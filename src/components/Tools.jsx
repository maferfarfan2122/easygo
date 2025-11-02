import { texts } from '../i18n/en';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Tools = () => {
  const { tools } = texts;
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleToolClick = (toolIndex) => {
    // Index 0 is the CV Builder (first tool)
    if (toolIndex === 0) {
      if (user) {
        navigate('/tools/cv-builder');
      } else {
        navigate('/signin');
      }
    }
  };

  return (
    <section className="tools" id="tools">
      <div className="tools-container">
        <h2 className="tools-heading">{tools.heading}</h2>
        <p className="tools-intro">{tools.intro}</p>
        
        <div className="tools-grid">
          {tools.features.map((feature, index) => (
            <article 
              key={index} 
              className={`tool-card ${index === 0 ? 'tool-card-clickable' : ''}`}
              onClick={() => index === 0 && handleToolClick(index)}
              style={index === 0 ? { cursor: 'pointer' } : {}}
            >
              <div className="tool-card-header">
                <h3 className="tool-card-title">
                  {feature.title}
                  {index === 0 && <span className="tool-badge">Try Now!</span>}
                </h3>
                <p className="tool-card-subtitle">{feature.subtitle}</p>
              </div>
              
              <ul className="tool-card-benefits">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex}>{benefit}</li>
                ))}
              </ul>
              
              <div className="tool-card-image" role="img" aria-label={feature.imageAlt}>
                {/* Image placeholder */}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tools;
