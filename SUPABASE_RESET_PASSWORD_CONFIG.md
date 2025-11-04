# 🔐 Configuración Reset Password en Supabase

## Problema
Cuando el usuario hace clic en el enlace del correo de recuperación, no aparece el formulario para ingresar la nueva contraseña.

## Solución

### 1️⃣ Configurar Redirect URLs en Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Authentication** → **URL Configuration**
3. En **Redirect URLs**, agrega las siguientes URLs:

**Para desarrollo:**
```
http://localhost:5173/reset-password
http://localhost:5173/*
```

**Para producción (easygo.com.es):**
```
https://easygo.com.es/reset-password
https://easygo.com.es/*
https://www.easygo.com.es/reset-password
https://www.easygo.com.es/*
```

4. Guarda los cambios

### 2️⃣ Configurar Email Templates (Opcional)

1. Ve a **Authentication** → **Email Templates**
2. Selecciona **Reset Password**
3. Verifica que el enlace use la plantilla correcta:

```html
<a href="{{ .SiteURL }}/reset-password?access_token={{ .Token }}&type=recovery">
  Reset Password
</a>
```

O simplemente:
```html
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

### 3️⃣ Verificar Site URL

1. Ve a **Authentication** → **URL Configuration**
2. Verifica que **Site URL** sea correcta:
   - Desarrollo: `http://localhost:5173`
   - Producción: `https://easygo.com.es`

### 4️⃣ Verificar Variables de Entorno

Asegúrate de tener en tu `.env.local`:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## Flujo de Reset Password

### 1. Usuario solicita reset
- Va a `/forgot-password`
- Ingresa su email
- Supabase envía email

### 2. Usuario hace clic en enlace del email
- URL: `https://easygo.com.es/reset-password#access_token=xxx&type=recovery`
- Supabase redirige automáticamente

### 3. Aplicación detecta token
- `ResetPassword.tsx` verifica la sesión
- Si hay token válido, muestra formulario
- Si no hay token, muestra error

### 4. Usuario ingresa nueva contraseña
- Valida contraseña (mínimo 6 caracteres)
- Confirma que coincidan
- Actualiza con `updatePassword()`
- Redirige a `/dashboard`

## Estados del Componente

### ✅ Loading State
```tsx
{checkingToken && (
  <Loader2 className="icon-spin" />
  <h1>Verificando...</h1>
)}
```

### ❌ Error State (Token Inválido)
```tsx
{!isValidToken && (
  <AlertCircle />
  <h1>Token Inválido</h1>
  <button onClick={() => navigate('/forgot-password')}>
    Solicitar Nuevo Enlace
  </button>
)}
```

### ✏️ Form State (Token Válido)
```tsx
{isValidToken && (
  <form onSubmit={handleSubmit}>
    <input type="password" />
    <input type="password" />
    <button type="submit">Actualizar</button>
  </form>
)}
```

## Debugging

### 1. Verificar URL después del clic
Abre DevTools Console y verifica:
```javascript
console.log('Hash:', window.location.hash);
console.log('Full URL:', window.location.href);
```

Deberías ver:
```
Hash: #access_token=xxxxxx&type=recovery
Full URL: http://localhost:5173/reset-password#access_token=xxxxx&type=recovery
```

### 2. Verificar sesión de Supabase
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

Si hay sesión, el token es válido.

### 3. Verificar en Network Tab
- Abre Network Tab en DevTools
- Filtra por `supabase`
- Deberías ver una petición a `/auth/v1/token` exitosa

## Errores Comunes

### ❌ "Token Inválido" siempre
**Causa:** URL de redirect no configurada en Supabase
**Solución:** Agregar URLs en Authentication → URL Configuration

### ❌ Email no llega
**Causa:** Email no configurado o bloqueado
**Solución:** 
- Verificar spam/junk
- Configurar SMTP custom en Supabase
- Revisar logs en Supabase Dashboard

### ❌ "Session not found"
**Causa:** Token expirado (24 horas por defecto)
**Solución:** Solicitar nuevo enlace de reset

### ❌ Redirect loop
**Causa:** Site URL incorrecta
**Solución:** Verificar Site URL en Supabase

## Testing

### 1. Test completo
```bash
# 1. Ir a forgot-password
http://localhost:5173/forgot-password

# 2. Ingresar email real
tu@email.com

# 3. Revisar email
# 4. Hacer clic en enlace
# 5. Debería aparecer form de reset
# 6. Ingresar nueva contraseña
# 7. Verificar redirección a /dashboard
```

### 2. Test con URL manual
```bash
# Copiar URL del email y pegarla en navegador
http://localhost:5173/reset-password#access_token=xxx&type=recovery
```

## Configuración Adicional (Opcional)

### Tiempo de expiración de tokens
En Supabase Dashboard:
- Authentication → Settings
- JWT Expiry: Default 3600 seconds (1 hour)
- Refresh Token Lifetime: Default 2592000 seconds (30 days)

### Rate Limiting
- Authentication → Settings
- Rate Limits: Configurar límites para prevenir spam

### Email Customization
- Authentication → Email Templates
- Personalizar diseño y contenido del email

## Soporte

Si sigues teniendo problemas:
1. Revisa Supabase Logs: Dashboard → Logs
2. Revisa Console del navegador (F12)
3. Verifica Network Tab para ver peticiones fallidas
4. Contacta soporte de Supabase si es necesario

## Referencias

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Reset Password Guide](https://supabase.com/docs/guides/auth/passwords)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
