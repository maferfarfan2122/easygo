import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';

const CVBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estados del formulario
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [optimizedContent, setOptimizedContent] = useState(null);
  const [activeRequests, setActiveRequests] = useState(0);

  // Cleanup on unmount - cancel pending requests
  useEffect(() => {
    return () => {
      apiService.cancelAllRequests();
    };
  }, []);

  // Datos del formulario
  const [formData, setFormData] = useState({
    jobDescription: '',
    personalInfo: {
      full_name: '',
      email: user?.email || '',
      phone: '',
      location: '',
      linkedin: '',
      portfolio: '',
      summary: ''
    },
    experiences: [
      {
        job_title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        description: '',
        achievements: []
      }
    ],
    education: [
      {
        degree: '',
        institution: '',
        location: '',
        graduation_date: '',
        gpa: '',
        honors: ''
      }
    ],
    skills: [],
    languages: [],
    skillInput: '',
    languageInput: '',
    languageProficiency: 'Intermediate'
  });

  // Handlers
  const handleInputChange = (section, field, value, index = null) => {
    if (index !== null) {
      // Para arrays (experiences, education)
      const newArray = [...formData[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      setFormData({ ...formData, [section]: newArray });
    } else if (section === 'personalInfo') {
      setFormData({
        ...formData,
        personalInfo: { ...formData.personalInfo, [field]: value }
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experiences: [
        ...formData.experiences,
        {
          job_title: '',
          company: '',
          location: '',
          start_date: '',
          end_date: '',
          description: '',
          achievements: []
        }
      ]
    });
  };

  const removeExperience = (index) => {
    const newExperiences = formData.experiences.filter((_, i) => i !== index);
    setFormData({ ...formData, experiences: newExperiences });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          degree: '',
          institution: '',
          location: '',
          graduation_date: '',
          gpa: '',
          honors: ''
        }
      ]
    });
  };

  const removeEducation = (index) => {
    const newEducation = formData.education.filter((_, i) => i !== index);
    setFormData({ ...formData, education: newEducation });
  };

  const addSkill = () => {
    if (formData.skillInput.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, { name: formData.skillInput.trim(), level: 'Advanced' }],
        skillInput: ''
      });
    }
  };

  const removeSkill = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  const addLanguage = () => {
    if (formData.languageInput.trim()) {
      setFormData({
        ...formData,
        languages: [
          ...formData.languages,
          { name: formData.languageInput.trim(), proficiency: formData.languageProficiency }
        ],
        languageInput: '',
        languageProficiency: 'Intermediate'
      });
    }
  };

  const removeLanguage = (index) => {
    const newLanguages = formData.languages.filter((_, i) => i !== index);
    setFormData({ ...formData, languages: newLanguages });
  };

  // API Calls
  const fetchSuggestions = async () => {
    if (!formData.jobDescription.trim()) {
      setError('Please enter a job description first');
      return;
    }

    setLoading(true);
    setError('');
    setActiveRequests(prev => prev + 1);

    try {
      const data = await apiService.post('/api/cv/suggestions', {
        job_description: formData.jobDescription
      });

      if (data) {
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      if (err.message !== 'The user aborted a request.') {
        setError(err.message || 'Failed to fetch suggestions');
      }
    } finally {
      setLoading(false);
      setActiveRequests(prev => Math.max(0, prev - 1));
    }
  };

  const optimizeCV = async () => {
    setLoading(true);
    setError('');
    setActiveRequests(prev => prev + 1);

    try {
      const payload = {
        job_description: formData.jobDescription,
        personal_info: formData.personalInfo,
        experiences: formData.experiences,
        education: formData.education,
        skills: formData.skills,
        languages: formData.languages
      };

      const data = await apiService.post('/api/cv/optimize', payload);

      if (data) {
        setOptimizedContent(data.optimized_content);
        setCurrentStep(6); // Ir a preview
      }
    } catch (err) {
      if (err.message !== 'The user aborted a request.') {
        setError(err.message || 'Failed to optimize CV');
      }
    } finally {
      setLoading(false);
      setActiveRequests(prev => Math.max(0, prev - 1));
    }
  };

  const generatePDF = async (withOptimization = true) => {
    setLoading(true);
    setError('');
    setActiveRequests(prev => prev + 1);

    try {
      const payload = {
        job_description: formData.jobDescription,
        personal_info: formData.personalInfo,
        experiences: formData.experiences,
        education: formData.education,
        skills: formData.skills,
        languages: formData.languages
      };

      const endpoint = withOptimization 
        ? '/api/cv/generate'
        : '/api/cv/generate-without-optimization';

      const filename = `${formData.personalInfo.full_name.replace(/\s+/g, '_')}_CV.pdf`;
      
      await apiService.download(endpoint, payload, filename);
    } catch (err) {
      if (err.message !== 'The user aborted a request.') {
        setError(err.message || 'Failed to generate PDF');
      }
    } finally {
      setLoading(false);
      setActiveRequests(prev => Math.max(0, prev - 1));
    }
  };

  // Navigation
  const nextStep = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Render Steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="cv-step">
            <h3>Step 1: Job Description</h3>
            <p className="step-description">
              Paste the job description you're applying for. Our AI will optimize your CV to match it.
            </p>
            <textarea
              className="cv-textarea"
              rows="10"
              placeholder="Paste the job description here..."
              value={formData.jobDescription}
              onChange={(e) => handleInputChange(null, 'jobDescription', e.target.value)}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={fetchSuggestions}
              disabled={loading || !formData.jobDescription.trim()}
            >
              {loading ? 'Getting Suggestions...' : 'Get AI Suggestions'}
            </button>
            {suggestions.length > 0 && (
              <div className="suggestions-box">
                <h4>💡 AI Suggestions:</h4>
                <ul>
                  {suggestions.map((suggestion, i) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="cv-step">
            <h3>Step 2: Personal Information</h3>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Full Name *"
                value={formData.personalInfo.full_name}
                onChange={(e) => handleInputChange('personalInfo', 'full_name', e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.personalInfo.email}
                onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.personalInfo.phone}
                onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
              />
              <input
                type="text"
                placeholder="Location (City, Country)"
                value={formData.personalInfo.location}
                onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
              />
              <input
                type="url"
                placeholder="LinkedIn Profile"
                value={formData.personalInfo.linkedin}
                onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
              />
              <input
                type="url"
                placeholder="Portfolio Website"
                value={formData.personalInfo.portfolio}
                onChange={(e) => handleInputChange('personalInfo', 'portfolio', e.target.value)}
              />
            </div>
            <textarea
              className="cv-textarea"
              rows="4"
              placeholder="Professional Summary (will be optimized by AI)"
              value={formData.personalInfo.summary}
              onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
            />
          </div>
        );

      case 3:
        return (
          <div className="cv-step">
            <h3>Step 3: Work Experience</h3>
            {formData.experiences.map((exp, index) => (
              <div key={index} className="experience-block">
                <div className="block-header">
                  <h4>Experience {index + 1}</h4>
                  {formData.experiences.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeExperience(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Job Title *"
                    value={exp.job_title}
                    onChange={(e) => handleInputChange('experiences', 'job_title', e.target.value, index)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Company *"
                    value={exp.company}
                    onChange={(e) => handleInputChange('experiences', 'company', e.target.value, index)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={exp.location}
                    onChange={(e) => handleInputChange('experiences', 'location', e.target.value, index)}
                  />
                  <input
                    type="text"
                    placeholder="Start Date (e.g., Jan 2020)"
                    value={exp.start_date}
                    onChange={(e) => handleInputChange('experiences', 'start_date', e.target.value, index)}
                  />
                  <input
                    type="text"
                    placeholder="End Date (or 'Present')"
                    value={exp.end_date}
                    onChange={(e) => handleInputChange('experiences', 'end_date', e.target.value, index)}
                  />
                </div>
                <textarea
                  className="cv-textarea"
                  rows="4"
                  placeholder="Job Description (will be optimized by AI)"
                  value={exp.description}
                  onChange={(e) => handleInputChange('experiences', 'description', e.target.value, index)}
                />
              </div>
            ))}
            <button type="button" className="btn-secondary" onClick={addExperience}>
              + Add Another Experience
            </button>
          </div>
        );

      case 4:
        return (
          <div className="cv-step">
            <h3>Step 4: Education</h3>
            {formData.education.map((edu, index) => (
              <div key={index} className="education-block">
                <div className="block-header">
                  <h4>Education {index + 1}</h4>
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeEducation(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Degree *"
                    value={edu.degree}
                    onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Institution *"
                    value={edu.institution}
                    onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={edu.location}
                    onChange={(e) => handleInputChange('education', 'location', e.target.value, index)}
                  />
                  <input
                    type="text"
                    placeholder="Graduation Date (e.g., May 2019)"
                    value={edu.graduation_date}
                    onChange={(e) => handleInputChange('education', 'graduation_date', e.target.value, index)}
                  />
                  <input
                    type="text"
                    placeholder="GPA (optional)"
                    value={edu.gpa}
                    onChange={(e) => handleInputChange('education', 'gpa', e.target.value, index)}
                  />
                  <input
                    type="text"
                    placeholder="Honors (optional)"
                    value={edu.honors}
                    onChange={(e) => handleInputChange('education', 'honors', e.target.value, index)}
                  />
                </div>
              </div>
            ))}
            <button type="button" className="btn-secondary" onClick={addEducation}>
              + Add Another Education
            </button>
          </div>
        );

      case 5:
        return (
          <div className="cv-step">
            <h3>Step 5: Skills & Languages</h3>
            
            <div className="skills-section">
              <h4>Skills</h4>
              <div className="input-with-button">
                <input
                  type="text"
                  placeholder="Add a skill (e.g., Python, Project Management)"
                  value={formData.skillInput}
                  onChange={(e) => setFormData({ ...formData, skillInput: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <button type="button" className="btn-add" onClick={addSkill}>
                  Add
                </button>
              </div>
              <div className="tags-container">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="tag">
                    {skill.name}
                    <button type="button" onClick={() => removeSkill(index)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="languages-section">
              <h4>Languages</h4>
              <div className="input-with-button">
                <input
                  type="text"
                  placeholder="Language name"
                  value={formData.languageInput}
                  onChange={(e) => setFormData({ ...formData, languageInput: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                />
                <select
                  value={formData.languageProficiency}
                  onChange={(e) => setFormData({ ...formData, languageProficiency: e.target.value })}
                >
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Basic">Basic</option>
                </select>
                <button type="button" className="btn-add" onClick={addLanguage}>
                  Add
                </button>
              </div>
              <div className="tags-container">
                {formData.languages.map((lang, index) => (
                  <div key={index} className="tag">
                    {lang.name} ({lang.proficiency})
                    <button type="button" onClick={() => removeLanguage(index)}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="cv-step preview-step">
            <h3>Step 6: Generate Your CV</h3>
            
            {optimizedContent && (
              <div className="optimization-preview">
                <h4>✨ AI Optimization Complete!</h4>
                <div className="preview-section">
                  <h5>Optimized Summary:</h5>
                  <p>{optimizedContent.summary}</p>
                </div>
                {optimizedContent.suggestions && optimizedContent.suggestions.length > 0 && (
                  <div className="preview-section">
                    <h5>💡 Suggestions:</h5>
                    <ul>
                      {optimizedContent.suggestions.map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="generate-buttons">
              <button
                type="button"
                className="btn-primary"
                onClick={() => generatePDF(true)}
                disabled={loading}
              >
                {loading ? 'Generating...' : '🚀 Generate Optimized CV (with AI)'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => generatePDF(false)}
                disabled={loading}
              >
                Generate Standard CV (faster)
              </button>
            </div>

            {!optimizedContent && (
              <div className="info-box">
                <p>
                  <strong>Tip:</strong> Click "Generate Optimized CV" to use AI to tailor your CV 
                  to the job description, or choose "Generate Standard CV" for a faster result.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="cv-builder-container">
      <div className="cv-builder-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>AI-Powered CV Builder</h1>
        <p className="subtitle">Create a professional CV optimized for your dream job</p>
        
        {/* Active Requests Indicator */}
        {activeRequests > 0 && (
          <div className="active-requests-indicator">
            <div className="spinner"></div>
            <span>{activeRequests} request{activeRequests > 1 ? 's' : ''} in progress...</span>
            <button 
              className="btn-cancel-requests"
              onClick={() => {
                apiService.cancelAllRequests();
                setActiveRequests(0);
                setLoading(false);
              }}
              title="Cancel all pending requests"
            >
              Cancel All
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div
            key={step}
            className={`progress-step ${currentStep >= step ? 'active' : ''} ${
              currentStep === step ? 'current' : ''
            }`}
            onClick={() => setCurrentStep(step)}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">
              {step === 1 && 'Job'}
              {step === 2 && 'Personal'}
              {step === 3 && 'Experience'}
              {step === 4 && 'Education'}
              {step === 5 && 'Skills'}
              {step === 6 && 'Generate'}
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Form Content */}
      <div className="cv-form">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="form-navigation">
        {currentStep > 1 && (
          <button type="button" className="btn-secondary" onClick={prevStep} disabled={loading}>
            ← Previous
          </button>
        )}
        {currentStep < 5 && (
          <button type="button" className="btn-primary" onClick={nextStep} disabled={loading}>
            Next →
          </button>
        )}
        {currentStep === 5 && (
          <button type="button" className="btn-primary" onClick={optimizeCV} disabled={loading}>
            {loading ? 'Optimizing...' : 'Optimize & Preview →'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CVBuilder;
