import { useLanguage } from '../context/LanguageContext';

const CTA = () => {
  const { texts } = useLanguage();
  const { cta } = texts;

  return (
    <section className="cta">
      <div className="cta-container">
        <h2 className="cta-headline">{cta.headline}</h2>
        <p className="cta-supporting">{cta.supporting}</p>
        
        <div className="cta-buttons">
          <button className="btn btn-primary">{cta.primaryCTA}</button>
          <button className="btn btn-secondary">{cta.secondaryCTA}</button>
        </div>
        
        <ul className="cta-reassurance">
          {cta.reassurance.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default CTA;
