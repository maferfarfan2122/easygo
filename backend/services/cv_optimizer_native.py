"""
🚀 CV Optimizer Native - Optimización de CV sin IA
====================================================

Optimizador nativo de CVs usando algoritmos Python puros.
No requiere OpenAI ni consume tokens.

Características:
- ✅ 100% GRATIS (sin consumo de tokens)
- ⚡ Ultra rápido (<100ms)
- 🎯 Reemplazo de verbos débiles por verbos de acción
- 📊 Análisis de keywords
- 💡 Sugerencias inteligentes

Author: EasyGo Team
Version: 1.0.0
"""

import re
from typing import Dict, List, Any, Optional
from collections import Counter


# Palabras débiles que deben ser reemplazadas
WEAK_WORDS = {
    'hice': 'Ejecuté',
    'hizo': 'Ejecutó',
    'trabajé': 'Colaboré',
    'ayudé': 'Contribuí',
    'participé': 'Lideré',
    'estuve': 'Desempeñé',
    'fui': 'Actué como',
    'tuve': 'Gestioné',
    'vi': 'Analicé'
}

# Verbos de acción fuertes para CVs
ACTION_VERBS = [
    # Liderazgo y Management
    'Lideré', 'Dirigí', 'Coordiné', 'Supervisé', 'Gestioné', 'Orquesté',
    'Administré', 'Comandé', 'Encabecé', 'Guié', 'Orienté',
    
    # Logro y Resultados
    'Logré', 'Alcancé', 'Obtuve', 'Conseguí', 'Superé', 'Excedí',
    'Maximicé', 'Optimicé', 'Mejoré', 'Aumenté', 'Incrementé',
    
    # Innovación y Creación
    'Desarrollé', 'Diseñé', 'Creé', 'Implementé', 'Innové', 'Establecí',
    'Lancé', 'Construí', 'Produje', 'Formé', 'Inicié',
    
    # Análisis y Estrategia
    'Analicé', 'Evalué', 'Investigué', 'Identifiqué', 'Diagnostiqué',
    'Planifiqué', 'Estrategicé', 'Proyecté', 'Pronostiqué',
    
    # Ejecución y Operación
    'Ejecuté', 'Implementé', 'Operé', 'Manejé', 'Procesé', 'Realicé',
    'Efectué', 'Completé', 'Finalizé', 'Cumplí',
    
    # Comunicación y Colaboración
    'Colaboré', 'Comuniqué', 'Presenté', 'Negocié', 'Facilité',
    'Coordiné', 'Integré', 'Sincronicé', 'Armonicé',
    
    # Mejora y Optimización
    'Transformé', 'Revolucioné', 'Modernizé', 'Automaticé', 'Simplifiqué',
    'Agilicé', 'Escalé', 'Expandí', 'Potencié', 'Fortalecí'
]


class CVOptimizerNative:
    """
    Optimizador nativo de CVs sin usar IA.
    
    Utiliza algoritmos de Python puro para:
    - Reemplazar palabras débiles por verbos de acción
    - Extraer keywords relevantes
    - Generar sugerencias de mejora
    - Optimizar contenido del CV
    """
    
    def __init__(self):
        self.WEAK_WORDS = WEAK_WORDS
        self.all_action_verbs = ACTION_VERBS
        
    def optimize_cv(self, cv_data: Dict[str, Any], job_description: Optional[str] = None) -> Dict[str, Any]:
        """
        Optimiza el CV reemplazando palabras débiles y mejorando el contenido.
        
        Args:
            cv_data: Diccionario con los datos del CV
            job_description: Descripción del puesto (opcional)
            
        Returns:
            CV optimizado con mejoras aplicadas
        """
        optimized = cv_data.copy()
        
        # Optimizar resumen profesional
        if 'professional_summary' in optimized:
            optimized['professional_summary'] = self._optimize_text(
                optimized['professional_summary']
            )
        
        # Optimizar experiencia laboral
        if 'work_experience' in optimized and isinstance(optimized['work_experience'], list):
            for i, exp in enumerate(optimized['work_experience']):
                if isinstance(exp, dict):
                    # Optimizar responsabilidades
                    if 'responsibilities' in exp:
                        if isinstance(exp['responsibilities'], str):
                            optimized['work_experience'][i]['responsibilities'] = self._optimize_text(
                                exp['responsibilities']
                            )
                        elif isinstance(exp['responsibilities'], list):
                            optimized['work_experience'][i]['responsibilities'] = [
                                self._optimize_text(resp) for resp in exp['responsibilities']
                            ]
                    
                    # Optimizar descripción
                    if 'description' in exp:
                        optimized['work_experience'][i]['description'] = self._optimize_text(
                            exp['description']
                        )
        
        # Optimizar educación
        if 'education' in optimized and isinstance(optimized['education'], list):
            for i, edu in enumerate(optimized['education']):
                if isinstance(edu, dict) and 'description' in edu:
                    optimized['education'][i]['description'] = self._optimize_text(
                        edu['description']
                    )
        
        # Agregar keywords del job description si está disponible
        if job_description:
            keywords = self._extract_keywords(job_description)
            optimized['_matched_keywords'] = keywords[:10]  # Top 10 keywords
        
        return optimized
    
    def _optimize_text(self, text: str) -> str:
        """
        Optimiza un texto reemplazando palabras débiles por verbos de acción.
        
        Args:
            text: Texto a optimizar
            
        Returns:
            Texto optimizado
        """
        if not text or not isinstance(text, str):
            return text
        
        optimized_text = text
        
        # Reemplazar palabras débiles
        for weak, strong in self.WEAK_WORDS.items():
            # Buscar la palabra débil como palabra completa
            pattern = r'\b' + re.escape(weak) + r'\b'
            optimized_text = re.sub(
                pattern, 
                strong, 
                optimized_text, 
                flags=re.IGNORECASE
            )
        
        return optimized_text
    
    def generate_suggestions(self, cv_data: Dict[str, Any]) -> List[str]:
        """
        Genera sugerencias de mejora para el CV.
        
        Args:
            cv_data: Datos del CV a analizar
            
        Returns:
            Lista de sugerencias específicas
        """
        suggestions = []
        
        # Analizar resumen profesional
        summary = cv_data.get('professional_summary', '')
        if not summary:
            suggestions.append("📝 Agrega un resumen profesional que destaque tus fortalezas")
        elif len(summary.split()) < 30:
            suggestions.append("📝 Expande tu resumen profesional (mínimo 30 palabras recomendadas)")
        
        # Analizar experiencia laboral
        experience = cv_data.get('work_experience', [])
        if not experience:
            suggestions.append("💼 Agrega experiencia laboral para fortalecer tu CV")
        else:
            # Verificar cuantificación
            has_numbers = False
            for exp in experience:
                exp_text = str(exp)
                if re.search(r'\d+[\%\$]?|\d+\+', exp_text):
                    has_numbers = True
                    break
            
            if not has_numbers:
                suggestions.append("📊 Cuantifica tus logros con números, porcentajes o métricas")
        
        # Analizar skills
        skills = cv_data.get('skills', [])
        if not skills:
            suggestions.append("🎯 Agrega habilidades técnicas relevantes para tu industria")
        elif len(skills) < 5:
            suggestions.append("🎯 Agrega más habilidades (mínimo 5-8 recomendadas)")
        
        # Analizar educación
        education = cv_data.get('education', [])
        if not education:
            suggestions.append("🎓 Agrega tu formación académica")
        
        # Analizar uso de verbos débiles
        weak_words_found = []
        text = str(cv_data).lower()
        
        for weak in self.WEAK_WORDS.keys():
            if weak in text:
                weak_words_found.append(weak)
        
        if weak_words_found:
            suggestions.append(
                f"💪 Reemplaza verbos débiles: {', '.join(weak_words_found[:3])} "
                f"por verbos de acción más fuertes"
            )
        
        # Analizar longitud de descripciones
        if experience:
            for exp in experience:
                if isinstance(exp, dict):
                    desc = exp.get('description', '') or exp.get('responsibilities', '')
                    if desc and len(str(desc).split()) < 20:
                        suggestions.append(
                            "📋 Expande las descripciones de tu experiencia (mínimo 20 palabras)"
                        )
                        break
        
        # Si no hay sugerencias, agregar una positiva
        if not suggestions:
            suggestions.append("✅ ¡Excelente! Tu CV tiene una estructura sólida")
            suggestions.append("💡 Considera agregar logros cuantificables para destacar más")
        
        return suggestions[:7]  # Máximo 7 sugerencias
    
    def _extract_keywords(self, job_description: str) -> List[str]:
        """
        Extrae keywords relevantes del job description.
        
        Args:
            job_description: Texto del job description
            
        Returns:
            Lista de keywords más relevantes
        """
        if not job_description:
            return []
        
        # Convertir a minúsculas y limpiar
        text = job_description.lower()
        
        # Remover puntuación y palabras comunes
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Stop words en español e inglés
        stop_words = {
            'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no',
            'por', 'con', 'para', 'una', 'su', 'al', 'lo', 'como', 'más',
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
            'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
            'buscamos', 'empresa', 'persona', 'ofrecemos', 'requisitos', 'años',
            'experiencia', 'conocimientos', 'habilidades', 'perfil', 'puesto'
        }
        
        # Extraer palabras
        words = text.split()
        
        # Filtrar stop words y palabras muy cortas
        keywords = [
            word for word in words 
            if word not in stop_words and len(word) > 3
        ]
        
        # Contar frecuencia
        word_freq = Counter(keywords)
        
        # Retornar las 20 palabras más comunes
        return [word for word, count in word_freq.most_common(20)]
    
    def analyze_cv_strength(self, cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analiza la fortaleza del CV y retorna un score detallado.
        
        Args:
            cv_data: Datos del CV a analizar
            
        Returns:
            Diccionario con scores y análisis
        """
        analysis = {
            'total_score': 0,
            'sections_score': {},
            'weak_words_count': 0,
            'action_verbs_count': 0,
            'quantification_count': 0
        }
        
        text = str(cv_data).lower()
        
        # Contar palabras débiles
        for weak in self.WEAK_WORDS.keys():
            if weak in text:
                analysis['weak_words_count'] += text.count(weak)
        
        # Contar verbos de acción
        for verb in self.all_action_verbs:
            if verb.lower() in text:
                analysis['action_verbs_count'] += 1
        
        # Contar cuantificaciones
        numbers = re.findall(r'\d+[\%\$]?|\d+\+', text)
        analysis['quantification_count'] = len(numbers)
        
        # Score por secciones (0-100)
        if cv_data.get('professional_summary'):
            analysis['sections_score']['summary'] = 90
        else:
            analysis['sections_score']['summary'] = 0
        
        if cv_data.get('work_experience'):
            exp_count = len(cv_data['work_experience'])
            analysis['sections_score']['experience'] = min(100, exp_count * 30)
        else:
            analysis['sections_score']['experience'] = 0
        
        if cv_data.get('skills'):
            skills_count = len(cv_data['skills'])
            analysis['sections_score']['skills'] = min(100, skills_count * 12)
        else:
            analysis['sections_score']['skills'] = 0
        
        if cv_data.get('education'):
            analysis['sections_score']['education'] = 85
        else:
            analysis['sections_score']['education'] = 0
        
        # Score total (promedio)
        if analysis['sections_score']:
            analysis['total_score'] = int(
                sum(analysis['sections_score'].values()) / len(analysis['sections_score'])
            )
        
        return analysis


def generate_suggestions_native(cv_data: Dict[str, Any], job_description: Optional[str] = None) -> List[str]:
    """
    Wrapper function para generar sugerencias.
    Compatible con llamadas directas desde main.py
    """
    return native_optimizer.generate_suggestions(cv_data)


def analyze_ats_compatibility(cv_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analiza la compatibilidad del CV con sistemas ATS.
    
    Args:
        cv_data: Datos del CV a analizar
        
    Returns:
        Análisis de compatibilidad ATS
    """
    analysis = native_optimizer.analyze_cv_strength(cv_data)
    
    # Calcular score ATS (0-100)
    ats_score = analysis['total_score']
    
    # Factores ATS
    factors = []
    
    if cv_data.get('contact_info'):
        factors.append('✅ Información de contacto presente')
    else:
        factors.append('❌ Falta información de contacto')
    
    if cv_data.get('professional_summary'):
        factors.append('✅ Resumen profesional incluido')
    else:
        factors.append('❌ Falta resumen profesional')
    
    if cv_data.get('work_experience'):
        factors.append('✅ Experiencia laboral documentada')
    else:
        factors.append('❌ Falta experiencia laboral')
    
    if cv_data.get('skills'):
        factors.append('✅ Habilidades listadas')
    else:
        factors.append('❌ Falta lista de habilidades')
    
    if cv_data.get('education'):
        factors.append('✅ Educación incluida')
    else:
        factors.append('❌ Falta información educativa')
    
    # Verificar uso de verbos de acción
    if analysis['action_verbs_count'] > 5:
        factors.append(f"✅ Usa {analysis['action_verbs_count']} verbos de acción fuertes")
    else:
        factors.append(f"⚠️ Pocos verbos de acción ({analysis['action_verbs_count']})")
    
    # Verificar cuantificación
    if analysis['quantification_count'] > 3:
        factors.append(f"✅ Incluye {analysis['quantification_count']} métricas cuantificables")
    else:
        factors.append(f"⚠️ Pocas métricas cuantificables ({analysis['quantification_count']})")
    
    return {
        'ats_score': ats_score,
        'compatibility': 'Alta' if ats_score >= 70 else 'Media' if ats_score >= 50 else 'Baja',
        'factors': factors,
        'recommendations': native_optimizer.generate_suggestions(cv_data)
    }


def calculate_match_score(cv_data: Dict[str, Any], job_description: str) -> int:
    """
    Calcula el score de match entre el CV y el job description.
    
    Args:
        cv_data: Datos del CV
        job_description: Descripción del puesto
        
    Returns:
        Score de 0-100
    """
    if not job_description:
        return 70  # Score neutral si no hay job description
    
    # Extraer keywords del job
    job_keywords = native_optimizer._extract_keywords(job_description)
    
    if not job_keywords:
        return 70
    
    # Texto del CV
    cv_text = str(cv_data).lower()
    
    # Contar matches
    matches = 0
    for keyword in job_keywords:
        if keyword.lower() in cv_text:
            matches += 1
    
    # Calcular score (porcentaje de keywords que matchean)
    if len(job_keywords) > 0:
        score = int((matches / len(job_keywords)) * 100)
    else:
        score = 70
    
    # Bonus por secciones completas
    bonus = 0
    if cv_data.get('professional_summary'):
        bonus += 5
    if cv_data.get('work_experience'):
        bonus += 10
    if cv_data.get('skills'):
        bonus += 10
    
    return min(100, score + bonus)


def match_skills(cv_skills: List[str], job_description: str) -> Dict[str, Any]:
    """
    Analiza el match entre skills del CV y el job description.
    
    Args:
        cv_skills: Lista de habilidades del CV
        job_description: Descripción del puesto
        
    Returns:
        Análisis de match de skills
    """
    if not job_description or not cv_skills:
        return {
            'matched_skills': [],
            'missing_skills': [],
            'match_percentage': 0
        }
    
    # Extraer keywords del job (probables skills)
    job_keywords = native_optimizer._extract_keywords(job_description)
    job_text = job_description.lower()
    
    # Identificar skills que matchean
    matched = []
    for skill in cv_skills:
        skill_lower = str(skill).lower()
        if skill_lower in job_text or any(keyword in skill_lower for keyword in job_keywords):
            matched.append(skill)
    
    # Identificar skills que podrían estar faltando
    missing = []
    for keyword in job_keywords[:10]:  # Top 10 keywords del job
        if not any(keyword in str(skill).lower() for skill in cv_skills):
            missing.append(keyword.capitalize())
    
    # Calcular porcentaje de match
    if len(cv_skills) > 0:
        match_pct = int((len(matched) / len(cv_skills)) * 100)
    else:
        match_pct = 0
    
    return {
        'matched_skills': matched,
        'missing_skills': missing[:5],  # Top 5 missing
        'match_percentage': match_pct,
        'total_cv_skills': len(cv_skills),
        'total_matched': len(matched)
    }


# Singleton instance
native_optimizer = CVOptimizerNative()
