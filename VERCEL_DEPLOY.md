# 🚀 Desplegar Frontend en Vercel

## Pasos para desplegar:

### 1. **Crear cuenta en Vercel**
   - Ve a: https://vercel.com
   - Haz clic en **"Sign Up"**
   - **Regístrate con GitHub** (es más fácil y rápido)

### 2. **Importar tu proyecto**
   - En el dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
   - Vercel detectará automáticamente tus repositorios de GitHub
   - Busca y selecciona: **`mfarfan-21/easygo`**
   - Haz clic en **"Import"**

### 3. **Configurar el proyecto**

Vercel detectará automáticamente que es un proyecto Vite. Asegúrate de que la configuración sea:

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build (detectado automáticamente)
Output Directory: dist (detectado automáticamente)
Install Command: npm install (detectado automáticamente)
```

### 4. **Variables de entorno**

En la sección **"Environment Variables"**, agrega estas 3 variables:

#### Variable 1: VITE_SUPABASE_URL
```
Name: VITE_SUPABASE_URL
Value: https://sjcerbejmrjcjcgqngdg.supabase.co
```

#### Variable 2: VITE_SUPABASE_ANON_KEY
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqY2VyYmVqbXJqY2pjZ3FuZ2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5Nzg4NzcsImV4cCI6MjA3NzU1NDg3N30.oGUqI85pw2q5zr2U9hXm2yz96QWWWv9orEvWnYvA2Ho
```

#### Variable 3: VITE_API_URL
```
Name: VITE_API_URL
Value: https://easygo-1-mxb7.onrender.com
```

**IMPORTANTE:** Marca estas variables para todos los entornos:
- ✅ Production
- ✅ Preview
- ✅ Development

### 5. **Desplegar**
   - Haz clic en **"Deploy"**
   - Vercel comenzará a construir y desplegar tu aplicación
   - El proceso toma aproximadamente 1-2 minutos
   - Cuando termine, verás **"🎉 Deployment Ready"**

### 6. **Obtener tu URL**
   - Vercel te dará una URL como: `https://easygo-xxx.vercel.app`
   - También puedes configurar un dominio personalizado si quieres

### 7. **Configurar Supabase**

**MUY IMPORTANTE:** Debes agregar la URL de Vercel a Supabase para permitir el login:

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: `sjcerbejmrjcjcgqngdg`
3. Ve a **Authentication** → **URL Configuration**
4. En **"Site URL"**, pon tu URL de Vercel: `https://easygo-xxx.vercel.app`
5. En **"Redirect URLs"**, agrega:
   ```
   https://easygo-xxx.vercel.app
   https://easygo-xxx.vercel.app/**
   ```
6. Guarda los cambios

---

## ✅ Verificación

Una vez desplegado:

1. Abre tu URL de Vercel: `https://easygo-xxx.vercel.app`
2. La página de inicio debe cargarse correctamente
3. Prueba registrarte o iniciar sesión
4. Ve al Dashboard
5. Haz clic en "Create AI CV"
6. Prueba crear un CV

---

## 🔄 Actualizaciones automáticas

Vercel se actualizará automáticamente cada vez que hagas push a GitHub:

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

Vercel detectará el cambio y desplegará automáticamente en 1-2 minutos.

---

## 📊 Monitoreo

En el dashboard de Vercel podrás ver:
- **Deployments**: Historial de despliegues
- **Analytics**: Visitas y rendimiento
- **Logs**: Logs de construcción y errores

---

## 🎉 ¡Listo!

Tu aplicación completa está ahora en producción:
- ✅ **Frontend en Vercel** (https://easygo-xxx.vercel.app)
- ✅ **Backend en Render** (https://easygo-1-mxb7.onrender.com)
- ✅ **Database & Auth en Supabase** (https://sjcerbejmrjcjcgqngdg.supabase.co)

Todo funcionando 24/7 en la nube. 🚀
