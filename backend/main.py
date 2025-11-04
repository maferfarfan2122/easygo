from fastapi import FastAPI, HTTPException, File, UploadFile, Request, Header, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from models.cv_models import CVRequest, CVResponse
from services.openai_service import optimize_cv_content, generate_cv_suggestions
from services.openai_service_retry import openai_service
from services.openai_service_optimized import (
    optimize_cv_parallel,
    generate_suggestions_fast,
    generate_cv_content_streaming,
    clear_cache,
    get_cache_stats
)
from services.cv_optimizer_native import (
    native_optimizer,
    generate_suggestions_native,
    analyze_ats_compatibility,
    calculate_match_score,
    match_skills
)
from services.pdf_generator import generate_cv_pdf, save_pdf_file
from services.pdf_optimizer import pdf_optimizer
from services.token_service import token_manager
import os
import time
import asyncio
import re
from urllib.parse import quote
from dotenv import load_dotenv
from typing import Optional, Dict, List

# Cargar variables de entorno
load_dotenv()

# Verificar si estamos en modo producción
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Crear aplicación FastAPI
app = FastAPI(
    title="Easy Go CV Builder API",
    description="API para generar CVs profesionales optimizados con Inteligencia Artificial. Análisis de ofertas de trabajo y optimización ATS.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_tags=[
        {
            "name": "health",
            "description": "Endpoints de estado y salud de la API"
        },
        {
            "name": "cv",
            "description": "Endpoints para generación y optimización de CVs con IA"
        }
    ]
)

# Configurar CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternativa
]

# En producción, permitir cualquier origen (puedes restringirlo a tu dominio específico)
if not DEBUG:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["health"])
async def root():
    """Endpoint raíz para verificar que la API está funcionando"""
    return {
        "message": "Easy Go CV Builder API está funcionando",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "generate_cv": "/api/cv/generate",
            "optimize_cv": "/api/cv/optimize",
            "suggestions": "/api/cv/suggestions",
            "sitemap": "/api/sitemap",
            "robots": "/api/robots"
        }
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Verifica el estado de la API y servicios"""
    openai_configured = bool(os.getenv("OPENAI_API_KEY"))
    
    return {
        "status": "healthy",
        "services": {
            "openai": "configured" if openai_configured else "not_configured",
            "pdf_generator": "ready"
        }
    }


@app.get("/api/sitemap", tags=["health"])
async def get_sitemap():
    """Retorna información del sitemap para SEO"""
    return JSONResponse(content={
        "urls": [
            {
                "loc": "https://easygo.com.es/",
                "priority": "1.0",
                "changefreq": "weekly"
            },
            {
                "loc": "https://easygo.com.es/signin",
                "priority": "0.8",
                "changefreq": "monthly"
            }
        ]
    })


@app.get("/api/robots", tags=["health"])
async def get_robots_info():
    """Retorna información de robots.txt"""
    return {
        "status": "ok",
        "crawlable": True,
        "user_agent": "*",
        "disallow": ["/dashboard", "/tools/cv-builder"]
    }


# ============================================================================
# TOKEN & USER MANAGEMENT HELPERS
# ============================================================================

def get_user_id_from_header(x_user_id: Optional[str] = Header(None)) -> str:
    """Extract user ID from header (simple auth for MVP)"""
    if not x_user_id:
        raise HTTPException(
            status_code=401,
            detail="Missing X-User-ID header. Please provide user identification."
        )
    return x_user_id


async def check_and_consume_tokens(user_id: str, tokens_required: int, endpoint: str, request_data: dict):
    """
    Check rate limit, cache, and consume tokens
    Returns cached result if available, None otherwise
    """
    # 1. Check rate limit
    if not token_manager.check_rate_limit(user_id):
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Maximum {token_manager.RATE_LIMIT_REQUESTS} requests per minute."
        )
    
    # 2. Check cache for duplicate request
    request_hash = token_manager.create_request_hash(user_id, endpoint, request_data)
    cached_result = token_manager.get_cached_result(request_hash)
    
    if cached_result:
        print(f"✓ Cache HIT for user {user_id} on {endpoint}")
        return cached_result, request_hash
    
    # 3. Check and consume tokens
    user_tokens = token_manager.get_user_tokens(user_id)
    
    if user_tokens < tokens_required:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient tokens. Required: {tokens_required}, Available: {user_tokens}. Please upgrade your plan."
        )
    
    # Consume tokens
    success = token_manager.consume_tokens(user_id, tokens_required)
    
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to consume tokens. Please try again."
        )
    
    print(f"✓ Consumed {tokens_required} tokens from user {user_id}. Remaining: {token_manager.get_user_tokens(user_id)}")
    
    return None, request_hash


@app.get("/api/user/tokens", tags=["cv"])
async def get_user_token_balance(user_id: str = Header(..., alias="X-User-ID")):
    """Get user's token balance and stats"""
    try:
        stats = token_manager.get_user_stats(user_id)
        return {
            "success": True,
            **stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/system/stats", tags=["health"])
async def get_system_stats():
    """Get system statistics (admin only in production)"""
    try:
        stats = token_manager.get_system_stats()
        circuit_breaker = openai_service.get_circuit_breaker_status()
        
        return {
            "success": True,
            "token_system": stats,
            "circuit_breaker": circuit_breaker
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# CV ENDPOINTS WITH TOKEN PROTECTION
# ============================================================================

@app.post("/api/cv/suggestions", tags=["cv"])
async def get_cv_suggestions(
    request: dict,
    user_id: str = Header(..., alias="X-User-ID")
):
    """
    ⚡ OPTIMIZADO: Genera sugerencias en <5 segundos
    
    Genera sugerencias para el CV basándose en la descripción del trabajo.
    Cost: 1 token
    
    Headers:
        X-User-ID: User identification (required)
    
    Body:
        job_description: str - Descripción del puesto de trabajo
        cv_data: dict - Datos actuales del CV (opcional)
    
    Returns:
        Lista de sugerencias optimizadas con IA
    """
    start_time = time.time()
    
    try:
        job_description = request.get("job_description")
        cv_data = request.get("cv_data", {})
        
        if not job_description:
            raise HTTPException(status_code=400, detail="Se requiere job_description")
        
        # Check tokens and cache
        cached_result, request_hash = await check_and_consume_tokens(
            user_id=user_id,
            tokens_required=1,
            endpoint="cv/suggestions",
            request_data=request
        )
        
        if cached_result:
            elapsed = time.time() - start_time
            return {
                "success": True,
                "suggestions": cached_result,
                "cached": True,
                "tokens_remaining": token_manager.get_user_tokens(user_id),
                "processing_time": f"{elapsed:.2f}s"
            }
        
        # ⚡ Usar versión optimizada ultra rápida
        suggestions = await generate_suggestions_fast(cv_data, job_description)
        
        # Cache result
        token_manager.cache_result(request_hash, suggestions)
        
        elapsed = time.time() - start_time
        print(f"✅ Sugerencias generadas en {elapsed:.2f}s")
        
        return {
            "success": True,
            "suggestions": suggestions,
            "cached": False,
            "tokens_remaining": token_manager.get_user_tokens(user_id),
            "processing_time": f"{elapsed:.2f}s"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error en suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/cv/optimize", tags=["cv"])
async def optimize_cv(
    request: CVRequest,
    user_id: str = Header(..., alias="X-User-ID")
):
    """
    ⚡ OPTIMIZADO: Procesamiento paralelo - Reduce tiempo de 15s a ~5s
    
    Optimiza el contenido del CV usando IA con procesamiento paralelo.
    Cost: 2 tokens
    
    Headers:
        X-User-ID: User identification (required)
    
    Returns:
        Contenido optimizado con IA y sugerencias personalizadas
    """
    start_time = time.time()
    
    try:
        # Validar que existe API key de OpenAI
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY no configurada. Por favor configura tu clave API de OpenAI en el archivo .env"
            )
        
        # Convertir request a diccionario para cache
        cv_data = {
            "personal_info": request.personal_info.model_dump(),
            "experiences": [exp.model_dump() for exp in request.experiences],
            "education": [edu.model_dump() for edu in request.education],
            "skills": [skill.model_dump() for skill in request.skills],
            "languages": [lang.model_dump() for lang in request.languages],
            "additional_sections": request.additional_sections,
            "professional_summary": request.personal_info.summary if hasattr(request.personal_info, 'summary') else "",
            "work_experience": [exp.model_dump() for exp in request.experiences]
        }
        
        # Check tokens and cache (2 tokens for optimization)
        cached_result, request_hash = await check_and_consume_tokens(
            user_id=user_id,
            tokens_required=2,
            endpoint="cv/optimize",
            request_data={
                "job_description": request.job_description,
                "cv_data": cv_data
            }
        )
        
        if cached_result:
            elapsed = time.time() - start_time
            return {
                "success": True,
                "message": "CV optimizado exitosamente (cached)",
                "optimized_cv": cached_result,
                "tokens_remaining": token_manager.get_user_tokens(user_id),
                "processing_time": f"{elapsed:.2f}s",
                "cached": True
            }
        
        # ⚡ OPTIMIZACIÓN 2: Procesamiento paralelo de todas las secciones
        optimized_cv = await optimize_cv_parallel(cv_data, request.job_description)
        
        # Cache the result
        token_manager.cache_result(request_hash, optimized_cv)
        
        elapsed = time.time() - start_time
        print(f"✅ CV optimizado en {elapsed:.2f}s")
        
        return {
            "success": True,
            "message": f"CV optimizado exitosamente en {elapsed:.2f}s",
            "optimized_cv": optimized_cv,
            "tokens_remaining": token_manager.get_user_tokens(user_id),
            "processing_time": f"{elapsed:.2f}s",
            "cached": False
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error optimizando CV: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/cv/generate", tags=["cv"])
async def generate_cv(
    request: CVRequest,
    user_id: str = Header(..., alias="X-User-ID")
):
    """
    ⚡ OPTIMIZACIÓN 4: Genera PDF directamente sin llamar a OpenAI de nuevo
    
    Genera un PDF del CV profesional optimizado.
    Cost: 2 tokens (solo si necesita optimizar primero)
    
    Headers:
        X-User-ID: User identification (required)
    
    Returns:
        PDF del CV como archivo descargable en formato profesional
    """
    start_time = time.time()
    
    try:
        # Validar que existe API key de OpenAI
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY no configurada"
            )
        
        # Convertir request a diccionario
        cv_data = {
            "personal_info": request.personal_info.model_dump(),
            "experiences": [exp.model_dump() for exp in request.experiences],
            "education": [edu.model_dump() for edu in request.education],
            "skills": [skill.model_dump() for skill in request.skills],
            "languages": [lang.model_dump() for lang in request.languages],
            "additional_sections": request.additional_sections,
            "professional_summary": request.personal_info.summary if hasattr(request.personal_info, 'summary') else "",
            "work_experience": [exp.model_dump() for exp in request.experiences]
        }
        
        # Check tokens and cache (2 tokens for PDF generation)
        cached_result, request_hash = await check_and_consume_tokens(
            user_id=user_id,
            tokens_required=2,
            endpoint="cv/generate",
            request_data={
                "job_description": request.job_description,
                "cv_data": cv_data
            }
        )
        
        # ⚡ OPTIMIZACIÓN 4: Generar PDF directamente sin OpenAI
        # Si ya tenemos datos optimizados, usar esos. Si no, usar originales.
        # No hacer nueva llamada a OpenAI aquí para evitar latencia
        
        # Verificar si hay datos optimizados en caché
        optimize_cache_key = f"optimize_{user_id}_{hash(str(cv_data))}{hash(request.job_description)}"
        optimized_data = token_manager.get_cached_response(optimize_cache_key)
        
        # Usar datos optimizados si existen, si no usar originales
        data_for_pdf = optimized_data if optimized_data else cv_data
        
        # Generar PDF directamente (sin llamar a OpenAI)
        pdf_buffer = generate_cv_pdf(data_for_pdf, None)
        
        # Generar nombre de archivo
        full_name = request.personal_info.full_name.replace(" ", "_")
        filename = f"{full_name}_CV.pdf"
        
        elapsed = time.time() - start_time
        print(f"✅ PDF generado en {elapsed:.2f}s (sin OpenAI)")
        
        # Codificar filename para soportar caracteres Unicode
        encoded_filename = quote(filename.encode('utf-8'))
        
        # Devolver PDF como respuesta
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
                "X-Tokens-Remaining": str(token_manager.get_user_tokens(user_id)),
                "X-Processing-Time": f"{elapsed:.2f}s"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generando PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/cv/generate-without-optimization", tags=["cv"])
async def generate_cv_without_optimization(
    request: CVRequest,
    user_id: str = Header(..., alias="X-User-ID")
):
    """
    Genera un PDF del CV profesional sin optimización de IA (generación rápida).
    Cost: 1 token
    
    Headers:
        X-User-ID: User identification (required)
    
    Returns:
        PDF del CV en formato profesional como archivo descargable
    """
    try:
        # Check tokens (1 token for PDF without optimization)
        if not token_manager.check_rate_limit(user_id):
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Maximum {token_manager.RATE_LIMIT_REQUESTS} requests per minute."
            )
        
        user_tokens = token_manager.get_user_tokens(user_id)
        if user_tokens < 1:
            raise HTTPException(
                status_code=402,
                detail=f"Insufficient tokens. Required: 1, Available: {user_tokens}. Please upgrade your plan."
            )
        
        # Consume 1 token
        token_manager.consume_tokens(user_id, 1)
        
        # Convertir request a diccionario
        cv_data = {
            "personal_info": request.personal_info.model_dump(),
            "experiences": [exp.model_dump() for exp in request.experiences],
            "education": [edu.model_dump() for edu in request.education],
            "skills": [skill.model_dump() for skill in request.skills],
            "languages": [lang.model_dump() for lang in request.languages],
            "additional_sections": request.additional_sections
        }
        
        # Generar PDF sin optimización
        pdf_buffer = generate_cv_pdf(cv_data, None)
        
        # Generar nombre de archivo
        full_name = request.personal_info.full_name.replace(" ", "_")
        filename = f"{full_name}_CV.pdf"
        
        # Codificar filename para soportar caracteres Unicode
        encoded_filename = quote(filename.encode('utf-8'))
        
        # Devolver PDF como respuesta
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
                "X-Tokens-Remaining": str(token_manager.get_user_tokens(user_id))
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# NATIVE CV OPTIMIZER (FREE - NO TOKENS REQUIRED)
# ============================================================================

@app.post("/api/tools/cv-optimizer-native", tags=["Tools"])
async def optimize_cv_native(request: dict):
    """
    🔧 GRATIS - Optimizador de CV Nativo sin IA
    
    Optimiza tu CV usando algoritmos Python puros (sin OpenAI).
    - ✅ 100% GRATIS (no consume tokens)
    - ⚡ Ultra rápido (<500ms)
    - 🎯 Mejora verbos de acción, formato y keywords
    - 📊 Detecta áreas de mejora
    
    Body:
        cv_data: dict - Datos del CV a optimizar
        job_description: str (opcional) - Para priorizar keywords
    
    Returns:
        CV optimizado + lista de sugerencias
    """
    start_time = time.time()
    
    try:
        cv_data = request.get('cv_data', {})
        job_description = request.get('job_description', '')
        
        if not cv_data:
            raise HTTPException(status_code=400, detail="cv_data is required")
        
        # Optimizar CV con lógica nativa
        optimized_cv = native_optimizer.optimize_cv(cv_data, job_description)
        
        # Generar sugerencias
        suggestions = native_optimizer.generate_suggestions(cv_data)
        
        elapsed = time.time() - start_time
        
        return {
            "success": True,
            "optimized_cv": optimized_cv,
            "suggestions": suggestions,
            "processing_time": f"{elapsed:.3f}s",
            "cost": "FREE - No tokens used",
            "method": "Native Python Algorithms"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in native optimizer: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/tools/cv-suggestions-native", tags=["Tools"])
async def get_cv_suggestions_native(request: dict):
    """
    💡 GRATIS - Sugerencias de Mejora sin IA
    
    Analiza tu CV y genera sugerencias de mejora usando lógica nativa.
    - ✅ 100% GRATIS (no consume tokens)
    - ⚡ Ultra rápido (<100ms)
    - 📋 5-7 sugerencias accionables
    
    Body:
        cv_data: dict - Datos del CV a analizar
    
    Returns:
        Lista de sugerencias específicas
    """
    start_time = time.time()
    
    try:
        cv_data = request.get('cv_data', {})
        
        if not cv_data:
            raise HTTPException(status_code=400, detail="cv_data is required")
        
        # Generar sugerencias
        suggestions = native_optimizer.generate_suggestions(cv_data)
        
        elapsed = time.time() - start_time
        
        return {
            "success": True,
            "suggestions": suggestions,
            "processing_time": f"{elapsed:.3f}s",
            "cost": "FREE - No tokens used"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating native suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/tools/cv-score", tags=["Tools"])
async def score_cv(request: dict):
    """
    📊 GRATIS - Score ATS de tu CV
    
    Analiza qué tan optimizado está tu CV para sistemas ATS.
    - ✅ 100% GRATIS (no consume tokens)
    - ⚡ Instantáneo
    - 📈 Score de 0-100
    - 💡 Breakdown por categorías
    
    Body:
        cv_data: dict - Datos del CV
        job_description: str (opcional) - Para análisis de keywords
    
    Returns:
        Score total + desglose por áreas
    """
    start_time = time.time()
    
    try:
        cv_data = request.get('cv_data', {})
        job_description = request.get('job_description', '')
        
        if not cv_data:
            raise HTTPException(status_code=400, detail="cv_data is required")
        
        # Calcular scores por categoría
        scores = {
            "action_verbs": _score_action_verbs(cv_data),
            "quantification": _score_quantification(cv_data),
            "keywords": _score_keywords(cv_data, job_description),
            "formatting": _score_formatting(cv_data),
            "completeness": _score_completeness(cv_data)
        }
        
        # Score total (promedio ponderado)
        total_score = int(
            scores["action_verbs"] * 0.25 +
            scores["quantification"] * 0.25 +
            scores["keywords"] * 0.20 +
            scores["formatting"] * 0.15 +
            scores["completeness"] * 0.15
        )
        
        elapsed = time.time() - start_time
        
        return {
            "success": True,
            "total_score": total_score,
            "scores": scores,
            "grade": _get_grade(total_score),
            "processing_time": f"{elapsed:.3f}s",
            "cost": "FREE - No tokens used"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error scoring CV: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def _score_action_verbs(cv_data: Dict) -> int:
    """Score basado en uso de verbos de acción fuertes."""
    action_verbs = native_optimizer.all_action_verbs
    weak_words = native_optimizer.WEAK_WORDS
    
    text = str(cv_data.get('professional_summary', ''))
    
    if cv_data.get('work_experience'):
        for exp in cv_data['work_experience']:
            text += ' ' + str(exp.get('responsibilities', ''))
            text += ' ' + str(exp.get('description', ''))
    
    text_lower = text.lower()
    
    # Contar verbos de acción
    action_count = sum(1 for verb in action_verbs if verb.lower() in text_lower)
    
    # Contar palabras débiles
    weak_count = sum(1 for weak in weak_words if weak in text_lower)
    
    # Score: más verbos de acción = mejor, más débiles = peor
    score = min(100, max(0, (action_count * 10) - (weak_count * 5)))
    
    return int(score)


def _score_quantification(cv_data: Dict) -> int:
    """Score basado en cuantificación de logros con números."""
    text = ''
    
    if cv_data.get('work_experience'):
        for exp in cv_data['work_experience']:
            text += ' ' + str(exp.get('responsibilities', ''))
            text += ' ' + str(exp.get('description', ''))
    
    # Contar números (%, $, cantidades)
    numbers = re.findall(r'\d+[\%\$]?|\d+\+', text)
    
    # Score basado en cantidad de cuantificaciones
    score = min(100, len(numbers) * 15)
    
    return int(score)


def _score_keywords(cv_data: Dict, job_description: str) -> int:
    """Score basado en match de keywords con job description."""
    if not job_description:
        return 70  # Score neutral si no hay job description
    
    # Extraer keywords del job description
    job_keywords = native_optimizer._extract_keywords(job_description)
    
    if not job_keywords:
        return 70
    
    # Texto del CV
    cv_text = str(cv_data).lower()
    
    # Contar cuántos keywords del job están en el CV
    matches = sum(1 for kw in job_keywords if kw.lower() in cv_text)
    
    # Score: porcentaje de keywords encontrados
    score = int((matches / len(job_keywords)) * 100)
    
    return min(100, score)


def _score_formatting(cv_data: Dict) -> int:
    """Score basado en formato y estructura."""
    score = 0
    
    # Tiene resumen profesional
    if cv_data.get('professional_summary'):
        score += 20
        # Longitud adecuada (50-150 palabras)
        words = len(cv_data['professional_summary'].split())
        if 50 <= words <= 150:
            score += 10
    
    # Tiene experiencias laborales
    if cv_data.get('work_experience') and len(cv_data['work_experience']) > 0:
        score += 30
        # Cada experiencia tiene bullets
        for exp in cv_data['work_experience']:
            if exp.get('responsibilities') or exp.get('description'):
                score += 5
                break
    
    # Tiene skills
    if cv_data.get('skills') and len(cv_data['skills']) >= 5:
        score += 20
    
    # Tiene educación
    if cv_data.get('education'):
        score += 20
    
    return min(100, score)


def _score_completeness(cv_data: Dict) -> int:
    """Score basado en completitud del CV."""
    score = 0
    sections = 0
    
    required_sections = [
        'personal_info',
        'professional_summary',
        'work_experience',
        'education',
        'skills'
    ]
    
    for section in required_sections:
        if cv_data.get(section):
            sections += 1
            score += 20
    
    return min(100, score)


def _get_grade(score: int) -> str:
    """Convierte score numérico en letra."""
    if score >= 90:
        return "A+ (Excellent)"
    elif score >= 80:
        return "A (Very Good)"
    elif score >= 70:
        return "B (Good)"
    elif score >= 60:
        return "C (Fair)"
    else:
        return "D (Needs Improvement)"


# ============================================================================
# CACHE & PERFORMANCE ENDPOINTS
# ============================================================================

@app.get("/api/cache/stats", tags=["System"])
async def get_cache_statistics():
    """
    Obtiene estadísticas del sistema de caché.
    Útil para monitoreo y debugging.
    """
    try:
        cache_stats = get_cache_stats()
        token_stats = token_manager.get_system_stats()
        
        return {
            "success": True,
            "cache": cache_stats,
            "tokens": token_stats,
            "optimization_status": "enabled"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/cache/clear", tags=["System"])
async def clear_system_cache(
    admin_key: str = Header(None, alias="X-Admin-Key")
):
    """
    Limpia todos los cachés del sistema.
    Requiere header X-Admin-Key para seguridad.
    """
    try:
        # Simple admin key check (en producción usar algo más robusto)
        expected_key = os.getenv("ADMIN_KEY", "admin_secret_key_123")
        if admin_key != expected_key:
            raise HTTPException(status_code=403, detail="Invalid admin key")
        
        # Limpiar cachés
        clear_cache()
        token_manager.clear_cache()
        
        return {
            "success": True,
            "message": "All caches cleared successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# NATIVE TOOLS (Sin OpenAI - Gratis y Rápido)
# ============================================================================

@app.post("/api/tools/cv-analyze", tags=["Tools"])
async def analyze_cv_tool(cv_data: Dict, job_description: Optional[str] = None):
    """
    🎯 TOOL: Analiza un CV sin usar IA.
    
    Características:
    - ⚡ Ultra rápido (<1 segundo)
    - 💰 100% GRATIS (sin tokens)
    - 🔍 Análisis de keywords
    - 📊 Score de compatibilidad ATS
    - 💡 Sugerencias inteligentes
    
    Body:
        cv_data: dict - Datos del CV
        job_description: str (opcional) - Descripción del trabajo
    
    Returns:
        Análisis completo con sugerencias y scores
    """
    start_time = time.time()
    
    try:
        # 1. Generar sugerencias nativas
        suggestions = generate_suggestions_native(cv_data, job_description)
        
        # 2. Analizar compatibilidad ATS
        ats_analysis = analyze_ats_compatibility(cv_data)
        
        # 3. Calcular match score si hay job description
        match_score = None
        skills_analysis = None
        
        if job_description:
            match_score = calculate_match_score(cv_data, job_description)
            
            # Analizar skills
            cv_skills = cv_data.get('skills', [])
            if cv_skills:
                skills_analysis = match_skills(cv_skills, job_description)
        
        elapsed = time.time() - start_time
        
        return {
            "success": True,
            "analysis": {
                "suggestions": suggestions,
                "ats_compatibility": ats_analysis,
                "match_score": match_score,
                "skills_analysis": skills_analysis
            },
            "processing_time": f"{elapsed:.3f}s",
            "cost": "FREE - No tokens used",
            "method": "native_python"
        }
    
    except Exception as e:
        print(f"❌ Error en CV analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/tools/cv-optimize-native", tags=["Tools"])
async def optimize_cv_native_tool(cv_data: Dict, job_description: str):
    """
    ⚡ TOOL: Optimiza CV sin IA (100% Gratis y Rápido).
    
    Optimizaciones:
    - 🎯 Prioriza skills relevantes
    - 💪 Reemplaza verbos débiles con action verbs
    - 📊 Reorganiza bullets por relevancia
    - 🔑 Optimiza keywords para ATS
    - ✨ Mejora formato y capitalización
    
    NO requiere tokens - NO usa OpenAI.
    
    Body:
        cv_data: dict - Datos del CV
        job_description: str - Descripción del trabajo objetivo
    
    Returns:
        CV optimizado con análisis de cambios
    """
    start_time = time.time()
    
    try:
        # Optimizar CV con algoritmos nativos
        optimized_cv = optimize_cv_native(cv_data, job_description)
        
        # Generar análisis de cambios
        original_score = calculate_match_score(cv_data, job_description)
        optimized_score = calculate_match_score(optimized_cv, job_description)
        improvement = optimized_score - original_score
        
        elapsed = time.time() - start_time
        
        return {
            "success": True,
            "optimized_cv": optimized_cv,
            "analysis": {
                "original_score": original_score,
                "optimized_score": optimized_score,
                "improvement": improvement,
                "improvement_percentage": f"+{improvement:.1f}%"
            },
            "processing_time": f"{elapsed:.3f}s",
            "cost": "FREE - No tokens used",
            "method": "native_python"
        }
    
    except Exception as e:
        print(f"❌ Error en native optimization: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/tools/skills-matcher", tags=["Tools"])
async def match_skills_tool(skills: List[str], job_description: str):
    """
    🎯 TOOL: Analiza qué skills coinciden con un trabajo.
    
    Ultra rápido - sin IA.
    
    Body:
        skills: list[str] - Lista de skills del CV
        job_description: str - Descripción del trabajo
    
    Returns:
        Skills matched, unmatched y missing
    """
    try:
        skills_analysis = match_skills(skills, job_description)
        
        return {
            "success": True,
            "skills_analysis": skills_analysis,
            "recommendations": [
                f"✅ {len(skills_analysis['matched'])} skills match the job requirements",
                f"⚠️ {len(skills_analysis['missing'])} important skills are missing from your CV",
                f"💡 Consider adding: {', '.join(skills_analysis['missing'][:3])}" if skills_analysis['missing'] else "Great skill coverage!"
            ],
            "cost": "FREE - No tokens used"
        }
    
    except Exception as e:
        print(f"❌ Error en skills matcher: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/tools/ats-check", tags=["Tools"])
async def ats_check_tool(cv_data: Dict):
    """
    📋 TOOL: Verifica compatibilidad con sistemas ATS.
    
    Analiza:
    - Estructura del CV
    - Densidad de keywords
    - Formato y secciones
    - Longitud y contenido
    
    Body:
        cv_data: dict - Datos del CV
    
    Returns:
        Score ATS y recomendaciones
    """
    try:
        ats_analysis = analyze_ats_compatibility(cv_data)
        
        # Generar recomendaciones basadas en issues
        recommendations = []
        if "missing_personal_info" in ats_analysis['issues']:
            recommendations.append("❌ Add complete personal information (name, email, phone)")
        if "missing_work_experience" in ats_analysis['issues']:
            recommendations.append("❌ Add work experience section")
        if "missing_skills" in ats_analysis['issues']:
            recommendations.append("❌ Add a skills section with relevant technologies")
        if "low_keyword_density" in ats_analysis['issues']:
            recommendations.append("⚠️ Increase keyword density - add more technical terms")
        if "incomplete_experience_info" in ats_analysis['issues']:
            recommendations.append("⚠️ Complete all experience entries (position, company, dates)")
        if "too_short" in ats_analysis['issues']:
            recommendations.append("📝 CV is too short - expand with more details")
        if "too_long" in ats_analysis['issues']:
            recommendations.append("✂️ CV is too long - condense to 1-2 pages")
        
        if not recommendations:
            recommendations = ["✅ Your CV meets ATS compatibility standards!"]
        
        return {
            "success": True,
            "ats_score": ats_analysis['score'],
            "rating": ats_analysis['rating'],
            "analysis": ats_analysis,
            "recommendations": recommendations,
            "cost": "FREE - No tokens used"
        }
    
    except Exception as e:
        print(f"❌ Error en ATS check: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# PDF OPTIMIZER TOOL - 100% Native Python (No AI)
# ============================================================================

@app.post("/api/tools/pdf-optimizer", tags=["Tools"])
async def optimize_pdf_file(
    file: UploadFile = File(..., description="PDF file to optimize")
):
    """
    🚀 PDF OPTIMIZER - Optimiza PDFs de CV sin usar IA (100% GRATIS)
    
    Proceso:
    1. Extrae texto del PDF subido
    2. Analiza estructura (experiencia, skills, educación)
    3. Optimiza contenido con reglas nativas:
       - Reemplaza verbos débiles con action verbs
       - Mejora formato de bullets
       - Optimiza para ATS
    4. Genera nuevo PDF optimizado
    
    Input: PDF file (multipart/form-data)
    Output: Optimized PDF + Analysis
    
    Velocidad: ~2-3 segundos
    Costo: GRATIS (0 tokens)
    """
    start_time = time.time()
    
    try:
        # Validar que sea PDF
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are accepted"
            )
        
        print(f"📄 Processing PDF: {file.filename}")
        
        # Leer archivo
        pdf_content = await file.read()
        pdf_file = io.BytesIO(pdf_content)
        
        # 1. Extraer texto del PDF
        print("🔍 Extracting text from PDF...")
        text = pdf_optimizer.extract_text_from_pdf(pdf_file)
        
        if not text or len(text) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF. Make sure the PDF is not image-based."
            )
        
        # 2. Parsear estructura del CV
        print("📋 Parsing CV structure...")
        cv_data = pdf_optimizer.parse_cv_structure(text)
        
        # 3. Analizar PDF original
        print("📊 Analyzing original PDF...")
        analysis = pdf_optimizer.analyze_pdf(cv_data)
        
        # 4. Optimizar contenido
        print("⚡ Optimizing content...")
        optimized_cv_data = pdf_optimizer.optimize_content(cv_data)
        
        # 5. Generar PDF optimizado
        print("📝 Generating optimized PDF...")
        optimized_pdf_buffer = pdf_optimizer.generate_optimized_pdf(optimized_cv_data)
        
        elapsed = time.time() - start_time
        print(f"✅ PDF optimized in {elapsed:.2f}s")
        
        # Sanitizar filename para evitar problemas de encoding
        safe_filename = f"optimized_{file.filename}"
        # Usar RFC 5987 encoding para soportar caracteres Unicode
        encoded_filename = quote(safe_filename.encode('utf-8'))
        
        # Retornar PDF optimizado
        return StreamingResponse(
            optimized_pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
                "X-Processing-Time": f"{elapsed:.2f}s",
                "X-Original-ATS-Score": str(analysis['ats_score']),
                "X-Weak-Verbs-Fixed": str(analysis['weak_verbs_found']),
                "X-Action-Verbs-Added": str(analysis['missing_action_verbs'])
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error optimizing PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/tools/pdf-analyzer", tags=["Tools"])
async def analyze_pdf_file(
    file: UploadFile = File(..., description="PDF file to analyze")
):
    """
    📊 PDF ANALYZER - Analiza PDFs de CV sin descargar (100% GRATIS)
    
    Analiza el PDF y retorna:
    - ATS score
    - Verbos débiles detectados
    - Missing action verbs
    - Sugerencias de mejora
    
    Input: PDF file (multipart/form-data)
    Output: JSON con análisis detallado
    
    Velocidad: ~1 segundo
    Costo: GRATIS (0 tokens)
    """
    start_time = time.time()
    
    try:
        # Validar que sea PDF
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are accepted"
            )
        
        print(f"📄 Analyzing PDF: {file.filename}")
        
        # Leer archivo
        pdf_content = await file.read()
        pdf_file = io.BytesIO(pdf_content)
        
        # Extraer texto
        text = pdf_optimizer.extract_text_from_pdf(pdf_file)
        
        if not text or len(text) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF"
            )
        
        # Parsear estructura
        cv_data = pdf_optimizer.parse_cv_structure(text)
        
        # Analizar
        analysis = pdf_optimizer.analyze_pdf(cv_data)
        
        elapsed = time.time() - start_time
        print(f"✅ PDF analyzed in {elapsed:.2f}s")
        
        return {
            "success": True,
            "filename": file.filename,
            "analysis": analysis,
            "cv_structure": {
                "has_name": bool(cv_data['name']),
                "has_contact": len(cv_data['contact']) > 0,
                "has_summary": bool(cv_data['summary']),
                "experience_count": len(cv_data['experience']),
                "skills_count": len(cv_data['skills']),
                "education_count": len(cv_data['education'])
            },
            "processing_time": f"{elapsed:.2f}s",
            "cost": "FREE - No tokens used"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error analyzing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Importar io al inicio si no está
import io


# Manejo de errores global
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Error interno del servidor",
            "detail": str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True  # Auto-reload en desarrollo
    )
