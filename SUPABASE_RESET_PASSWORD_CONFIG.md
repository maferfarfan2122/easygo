# 🔐 Configuración Autenticación en Supabase

## Configuración Completa de Email

### 1️⃣ Configurar Redirect URLs en Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Authentication** → **URL Configuration**
3. En **Redirect URLs**, agrega las siguientes URLs:

**Para desarrollo:**
```
http://localhost:5173/reset-password
http://localhost:5173/confirm-email
http://localhost:5173/*
```

**Para producción (easygo.com.es):**
```
https://easygo.com.es/reset-password
https://easygo.com.es/confirm-email
https://easygo.com.es/*
https://www.easygo.com.es/reset-password
https://www.easygo.com.es/confirm-email
https://www.easygo.com.es/*
```

4. Guarda los cambios

### 2️⃣ Configurar Email Templates

#### A) Reset Password Template

1. Ve a **Authentication** → **Email Templates**
2. Selecciona **Reset Password**
3. **IMPORTANTE**: Usa `{{ .ConfirmationURL }}` (recomendado)

```html
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

**❌ NO uses esto (causará error):**
```html
<!-- NO USAR: Formato incorrecto -->
<a href="{{ .SiteURL }}/reset-password?access_token={{ .Token }}&type=recovery">
  Reset Password
</a>
```

**✅ Si necesitas personalizar la ruta, usa esto:**
```html
<!-- Solo si ConfirmationURL no funciona -->
<a href="{{ .SiteURL }}/reset-password#access_token={{ .Token }}&type=recovery">
  Reset Password
</a>
```

**Nota:** El token DEBE ir en el hash (#) no en query params (?)

#### B) Confirm Signup Template

1. Ve a **Authentication** → **Email Templates**
2. Selecciona **Confirm Signup**
3. **IMPORTANTE**: Usa `{{ .ConfirmationURL }}` (recomendado)

```html
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
```

**❌ NO uses esto (causará error):**
```html
<!-- NO USAR: Formato incorrecto -->
<a href="{{ .SiteURL }}/confirm-email?access_token={{ .Token }}&type=signup">
  Confirm Email
</a>
```

**✅ Si necesitas personalizar la ruta, usa esto:**
```html
<!-- Solo si ConfirmationURL no funciona -->
<a href="{{ .SiteURL }}/confirm-email#access_token={{ .Token }}&type=signup">
  Confirm Email
</a>
```

**Nota:** El token DEBE ir en el hash (#) no en query params (?)

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

## Flujos de Autenticación

### 📧 Flujo: Email Confirmation (Nuevo Usuario)

1. **Usuario se registra**
   - Va a `/signin` y crea cuenta
   - Supabase envía email de confirmación

2. **Usuario hace clic en enlace del email**
   - URL: `https://easygo.com.es/confirm-email#access_token=xxx&type=signup`
   - Supabase redirige automáticamente

3. **Aplicación verifica email**
   - `ConfirmEmail.tsx` detecta token
   - Verifica sesión con Supabase
   - Muestra éxito o error

4. **Si verificación exitosa**
   - Muestra pantalla de éxito
   - Lista de checks animados
   - Barra de progreso (3 segundos)
   - Auto-redirect a `/dashboard`

5. **Si verificación falla**
   - Muestra instrucciones
   - Botón "Reenviar Email"
   - Link para volver a signin

---

### 🔑 Flujo: Reset Password

1. Usuario solicita reset
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

## Estados de los Componentes

### ✅ ConfirmEmail.tsx States

**Loading (Verificando):**
```tsx
{verifying && (
  <Loader2 className="icon-spin" />
  <h1>Verificando...</h1>
)}
```

**Success (Email Verificado):**
```tsx
{isVerified && (
  <CheckCircle className="icon-large" />
  <h1>¡Email Verificado!</h1>
  <SuccessChecks />
  <ProgressBar duration={3s} />
)}
```

**Error/Pending (Verificación Pendiente):**
```tsx
{!isVerified && (
  <Mail className="icon-large" />
  <h1>Verifica tu Email</h1>
  <Instructions />
  <button onClick={handleResendEmail}>
    Reenviar Email
  </button>
)}
```

---

### 🔑 ResetPassword.tsx States

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

### 1. Test Email Confirmation (Nuevo)

```bash
# 1. Registrarse
https://easygo.com.es/signin
# Click en "Sign Up"

# 2. Ingresar datos
email: tu@email.com
password: ******

# 3. Revisar email de confirmación
# Buscar: "Confirm your signup"

# 4. Hacer clic en enlace
# Debería abrir: https://easygo.com.es/confirm-email

# 5. Ver pantalla de éxito
# ✓ Email confirmado
# ✓ Cuenta activada
# ✓ Redirigiendo...

# 6. Auto-redirect a dashboard
https://easygo.com.es/dashboard
```

### 2. Test Reset Password

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
