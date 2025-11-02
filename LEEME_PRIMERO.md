# 🎯 INSTRUCCIONES FINALES - CV Builder

## ✅ TODO ESTÁ LISTO

He implementado completamente el CV Builder con inteligencia artificial. Solo necesitas hacer 2 cosas:

---

## 🔑 PASO 1: Configurar OpenAI API Key

El CV Builder usa GPT-4 de OpenAI para optimizar los CVs. Necesitas una API key:

### Obtener la API Key:

1. **Ve a:** https://platform.openai.com/api-keys
2. **Inicia sesión** (o crea una cuenta si no tienes)
3. **Haz click en:** "Create new secret key"
4. **Copia la clave** (empieza con `sk-proj-...`)

### Configurar la API Key:

Abre el archivo `backend/.env` y pega tu clave:

```bash
# Opción 1: Con editor de texto
nano /Users/Fernanda/Desktop/easygowebapp/backend/.env

# Luego pega:
OPENAI_API_KEY=sk-proj-tu-clave-aqui
```

**Ejemplo:**
```env
OPENAI_API_KEY=sk-proj-abc123xyz456...
PORT=8000
DEBUG=True
```

**💡 Nota:** La primera vez que uses OpenAI necesitarás agregar un método de pago. El costo es muy bajo: ~$0.03-0.10 por CV generado.

---

## 🚀 PASO 2: Iniciar los Servidores

### Opción A: Script Automático (Recomendado)

```bash
cd /Users/Fernanda/Desktop/easygowebapp
chmod +x start-dev.sh
./start-dev.sh
```

Este script:
- ✅ Inicia el backend (Python)
- ✅ Inicia el frontend (React)
- ✅ Muestra las URLs donde acceder

### Opción B: Manual (2 Terminales)

**Terminal 1 - Backend:**
```bash
cd /Users/Fernanda/Desktop/easygowebapp/backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd /Users/Fernanda/Desktop/easygowebapp
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 24
npm run dev
```

---

## 🎮 PASO 3: Usar el CV Builder

1. **Abre tu navegador:** http://localhost:5173

2. **Inicia sesión** con tu cuenta de Supabase

3. **Ve al CV Builder:**
   - Haz click en la primera tarjeta de "Tools" (tiene un badge "Try Now!")
   - O ve directamente a: http://localhost:5173/tools/cv-builder

4. **Llena el formulario** siguiendo los 6 pasos:
   - Paso 1: Pega una descripción de trabajo
   - Paso 2: Tus datos personales
   - Paso 3: Experiencia laboral
   - Paso 4: Educación
   - Paso 5: Habilidades e idiomas
   - Paso 6: Generar y descargar el PDF

5. **¡Listo!** El CV optimizado se descargará automáticamente

---

## 📋 Resumen de URLs

```
Frontend:     http://localhost:5173
CV Builder:   http://localhost:5173/tools/cv-builder
Dashboard:    http://localhost:5173/dashboard

Backend:      http://localhost:8000
API Docs:     http://localhost:8000/docs
Health Check: http://localhost:8000/health
```

---

## 🐛 Si Algo No Funciona

### "OPENAI_API_KEY no configurada"
→ Verifica que pusiste tu API key en `backend/.env`

### "Failed to fetch"
→ Asegúrate que el backend esté corriendo en http://localhost:8000

### El servidor frontend no inicia
→ Usa Node.js v24: `nvm use 24`

### El backend no inicia
→ Activa el entorno virtual: `source backend/venv/bin/activate`

---

## 📚 Documentación Adicional

- **Guía completa:** `CV_BUILDER_GUIDE.md`
- **Resumen técnico:** `CV_BUILDER_COMPLETE.md`
- **Backend info:** `backend/README.md`

---

## 💡 Tips

1. **Guarda tu OpenAI API Key** en un lugar seguro
2. **Nunca subas** el archivo `backend/.env` a Git (ya está en .gitignore)
3. **Monitorea tu uso** de OpenAI en: https://platform.openai.com/usage
4. **Primera vez usando OpenAI:** Necesitarás agregar $5-10 USD de crédito

---

## ✨ Características del CV Builder

- ✅ Formulario multi-paso intuitivo
- ✅ Sugerencias de IA basadas en la oferta de trabajo
- ✅ Optimización automática del CV con GPT-4
- ✅ Descarga de PDF profesional
- ✅ Protección con autenticación (Supabase)
- ✅ Diseño responsive y moderno

---

## 🎯 ¡Eso es Todo!

Siguiendo estos 3 pasos tendrás tu CV Builder funcionando:

1. ✅ Configurar OpenAI API Key
2. ✅ Iniciar servidores
3. ✅ Usar el CV Builder

**¡Disfruta creando CVs optimizados con IA!** 🚀

---

**¿Necesitas ayuda?**
Lee la documentación completa en `CV_BUILDER_GUIDE.md`
