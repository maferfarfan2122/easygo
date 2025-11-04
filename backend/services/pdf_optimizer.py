"""
🚀 PDF Optimizer - 100% Native Python (No AI)

Optimiza PDFs de CV sin usar OpenAI:
1. Extrae texto del PDF
2. Analiza y optimiza contenido con reglas nativas
3. Genera nuevo PDF optimizado

Velocidad: ~2-3 segundos
Costo: GRATIS (0 tokens)
"""

import re
import io
from typing import Dict, List, Tuple
from PyPDF2 import PdfReader
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.colors import HexColor
from datetime import datetime


# Reglas de optimización
WEAK_VERBS = {
    'did': ['executed', 'implemented', 'developed', 'achieved'],
    'made': ['created', 'built', 'designed', 'engineered'],
    'helped': ['assisted', 'supported', 'facilitated', 'enabled'],
    'worked on': ['developed', 'implemented', 'engineered', 'built'],
    'responsible for': ['managed', 'led', 'directed', 'oversaw'],
    'was': ['served as', 'acted as', 'functioned as'],
    'used': ['utilized', 'leveraged', 'employed', 'applied'],
    'got': ['achieved', 'obtained', 'secured', 'attained'],
    'handled': ['managed', 'coordinated', 'administered', 'supervised']
}

ACTION_VERBS = [
    'Achieved', 'Administered', 'Advanced', 'Analyzed', 'Architected',
    'Built', 'Coordinated', 'Created', 'Delivered', 'Demonstrated',
    'Designed', 'Developed', 'Directed', 'Drove', 'Engineered',
    'Enhanced', 'Established', 'Executed', 'Expanded', 'Facilitated',
    'Generated', 'Grew', 'Implemented', 'Improved', 'Increased',
    'Initiated', 'Launched', 'Led', 'Managed', 'Optimized',
    'Orchestrated', 'Performed', 'Pioneered', 'Produced', 'Reduced',
    'Redesigned', 'Resolved', 'Spearheaded', 'Streamlined', 'Strengthened'
]

ATS_KEYWORDS = [
    'leadership', 'management', 'strategic', 'innovative', 'results-driven',
    'cross-functional', 'collaborative', 'data-driven', 'agile', 'analytical',
    'problem-solving', 'communication', 'technical', 'project management'
]


class PDFOptimizer:
    """Optimiza PDFs de CV sin usar IA"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()
    
    def _create_custom_styles(self):
        """Crea estilos personalizados para el PDF"""
        # Estilo para nombre
        if 'Name' not in self.styles:
            self.styles.add(ParagraphStyle(
                name='Name',
                parent=self.styles['Heading1'],
                fontSize=24,
                textColor=HexColor('#2C3E50'),
                spaceAfter=6,
                alignment=TA_CENTER,
                fontName='Helvetica-Bold'
            ))
        
        # Estilo para información de contacto
        if 'Contact' not in self.styles:
            self.styles.add(ParagraphStyle(
                name='Contact',
                parent=self.styles['Normal'],
                fontSize=10,
                textColor=HexColor('#34495E'),
                alignment=TA_CENTER,
                spaceAfter=12
            ))
        
        # Estilo para títulos de sección
        if 'SectionTitle' not in self.styles:
            self.styles.add(ParagraphStyle(
                name='SectionTitle',
                parent=self.styles['Heading2'],
                fontSize=14,
                textColor=HexColor('#2980B9'),
                spaceAfter=8,
                spaceBefore=12,
                fontName='Helvetica-Bold',
                borderWidth=0,
                borderColor=HexColor('#2980B9'),
                borderPadding=0,
                leftIndent=0
            ))
        
        # Estilo para contenido
        if 'Content' not in self.styles:
            self.styles.add(ParagraphStyle(
                name='Content',
                parent=self.styles['Normal'],
                fontSize=10,
                textColor=HexColor('#2C3E50'),
                spaceAfter=6,
                leading=14,
                leftIndent=0
            ))
        
        # Estilo para bullets (usar nombre único)
        if 'CVBullet' not in self.styles:
            self.styles.add(ParagraphStyle(
                name='CVBullet',
                parent=self.styles['Normal'],
                fontSize=10,
                textColor=HexColor('#2C3E50'),
                spaceAfter=4,
                leading=13,
                leftIndent=20,
                bulletIndent=10
            ))
    
    def extract_text_from_pdf(self, pdf_file) -> str:
        """Extrae texto de un PDF"""
        try:
            reader = PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            raise ValueError(f"Error extracting PDF: {str(e)}")
    
    def parse_cv_structure(self, text: str) -> Dict:
        """
        Parsea el texto del CV y extrae estructura
        Detecta secciones comunes: contacto, experiencia, educación, skills
        """
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        cv_data = {
            'name': '',
            'contact': [],
            'summary': '',
            'experience': [],
            'education': [],
            'skills': [],
            'other_sections': []
        }
        
        # Detectar nombre (primera línea con palabras capitalizadas)
        for i, line in enumerate(lines[:5]):
            if len(line.split()) <= 4 and line[0].isupper():
                cv_data['name'] = line
                break
        
        # Detectar email, teléfono, LinkedIn
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]'
        
        for line in lines[:10]:
            if re.search(email_pattern, line):
                cv_data['contact'].append(line)
            elif re.search(phone_pattern, line):
                cv_data['contact'].append(line)
            elif 'linkedin' in line.lower() or 'github' in line.lower():
                cv_data['contact'].append(line)
        
        # Detectar secciones
        current_section = None
        section_content = []
        
        section_keywords = {
            'experience': ['experience', 'work history', 'employment', 'professional experience'],
            'education': ['education', 'academic', 'qualification'],
            'skills': ['skills', 'technical skills', 'competencies', 'expertise'],
            'summary': ['summary', 'profile', 'objective', 'about']
        }
        
        for line in lines:
            # Detectar si es un título de sección
            line_lower = line.lower()
            is_section_header = False
            
            for section_type, keywords in section_keywords.items():
                if any(keyword in line_lower for keyword in keywords) and len(line.split()) <= 4:
                    if current_section and section_content:
                        if current_section == 'experience':
                            cv_data['experience'].extend(self._parse_experience(section_content))
                        elif current_section == 'skills':
                            cv_data['skills'].extend(self._parse_skills(section_content))
                        elif current_section == 'education':
                            cv_data['education'].extend(section_content)
                        elif current_section == 'summary':
                            cv_data['summary'] = ' '.join(section_content)
                    
                    current_section = section_type
                    section_content = []
                    is_section_header = True
                    break
            
            if not is_section_header and line:
                section_content.append(line)
        
        # Procesar última sección
        if current_section and section_content:
            if current_section == 'experience':
                cv_data['experience'].extend(self._parse_experience(section_content))
            elif current_section == 'skills':
                cv_data['skills'].extend(self._parse_skills(section_content))
            elif current_section == 'education':
                cv_data['education'].extend(section_content)
            elif current_section == 'summary':
                cv_data['summary'] = ' '.join(section_content)
        
        return cv_data
    
    def _parse_experience(self, lines: List[str]) -> List[Dict]:
        """Parsea experiencia laboral"""
        experiences = []
        current_exp = None
        
        for line in lines:
            # Detectar inicio de nueva experiencia (título de puesto o empresa)
            if len(line.split()) <= 8 and (
                any(char.isupper() for char in line[:3]) or
                '|' in line or '-' in line[:20]
            ):
                if current_exp:
                    experiences.append(current_exp)
                current_exp = {
                    'title': line,
                    'bullets': []
                }
            elif current_exp and line:
                # Es un bullet o descripción
                current_exp['bullets'].append(line)
        
        if current_exp:
            experiences.append(current_exp)
        
        return experiences
    
    def _parse_skills(self, lines: List[str]) -> List[str]:
        """Parsea skills"""
        skills = []
        for line in lines:
            # Separar por comas, pipes, bullets
            parts = re.split(r'[,|•\-]', line)
            for part in parts:
                skill = part.strip()
                if skill and len(skill) < 50:  # Skills no deben ser muy largos
                    skills.append(skill)
        return skills
    
    def optimize_content(self, cv_data: Dict) -> Dict:
        """
        Optimiza el contenido del CV con reglas nativas
        """
        optimized = cv_data.copy()
        
        # Optimizar summary
        if optimized['summary']:
            optimized['summary'] = self._optimize_text(optimized['summary'])
        
        # Optimizar experiencia
        optimized_experiences = []
        for exp in optimized['experience']:
            optimized_exp = exp.copy()
            optimized_bullets = []
            
            for bullet in exp['bullets']:
                optimized_bullet = self._optimize_bullet(bullet)
                optimized_bullets.append(optimized_bullet)
            
            optimized_exp['bullets'] = optimized_bullets
            optimized_experiences.append(optimized_exp)
        
        optimized['experience'] = optimized_experiences
        
        return optimized
    
    def _optimize_text(self, text: str) -> str:
        """Optimiza un texto general"""
        # Reemplazar verbos débiles
        for weak, strong_options in WEAK_VERBS.items():
            pattern = r'\b' + weak + r'\b'
            if re.search(pattern, text, re.IGNORECASE):
                text = re.sub(pattern, strong_options[0], text, flags=re.IGNORECASE)
        
        return text
    
    def _optimize_bullet(self, bullet: str) -> str:
        """Optimiza un bullet point"""
        # Remover bullets y limpiar
        bullet = re.sub(r'^[•\-\*\◦]\s*', '', bullet).strip()
        
        # Si no empieza con verbo de acción, agregarlo
        words = bullet.split()
        if words and words[0].lower() not in [v.lower() for v in ACTION_VERBS]:
            # Detectar si es descripción pasiva y convertir
            if any(weak in bullet.lower() for weak in ['responsible for', 'worked on', 'did']):
                for weak, strong_options in WEAK_VERBS.items():
                    pattern = r'\b' + weak + r'\b'
                    bullet = re.sub(pattern, strong_options[0], bullet, flags=re.IGNORECASE)
            else:
                # Agregar verbo de acción al inicio
                bullet = f"{ACTION_VERBS[0]} {bullet.lower()}"
        
        # Capitalizar primera letra
        if bullet:
            bullet = bullet[0].upper() + bullet[1:]
        
        return bullet
    
    def generate_optimized_pdf(self, cv_data: Dict) -> io.BytesIO:
        """Genera PDF optimizado"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        story = []
        
        # Nombre
        if cv_data['name']:
            story.append(Paragraph(cv_data['name'], self.styles['Name']))
            story.append(Spacer(1, 0.1*inch))
        
        # Contacto
        if cv_data['contact']:
            contact_text = ' | '.join(cv_data['contact'])
            story.append(Paragraph(contact_text, self.styles['Contact']))
            story.append(Spacer(1, 0.2*inch))
        
        # Summary
        if cv_data['summary']:
            story.append(Paragraph('PROFESSIONAL SUMMARY', self.styles['SectionTitle']))
            story.append(Paragraph(cv_data['summary'], self.styles['Content']))
            story.append(Spacer(1, 0.15*inch))
        
        # Experience
        if cv_data['experience']:
            story.append(Paragraph('PROFESSIONAL EXPERIENCE', self.styles['SectionTitle']))
            for exp in cv_data['experience']:
                # Título del puesto
                story.append(Paragraph(f"<b>{exp['title']}</b>", self.styles['Content']))
                # Bullets
                for bullet in exp['bullets']:
                    bullet_text = f"• {bullet}"
                    story.append(Paragraph(bullet_text, self.styles['CVBullet']))
                story.append(Spacer(1, 0.1*inch))
        
        # Skills
        if cv_data['skills']:
            story.append(Paragraph('SKILLS', self.styles['SectionTitle']))
            skills_text = ' • '.join(cv_data['skills'])
            story.append(Paragraph(skills_text, self.styles['Content']))
            story.append(Spacer(1, 0.15*inch))
        
        # Education
        if cv_data['education']:
            story.append(Paragraph('EDUCATION', self.styles['SectionTitle']))
            for edu in cv_data['education']:
                story.append(Paragraph(edu, self.styles['Content']))
        
        # Footer
        story.append(Spacer(1, 0.3*inch))
        footer_text = f'<i>Optimized by EasyGo • {datetime.now().strftime("%B %Y")}</i>'
        story.append(Paragraph(footer_text, self.styles['Contact']))
        
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    def analyze_pdf(self, cv_data: Dict) -> Dict:
        """Analiza el PDF y da métricas"""
        total_bullets = sum(len(exp['bullets']) for exp in cv_data['experience'])
        weak_verbs_count = 0
        missing_action_verbs = 0
        
        for exp in cv_data['experience']:
            for bullet in exp['bullets']:
                # Contar verbos débiles
                for weak in WEAK_VERBS.keys():
                    if weak in bullet.lower():
                        weak_verbs_count += 1
                
                # Verificar si empieza con action verb
                words = bullet.strip().split()
                if words and words[0].lower() not in [v.lower() for v in ACTION_VERBS]:
                    missing_action_verbs += 1
        
        ats_score = max(0, 100 - (weak_verbs_count * 10) - (missing_action_verbs * 5))
        
        return {
            'total_bullets': total_bullets,
            'weak_verbs_found': weak_verbs_count,
            'missing_action_verbs': missing_action_verbs,
            'ats_score': min(100, ats_score),
            'optimization_suggestions': [
                f"Replace {weak_verbs_count} weak verbs with action verbs",
                f"Add action verbs to {missing_action_verbs} bullet points",
                "Ensure all achievements are quantified",
                "Add ATS-friendly keywords"
            ]
        }


# Singleton instance
pdf_optimizer = PDFOptimizer()
