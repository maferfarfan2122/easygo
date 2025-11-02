#!/bin/bash

# Script para iniciar el backend con Docker

echo "🐳 Easy Go Backend - Docker Deployment"
echo "======================================="
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker Desktop:"
    echo "   https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Verificar si Docker está corriendo
if ! docker info &> /dev/null; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
fi

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo "⚠️  No se encontró el archivo .env"
    echo "📝 Creando archivo .env desde .env.docker..."
    cp .env.docker .env
    echo ""
    echo "⚠️  IMPORTANTE: Edita el archivo .env y agrega tu OPENAI_API_KEY"
    echo "   Archivo: $(pwd)/.env"
    echo ""
    read -p "Presiona Enter cuando hayas configurado tu API key..."
fi

echo "🔨 Construyendo la imagen Docker..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "❌ Error al construir la imagen"
    exit 1
fi

echo ""
echo "🚀 Iniciando el backend..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Error al iniciar el contenedor"
    exit 1
fi

echo ""
echo "⏳ Esperando que el backend esté listo..."
sleep 5

# Verificar que el backend esté funcionando
echo "🔍 Verificando estado del backend..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo ""
    echo "✅ ¡Backend iniciado correctamente!"
    echo ""
    echo "📍 URLs disponibles:"
    echo "   - API:            http://localhost:8000"
    echo "   - Health Check:   http://localhost:8000/health"
    echo "   - Documentación:  http://localhost:8000/docs"
    echo ""
    echo "📊 Ver logs:"
    echo "   docker-compose logs -f backend"
    echo ""
    echo "🛑 Detener backend:"
    echo "   docker-compose down"
else
    echo ""
    echo "⚠️  El backend inició pero no responde aún."
    echo "   Puedes ver los logs con:"
    echo "   docker-compose logs -f backend"
fi
