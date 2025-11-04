import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Tools = () => {
  const { texts } = useLanguage();
  const { tools } = texts;
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleToolClick = (feature, index) => {
    if (feature.available) {
      if (user) {
        // Primera herramienta: CV Builder
        if (index === 0) {
          navigate('/tools/cv-builder');
        }
        // Segunda herramienta: PDF Optimizer
        else if (index === 1) {
          navigate('/tools/pdf-optimizer');
        }
      } else {
        navigate('/signin');
      }
    }
  };

  return (
    <section className="tools" id="tools" aria-labelledby="tools-heading">
      <div className="tools-container">
        {/* SEO: H2 descriptivo */}
        <h2 id="tools-heading" className="tools-heading">{tools.heading}</h2>
        <p className="tools-intro">{tools.intro}</p>
        
        <div className="tools-grid">
          {tools.features.map((feature, index) => (
            <article 
              key={index} 
              className={`tool-card ${feature.available ? 'tool-card-available' : 'tool-card-coming-soon'}`}
              onClick={() => handleToolClick(feature, index)}
              style={feature.available ? { cursor: 'pointer' } : { cursor: 'not-allowed', opacity: 0.7 }}
              itemScope
              itemType="https://schema.org/SoftwareApplication"
            >
              <div className="tool-card-badge">
                <span className={feature.available ? 'badge-available' : 'badge-coming-soon'}>
                  {feature.badge}
                </span>
              </div>
              
              <div className="tool-card-icon">
                {feature.available ? '🚀' : '⏳'}
              </div>
              
              <div className="tool-card-header">
                {/* SEO: H3 específicos con estructura semántica */}
                <h3 className="tool-card-title" itemProp="name">
                  {feature.title}
                </h3>
                <p className="tool-card-subtitle" itemProp="description">{feature.subtitle}</p>
              </div>
              
              <ul className="tool-card-benefits" role="list" itemProp="featureList">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} role="listitem">
                    <span className="benefit-checkmark">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
              
              {feature.available && (
                <button className="tool-card-cta">
                  Launch Tool →
                </button>
              )}
              
              {!feature.available && (
                <div className="tool-card-notify">
                  <button className="tool-card-notify-btn">
                    Notify Me
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tools;
