# 🐳 Docker Setup para Easy Go Backend

Este documento explica cómo ejecutar el backend de Easy Go usando Docker para tenerlo corriendo 24/7.

## 📋 Requisitos Previos

1. **Docker Desktop** instalado en tu Mac:
   - Descarga desde: https://www.docker.com/products/docker-desktop/
   - O instala con Homebrew: `brew install --cask docker`

2. **Tu OpenAI API Key**

## 🚀 Configuración Inicial

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cd /Users/Fernanda/Desktop/easygowebapp
cp .env.docker .env
```

Edita el archivo `.env` y agrega tu API key:

```env
OPENAI_API_KEY=sk-proj-tu-api-key-aqui
```

### 2. Construir y Ejecutar con Docker Compose

```bash
# Construir la imagen
docker-compose build

# Ejecutar el contenedor
docker-compose up -d
```

El flag `-d` ejecuta el contenedor en segundo plano (detached mode).

## 🔧 Comandos Útiles

### Ver los logs del backend
```bash
docker-compose logs -f backend
```

### Detener el backend
```bash
docker-compose down
```

### Reiniciar el backend
```bash
docker-compose restart backend
```

### Ver el estado del contenedor
```bash
docker-compose ps
```

### Reconstruir la imagen (después de cambios en el código)
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Verificar que está funcionando
```bash
curl http://localhost:8000/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "services": {
    "openai": "configured",
    "pdf_generator": "ready"
  }
}
```

## 📡 Acceder a la API

Una vez corriendo, tu backend estará disponible en:

- **Local**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🌐 Despliegue en Producción

Para desplegar en un servidor remoto (VPS, AWS, etc.):

### Opción 1: Docker Hub

1. **Crear cuenta en Docker Hub**: https://hub.docker.com/

2. **Build y Push de la imagen**:

```bash
# Login en Docker Hub
docker login

# Tag de la imagen
docker tag easygowebapp-backend tuusuario/easygo-backend:latest

# Push a Docker Hub
docker push tuusuario/easygo-backend:latest
```

3. **En tu servidor remoto**:

```bash
# Pull de la imagen
docker pull tuusuario/easygo-backend:latest

# Ejecutar
docker run -d \
  -p 8000:8000 \
  -e OPENAI_API_KEY=tu-api-key \
  --name easygo-backend \
  --restart always \
  tuusuario/easygo-backend:latest
```

### Opción 2: Railway.app (Recomendado - Gratis para empezar)

1. Ve a https://railway.app/
2. Conecta tu repositorio de GitHub
3. Railway detectará el Dockerfile automáticamente
4. Agrega la variable de entorno `OPENAI_API_KEY`
5. Railway te dará una URL pública: `https://tu-proyecto.railway.app`

### Opción 3: Render.com (Otra opción gratuita)

1. Ve a https://render.com/
2. Crea un nuevo "Web Service"
3. Conecta tu repositorio
4. Selecciona "Docker"
5. Agrega la variable de entorno `OPENAI_API_KEY`
6. Deploy automático

### Opción 4: Tu VPS de IONOS

Si quieres usar tu VPS de IONOS:

```bash
# 1. Conectar por SSH a tu VPS
ssh usuario@tu-servidor.com

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Clonar tu proyecto
git clone tu-repositorio.git
cd easygowebapp

# 5. Crear archivo .env con tu API key
echo "OPENAI_API_KEY=tu-api-key" > .env

# 6. Ejecutar
docker-compose up -d
```

## 🔄 Actualizar el Frontend para usar el Backend Dockerizado

Una vez que tu backend esté en producción, actualiza el archivo `.env.local` del frontend:

```env
# Cambiar de localhost a tu URL de producción
VITE_API_URL=https://tu-backend-en-produccion.com
```

O para Railway/Render:
```env
VITE_API_URL=https://easygo-backend.railway.app
```

## 🛡️ Seguridad en Producción

Antes de desplegar en producción, asegúrate de:

1. ✅ Nunca commitear el archivo `.env` con tu API key real
2. ✅ Usar HTTPS en producción
3. ✅ Configurar CORS correctamente en `main.py`
4. ✅ Agregar rate limiting para evitar abuso
5. ✅ Monitorear los logs regularmente

## 📊 Monitoreo

### Ver logs en tiempo real
```bash
docker-compose logs -f backend
```

### Ver uso de recursos
```bash
docker stats easygo-backend
```

## 🔥 Troubleshooting

### El contenedor no inicia
```bash
# Ver logs del contenedor
docker-compose logs backend

# Ver todos los contenedores (incluso los detenidos)
docker ps -a
```

### Puerto 8000 ya en uso
```bash
# Ver qué está usando el puerto
lsof -i :8000

# Cambiar el puerto en docker-compose.yml
ports:
  - "8001:8000"  # Usar puerto 8001 en el host
```

### Cambios en el código no se reflejan
```bash
# Reconstruir sin cache
docker-compose build --no-cache
docker-compose up -d
```

## 💡 Tips

1. **Auto-reinicio**: El contenedor se reiniciará automáticamente si se cae (configurado con `restart: always`)

2. **Logs persistentes**: Considera agregar un volumen para logs:
```yaml
volumes:
  - ./logs:/app/logs
```

3. **Base de datos**: Si más adelante necesitas una base de datos, puedes agregar PostgreSQL al docker-compose.yml

4. **Backup de API Key**: Guarda tu API key en un gestor de contraseñas seguro

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose logs backend`
2. Verifica que Docker Desktop esté corriendo
3. Asegúrate de que el puerto 8000 esté disponible
4. Confirma que tu API key de OpenAI sea válida

---

¡Tu backend estará corriendo 24/7! 🎉
