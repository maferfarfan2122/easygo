from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from models.cv_models import CVRequest, CVResponse
from services.openai_service import optimize_cv_content, generate_cv_suggestions
from services.pdf_generator import generate_cv_pdf, save_pdf_file
import os
from dotenv import load_dotenv

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


@app.post("/api/cv/suggestions", tags=["cv"])
async def get_cv_suggestions(request: dict):
    """
    Genera sugerencias para el CV basándose en la descripción del trabajo.
    
    Body:
        job_description: str - Descripción del puesto de trabajo
    
    Returns:
        Lista de sugerencias optimizadas con IA
    """
    try:
        job_description = request.get("job_description")
        
        if not job_description:
            raise HTTPException(status_code=400, detail="Se requiere job_description")
        
        suggestions = generate_cv_suggestions(job_description)
        
        return {
            "success": True,
            "suggestions": suggestions
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/cv/optimize", tags=["cv"])
async def optimize_cv(request: CVRequest):
    """
    Optimiza el contenido del CV usando GPT-4 basándose en la descripción del trabajo.
    
    Returns:
        Contenido optimizado con IA y sugerencias personalizadas
    """
    try:
        # Validar que existe API key de OpenAI
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY no configurada. Por favor configura tu clave API de OpenAI en el archivo .env"
            )
        
        # Convertir request a diccionario
        cv_data = {
            "personal_info": request.personal_info.model_dump(),
            "experiences": [exp.model_dump() for exp in request.experiences],
            "education": [edu.model_dump() for edu in request.education],
            "skills": [skill.model_dump() for skill in request.skills],
            "languages": [lang.model_dump() for lang in request.languages],
            "additional_sections": request.additional_sections
        }
        
        # Optimizar contenido con GPT-4
        result = optimize_cv_content(request.job_description, cv_data)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Error al optimizar CV: {result.get('error', 'Unknown error')}"
            )
        
        return CVResponse(
            success=True,
            message="CV optimizado exitosamente",
            optimized_content=result.get("optimized_content"),
            suggestions=result.get("suggestions", [])
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/cv/generate", tags=["cv"])
async def generate_cv(request: CVRequest):
    """
    Genera un PDF del CV profesional optimizado con IA.
    
    Returns:
        PDF del CV como archivo descargable en formato profesional
    """
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
            "additional_sections": request.additional_sections
        }
        
        # Optimizar contenido con GPT-4
        optimized_result = optimize_cv_content(request.job_description, cv_data)
        optimized_content = optimized_result.get("optimized_content") if optimized_result.get("success") else None
        
        # Generar PDF
        pdf_buffer = generate_cv_pdf(cv_data, optimized_content)
        
        # Generar nombre de archivo
        full_name = request.personal_info.full_name.replace(" ", "_")
        filename = f"{full_name}_CV.pdf"
        
        # Devolver PDF como respuesta
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/cv/generate-without-optimization", tags=["cv"])
async def generate_cv_without_optimization(request: CVRequest):
    """
    Genera un PDF del CV profesional sin optimización de IA (generación rápida).
    
    Returns:
        PDF del CV en formato profesional como archivo descargable
    """
    try:
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
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
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
