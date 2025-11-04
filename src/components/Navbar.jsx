import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { texts, language, toggleLanguage } = useLanguage();
  const { navbar } = texts;
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" aria-label={navbar.ariaLabels.home}>
            {navbar.brand}
          </Link>
        </div>
        
        <ul className="navbar-menu">
          <li>
            <a href="#home" aria-label={navbar.ariaLabels.home}>
              {navbar.home}
            </a>
          </li>
          <li>
            <a href="#tools" aria-label={navbar.ariaLabels.tools}>
              {navbar.tools}
            </a>
          </li>
          <li>
            <a href="#pricing" aria-label={navbar.ariaLabels.pricing}>
              {navbar.pricing}
            </a>
          </li>
          
          {user ? (
            <>
              <li>
                <Link to="/dashboard" className="navbar-link">
                  {navbar.dashboard}
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleSignOut} 
                  className="navbar-signout"
                  aria-label={navbar.signOut}
                >
                  {navbar.signOut}
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/signin" aria-label={navbar.ariaLabels.signIn} className="navbar-signin">
                {navbar.signIn}
              </Link>
            </li>
          )}
          
          {/* Language Switcher */}
          <li>
            <button 
              onClick={toggleLanguage}
              className="language-switcher"
              aria-label={language === 'en' ? 'Cambiar a español' : 'Switch to English'}
            >
              <span className="language-icon">🌐</span>
              <span className="language-text">{language === 'en' ? 'ES' : 'EN'}</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
