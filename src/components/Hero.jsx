import { texts } from '../i18n/en';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const { hero } = texts;
  const navigate = useNavigate();

  return (
    <section className="hero" id="home" aria-label="Sección principal">
      <div className="hero-container">
        <div className="hero-content">
          {/* SEO: H1 único y descriptivo */}
          <h1 className="hero-title">{hero.title}</h1>
          <p className="hero-subtitle">{hero.subtitle}</p>
          
          <div className="hero-cta">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/signin')}
              aria-label="Comenzar a crear CV gratis"
            >
              {hero.primaryCTA}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
              aria-label="Ver características"
            >
              {hero.secondaryCTA}
            </button>
          </div>
          
          {/* SEO: Lista de beneficios con estructura semántica */}
          <ul className="hero-benefits" role="list">
            {hero.benefits.map((benefit, index) => (
              <li key={index} role="listitem">{benefit}</li>
            ))}
          </ul>
          
          <p className="hero-description">{hero.description}</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
