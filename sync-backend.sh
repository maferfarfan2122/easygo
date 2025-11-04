#!/bin/bash

# 🚀 Script para sincronizar backend con repositorio separado
# Repositorio backend: https://github.com/mfarfan-21/easygo.git

echo "🎯 Sincronizando backend con repositorio mfarfan-21/easygo"
echo "=================================================="

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio actual (debería estar en /Users/Fernanda/Desktop/easygowebapp)
CURRENT_DIR=$(pwd)
BACKEND_DIR="$CURRENT_DIR/backend"

# Verificar que estamos en el directorio correcto
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Error: No se encuentra el directorio backend/"
    echo "Por favor ejecuta este script desde: /Users/Fernanda/Desktop/easygowebapp"
    exit 1
fi

echo -e "${BLUE}📂 Directorio backend encontrado: $BACKEND_DIR${NC}"

# Navegar al directorio backend
cd "$BACKEND_DIR"

# Verificar si ya tiene git configurado
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📦 Inicializando repositorio Git en backend/${NC}"
    git init
    git remote add origin https://github.com/mfarfan-21/easygo.git
else
    echo -e "${GREEN}✓ Repositorio Git ya existe${NC}"
    
    # Verificar remote
    CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null)
    if [ "$CURRENT_REMOTE" != "https://github.com/mfarfan-21/easygo.git" ]; then
        echo -e "${YELLOW}⚙️  Actualizando remote origin${NC}"
        git remote set-url origin https://github.com/mfarfan-21/easygo.git
    fi
fi

# Verificar branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
if [ -z "$CURRENT_BRANCH" ]; then
    echo -e "${YELLOW}🌿 Creando branch main${NC}"
    git checkout -b main
elif [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}🌿 Cambiando a branch main${NC}"
    git checkout main 2>/dev/null || git checkout -b main
fi

# Agregar todos los archivos
echo -e "${BLUE}📝 Agregando archivos...${NC}"
git add .

# Verificar si hay cambios
if git diff --staged --quiet; then
    echo -e "${GREEN}✓ No hay cambios nuevos para commitear${NC}"
else
    echo -e "${YELLOW}💾 Commiteando cambios...${NC}"
    git commit -m "🎫 Token System: Rate limiting, cache, retry & circuit breaker

Sistema de tokens implementado:
- token_service.py: Gestión de tokens (5 gratis por usuario)
- openai_service_retry.py: Retry logic con circuit breaker
- main.py: Endpoints protegidos con X-User-ID header
- requirements.txt: Dependencias actualizadas (supabase)

Features:
✅ Rate limiting: 10 requests/minuto
✅ Caché: 10 minutos de TTL
✅ Retry: 3 intentos con exponential backoff
✅ Circuit breaker: Protección contra fallos OpenAI
✅ Costos: suggestions=1, optimize=2, generate=2 tokens

Deploy ready para Render.com"
    
    echo -e "${GREEN}✓ Commit creado${NC}"
fi

# Push a GitHub
echo -e "${BLUE}🚀 Haciendo push a GitHub...${NC}"
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=================================================="
    echo "✅ Backend sincronizado exitosamente!"
    echo "=================================================="
    echo ""
    echo "📍 Repositorio: https://github.com/mfarfan-21/easygo"
    echo "🌐 Render: https://dashboard.render.com/"
    echo ""
    echo "Próximos pasos:"
    echo "1. Ve a Render Dashboard: https://dashboard.render.com/"
    echo "2. Selecciona tu servicio: easygo-1-mxb7"
    echo "3. Click en 'Manual Deploy' → 'Deploy latest commit'"
    echo "4. Espera ~2-3 minutos para que se complete el deploy"
    echo "5. Verifica: curl https://easygo-1-mxb7.onrender.com/health"
    echo ""
    echo -e "📚 Documentación completa: $BACKEND_DIR/DEPLOY_RENDER.md"
    echo -e "${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Hubo un error al hacer push${NC}"
    echo "Posibles soluciones:"
    echo "1. Verifica tu autenticación con GitHub"
    echo "2. Si es la primera vez, ejecuta: git push -u origin main --force"
    echo "3. Revisa que el repositorio existe: https://github.com/mfarfan-21/easygo"
fi

# Volver al directorio original
cd "$CURRENT_DIR"
