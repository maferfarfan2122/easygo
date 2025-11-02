import { texts } from '../i18n/en';

const Pricing = () => {
  const { pricing } = texts;

  return (
    <section className="pricing" id="pricing">
      <div className="pricing-container">
        <h2 className="pricing-heading">{pricing.heading}</h2>
        <p className="pricing-intro">{pricing.intro}</p>
        
        <div className="pricing-grid">
          {pricing.plans.map((plan, index) => (
            <article key={index} className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}>
              {plan.popular && <span className="pricing-badge">Popular</span>}
              
              <div className="pricing-card-header">
                <h3 className="pricing-card-name">{plan.name}</h3>
                <p className="pricing-card-tagline">{plan.tagline}</p>
                <p className="pricing-card-price">{plan.price}</p>
              </div>
              
              <ul className="pricing-card-features">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>{feature}</li>
                ))}
              </ul>
              
              <p className="pricing-card-bestfor">{plan.bestFor}</p>
              
              <button className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                {plan.cta}
              </button>
            </article>
          ))}
        </div>
        
        <div className="pricing-faq">
          <h3 className="pricing-faq-title">{pricing.faq.title}</h3>
          <dl className="pricing-faq-list">
            {pricing.faq.questions.map((item, index) => (
              <div key={index} className="pricing-faq-item">
                <dt className="pricing-faq-question">{item.question}</dt>
                <dd className="pricing-faq-answer">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
