# 🔐 Configuración de Google OAuth en Supabase

## ✅ Código Ya Implementado

El código de autenticación con Google ya está completo en tu aplicación:
- ✅ Botón "Continue with Google" en SignIn
- ✅ Función `signInWithGoogle()` en AuthContext
- ✅ Estilos CSS para el botón
- ✅ Redirección al dashboard después del login

## 📋 Pasos para Configurar Google OAuth

### 1️⃣ Crear Credenciales en Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. En el menú lateral, ve a: **APIs & Services → Credentials**
4. Click en **"+ CREATE CREDENTIALS"** → **OAuth client ID**
5. Si es tu primera vez, configura la pantalla de consentimiento:
   - **User Type**: External
   - **App name**: Easy Go
   - **User support email**: tu email
   - **Developer contact**: tu email
   - Guarda y continúa

### 2️⃣ Configurar OAuth Client ID

1. **Application type**: Web application
2. **Name**: Easy Go Web Client
3. **Authorized JavaScript origins**:
   ```
   https://sjcerbejmrjcjcgqngdg.supabase.co
   http://localhost:5173
   https://easygo.com.es
   ```

4. **Authorized redirect URIs**:
   ```
   https://sjcerbejmrjcjcgqngdg.supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   ```

5. Click en **CREATE**
6. **Copia el Client ID y Client Secret** (los necesitarás en Supabase)

### 3️⃣ Configurar Google Provider en Supabase

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard/project/sjcerbejmrjcjcgqngdg

2. En el menú lateral: **Authentication → Providers**

3. Busca **Google** y habilítalo:
   - ✅ **Enable Sign in with Google**
   
4. Pega las credenciales:
   - **Client ID**: (el que copiaste de Google Cloud)
   - **Client Secret**: (el que copiaste de Google Cloud)

5. **Redirect URL** (ya configurada automáticamente):
   ```
   https://sjcerbejmrjcjcgqngdg.supabase.co/auth/v1/callback
   ```

6. Click en **Save**

### 4️⃣ Configurar Email Templates (Opcional pero Recomendado)

1. En Supabase: **Authentication → Email Templates**
2. Personaliza el template **"Confirm signup"** si quieres que los usuarios que se registren con Google también confirmen su email

### 5️⃣ Verificar Configuración

1. Asegúrate que en **Authentication → Settings → Site URL** esté configurado:
   ```
   https://easygo.com.es
   ```
   O para desarrollo:
   ```
   http://localhost:5173
   ```

2. En **Redirect URLs**, agrega:
   ```
   http://localhost:5173/dashboard
   https://easygo.com.es/dashboard
   ```

## 🧪 Probar la Integración

### En Desarrollo Local:
1. Corre tu app: `npm run dev`
2. Ve a: http://localhost:5173/signin
3. Click en **"Continue with Google"**
4. Autoriza la app
5. Deberías ser redirigido a `/dashboard`

### En Producción:
1. Despliega tu app en: https://easygo.com.es
2. Ve a: https://easygo.com.es/signin
3. Click en **"Continue with Google"**
4. Autoriza la app
5. Deberías ser redirigido a `/dashboard`

## 🔒 Seguridad

### Scopes Solicitados:
- `email`: Para obtener el email del usuario
- `profile`: Para obtener nombre y foto de perfil
- `openid`: Para autenticación OpenID Connect

### Modo de Acceso:
- `access_type: 'offline'`: Permite obtener refresh tokens
- `prompt: 'consent'`: Muestra siempre la pantalla de consentimiento

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que la URL de callback en Google Cloud Console coincida exactamente con:
  ```
  https://sjcerbejmrjcjcgqngdg.supabase.co/auth/v1/callback
  ```

### Error: "Access blocked: This app's request is invalid"
- Completa la pantalla de consentimiento en Google Cloud Console
- Agrega tu email en "Test users" si la app está en modo Testing

### El usuario no se redirige al dashboard
- Verifica que la Redirect URL en Supabase Settings incluya `/dashboard`
- Revisa la consola del navegador para errores

### Error: "Invalid client"
- Verifica que el Client ID y Client Secret estén correctamente copiados en Supabase
- No debe haber espacios extras al inicio o final

## ✨ Flujo Completo

```
Usuario → Click "Continue with Google" 
       → Redirección a Google OAuth
       → Usuario autoriza la app
       → Google redirige a: https://sjcerbejmrjcjcgqngdg.supabase.co/auth/v1/callback
       → Supabase crea/autentica el usuario
       → Supabase redirige a: https://easygo.com.es/dashboard
       → Usuario logueado ✅
```

## 📝 Notas Importantes

1. **En modo Testing**: Solo los emails agregados en "Test users" pueden acceder
2. **Para producción**: Debes verificar tu app en Google (proceso puede tardar días)
3. **Usuarios existentes**: Si un usuario ya se registró con email/password, puede vincular su cuenta de Google
4. **Datos del usuario**: El email, nombre y foto se guardan automáticamente en Supabase Auth

## 🎯 Next Steps

Una vez configurado Google OAuth, puedes agregar:
- [ ] Avatar del usuario (usando `user.user_metadata.avatar_url`)
- [ ] Nombre completo (usando `user.user_metadata.full_name`)
- [ ] Más providers (GitHub, Facebook, Twitter, etc.)
- [ ] Two-Factor Authentication (2FA)

---

¿Necesitas ayuda con la configuración? Revisa:
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
