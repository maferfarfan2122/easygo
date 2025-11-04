"""
⚡ Servicio OpenAI Optimizado con:
- Procesamiento paralelo (asyncio)
- Streaming de respuestas
- Caché inteligente
- Timeouts agresivos
- GPT-3.5-turbo para velocidad
"""

import asyncio
import os
import time
from typing import Dict, List, Optional, Any
from openai import AsyncOpenAI
import hashlib
import json

# Cliente asíncrono de OpenAI
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Caché en memoria para respuestas rápidas
_response_cache: Dict[str, tuple[Any, float]] = {}
CACHE_TTL = 600  # 10 minutos


def _create_cache_key(*args) -> str:
    """Crea una key única para el caché basada en los argumentos."""
    content = json.dumps(args, sort_keys=True)
    return hashlib.sha256(content.encode()).hexdigest()


def _get_from_cache(cache_key: str) -> Optional[Any]:
    """Obtiene un valor del caché si existe y no ha expirado."""
    if cache_key in _response_cache:
        data, timestamp = _response_cache[cache_key]
        if time.time() - timestamp < CACHE_TTL:
            print(f"💨 Cache HIT: {cache_key[:8]}...")
            return data
        else:
            # Expiró, eliminar
            del _response_cache[cache_key]
    return None


def _save_to_cache(cache_key: str, data: Any) -> None:
    """Guarda un valor en el caché con timestamp."""
    _response_cache[cache_key] = (data, time.time())
    print(f"💾 Cache SAVE: {cache_key[:8]}...")


async def optimize_cv_parallel(cv_data: Dict, job_description: str) -> Dict:
    """
    ⚡ OPTIMIZACIÓN 2: Procesamiento Paralelo
    
    Optimiza todas las secciones del CV en paralelo usando asyncio.
    Esto reduce el tiempo total de ~15s a ~5s.
    """
    start_time = time.time()
    
    # Check caché global
    cache_key = _create_cache_key("optimize_cv", cv_data, job_description)
    cached = _get_from_cache(cache_key)
    if cached:
        return cached
    
    # Preparar tareas paralelas
    tasks = []
    task_map = []  # Para saber qué task corresponde a qué
    
    # 1. Optimizar resumen profesional
    if cv_data.get('professional_summary'):
        tasks.append(_optimize_summary(cv_data['professional_summary'], job_description))
        task_map.append(('summary', None))
    
    # 2. Optimizar experiencias laborales (todas en paralelo)
    if cv_data.get('work_experience'):
        for idx, exp in enumerate(cv_data['work_experience']):
            tasks.append(_optimize_experience(exp, job_description))
            task_map.append(('experience', idx))
    
    # 3. Optimizar skills
    if cv_data.get('skills'):
        tasks.append(_optimize_skills(cv_data['skills'], job_description))
        task_map.append(('skills', None))
    
    # EJECUTAR TODO EN PARALELO
    print(f"🚀 Ejecutando {len(tasks)} tareas en paralelo...")
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Construir CV optimizado
    optimized_cv = cv_data.copy()
    optimized_experiences = []
    
    for idx, (task_type, task_idx) in enumerate(task_map):
        result = results[idx]
        
        # Si hubo error, usar original
        if isinstance(result, Exception):
            print(f"⚠️ Error en {task_type}: {result}")
            continue
        
        if task_type == 'summary':
            optimized_cv['professional_summary'] = result
        elif task_type == 'experience':
            optimized_experiences.append(result)
        elif task_type == 'skills':
            optimized_cv['skills'] = result
    
    if optimized_experiences:
        optimized_cv['work_experience'] = optimized_experiences
    
    elapsed = time.time() - start_time
    print(f"✅ CV optimizado en {elapsed:.2f}s (paralelo)")
    
    # Guardar en caché
    _save_to_cache(cache_key, optimized_cv)
    
    return optimized_cv


async def _optimize_summary(summary: str, job_description: str) -> str:
    """
    Optimiza el resumen profesional.
    Usa GPT-3.5-turbo para velocidad (5x más rápido que GPT-4).
    """
    cache_key = _create_cache_key("summary", summary, job_description[:200])
    cached = _get_from_cache(cache_key)
    if cached:
        return cached
    
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",  # ⚡ Más rápido y 10x más barato
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert CV optimizer. Create a compelling professional summary under 100 words that highlights key achievements and skills relevant to the job. Use action verbs and quantifiable results."
                },
                {
                    "role": "user",
                    "content": f"Job Description:\n{job_description[:300]}\n\nCurrent Summary:\n{summary}\n\nOptimize this summary to match the job requirements. Make it ATS-friendly and impactful."
                }
            ],
            max_tokens=200,
            temperature=0.7,
            timeout=10.0  # ⚡ Timeout agresivo
        )
        
        result = response.choices[0].message.content.strip()
        _save_to_cache(cache_key, result)
        return result
        
    except Exception as e:
        print(f"❌ Error optimizing summary: {e}")
        return summary  # Fallback: retornar original


async def _optimize_experience(experience: Dict, job_description: str) -> Dict:
    """
    Optimiza una experiencia laboral.
    Solo optimiza los 4 bullets más importantes (más rápido).
    """
    cache_key = _create_cache_key("experience", str(experience), job_description[:200])
    cached = _get_from_cache(cache_key)
    if cached:
        return cached
    
    try:
        bullets = experience.get('responsibilities', []) or experience.get('description', [])
        if not bullets:
            return experience
        
        # Solo optimizar primeros 4 bullets (velocidad)
        bullets_to_optimize = bullets[:4] if isinstance(bullets, list) else [bullets]
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a CV optimizer. Return ONLY optimized bullet points, one per line. Start each with '• '. Use action verbs, quantify achievements, and make them ATS-friendly."
                },
                {
                    "role": "user",
                    "content": f"Job Requirements:\n{job_description[:200]}\n\nOptimize these achievements:\n" + "\n".join(f"• {b}" for b in bullets_to_optimize)
                }
            ],
            max_tokens=400,
            temperature=0.7,
            timeout=12.0
        )
        
        optimized_text = response.choices[0].message.content.strip()
        optimized_bullets = [
            line.strip('• -').strip() 
            for line in optimized_text.split('\n') 
            if line.strip() and line.strip() not in ['', '• ', '- ']
        ]
        
        # Combinar optimizados con los restantes
        all_bullets = optimized_bullets + bullets[4:] if len(bullets) > 4 else optimized_bullets
        
        experience_copy = experience.copy()
        if 'responsibilities' in experience_copy:
            experience_copy['responsibilities'] = all_bullets
        elif 'description' in experience_copy:
            experience_copy['description'] = all_bullets
        
        _save_to_cache(cache_key, experience_copy)
        return experience_copy
        
    except Exception as e:
        print(f"❌ Error optimizing experience: {e}")
        return experience


async def _optimize_skills(skills: List[str], job_description: str) -> List[str]:
    """
    Optimiza y prioriza skills basado en el job description.
    """
    cache_key = _create_cache_key("skills", str(skills), job_description[:200])
    cached = _get_from_cache(cache_key)
    if cached:
        return cached
    
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a CV optimizer. Prioritize and organize skills based on job relevance. Return ONLY a comma-separated list. Put most relevant first."
                },
                {
                    "role": "user",
                    "content": f"Job Requirements:\n{job_description[:250]}\n\nSkills to prioritize:\n{', '.join(skills)}\n\nReturn prioritized list, most relevant first."
                }
            ],
            max_tokens=200,
            temperature=0.5,
            timeout=8.0
        )
        
        optimized_text = response.choices[0].message.content.strip()
        optimized_skills = [s.strip() for s in optimized_text.split(',') if s.strip()]
        
        _save_to_cache(cache_key, optimized_skills)
        return optimized_skills
        
    except Exception as e:
        print(f"❌ Error optimizing skills: {e}")
        return skills


async def generate_suggestions_fast(cv_data: Dict, job_description: Optional[str] = None) -> List[str]:
    """
    ⚡ ULTRA RÁPIDO: Genera 3-5 sugerencias en <5 segundos.
    Usa caché agresivo y prompts cortos.
    """
    cache_key = _create_cache_key("suggestions", str(cv_data)[:500], job_description or "")
    cached = _get_from_cache(cache_key)
    if cached:
        return cached
    
    try:
        job_context = f"\n\nTarget Job:\n{job_description[:200]}" if job_description else ""
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a CV expert. Give 4 short, actionable improvement tips. Each must be under 15 words. Be specific and practical."
                },
                {
                    "role": "user",
                    "content": f"Quick improvement tips for this CV:\n{str(cv_data)[:400]}{job_context}"
                }
            ],
            max_tokens=150,
            temperature=0.8,
            timeout=8.0
        )
        
        suggestions_text = response.choices[0].message.content.strip()
        suggestions = [
            s.strip('1234567890.- •').strip() 
            for s in suggestions_text.split('\n') 
            if s.strip()
        ][:4]
        
        # Fallback si no hay suficientes
        if len(suggestions) < 3:
            suggestions = [
                "Add quantifiable achievements with numbers and percentages",
                "Use strong action verbs to start each bullet point",
                "Tailor your skills section to match job requirements",
                "Include industry-specific keywords for ATS optimization"
            ]
        
        _save_to_cache(cache_key, suggestions)
        return suggestions
        
    except Exception as e:
        print(f"❌ Error generating suggestions: {e}")
        return [
            "Add quantifiable achievements with metrics",
            "Use action verbs at the start of bullets",
            "Tailor keywords to job description",
            "Highlight unique accomplishments"
        ]


async def generate_cv_content_streaming(cv_data: Dict, job_description: str) -> Dict:
    """
    ⚡ OPTIMIZACIÓN 1: Streaming de respuestas
    
    Genera contenido optimizado del CV con streaming para feedback instantáneo.
    Esta función puede enviar chunks mientras procesa.
    """
    start_time = time.time()
    
    cache_key = _create_cache_key("generate_cv", cv_data, job_description)
    cached = _get_from_cache(cache_key)
    if cached:
        return cached
    
    try:
        # Preparar el prompt completo
        prompt = f"""Create an optimized CV based on this data and job description.

Job Description:
{job_description}

Current CV Data:
{json.dumps(cv_data, indent=2)}

Generate an improved version with:
1. Compelling professional summary (80-100 words)
2. Optimized work experience bullets (action verbs, quantified results)
3. Prioritized skills matching job requirements
4. ATS-friendly formatting

Return as JSON with keys: professional_summary, work_experience, skills, education"""

        # Streaming response (chunks progresivos)
        stream = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert CV writer. Return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.7,
            stream=True,  # ⚡ STREAMING habilitado
            timeout=15.0
        )
        
        # Acumular respuesta
        full_response = ""
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_response += content
                # Aquí podrías emitir eventos SSE al frontend
                print(content, end="", flush=True)
        
        print()  # Nueva línea
        
        # Parsear JSON
        try:
            result = json.loads(full_response)
        except json.JSONDecodeError:
            # Si no es JSON válido, extraer lo que se pueda
            result = cv_data
        
        elapsed = time.time() - start_time
        print(f"✅ CV generado con streaming en {elapsed:.2f}s")
        
        _save_to_cache(cache_key, result)
        return result
        
    except Exception as e:
        print(f"❌ Error generating CV content: {e}")
        return cv_data


def clear_cache():
    """Limpia el caché completo."""
    global _response_cache
    count = len(_response_cache)
    _response_cache.clear()
    print(f"🗑️  Caché limpiado: {count} entradas removidas")


def get_cache_stats() -> Dict:
    """Obtiene estadísticas del caché."""
    now = time.time()
    valid_entries = sum(1 for _, (_, ts) in _response_cache.items() if now - ts < CACHE_TTL)
    expired_entries = len(_response_cache) - valid_entries
    
    return {
        "total_entries": len(_response_cache),
        "valid_entries": valid_entries,
        "expired_entries": expired_entries,
        "cache_ttl_seconds": CACHE_TTL,
        "memory_size_kb": len(str(_response_cache)) / 1024
    }


# Cleanup periódico del caché (ejecutar en background)
async def cleanup_expired_cache():
    """Limpia entradas expiradas del caché cada 5 minutos."""
    while True:
        await asyncio.sleep(300)  # 5 minutos
        now = time.time()
        expired_keys = [
            key for key, (_, ts) in _response_cache.items() 
            if now - ts >= CACHE_TTL
        ]
        for key in expired_keys:
            del _response_cache[key]
        if expired_keys:
            print(f"🧹 Limpieza automática: {len(expired_keys)} entradas expiradas removidas")
