import { texts } from '../i18n/en';

const Hero = () => {
  const { hero } = texts;

  return (
    <section className="hero" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">{hero.title}</h1>
          <p className="hero-subtitle">{hero.subtitle}</p>
          
          <div className="hero-cta">
            <button className="btn btn-primary">{hero.primaryCTA}</button>
            <button className="btn btn-secondary">{hero.secondaryCTA}</button>
          </div>
          
          <ul className="hero-benefits">
            {hero.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
          
          <p className="hero-description">{hero.description}</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
