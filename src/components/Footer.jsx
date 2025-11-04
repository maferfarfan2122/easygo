import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { texts } = useLanguage();
  const { footer } = texts;

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-about">
          <p>{footer.about}</p>
        </div>
        
        {/* SEO: Navegación con estructura semántica */}
        <nav className="footer-links" aria-label="Enlaces del pie de página">
          <a href="#about" aria-label="Acerca de nosotros">{footer.links.about}</a>
          <a href="#privacy" aria-label="Política de privacidad">{footer.links.privacy}</a>
          <a href="#terms" aria-label="Términos y condiciones">{footer.links.terms}</a>
          <a href="#contact" aria-label="Contacto">{footer.links.contact}</a>
        </nav>
        
        <div className="footer-social">
          <p>{footer.social}</p>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">{footer.copyright}</p>
          <p className="footer-tagline">{footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
