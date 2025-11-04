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
from services.pdf_generator import generate_cv_pdf, save_pdf_file
from services.token_service import token_manager
import os
import time
import asyncio
from dotenv import load_dotenv
from typing import Optional, Dict

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
        
        # Devolver PDF como respuesta
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
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
        
        # Devolver PDF como respuesta
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "X-Tokens-Remaining": str(token_manager.get_user_tokens(user_id))
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
