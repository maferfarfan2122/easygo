import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { texts, language, toggleLanguage } = useLanguage();
  const { navbar } = texts;
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleNavClick = (e, href) => {
    if (location.pathname !== '/') {
      e.preventDefault();
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLanguageToggle = () => {
    toggleLanguage();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" aria-label={navbar.ariaLabels.home} onClick={() => setMobileMenuOpen(false)}>
            {navbar.brand}
          </Link>
        </div>
        
        {/* Hamburger Button */}
        <button 
          className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Desktop & Mobile Menu */}
        <ul className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li>
            <Link 
              to="/" 
              onClick={(e) => handleNavClick(e, '#home')}
              aria-label={navbar.ariaLabels.home}
            >
              {navbar.home}
            </Link>
          </li>
          <li>
            <a 
              href="#tools" 
              onClick={(e) => handleNavClick(e, '#tools')}
              aria-label={navbar.ariaLabels.tools}
            >
              {navbar.tools}
            </a>
          </li>
          <li>
            <a 
              href="#pricing" 
              onClick={(e) => handleNavClick(e, '#pricing')}
              aria-label={navbar.ariaLabels.pricing}
            >
              {navbar.pricing}
            </a>
          </li>
          
          {user ? (
            <>
              <li>
                <Link 
                  to="/dashboard" 
                  className="navbar-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
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
              <Link 
                to="/signin" 
                aria-label={navbar.ariaLabels.signIn} 
                className="navbar-signin"
                onClick={() => setMobileMenuOpen(false)}
              >
                {navbar.signIn}
              </Link>
            </li>
          )}
          
          {/* Language Switcher */}
          <li>
            <button 
              onClick={handleLanguageToggle}
              className="language-switcher"
              aria-label={language === 'en' ? 'Cambiar a español' : 'Switch to English'}
            >
              <span className="language-icon">🌐</span>
              <span className="language-text">{language === 'en' ? 'ES' : 'EN'}</span>
            </button>
          </li>
        </ul>

        {/* Overlay */}
        {mobileMenuOpen && (
          <div 
            className="navbar-overlay" 
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
