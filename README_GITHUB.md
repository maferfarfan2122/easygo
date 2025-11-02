# 🚀 Easy Go - AI-Powered Website Builder

Easy Go es una plataforma moderna para crear sitios web con inteligencia artificial, incluyendo un generador de CVs optimizado con OpenAI GPT-4.

## ✨ Características

- 🎨 **Landing Page Moderna** con React + Vite
- 🔐 **Autenticación Segura** con Supabase
- 🤖 **AI CV Builder** - Genera CVs profesionales con IA
- 📄 **Exportación PDF** - CVs listos para descargar
- 🎯 **Optimización Inteligente** - Adapta tu CV a descripciones de trabajo
- 🌐 **Backend API** con FastAPI y Python

## 🛠️ Tech Stack

### Frontend
- React 18.3.1
- Vite 7.1.12
- React Router DOM
- Supabase Auth
- TypeScript

### Backend
- Python 3.11
- FastAPI 0.115.0
- OpenAI GPT-4
- ReportLab (PDF Generation)
- Uvicorn

## 🚀 Deploy en Railway

Este proyecto está listo para desplegarse en Railway.app:

1. Conéctalo a tu cuenta de Railway
2. Agrega la variable de entorno `OPENAI_API_KEY`
3. Deploy automático desde el Procfile

## 📦 Instalación Local

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🔑 Variables de Entorno

### Frontend (.env.local)
```env
VITE_SUPABASE_URL=tu-supabase-url
VITE_SUPABASE_ANON_KEY=tu-supabase-anon-key
VITE_API_URL=http://localhost:8000
```

### Backend (backend/.env)
```env
OPENAI_API_KEY=tu-openai-api-key
PORT=8000
DEBUG=True
```

## 📖 Documentación

- [Setup de Supabase](SUPABASE_SETUP.md)
- [Guía del CV Builder](CV_BUILDER_GUIDE.md)
- [Opciones de Despliegue](DEPLOYMENT_OPTIONS.md)

## 🌐 Demo

Una vez desplegado, accede a:
- Frontend: Tu URL de producción
- API Docs: `https://tu-backend.railway.app/docs`

## 📝 Licencia

MIT

## 👤 Autor

Fernanda - Easy Go Project

---

¿Preguntas? Abre un issue en GitHub.
