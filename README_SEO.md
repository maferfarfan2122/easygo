# Easy Go - Generador de CVs Profesionales con IA 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-purple.svg)](https://openai.com/)

**Easy Go** es una plataforma web que utiliza Inteligencia Artificial (GPT-4) para crear currículums profesionales optimizados según ofertas de trabajo específicas.

🌐 **Sitio web**: [https://easygo.com.es](https://easygo.com.es)

## 🎯 Características Principales

### ✨ Generación de CV con IA
- **Análisis inteligente** de ofertas de trabajo
- **Optimización automática** del contenido para ATS (Applicant Tracking Systems)
- **Sugerencias personalizadas** basadas en la descripción del puesto
- **Reescritura profesional** de resúmenes y experiencias

### 📄 Exportación Profesional
- Generación de **PDF de alta calidad** con ReportLab
- Diseño limpio y profesional
- Formato optimizado para lectura ATS
- Descarga instantánea

### 🔐 Autenticación Segura
- Sistema completo con **Supabase Auth**
- Registro, login y recuperación de contraseña
- Sesiones persistentes y seguras
- Rutas protegidas

## 🛠️ Stack Tecnológico

### Frontend
- **React 18.3** con TypeScript
- **Vite 7** como build tool
- **React Router DOM 7** para navegación
- **Supabase JS** para autenticación
- **CSS** personalizado

### Backend
- **FastAPI 0.115** (Python)
- **OpenAI GPT-4 Turbo** para optimización con IA
- **ReportLab 4.2** para generación de PDFs
- **Uvicorn** como servidor ASGI
- **Docker** para containerización

### Servicios
- **Supabase** - Autenticación y base de datos
- **OpenAI API** - Procesamiento de lenguaje natural
- **Vercel** - Hosting del frontend
- **Render/Railway** - Hosting del backend

## 📦 Instalación y Configuración

### Prerrequisitos
```bash
# Node.js 18+ y npm
node --version
npm --version

# Python 3.11+
python --version

# Git
git --version
```

### 1. Clonar el repositorio
```bash
git clone https://github.com/maferfarfan2122/easygo.git
cd easygo
```

### 2. Configurar Frontend

```bash
# Instalar dependencias
npm install

# Crear archivo .env.local
cp .env.example .env.local

# Editar .env.local con tus credenciales
VITE_SUPABASE_URL=tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_API_URL=http://localhost:8000
```

### 3. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales
OPENAI_API_KEY=tu-openai-api-key
PORT=8000
DEBUG=True
```

### 4. Ejecutar en Desarrollo

**Terminal 1 - Frontend:**
```bash
npm run dev
# Abre http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
# API disponible en http://localhost:8000
```

## 🐳 Docker

### Ejecutar con Docker Compose
```bash
# Crear archivo .env con tus credenciales
cp backend/.env.example backend/.env

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 🚀 Deployment

### Frontend (Vercel)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL`
3. Deploy automático en cada push a `main`

### Backend (Render)
1. Crea un nuevo Web Service en Render
2. Conecta tu repositorio
3. Configura:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Agrega variables de entorno:
   - `OPENAI_API_KEY`
   - `DEBUG=False`

## 📖 Documentación de la API

Una vez que el backend esté corriendo, visita:
- **Swagger UI**: `http://localhost:8000/api/docs`
- **ReDoc**: `http://localhost:8000/api/redoc`

### Endpoints Principales

#### 1. Obtener Sugerencias
```http
POST /api/cv/suggestions
Content-Type: application/json

{
  "job_description": "Descripción de la oferta de trabajo..."
}
```

#### 2. Optimizar CV
```http
POST /api/cv/optimize
Content-Type: application/json

{
  "job_description": "...",
  "personal_info": {...},
  "experiences": [...],
  "education": [...],
  "skills": [...],
  "languages": [...]
}
```

#### 3. Generar PDF
```http
POST /api/cv/generate
Content-Type: application/json

{
  "job_description": "...",
  "personal_info": {...},
  // ... resto de datos
}
```

## 🎨 Estructura del Proyecto

```
easygo/
├── backend/
│   ├── models/
│   │   └── cv_models.py          # Modelos Pydantic
│   ├── services/
│   │   ├── openai_service.py     # Integración OpenAI
│   │   ├── pdf_generator.py      # Generación de PDFs
│   │   └── supabase_service.py   # Cliente Supabase
│   ├── main.py                   # FastAPI app
│   ├── requirements.txt          # Dependencias Python
│   └── Dockerfile                # Containerización
├── src/
│   ├── components/
│   │   ├── Home.jsx              # Landing page
│   │   ├── Hero.jsx              # Sección hero
│   │   ├── Tools.jsx             # Herramientas
│   │   ├── Pricing.jsx           # Precios
│   │   ├── CVBuilder.jsx         # Constructor de CV
│   │   ├── Dashboard.jsx         # Panel usuario
│   │   ├── SignIn.jsx            # Autenticación
│   │   └── SEOHead.tsx           # Meta tags SEO
│   ├── context/
│   │   └── AuthContext.jsx       # Context de autenticación
│   ├── lib/
│   │   └── supabase.js           # Cliente Supabase
│   └── i18n/
│       └── en.js                 # Textos en inglés
├── public/
│   ├── robots.txt                # SEO
│   └── sitemap.xml               # SEO
├── index.html                    # HTML principal
├── vercel.json                   # Config Vercel
├── docker-compose.yml            # Docker Compose
└── package.json                  # Dependencias npm
```

## 🔑 Variables de Entorno

### Frontend (.env.local)
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_API_URL=http://localhost:8000
```

### Backend (.env)
```env
OPENAI_API_KEY=sk-...
PORT=8000
DEBUG=True
```

## 🧪 Testing

```bash
# Frontend
npm run test

# Backend
cd backend
pytest
```

## 📈 SEO y Rendimiento

- ✅ Meta tags optimizados (Open Graph, Twitter Cards)
- ✅ Sitemap.xml generado
- ✅ Robots.txt configurado
- ✅ Structured Data (JSON-LD)
- ✅ Canonical URLs
- ✅ Semantic HTML
- ✅ Lighthouse Score: 90+

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Fernanda** - *Desarrollo inicial* - [@maferfarfan2122](https://github.com/maferfarfan2122)

## 🙏 Agradecimientos

- OpenAI por GPT-4
- Supabase por la infraestructura de autenticación
- FastAPI por el excelente framework
- React team por React 18

## 📞 Soporte

- **Email**: info@easygo.com.es
- **Website**: [https://easygo.com.es](https://easygo.com.es)
- **Issues**: [GitHub Issues](https://github.com/maferfarfan2122/easygo/issues)

## 🔄 Roadmap

- [ ] Múltiples plantillas de CV
- [ ] Soporte multiidioma (ES, EN, FR)
- [ ] Editor visual drag & drop
- [ ] Integración con LinkedIn
- [ ] Sistema de pagos (Stripe)
- [ ] Dashboard con estadísticas
- [ ] Exportación a Word
- [ ] Generador de cartas de presentación

---

⭐️ Si te gusta este proyecto, dale una estrella en GitHub!

**Keywords**: CV generator, curriculum vitae, resume builder, AI CV, ATS optimization, professional resume, GPT-4, React, FastAPI, Supabase, generador de curriculum, CV con IA, curriculum profesional
