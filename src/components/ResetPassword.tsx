import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
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

  // Verificar que hay un token de recuperación en la URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) {
      setMessage({ 
        type: 'error', 
        text: 'No se encontró un token de recuperación válido. Por favor solicita un nuevo enlace.' 
      });
    }
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
        setMessage({ 
          type: 'success', 
          text: '¡Contraseña actualizada correctamente! Redirigiendo...' 
        });
        
        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
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
          
          {/* Header */}
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

          .auth-page__icon {
            width: 80px;
            height: 80px;
            background: #111827;
            border-radius: 9999px;
            display: inline-block;
            margin-bottom: 24px;
            position: relative;
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
