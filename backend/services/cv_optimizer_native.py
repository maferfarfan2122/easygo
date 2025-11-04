""""""

🔧 Optimizador de CV Nativo - Sin IA🎯 Native CV Optimizer - Sin OpenAI

Optimiza CVs usando lógica algorítmica pura en PythonOptimiza CVs usando algoritmos Python puros:

No requiere OpenAI API, es completamente gratis y rápido (<1s)- Análisis de keywords del job description

"""- Matching de skills relevantes

- Priorización de experiencias

import re- Optimización de bullets con action verbs

from typing import Dict, List, Optional- Sugerencias basadas en reglas

from collections import Counter"""

import string

import re

from typing import Dict, List, Optional, Set

class NativeCVOptimizer:from collections import Counter

    """import string

    Optimizador de CV con lógica nativa en Python.

    No usa IA, solo algoritmos y reglas de mejores prácticas.

    """# ============================================================================

    # KEYWORDS Y PATRONES

    # Palabras clave de acción para diferentes roles# ============================================================================

    ACTION_VERBS = {

        'technical': [ACTION_VERBS = [

            'Developed', 'Engineered', 'Implemented', 'Architected', 'Designed',    "achieved", "improved", "increased", "reduced", "developed", "created",

            'Built', 'Created', 'Programmed', 'Optimized', 'Automated',    "implemented", "designed", "managed", "led", "coordinated", "delivered",

            'Integrated', 'Deployed', 'Maintained', 'Debugged', 'Refactored'    "optimized", "automated", "streamlined", "launched", "built", "established",

        ],    "drove", "executed", "analyzed", "resolved", "enhanced", "collaborated",

        'management': [    "spearheaded", "facilitated", "mentored", "trained", "architected"

            'Led', 'Managed', 'Directed', 'Coordinated', 'Supervised',]

            'Oversaw', 'Established', 'Organized', 'Planned', 'Executed',

            'Facilitated', 'Mentored', 'Trained', 'Delegated', 'Motivated'WEAK_VERBS = [

        ],    "was", "were", "responsible for", "in charge of", "helped with",

        'business': [    "worked on", "assisted", "involved in", "participated", "did"

            'Achieved', 'Increased', 'Reduced', 'Improved', 'Delivered',]

            'Generated', 'Negotiated', 'Closed', 'Exceeded', 'Maximized',

            'Streamlined', 'Enhanced', 'Drove', 'Accelerated', 'Transformed'TECHNICAL_SKILLS = [

        ],    # Programming Languages

        'analytical': [    "python", "javascript", "java", "c++", "c#", "ruby", "go", "rust",

            'Analyzed', 'Evaluated', 'Assessed', 'Researched', 'Identified',    "typescript", "php", "swift", "kotlin", "scala", "r",

            'Investigated', 'Measured', 'Calculated', 'Forecasted', 'Validated',    

            'Tested', 'Reviewed', 'Audited', 'Monitored', 'Tracked'    # Frameworks & Libraries

        ]    "react", "angular", "vue", "node.js", "express", "django", "flask",

    }    "spring", "laravel", ".net", "fastapi", "nextjs", "gatsby",

        

    # Palabras débiles a evitar    # Databases

    WEAK_WORDS = [    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",

        'responsible for', 'worked on', 'helped with', 'involved in',    "dynamodb", "cassandra", "oracle", "sqlite",

        'participated in', 'assisted with', 'contributed to', 'was part of',    

        'duties included', 'tasks included', 'helped to', 'worked with'    # Cloud & DevOps

    ]    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "gitlab",

        "terraform", "ansible", "ci/cd", "git", "github", "bitbucket",

    # Palabras clave técnicas comunes (ATS keywords)    

    TECH_KEYWORDS = {    # Tools & Others

        'languages': [    "agile", "scrum", "jira", "api", "rest", "graphql", "microservices",

            'Python', 'JavaScript', 'Java', 'C++', 'C#', 'TypeScript', 'Go',    "machine learning", "ai", "data science", "analytics"

            'Ruby', 'PHP', 'Swift', 'Kotlin', 'Rust', 'Scala', 'R', 'SQL']

        ],

        'frameworks': [QUANTIFIABLE_PATTERNS = [

            'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',    r'\d+%',  # 25%

            'Spring', 'FastAPI', 'Next.js', 'Nuxt', 'Laravel', 'Rails', 'ASP.NET'    r'\d+x',  # 3x

        ],    r'\$\d+[KMB]?',  # $50K, $1M

        'tools': [    r'\d+\+',  # 100+

            'Git', 'Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Azure', 'GCP',    r'\d+ (users|customers|clients|projects|people|team)',

            'CI/CD', 'Jira', 'Agile', 'Scrum', 'MongoDB', 'PostgreSQL', 'Redis']

        ],

        'skills': [

            'API', 'REST', 'GraphQL', 'Microservices', 'TDD', 'DevOps',# ============================================================================

            'Machine Learning', 'AI', 'Data Analysis', 'Cloud', 'Security'# ANÁLISIS DE KEYWORDS

        ]# ============================================================================

    }

    def extract_keywords(text: str) -> Set[str]:

    def __init__(self):    """

        """Inicializa el optimizador nativo."""    Extrae keywords relevantes de un texto.

        self.all_action_verbs = []    Filtra stopwords y palabras cortas.

        for verbs in self.ACTION_VERBS.values():    """

            self.all_action_verbs.extend(verbs)    # Limpiar texto

        text = text.lower()

    def optimize_cv(self, cv_data: Dict, job_description: str = "") -> Dict:    text = re.sub(r'[^\w\s]', ' ', text)

        """    

        Optimiza el CV completo usando lógica nativa.    # Stopwords comunes

            stopwords = {

        Args:        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',

            cv_data: Datos del CV        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',

            job_description: Descripción del trabajo (opcional)        'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',

                'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall'

        Returns:    }

            CV optimizado con mejoras    

        """    # Extraer palabras

        optimized = cv_data.copy()    words = text.split()

            keywords = {

        # 1. Optimizar resumen profesional        word for word in words 

        if cv_data.get('professional_summary'):        if len(word) > 3 and word not in stopwords

            optimized['professional_summary'] = self.optimize_summary(    }

                cv_data['professional_summary'],    

                job_description    return keywords

            )

        

        # 2. Optimizar experiencias laboralesdef match_skills(cv_skills: List[str], job_description: str) -> Dict:

        if cv_data.get('work_experience'):    """

            optimized['work_experience'] = [    Analiza qué skills del CV coinciden con el job description.

                self.optimize_experience(exp, job_description)    Retorna matched, missing y priority.

                for exp in cv_data['work_experience']    """

            ]    job_keywords = extract_keywords(job_description)

            job_lower = job_description.lower()

        # 3. Optimizar skills    

        if cv_data.get('skills'):    matched_skills = []

            optimized['skills'] = self.optimize_skills(    unmatched_skills = []

                cv_data['skills'],    

                job_description    for skill in cv_skills:

            )        skill_lower = skill.lower()

                # Check if skill or sus keywords aparecen en job description

        return optimized        if skill_lower in job_lower or any(kw in skill_lower for kw in job_keywords):

                matched_skills.append(skill)

    def optimize_summary(self, summary: str, job_description: str = "") -> str:        else:

        """            unmatched_skills.append(skill)

        Optimiza el resumen profesional.    

            # Detectar skills que faltan pero están en el job description

        Mejoras:    missing_skills = []

        - Elimina palabras débiles    for tech_skill in TECHNICAL_SKILLS:

        - Agrega verbos de acción        if tech_skill in job_lower:

        - Asegura que sea conciso (80-120 palabras)            # Check if already in CV

        - Incluye keywords del job description            has_skill = any(tech_skill in s.lower() for s in cv_skills)

        """            if not has_skill:

        if not summary:                missing_skills.append(tech_skill.title())

            return summary    

            return {

        # Limpiar el summary        "matched": matched_skills,

        optimized = summary.strip()        "unmatched": unmatched_skills,

                "missing": missing_skills[:5],  # Top 5

        # Reemplazar palabras débiles con versiones más fuertes        "match_score": len(matched_skills) / len(cv_skills) if cv_skills else 0

        for weak in self.WEAK_WORDS:    }

            if weak in optimized.lower():

                # Encontrar un verbo de acción apropiado

                action_verb = self._get_random_action_verb()# ============================================================================

                optimized = re.sub(# OPTIMIZACIÓN DE BULLETS

                    re.escape(weak),# ============================================================================

                    action_verb,

                    optimized,def optimize_bullet(bullet: str, job_keywords: Set[str]) -> Dict:

                    flags=re.IGNORECASE    """

                )    Optimiza un bullet point individual.

            Retorna el bullet optimizado y un score.

        # Asegurar que comience con mayúscula    """

        if optimized:    original = bullet.strip()

            optimized = optimized[0].upper() + optimized[1:]    optimized = original

            issues = []

        # Limitar longitud (80-120 palabras)    score = 100

        words = optimized.split()    

        if len(words) > 120:    # 1. Check si empieza con action verb

            optimized = ' '.join(words[:120]) + '...'    first_word = original.split()[0].lower() if original else ""

            starts_with_action = first_word in ACTION_VERBS

        # Agregar keywords del job description si están faltando    starts_with_weak = any(original.lower().startswith(weak) for weak in WEAK_VERBS)

        if job_description:    

            job_keywords = self._extract_keywords(job_description)    if starts_with_weak:

            summary_lower = optimized.lower()        issues.append("weak_verb")

                    score -= 20

            # Agregar hasta 3 keywords importantes que falten        # Sugerir reemplazo

            missing_keywords = [        for action_verb in ACTION_VERBS[:3]:

                kw for kw in job_keywords[:5]            if action_verb not in original.lower():

                if kw.lower() not in summary_lower                optimized = f"{action_verb.title()} " + original.split(maxsplit=1)[1] if len(original.split()) > 1 else original

            ]                break

                

            if missing_keywords:    elif not starts_with_action:

                # Integrar naturalmente        issues.append("no_action_verb")

                keywords_str = ', '.join(missing_keywords[:3])        score -= 15

                if not optimized.endswith('.'):    

                    optimized += '.'    # 2. Check si tiene números/métricas

                optimized += f" Experienced with {keywords_str}."    has_numbers = bool(re.search(r'\d', original))

            has_quantifiable = any(re.search(pattern, original) for pattern in QUANTIFIABLE_PATTERNS)

        return optimized    

        if not has_numbers:

    def optimize_experience(self, experience: Dict, job_description: str = "") -> Dict:        issues.append("no_metrics")

        """        score -= 25

        Optimiza una experiencia laboral.    

            # 3. Check longitud (ideal: 15-25 palabras)

        Mejoras:    word_count = len(original.split())

        - Convierte bullets débiles en fuertes    if word_count < 10:

        - Agrega verbos de acción        issues.append("too_short")

        - Cuantifica logros (detecta números)        score -= 10

        - Elimina redundancias    elif word_count > 30:

        """        issues.append("too_long")

        optimized_exp = experience.copy()        score -= 10

            

        # Optimizar responsibilities/bullets    # 4. Check relevancia con job keywords

        if 'responsibilities' in experience:    bullet_words = set(original.lower().split())

            bullets = experience['responsibilities']    keyword_matches = len(bullet_words & job_keywords)

        elif 'description' in experience:    relevance_score = min(keyword_matches * 10, 30)

            bullets = experience['description']    score += relevance_score

        else:    

            return optimized_exp    if keyword_matches == 0:

                issues.append("low_relevance")

        if not bullets:    

            return optimized_exp    # 5. Capitalizar correctamente

            if not original[0].isupper():

        # Convertir a lista si es string        optimized = optimized.capitalize()

        if isinstance(bullets, str):    

            bullets = [bullets]    # 6. Asegurar que termina con punto

            if not optimized.endswith('.'):

        optimized_bullets = []        optimized = optimized + '.'

            

        for bullet in bullets:    return {

            if not bullet or not bullet.strip():        "original": original,

                continue        "optimized": optimized,

                    "score": max(0, min(100, score)),

            optimized_bullet = self._optimize_bullet(bullet, job_description)        "issues": issues,

            optimized_bullets.append(optimized_bullet)        "has_metrics": has_numbers,

                "has_action_verb": starts_with_action,

        # Guardar bullets optimizados        "keyword_matches": keyword_matches,

        if 'responsibilities' in experience:        "word_count": word_count

            optimized_exp['responsibilities'] = optimized_bullets    }

        elif 'description' in experience:

            optimized_exp['description'] = optimized_bullets

        def optimize_experience(experience: Dict, job_keywords: Set[str]) -> Dict:

        return optimized_exp    """

        Optimiza una experiencia laboral completa.

    def _optimize_bullet(self, bullet: str, job_description: str = "") -> str:    """

        """    optimized_exp = experience.copy()

        Optimiza un bullet point individual.    

        """    # Optimizar responsibilities/bullets

        bullet = bullet.strip()    bullets = experience.get('responsibilities', []) or experience.get('description', [])

            if bullets:

        # Eliminar bullet markers existentes        optimized_bullets = []

        bullet = re.sub(r'^[•\-\*]\s*', '', bullet)        bullet_scores = []

                

        # Verificar si ya comienza con verbo de acción        for bullet in bullets:

        first_word = bullet.split()[0] if bullet.split() else ""            if isinstance(bullet, str) and bullet.strip():

        starts_with_action = first_word in self.all_action_verbs                result = optimize_bullet(bullet, job_keywords)

                        optimized_bullets.append(result['optimized'])

        if not starts_with_action:                bullet_scores.append(result['score'])

            # Reemplazar inicio débil con verbo de acción        

            for weak in self.WEAK_WORDS:        # Ordenar bullets por score (más relevantes primero)

                if bullet.lower().startswith(weak):        sorted_bullets = [b for _, b in sorted(zip(bullet_scores, optimized_bullets), reverse=True)]

                    action_verb = self._get_appropriate_action_verb(bullet, job_description)        

                    bullet = bullet[len(weak):].strip()        if 'responsibilities' in optimized_exp:

                    bullet = f"{action_verb} {bullet}"            optimized_exp['responsibilities'] = sorted_bullets

                    break        elif 'description' in optimized_exp:

                        optimized_exp['description'] = sorted_bullets

            # Si aún no comienza con acción, agregar una        

            if bullet.split()[0] not in self.all_action_verbs:        optimized_exp['_optimization_score'] = sum(bullet_scores) / len(bullet_scores) if bullet_scores else 0

                action_verb = self._get_appropriate_action_verb(bullet, job_description)    

                bullet = f"{action_verb} {bullet}"    return optimized_exp

        

        # Asegurar que comience con mayúscula

        if bullet:# ============================================================================

            bullet = bullet[0].upper() + bullet[1:]# OPTIMIZACIÓN COMPLETA DE CV

        # ============================================================================

        # Detectar si ya tiene números (cuantificación)

        has_numbers = bool(re.search(r'\d+', bullet))def optimize_cv_native(cv_data: Dict, job_description: str) -> Dict:

            """

        # Si no tiene números, intentar sugerir cuantificación    🎯 Optimización nativa completa del CV.

        if not has_numbers and len(bullet) < 100:    No usa OpenAI - solo algoritmos Python.

            # Agregar sugerencia de cuantificación al final    """

            if 'improved' in bullet.lower() or 'increased' in bullet.lower():    job_keywords = extract_keywords(job_description)

                if not bullet.endswith('.'):    optimized_cv = cv_data.copy()

                    bullet += ' by X%'    

            elif 'developed' in bullet.lower() or 'created' in bullet.lower():    # 1. Analizar y optimizar SKILLS

                if not bullet.endswith('.'):    cv_skills = cv_data.get('skills', [])

                    bullet += ' for X+ users'    if isinstance(cv_skills, list) and cv_skills:

                skills_analysis = match_skills(cv_skills, job_description)

        # Eliminar punto final si existe (para consistencia)        

        bullet = bullet.rstrip('.')        # Reordenar skills: matched primero

                optimized_skills = skills_analysis['matched'] + skills_analysis['unmatched']

        return bullet        optimized_cv['skills'] = optimized_skills

            optimized_cv['_skills_analysis'] = skills_analysis

    def optimize_skills(self, skills: List[str], job_description: str = "") -> List[str]:    

        """    # 2. Optimizar EXPERIENCIAS LABORALES

        Optimiza y prioriza la lista de skills.    experiences = cv_data.get('work_experience', []) or cv_data.get('experiences', [])

            if experiences:

        Mejoras:        optimized_experiences = []

        - Prioriza skills mencionados en job description        for exp in experiences:

        - Agrupa por categorías            optimized_exp = optimize_experience(exp, job_keywords)

        - Elimina duplicados            optimized_experiences.append(optimized_exp)

        - Ordena por relevancia        

        """        # Ordenar experiencias por score de optimización

        if not skills:        optimized_experiences.sort(

            return skills            key=lambda x: x.get('_optimization_score', 0),

                    reverse=True

        # Eliminar duplicados (case-insensitive)        )

        unique_skills = []        

        seen = set()        if 'work_experience' in optimized_cv:

                    optimized_cv['work_experience'] = optimized_experiences

        for skill in skills:        elif 'experiences' in optimized_cv:

            skill_lower = skill.lower().strip()            optimized_cv['experiences'] = optimized_experiences

            if skill_lower not in seen:    

                seen.add(skill_lower)    # 3. Optimizar RESUMEN PROFESIONAL

                unique_skills.append(skill.strip())    summary = cv_data.get('professional_summary', '')

            if summary:

        # Si hay job description, priorizar skills mencionados        optimized_cv['professional_summary'] = optimize_summary_native(summary, job_keywords)

        if job_description:    

            job_keywords = set(self._extract_keywords(job_description))    return optimized_cv

            

            # Separar skills en: mencionados en job vs no mencionados

            priority_skills = []def optimize_summary_native(summary: str, job_keywords: Set[str]) -> str:

            other_skills = []    """

                Optimiza el resumen profesional sin IA.

            for skill in unique_skills:    """

                if skill.lower() in [kw.lower() for kw in job_keywords]:    # Asegurar que empiece con mayúscula

                    priority_skills.append(skill)    if not summary[0].isupper():

                else:        summary = summary.capitalize()

                    other_skills.append(skill)    

                # Asegurar que termine con punto

            # Combinar: prioritarios primero    if not summary.endswith('.'):

            optimized_skills = priority_skills + other_skills        summary = summary + '.'

        else:    

            optimized_skills = unique_skills    # Capitalizar palabras clave técnicas

            for tech_skill in TECHNICAL_SKILLS:

        return optimized_skills        if tech_skill in summary.lower():

                summary = re.sub(

    def _get_appropriate_action_verb(self, context: str, job_description: str = "") -> str:                rf'\b{tech_skill}\b',

        """                tech_skill.title(),

        Selecciona un verbo de acción apropiado basado en el contexto.                summary,

        """                flags=re.IGNORECASE

        context_lower = context.lower()            )

            

        # Detectar el tipo de trabajo basado en keywords    return summary

        if any(word in context_lower for word in ['code', 'develop', 'program', 'software', 'system']):

            return self._get_random_action_verb('technical')

        elif any(word in context_lower for word in ['team', 'manage', 'lead', 'coordinate', 'supervise']):# ============================================================================

            return self._get_random_action_verb('management')# GENERACIÓN DE SUGERENCIAS

        elif any(word in context_lower for word in ['sales', 'revenue', 'client', 'customer', 'business']):# ============================================================================

            return self._get_random_action_verb('business')

        elif any(word in context_lower for word in ['data', 'analyze', 'research', 'study', 'evaluate']):def generate_suggestions_native(cv_data: Dict, job_description: str = None) -> List[str]:

            return self._get_random_action_verb('analytical')    """

        else:    Genera sugerencias de mejora basadas en reglas.

            return self._get_random_action_verb()    Ultra rápido - sin IA.

        """

    def _get_random_action_verb(self, category: Optional[str] = None) -> str:    suggestions = []

        """    

        Obtiene un verbo de acción de la categoría especificada.    # Analizar skills

        """    skills = cv_data.get('skills', [])

        if category and category in self.ACTION_VERBS:    if len(skills) < 5:

            import random        suggestions.append("⚠️ Add more skills - aim for at least 8-12 relevant technical skills")

            return random.choice(self.ACTION_VERBS[category])    

        else:    # Analizar experiencias

            import random    experiences = cv_data.get('work_experience', []) or cv_data.get('experiences', [])

            return random.choice(self.all_action_verbs)    if experiences:

            for exp in experiences:

    def _extract_keywords(self, text: str) -> List[str]:            bullets = exp.get('responsibilities', []) or exp.get('description', [])

        """            if bullets:

        Extrae keywords importantes del texto.                # Check action verbs

        """                weak_verbs_count = sum(

        if not text:                    1 for bullet in bullets

            return []                    if isinstance(bullet, str) and any(bullet.lower().startswith(weak) for weak in WEAK_VERBS)

                        )

        # Convertir a minúsculas                if weak_verbs_count > 0:

        text_lower = text.lower()                    suggestions.append(f"💪 Replace weak verbs with strong action verbs in your experience bullets")

                        

        keywords = []                # Check metrics

                        bullets_with_metrics = sum(

        # Buscar keywords técnicos conocidos                    1 for bullet in bullets

        for category, terms in self.TECH_KEYWORDS.items():                    if isinstance(bullet, str) and re.search(r'\d', bullet)

            for term in terms:                )

                if term.lower() in text_lower:                if bullets_with_metrics < len(bullets) / 2:

                    keywords.append(term)                    suggestions.append("📊 Add quantifiable achievements (numbers, percentages, metrics) to your bullets")

            

        # Extraer palabras importantes (sustantivos técnicos)    # Analizar summary

        # Palabras de 3+ letras, capitalizadas o con guiones    summary = cv_data.get('professional_summary', '')

        words = re.findall(r'\b[A-Z][a-z]+\b|\b[a-z]+-[a-z]+\b|\b[A-Z]{2,}\b', text)    if not summary:

        keywords.extend(words[:10])  # Agregar las primeras 10        suggestions.append("📝 Add a compelling professional summary at the top of your CV")

            elif len(summary.split()) < 30:

        # Eliminar duplicados manteniendo orden        suggestions.append("✍️ Expand your professional summary to 50-100 words for better impact")

        seen = set()    

        unique_keywords = []    # Sugerencias de keywords si hay job description

        for kw in keywords:    if job_description:

            if kw.lower() not in seen:        job_keywords = extract_keywords(job_description)

                seen.add(kw.lower())        cv_text = str(cv_data).lower()

                unique_keywords.append(kw)        

                missing_important = []

        return unique_keywords[:15]  # Retornar top 15        for keyword in list(job_keywords)[:10]:

                if keyword not in cv_text and len(keyword) > 4:

    def generate_suggestions(self, cv_data: Dict) -> List[str]:                missing_important.append(keyword)

        """        

        Genera sugerencias de mejora para el CV.        if missing_important:

                    suggestions.append(f"🎯 Consider adding these keywords from the job: {', '.join(missing_important[:3])}")

        Returns:    

            Lista de sugerencias accionables    # Sugerencias generales

        """    if len(suggestions) == 0:

        suggestions = []        suggestions = [

                    "✅ Your CV structure looks good! Focus on tailoring it to specific jobs",

        # Analizar resumen            "💡 Consider adding a 'Projects' or 'Achievements' section",

        if cv_data.get('professional_summary'):            "🎓 Include relevant certifications or courses if applicable"

            summary = cv_data['professional_summary']        ]

            words = len(summary.split())    

                return suggestions[:5]  # Top 5

            if words < 50:

                suggestions.append("📝 Tu resumen profesional es muy corto. Expándelo a 80-120 palabras para mayor impacto.")

            elif words > 150:# ============================================================================

                suggestions.append("✂️ Tu resumen profesional es muy largo. Redúcelo a 80-120 palabras para mejor lectura.")# ANÁLISIS DE ATS COMPATIBILITY

            # ============================================================================

            # Verificar verbos de acción

            has_action_verb = any(verb in summary for verb in self.all_action_verbs)def analyze_ats_compatibility(cv_data: Dict) -> Dict:

            if not has_action_verb:    """

                suggestions.append("💪 Agrega verbos de acción fuertes en tu resumen: 'Developed', 'Led', 'Achieved', etc.")    Analiza qué tan compatible es el CV con sistemas ATS.

            """

        # Analizar experiencias    score = 100

        if cv_data.get('work_experience'):    issues = []

            for i, exp in enumerate(cv_data['work_experience']):    

                bullets = exp.get('responsibilities', exp.get('description', []))    # 1. Check estructura básica

                    required_sections = ['personal_info', 'work_experience', 'skills']

                if isinstance(bullets, str):    for section in required_sections:

                    bullets = [bullets]        if section not in cv_data or not cv_data[section]:

                            score -= 20

                if not bullets or len(bullets) == 0:            issues.append(f"missing_{section}")

                    suggestions.append(f"⚠️ Experiencia {i+1}: Agrega bullets con tus logros y responsabilidades.")    

                    continue    # 2. Check keywords

                    cv_text = str(cv_data).lower()

                # Verificar cuantificación    tech_skills_count = sum(1 for skill in TECHNICAL_SKILLS if skill in cv_text)

                has_numbers = any(re.search(r'\d+', str(bullet)) for bullet in bullets)    if tech_skills_count < 3:

                if not has_numbers:        score -= 15

                    suggestions.append(f"📊 Experiencia {i+1}: Cuantifica tus logros con números (ej: 'Increased sales by 25%').")        issues.append("low_keyword_density")

                    

                # Verificar verbos de acción    # 3. Check formatting

                weak_bullets = []    experiences = cv_data.get('work_experience', [])

                for bullet in bullets:    if experiences:

                    bullet_str = str(bullet).lower()        for exp in experiences:

                    if any(weak in bullet_str for weak in self.WEAK_WORDS[:5]):            if not exp.get('position') or not exp.get('company'):

                        weak_bullets.append(bullet)                score -= 10

                                issues.append("incomplete_experience_info")

                if weak_bullets:                break

                    suggestions.append(f"⚡ Experiencia {i+1}: Reemplaza frases débiles con verbos de acción fuertes.")    

            # 4. Check longitud

        # Analizar skills    total_text = str(cv_data)

        if cv_data.get('skills'):    word_count = len(total_text.split())

            skills = cv_data['skills']    if word_count < 200:

            if len(skills) < 5:        score -= 15

                suggestions.append("🔧 Agrega más skills técnicos relevantes (mínimo 8-12 para mejor visibilidad ATS).")        issues.append("too_short")

            elif len(skills) > 20:    elif word_count > 1500:

                suggestions.append("🎯 Tienes muchos skills listados. Enfócate en los 12-15 más relevantes.")        score -= 10

                issues.append("too_long")

        # Si no hay sugerencias, todo está bien    

        if not suggestions:    return {

            suggestions = [        "score": max(0, score),

                "✅ Tu CV tiene una estructura sólida!",        "issues": issues,

                "💡 Considera agregar proyectos destacados si tienes espacio.",        "keyword_count": tech_skills_count,

                "🎯 Personaliza tu CV para cada aplicación usando keywords del job description."        "word_count": word_count,

            ]        "rating": "Excellent" if score >= 80 else "Good" if score >= 60 else "Needs Improvement"

            }

        return suggestions[:5]  # Máximo 5 sugerencias



# ============================================================================

# Instancia global# UTILITY FUNCTIONS

native_optimizer = NativeCVOptimizer()# ============================================================================


def calculate_match_score(cv_data: Dict, job_description: str) -> float:
    """
    Calcula un score de 0-100 de qué tan bien el CV coincide con el job.
    """
    job_keywords = extract_keywords(job_description)
    cv_text = str(cv_data).lower()
    cv_keywords = extract_keywords(cv_text)
    
    # Jaccard similarity
    intersection = len(job_keywords & cv_keywords)
    union = len(job_keywords | cv_keywords)
    
    similarity = (intersection / union * 100) if union > 0 else 0
    
    # Bonus por skills técnicos
    skills = cv_data.get('skills', [])
    skill_analysis = match_skills(skills, job_description)
    skill_bonus = skill_analysis['match_score'] * 20
    
    total_score = min(100, similarity + skill_bonus)
    
    return round(total_score, 2)
