import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, CheckCircle, AlertCircle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { SEOHead } from './SEOHead';

const ConfirmEmail = () => {
  const navigate = useNavigate();
  
  const [verifying, setVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Supabase maneja la confirmación automáticamente cuando el usuario hace clic en el enlace
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError('Error al verificar tu correo. Por favor intenta de nuevo.');
          setIsVerified(false);
        } else if (session?.user?.email_confirmed_at) {
          // Email confirmado
          setIsVerified(true);
          console.log('Email verified successfully');
          
          // Redirigir al dashboard después de 3 segundos
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          // Verificar si hay token en el hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const type = hashParams.get('type');
          
          if (accessToken && type === 'signup') {
            setIsVerified(true);
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          } else {
            setError('No se encontró un enlace de verificación válido. Por favor revisa tu email.');
            setIsVerified(false);
          }
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
        setIsVerified(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [navigate]);

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        setError('No se encontró un email asociado. Por favor inicia sesión.');
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        setError('Error al reenviar el correo. Por favor intenta de nuevo.');
      } else {
        setResendSuccess(true);
        setError(null);
      }
    } catch (error) {
      console.error('Error resending email:', error);
      setError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="Confirmar Email"
        description="Confirma tu correo electrónico para activar tu cuenta de Easy Go."
        url="https://easygo.com.es/confirm-email"
      />
      
      <div className="auth-page">
        <div className="auth-page__container">
          
          {/* Success State - Email Verified */}
          {isVerified ? (
            <div className="auth-page__success">
              <div className="auth-page__icon auth-page__icon--success">
                <CheckCircle className="icon-large" />
              </div>
              <h1 className="auth-page__title">
                ¡Email Verificado!
              </h1>
              <p className="auth-page__subtitle">
                Tu cuenta ha sido activada exitosamente
              </p>
              <div className="auth-page__success-details">
                <div className="auth-page__success-item">
                  <CheckCircle className="icon-small" />
                  <span>Email confirmado correctamente</span>
                </div>
                <div className="auth-page__success-item">
                  <CheckCircle className="icon-small" />
                  <span>Cuenta activada</span>
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
          ) : verifying ? (
            /* Loading State - Verifying */
            <div className="auth-page__loading">
              <div className="auth-page__icon">
                <Loader2 className="icon-large icon-spin" />
              </div>
              <h1 className="auth-page__title">
                Verificando...
              </h1>
              <p className="auth-page__subtitle">
                Confirmando tu correo electrónico
              </p>
            </div>
          ) : (
            /* Error State - Verification Failed */
            <>
              <div className="auth-page__header">
                <div className="auth-page__icon auth-page__icon--warning">
                  <Mail className="icon-large" />
                </div>
                <h1 className="auth-page__title">
                  Verifica tu Email
                </h1>
                <p className="auth-page__subtitle">
                  {error || 'Por favor revisa tu correo para confirmar tu cuenta'}
                </p>
              </div>

              <div className="auth-page__form">
                {/* Message */}
                {error && (
                  <div className="auth-page__message auth-page__message--error">
                    <div className="auth-page__message-icon">
                      <AlertCircle className="icon-small" />
                    </div>
                    <span className="auth-page__message-text">{error}</span>
                  </div>
                )}

                {resendSuccess && (
                  <div className="auth-page__message auth-page__message--success">
                    <div className="auth-page__message-icon">
                      <CheckCircle className="icon-small" />
                    </div>
                    <span className="auth-page__message-text">
                      ¡Email enviado! Revisa tu bandeja de entrada.
                    </span>
                  </div>
                )}

                <div className="auth-page__info">
                  <p>
                    📧 Te hemos enviado un correo de confirmación. 
                    Haz clic en el enlace para activar tu cuenta.
                  </p>
                  <p>
                    💡 Si no encuentras el correo, revisa tu carpeta de spam.
                  </p>
                </div>

                {/* Resend Button */}
                <button
                  type="button"
                  className={`auth-page__button ${resendLoading ? 'auth-page__button--loading' : ''}`}
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                >
                  {resendLoading ? (
                    <>
                      <svg className="auth-page__spinner" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                        <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Reenviando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="icon-small" style={{ marginRight: '8px', marginTop: '-2px' }} />
                      Reenviar Email de Confirmación
                    </>
                  )}
                </button>

                {/* Back to Sign In */}
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

              {/* Instructions */}
              <div className="auth-page__instructions">
                <h3>¿No recibiste el correo?</h3>
                <ul>
                  <li>Revisa tu carpeta de spam o correo no deseado</li>
                  <li>Verifica que el email sea correcto</li>
                  <li>Espera unos minutos, puede tardar en llegar</li>
                  <li>Usa el botón "Reenviar" si no llega en 5 minutos</li>
                </ul>
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

          .auth-page__icon--warning {
            background: #fef3c7;
          }

          .auth-page__icon--warning .icon-large {
            color: #d97706;
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

          /* === INFO === */
          .auth-page__info {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
          }

          .auth-page__info p {
            font-size: 14px;
            color: #6b7280;
            margin: 0 0 12px 0;
            line-height: 1.5;
          }

          .auth-page__info p:last-child {
            margin-bottom: 0;
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
            display: flex;
            align-items: center;
            justify-content: center;
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

          .auth-page__link .icon-small {
            width: 16px;
            height: 16px;
            vertical-align: middle;
            margin-right: 4px;
            margin-top: -2px;
          }

          /* === INSTRUCTIONS === */
          .auth-page__instructions {
            margin-top: 32px;
            text-align: left;
          }

          .auth-page__instructions h3 {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 16px 0;
          }

          .auth-page__instructions ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .auth-page__instructions li {
            font-size: 14px;
            color: #6b7280;
            padding: 8px 0;
            padding-left: 24px;
            position: relative;
          }

          .auth-page__instructions li::before {
            content: "•";
            position: absolute;
            left: 8px;
            color: #9ca3af;
            font-weight: bold;
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

            .auth-page__instructions {
              padding: 0 8px;
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

export default ConfirmEmail;
