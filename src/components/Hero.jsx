import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const { texts } = useLanguage();
  const { hero } = texts;
  const navigate = useNavigate();

  return (
    <section className="hero" id="home" aria-label="Sección principal">
      <div className="hero-container">
        <div className="hero-content">
          {/* Apple-style badge */}
          <div className="hero-badge">
            <span className="badge-text">Introducing Easy Go Tools</span>
          </div>
          
          {/* SEO: H1 único y descriptivo */}
          <h1 className="hero-title">{hero.title}</h1>
          <p className="hero-subtitle">{hero.subtitle}</p>
          
          <div className="hero-cta">
            <button 
              className="btn btn-primary"
              onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
              aria-label="Explorar herramientas disponibles"
            >
              {hero.primaryCTA}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
              aria-label="Ver más información"
            >
              {hero.secondaryCTA}
            </button>
          </div>
          
          {/* SEO: Lista de beneficios con estructura semántica */}
          <ul className="hero-benefits" role="list">
            {hero.benefits.map((benefit, index) => (
              <li key={index} role="listitem">
                <span className="benefit-icon">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
          
          <p className="hero-description">{hero.description}</p>
        </div>
        
        {/* Apple-style floating cards preview */}
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">📝</div>
            <div className="card-title">CV Builder</div>
            <div className="card-status">Available</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">💼</div>
            <div className="card-title">Portfolio</div>
            <div className="card-status">Coming Soon</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">✉️</div>
            <div className="card-title">Email Signature</div>
            <div className="card-status">Coming Soon</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
