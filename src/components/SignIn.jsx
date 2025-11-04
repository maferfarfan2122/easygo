import { texts } from '../i18n/en';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from './SEOHead';

const SignIn = () => {
  const { signIn: signInTexts } = texts;
  const { signIn, signUp, resetPassword, loading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    // Validaciones
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    // Si es registro, validar contraseñas coincidan
    if (isSignUp) {
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' });
        return;
      }
      if (password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
        return;
      }
    }

    try {
      if (isSignUp) {
        // Registro
        const { error } = await signUp(email, password);
        if (error) {
          setMessage({ type: 'error', text: error });
        } else {
          setMessage({ 
            type: 'success', 
            text: 'Account created! Please check your email to verify your account.' 
          });
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        // Inicio de sesión
        const { error } = await signIn(email, password);
        if (error) {
          setMessage({ type: 'error', text: error });
        } else {
          setMessage({ type: 'success', text: signInTexts.successMessage });
          setTimeout(() => navigate('/dashboard'), 1000);
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    const { error } = await resetPassword(email);
    if (error) {
      setMessage({ type: 'error', text: error });
    } else {
      setMessage({ 
        type: 'success', 
        text: 'Password reset link sent! Check your email.' 
      });
      setIsForgotPassword(false);
    }
  };

  return (
    <>
      <SEOHead 
        title={isSignUp ? 'Registro' : 'Iniciar Sesión'}
        description="Accede a Easy Go para crear CVs profesionales optimizados con IA. Regístrate gratis y comienza a construir tu currículum perfecto."
        url="https://easygo.com.es/signin"
      />
      
      <section className="signin" id="signin">
        <div className="signin-container">
          <div className="signin-content">
            <h1 className="signin-heading">
              {isForgotPassword 
                ? 'Reset Password' 
                : isSignUp 
                  ? 'Create Account' 
                  : signInTexts.heading}
            </h1>
          <p className="signin-intro">
            {isForgotPassword
              ? 'Enter your email to receive a password reset link'
              : isSignUp
                ? 'Sign up to start building websites with AI'
                : signInTexts.intro}
          </p>
          
          <form 
            className="signin-form" 
            onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder={signInTexts.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            {!isForgotPassword && (
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder={signInTexts.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {isSignUp && !isForgotPassword && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}
            
            {!isForgotPassword && !isSignUp && (
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  {signInTexts.rememberMe}
                </label>
                
                <button 
                  type="button"
                  className="forgot-link"
                  onClick={() => setIsForgotPassword(true)}
                  disabled={loading}
                >
                  {signInTexts.forgotPassword}
                </button>
              </div>
            )}
            
            {message.text && (
              <div className={`message message-${message.type}`}>
                {message.text}
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading 
                ? 'Loading...' 
                : isForgotPassword 
                  ? 'Send Reset Link'
                  : isSignUp 
                    ? 'Sign Up' 
                    : signInTexts.submitButton}
            </button>

            <div className="signin-toggle">
              {!isForgotPassword ? (
                <>
                  <p>
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                      type="button"
                      className="toggle-link"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setMessage({ type: '', text: '' });
                      }}
                      disabled={loading}
                    >
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>
                </>
              ) : (
                <button
                  type="button"
                  className="toggle-link"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setMessage({ type: '', text: '' });
                  }}
                  disabled={loading}
                >
                  ← Back to Sign In
                </button>
              )}
            </div>
          </form>
          
          <p className="signin-security">{signInTexts.securityNote}</p>
        </div>
      </div>
    </section>
    </>
  );
};

export default SignIn;
