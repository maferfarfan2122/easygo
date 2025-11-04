import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const { texts } = useLanguage();
  const { pricing } = texts;
  const navigate = useNavigate();

  return (
    <section className="pricing" id="pricing" aria-labelledby="pricing-heading">
      <div className="pricing-container">
        {/* SEO: H2 descriptivo */}
        <h2 id="pricing-heading" className="pricing-heading">{pricing.heading}</h2>
        <p className="pricing-intro">{pricing.intro}</p>
        
        <div className="pricing-grid">
          {pricing.plans.map((plan, index) => (
            <article 
              key={index} 
              className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}
              itemScope
              itemType="https://schema.org/Offer"
            >
              {plan.popular && <span className="pricing-badge">Popular</span>}
              
              <div className="pricing-card-header">
                {/* SEO: H3 para cada plan */}
                <h3 className="pricing-card-name" itemProp="name">{plan.name}</h3>
                <p className="pricing-card-tagline" itemProp="description">{plan.tagline}</p>
                <p className="pricing-card-price" itemProp="price">{plan.price}</p>
              </div>
              
              <ul className="pricing-card-features" role="list">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} role="listitem">{feature}</li>
                ))}
              </ul>
              
              <p className="pricing-card-bestfor">{plan.bestFor}</p>
              
              <button 
                className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => navigate('/signin')}
                aria-label={`Seleccionar plan ${plan.name}`}
              >
                {plan.cta}
              </button>
            </article>
          ))}
        </div>
        
        <div className="pricing-faq">
          {/* SEO: H3 para FAQ */}
          <h3 className="pricing-faq-title">{pricing.faq.title}</h3>
          <dl className="pricing-faq-list" itemScope itemType="https://schema.org/FAQPage">
            {pricing.faq.questions.map((item, index) => (
              <div key={index} className="pricing-faq-item" itemScope itemType="https://schema.org/Question">
                <dt className="pricing-faq-question" itemProp="name">{item.question}</dt>
                <dd className="pricing-faq-answer" itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                  <span itemProp="text">{item.answer}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
