import { texts } from '../i18n/en';

const Footer = () => {
  const { footer } = texts;

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-about">
          <p>{footer.about}</p>
        </div>
        
        <nav className="footer-links">
          <a href="#about">{footer.links.about}</a>
          <a href="#privacy">{footer.links.privacy}</a>
          <a href="#terms">{footer.links.terms}</a>
          <a href="#contact">{footer.links.contact}</a>
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
