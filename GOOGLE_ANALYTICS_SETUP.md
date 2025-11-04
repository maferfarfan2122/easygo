# Configuración de Google Analytics y Search Console

## 🔍 Google Search Console - Pasos de Configuración

### 1. Verificar Propiedad

**Opción A: Verificación por DNS (Recomendada para Vercel)**
```
1. Ve a Google Search Console: https://search.google.com/search-console
2. Añadir propiedad → Dominio
3. Ingresa: easygo.com.es
4. Google te dará un registro TXT

En IONOS:
- Ve a DNS Settings
- Añade registro TXT:
  Nombre: @
  Valor: google-site-verification=XXXXX
  TTL: 3600
  
5. Espera 10-30 minutos
6. Verifica en Search Console
```

**Opción B: Verificación por HTML (Más rápida)**
```html
<!-- Agregar en index.html dentro de <head> -->
<meta name="google-site-verification" content="TU_CODIGO_AQUI" />
```

### 2. Enviar Sitemap
```
1. En Search Console, ve a "Sitemaps"
2. Añadir nuevo sitemap
3. URL: https://easygo.com.es/sitemap.xml
4. Enviar
5. Esperar 24-48h para ver resultados
```

### 3. Solicitar Indexación Manual
```
1. En Search Console, ve a "Inspección de URLs"
2. Ingresa cada URL importante:
   - https://easygo.com.es/
   - https://easygo.com.es/signin
   - Etc.
3. Clic en "Solicitar indexación"
4. Repetir para páginas principales
```

---

## 📊 Google Analytics 4 - Configuración Completa

### 1. Crear Propiedad

```
1. Ve a: https://analytics.google.com
2. Admin → Crear propiedad
3. Nombre: Easy Go
4. Zona horaria: España
5. Moneda: EUR
6. Crear flujo de datos web:
   - URL: https://easygo.com.es
   - Nombre del flujo: Easy Go Web
```

### 2. Código de Seguimiento (Agregar a index.html)

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    
    <!-- SEO Meta Tags -->
    <title>Easy Go - Crea CVs Profesionales con IA | Generador de Currículums Inteligente</title>
    <!-- ... otros meta tags ... -->
    
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX', {
        'send_page_view': true,
        'cookie_flags': 'SameSite=None;Secure'
      });
    </script>
    
    <!-- ... resto del head ... -->
  </head>
  <body>
    <!-- contenido -->
  </body>
</html>
```

### 3. Eventos Personalizados (Agregar a componentes)

**En CVBuilder.jsx - Tracking de generación de CV:**
```jsx
// Al inicio del archivo
const trackEvent = (eventName, params = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Cuando el usuario genera un CV
const generatePDF = async (withOptimization = true) => {
  setLoading(true);
  
  // Track inicio
  trackEvent('cv_generation_start', {
    with_optimization: withOptimization,
    user_id: user?.id
  });

  try {
    // ... código existente ...
    
    // Track éxito
    trackEvent('cv_generation_success', {
      with_optimization: withOptimization,
      cv_name: formData.personalInfo.full_name
    });
    
  } catch (err) {
    // Track error
    trackEvent('cv_generation_error', {
      error: err.message
    });
  }
};

// Cuando optimiza con IA
const optimizeCV = async () => {
  trackEvent('cv_optimization_start');
  // ... resto del código
};
```

**En SignIn.jsx - Tracking de registros:**
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (!error) {
        // Track registro exitoso
        if (window.gtag) {
          window.gtag('event', 'sign_up', {
            method: 'email'
          });
        }
      }
    } else {
      const { error } = await signIn(email, password);
      if (!error) {
        // Track login exitoso
        if (window.gtag) {
          window.gtag('event', 'login', {
            method: 'email'
          });
        }
      }
    }
  } catch (error) {
    // ...
  }
};
```

**En Hero.jsx - Tracking de CTAs:**
```jsx
<button 
  className="btn btn-primary btn-large"
  onClick={() => {
    // Track click en CTA principal
    if (window.gtag) {
      window.gtag('event', 'cta_click', {
        cta_location: 'hero',
        cta_text: 'Crear Mi CV Gratis'
      });
    }
    navigate('/signin');
  }}
>
  Crear Mi CV Gratis
</button>
```

### 4. Configurar Conversiones en GA4

```
1. En GA4, ve a Admin → Eventos
2. Crear eventos como conversiones:
   - sign_up (Registro)
   - cv_generation_success (CV generado)
   - cv_optimization_start (Optimización con IA)
   
3. Marcar cada uno como "Conversión"
```

---

## 🎯 Google Tag Manager (Alternativa Avanzada)

Si prefieres usar Google Tag Manager en lugar de código directo:

### 1. Crear Cuenta GTM
```
1. Ve a: https://tagmanager.google.com
2. Crear cuenta → Easy Go
3. Crear contenedor → Web
4. Copiar el código del contenedor
```

### 2. Código GTM para index.html

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
    <!-- End Google Tag Manager -->
    
    <title>Easy Go - Generador de CVs</title>
    <!-- ... resto del head ... -->
  </head>
  <body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 3. Tags a Configurar en GTM

**Tag 1: Google Analytics 4**
```
Tipo: Google Analytics: Configuración de GA4
ID de medición: G-XXXXXXXXXX
Activador: All Pages
```

**Tag 2: Eventos de Conversión**
```
Tipo: Google Analytics: Evento de GA4
Nombre del evento: cv_generated
Activador: Personalizado (cuando se genera CV)
```

---

## 🔥 Hotjar - Análisis de Comportamiento (Opcional)

Para entender cómo los usuarios interactúan con tu sitio:

### Código de Hotjar
```html
<!-- Hotjar Tracking Code -->
<script>
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:XXXXXXX,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

---

## 📱 Meta Pixel (Facebook) - Opcional

Si planeas hacer publicidad en Facebook/Instagram:

```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
```

---

## ✅ Checklist de Implementación

### Día 1: Configuración Básica
- [ ] Crear cuenta Google Search Console
- [ ] Verificar propiedad (método DNS o HTML)
- [ ] Enviar sitemap.xml
- [ ] Solicitar indexación de páginas principales
- [ ] Crear propiedad Google Analytics 4
- [ ] Instalar código GA4 en index.html

### Día 2: Eventos y Conversiones
- [ ] Configurar eventos personalizados en componentes
- [ ] Marcar eventos como conversiones en GA4
- [ ] Probar eventos en tiempo real
- [ ] Configurar filtros (excluir tráfico interno)

### Día 3: Monitoreo
- [ ] Verificar que el tracking funciona
- [ ] Revisar informe de tiempo real en GA4
- [ ] Comprobar que los eventos se registran
- [ ] Configurar alertas en Search Console

---

## 📊 Variables de Entorno para Analytics

Crear archivo `.env.local` actualizado:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key

# Backend API
VITE_API_URL=http://localhost:8000

# Google Analytics 4
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Tag Manager (opcional)
VITE_GTM_ID=GTM-XXXXXXX

# Hotjar (opcional)
VITE_HOTJAR_ID=XXXXXXX

# Meta Pixel (opcional)
VITE_META_PIXEL_ID=XXXXXXXXXXXXXXXXX
```

### Usar en index.html dinámicamente:

```html
<script>
  // Leer GA ID desde variables de entorno de Vite
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (gaId) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);
    
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', gaId);
  }
</script>
```

---

## 🎓 Recursos de Aprendizaje

- **Google Analytics Academy**: https://analytics.google.com/analytics/academy/
- **Search Console Help**: https://support.google.com/webmasters
- **GA4 Documentation**: https://developers.google.com/analytics/devguides/collection/ga4

---

**Nota**: Reemplaza todos los `XXXXXXXXXX` con tus códigos reales una vez que crees las cuentas.
