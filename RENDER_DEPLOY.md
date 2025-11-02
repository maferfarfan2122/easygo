# 🚀 Desplegar Backend en Render.com

## Pasos para desplegar:

### 1. Crear cuenta en Render
1. Ve a https://render.com
2. Haz clic en "Get Started for Free"
3. Regístrate con GitHub (recomendado) o email

### 2. Conectar tu repositorio
1. En el dashboard de Render, haz clic en "New +"
2. Selecciona "Web Service"
3. Conecta tu cuenta de GitHub si aún no lo has hecho
4. Busca y selecciona el repositorio: `mfarfan-21/easygo`
5. Haz clic en "Connect"

### 3. Configurar el servicio

**Configuración básica:**
- **Name:** `easygo-backend` (o el nombre que prefieras)
- **Region:** Oregon (US West) - es gratis
- **Branch:** `main`
- **Root Directory:** `backend` ⚠️ MUY IMPORTANTE
- **Runtime:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Plan:**
- Selecciona "Free" (plan gratuito)

### 4. Variables de entorno
En la sección "Environment Variables", agrega:

| Key | Value |
|-----|-------|
| `OPENAI_API_KEY` | `Tu API key de OpenAI (cópiala del archivo backend/.env)` |
| `DEBUG` | `False` |

### 5. Desplegar
1. Haz clic en "Create Web Service"
2. Render comenzará a construir y desplegar tu aplicación
3. El proceso toma aproximadamente 3-5 minutos
4. Cuando termine, verás "Live" en verde

### 6. Obtener la URL
- Una vez desplegado, Render te dará una URL como: `https://easygo-backend.onrender.com`
- Copia esta URL

### 7. Actualizar el frontend
1. Abre el archivo `.env.local` en la raíz del proyecto
2. Actualiza la variable:
   ```
   VITE_API_URL=https://easygo-backend.onrender.com
   ```
3. Reinicia el servidor de desarrollo del frontend

## 🔍 Verificación

Una vez desplegado, verifica que funcione:
```bash
curl https://easygo-backend.onrender.com/health
```

Deberías ver una respuesta como:
```json
{
  "status": "healthy",
  "services": {
    "openai": "configured",
    "pdf_generator": "ready"
  }
}
```

## 📝 Notas importantes

- **Plan gratuito:** El servicio se "duerme" después de 15 minutos de inactividad. La primera petición después de dormir tomará ~30 segundos.
- **Límites del plan gratuito:**
  - 750 horas/mes
  - Se duerme después de 15 min de inactividad
  - 512 MB RAM
  - Perfecto para desarrollo y demos

## 🔄 Actualizaciones automáticas

Render se actualizará automáticamente cada vez que hagas push a la rama `main` en GitHub:
```bash
git add .
git commit -m "Update backend"
git push origin main
```

## ⚠️ Troubleshooting

**Si el deploy falla:**
1. Revisa los logs en Render (pestaña "Logs")
2. Verifica que el "Root Directory" sea `backend`
3. Asegúrate de que las variables de entorno estén configuradas
4. Verifica que `requirements.txt` esté completo

**Si la app no responde:**
- Es normal que la primera petición tarde si la app estaba dormida
- Espera 30 segundos y vuelve a intentar

## 🎉 ¡Listo!

Tu backend estará corriendo 24/7 (con las limitaciones del plan gratuito) y se actualizará automáticamente con cada push a GitHub.
