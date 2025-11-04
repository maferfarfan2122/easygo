import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Lock, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { SEOHead } from './SEOHead';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { updatePassword, loading } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({ 
    type: '', 
    text: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Verificar que hay un token de recuperación válido
  useEffect(() => {
    const checkRecoveryToken = async () => {
      try {
        console.log('Checking recovery token...');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);
        
        // PRIMERO: Verificar si hay token en el hash (método correcto de Supabase)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        let accessToken = hashParams.get('access_token');
        let type = hashParams.get('type');
        
        // SEGUNDO: Si no está en hash, verificar query params (por si acaso)
        if (!accessToken) {
          const searchParams = new URLSearchParams(window.location.search);
          accessToken = searchParams.get('access_token');
          type = searchParams.get('type');
          console.log('Checking query params:', { accessToken: !!accessToken, type });
        }
        
        console.log('Token detection:', { accessToken: !!accessToken, type });
        
        if (accessToken && type === 'recovery') {
          // Hay un token de recuperación en la URL
          console.log('✅ Recovery token found - Valid!');
          setIsValidToken(true);
          setCheckingToken(false);
          return;
        }
        
        // TERCERO: Si no hay token, verificar sesión
        console.log('No token in URL, checking session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setMessage({ 
            type: 'error', 
            text: 'Error al verificar el token. Por favor solicita un nuevo enlace.' 
          });
          setIsValidToken(false);
        } else if (session?.user) {
          // Hay una sesión válida, el usuario puede cambiar la contraseña
          console.log('✅ Session found, user can reset password');
          setIsValidToken(true);
        } else {
          // No hay token ni sesión válida
          console.log('❌ No valid token or session found');
          setMessage({ 
            type: 'error', 
            text: 'No se encontró un token de recuperación válido. Por favor solicita un nuevo enlace desde la página de recuperación de contraseña.' 
          });
          setIsValidToken(false);
        }
      } catch (error) {
        console.error('Error checking token:', error);
        setMessage({ 
          type: 'error', 
          text: 'Error al verificar el token. Por favor intenta de nuevo.' 
        });
        setIsValidToken(false);
      } finally {
        setCheckingToken(false);
      }
    };

    checkRecoveryToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validaciones
    if (!password || !confirmPassword) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    try {
      const { error } = await updatePassword(password);
      
      if (error) {
        setMessage({ type: 'error', text: error });
      } else {
        // Mostrar pantalla de éxito
        setPasswordChanged(true);
        
        // Redirigir al dashboard después de 3 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Ocurrió un error inesperado. Por favor intenta de nuevo.' 
      });
    }
  };

  return (
    <>
      <SEOHead 
        title="Restablecer Contraseña"
        description="Restablece tu contraseña de Easy Go de forma segura."
        url="https://easygo.com.es/reset-password"
      />
      
      <div className="auth-page">
        <div className="auth-page__container">
          
          {/* Success State - Password Changed */}
          {passwordChanged ? (
            <div className="auth-page__success">
              <div className="auth-page__icon auth-page__icon--success">
                <CheckCircle className="icon-large" />
              </div>
              <h1 className="auth-page__title">
                ¡Contraseña Actualizada!
              </h1>
              <p className="auth-page__subtitle">
                Tu contraseña ha sido cambiada exitosamente
              </p>
              <div className="auth-page__success-details">
                <div className="auth-page__success-item">
                  <CheckCircle className="icon-small" />
                  <span>Contraseña segura establecida</span>
                </div>
                <div className="auth-page__success-item">
                  <CheckCircle className="icon-small" />
                  <span>Sesión actualizada</span>
                </div>
                <div className="auth-page__success-item">
                  <CheckCircle className="icon-small" />
                  <span>Redirigiendo a tu dashboard...</span>
                </div>
              </div>
              <div className="auth-page__success-progress">
                <div className="auth-page__success-progress-bar"></div>
              </div>
            </div>
          ) : checkingToken ? (
            /* Loading State */
            <div className="auth-page__loading">
              <div className="auth-page__icon">
                <Loader2 className="icon-large icon-spin" />
              </div>
              <h1 className="auth-page__title">
                Verificando...
              </h1>
              <p className="auth-page__subtitle">
                Por favor espera un momento
              </p>
            </div>
          ) : !isValidToken ? (
            // Error State - No valid token
            <>
              <div className="auth-page__header">
                <div className="auth-page__icon auth-page__icon--error">
                  <AlertCircle className="icon-large" />
                </div>
                <h1 className="auth-page__title">
                  Token Inválido
                </h1>
                <p className="auth-page__subtitle">
                  El enlace de recuperación no es válido o ha expirado
                </p>
              </div>

              <div className="auth-page__form">
                {message.text && (
                  <div className={`auth-page__message auth-page__message--${message.type}`}>
                    <div className="auth-page__message-icon">
                      <AlertCircle className="icon-small" />
                    </div>
                    <span className="auth-page__message-text">{message.text}</span>
                  </div>
                )}

                <button
                  type="button"
                  className="auth-page__button"
                  onClick={() => navigate('/forgot-password')}
                >
                  Solicitar Nuevo Enlace
                </button>

                <div className="auth-page__footer">
                  <button
                    type="button"
                    className="auth-page__link"
                    onClick={() => navigate('/signin')}
                  >
                    <ArrowLeft className="icon-small" />
                    Volver al inicio de sesión
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Valid Token - Show Form
            <>
              <div className="auth-page__header">
                <div className="auth-page__icon">
                  <Lock className="icon-large" />
                </div>
                <h1 className="auth-page__title">
                  Restablecer Contraseña
                </h1>
                <p className="auth-page__subtitle">
                  Ingresa tu nueva contraseña
                </p>
              </div>

              {/* Form */}
              <form className="auth-page__form" onSubmit={handleSubmit}>
            
            {/* Password Input */}
            <div className="auth-page__form-group">
              <label htmlFor="password" className="auth-page__label">
                Nueva Contraseña
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="auth-page__input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Confirm Password Input */}
            <div className="auth-page__form-group">
              <label htmlFor="confirmPassword" className="auth-page__label">
                Confirmar Contraseña
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                className="auth-page__input"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Show Password Toggle */}
            <div className="auth-page__checkbox">
              <label className="auth-page__checkbox-label">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  disabled={loading}
                />
                <span>Mostrar contraseña</span>
              </label>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`auth-page__message auth-page__message--${message.type}`}>
                <div className="auth-page__message-icon">
                  {message.type === 'success' ? (
                    <CheckCircle className="icon-small" />
                  ) : (
                    <AlertCircle className="icon-small" />
                  )}
                </div>
                <span className="auth-page__message-text">{message.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`auth-page__button ${loading ? 'auth-page__button--loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="auth-page__spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                    <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Actualizando...
                </>
              ) : (
                'Actualizar Contraseña'
              )}
            </button>

            {/* Back to Sign In */}
            <div className="auth-page__footer">
              <button
                type="button"
                className="auth-page__link"
                onClick={() => navigate('/signin')}
                disabled={loading}
              >
                <ArrowLeft className="icon-small" />
                Volver al inicio de sesión
              </button>
            </div>
          </form>

          {/* Security Note */}
          <div className="auth-page__security">
            <p>
              🔒 Tu contraseña está protegida con encriptación de nivel empresarial
            </p>
          </div>
        </>
        )}
        </div>

        <style>{`
          /* === AUTH PAGE STYLES === */
          .auth-page {
            min-height: 100vh;
            background: linear-gradient(to bottom, #f9fafb, #ffffff);
            display: grid;
            place-items: center;
            padding: 40px 16px;
          }

          .auth-page__container {
            max-width: 480px;
            width: 100%;
          }

          /* === HEADER === */
          .auth-page__header {
            text-align: center;
            margin-bottom: 48px;
          }

          .auth-page__loading {
            text-align: center;
            padding: 40px 0;
          }

          .auth-page__icon {
            width: 80px;
            height: 80px;
            background: #111827;
            border-radius: 9999px;
            display: inline-block;
            margin-bottom: 24px;
            position: relative;
          }

          .auth-page__icon--error {
            background: #fef2f2;
          }

          .auth-page__icon--error .icon-large {
            color: #dc2626;
          }

          .auth-page__icon--success {
            background: #f0fdf4;
            animation: successPulse 0.6s ease-out;
          }

          .auth-page__icon--success .icon-large {
            color: #16a34a;
          }

          @keyframes successPulse {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }

          .auth-page__icon .icon-large {
            width: 40px;
            height: 40px;
            color: #ffffff;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }

          .icon-spin {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }

          .auth-page__title {
            font-size: 48px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 16px 0;
            letter-spacing: -0.025em;
            line-height: 1;
          }

          .auth-page__subtitle {
            font-size: 18px;
            color: #6b7280;
            font-weight: 300;
            margin: 0;
          }

          /* === FORM === */
          .auth-page__form {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }

          .auth-page__form-group {
            margin-bottom: 24px;
          }

          .auth-page__label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #111827;
            margin-bottom: 8px;
          }

          .auth-page__input {
            width: 100%;
            padding: 12px 16px;
            font-size: 16px;
            color: #111827;
            background: #ffffff;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            transition: all 0.2s ease;
            font-family: inherit;
          }

          .auth-page__input:hover {
            border-color: #9ca3af;
          }

          .auth-page__input:focus {
            outline: none;
            border-color: #111827;
            box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.1);
          }

          .auth-page__input:disabled {
            background: #f3f4f6;
            cursor: not-allowed;
            opacity: 0.6;
          }

          .auth-page__input::placeholder {
            color: #9ca3af;
          }

          /* === CHECKBOX === */
          .auth-page__checkbox {
            margin-bottom: 24px;
          }

          .auth-page__checkbox-label {
            display: inline-block;
            font-size: 14px;
            color: #6b7280;
            cursor: pointer;
          }

          .auth-page__checkbox-label input[type="checkbox"] {
            margin-right: 8px;
            cursor: pointer;
          }

          /* === MESSAGE === */
          .auth-page__message {
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 24px;
            display: block;
          }

          .auth-page__message--success {
            background: #f0fdf4;
            border: 1px solid #dcfce7;
            color: #166534;
          }

          .auth-page__message--error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
          }

          .auth-page__message-icon {
            display: inline-block;
            vertical-align: middle;
            margin-right: 8px;
          }

          .auth-page__message-icon .icon-small {
            width: 16px;
            height: 16px;
          }

          .auth-page__message-text {
            display: inline-block;
            vertical-align: middle;
            font-size: 14px;
            font-weight: 500;
          }

          /* === BUTTON === */
          .auth-page__button {
            width: 100%;
            padding: 16px 32px;
            background: #111827;
            color: #ffffff;
            border: none;
            border-radius: 9999px;
            font-weight: 500;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }

          .auth-page__button:hover {
            background: #1f2937;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }

          .auth-page__button:active {
            transform: scale(0.98);
          }

          .auth-page__button:disabled {
            background: #e5e7eb;
            color: #9ca3af;
            cursor: not-allowed;
            box-shadow: none;
            transform: none;
          }

          .auth-page__button--loading {
            background: #1f2937;
          }

          .auth-page__spinner {
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            display: inline-block;
            vertical-align: middle;
            margin-right: 8px;
            margin-top: -2px;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          /* === FOOTER === */
          .auth-page__footer {
            margin-top: 24px;
            text-align: center;
          }

          .auth-page__link {
            display: inline-block;
            background: transparent;
            border: none;
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: color 0.2s ease;
            padding: 0;
          }

          .auth-page__link:hover {
            color: #111827;
          }

          .auth-page__link:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .auth-page__link .icon-small {
            width: 16px;
            height: 16px;
            vertical-align: middle;
            margin-right: 4px;
            margin-top: -2px;
          }

          /* === SECURITY === */
          .auth-page__security {
            text-align: center;
            margin-top: 32px;
          }

          .auth-page__security p {
            font-size: 12px;
            color: #9ca3af;
            margin: 0;
          }

          /* === SUCCESS STATE === */
          .auth-page__success {
            text-align: center;
            animation: fadeInUp 0.5s ease-out;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .auth-page__success-details {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 24px;
            padding: 32px;
            margin-top: 32px;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }

          .auth-page__success-item {
            display: block;
            padding: 12px 0;
            font-size: 16px;
            color: #111827;
            animation: fadeInLeft 0.5s ease-out backwards;
          }

          .auth-page__success-item:nth-child(1) { animation-delay: 0.2s; }
          .auth-page__success-item:nth-child(2) { animation-delay: 0.4s; }
          .auth-page__success-item:nth-child(3) { animation-delay: 0.6s; }

          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .auth-page__success-item .icon-small {
            width: 20px;
            height: 20px;
            color: #16a34a;
            vertical-align: middle;
            margin-right: 12px;
            margin-top: -2px;
          }

          .auth-page__success-item span {
            display: inline-block;
            vertical-align: middle;
          }

          .auth-page__success-progress {
            margin-top: 32px;
            height: 4px;
            background: #f3f4f6;
            border-radius: 9999px;
            overflow: hidden;
          }

          .auth-page__success-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%);
            border-radius: 9999px;
            animation: progressBar 3s ease-in-out;
          }

          @keyframes progressBar {
            from { width: 0%; }
            to { width: 100%; }
          }

          /* === ICONS === */
          .icon-small {
            width: 16px;
            height: 16px;
          }

          .icon-large {
            width: 40px;
            height: 40px;
          }

          /* === RESPONSIVE === */
          @media (max-width: 640px) {
            .auth-page {
              padding: 24px 16px;
            }

            .auth-page__title {
              font-size: 36px;
            }

            .auth-page__form {
              padding: 24px;
            }
          }

          /* === ACCESSIBILITY === */
          button:focus-visible,
          input:focus-visible {
            outline: 2px solid #111827;
            outline-offset: 2px;
          }
        `}</style>
      </div>
    </>
  );
};

export default ResetPassword;
