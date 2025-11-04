import { createContext, useContext, useState, useEffect } from 'react';
import { texts as enTexts } from '../i18n/en';
import { texts as esTexts } from '../i18n/es';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Get language from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('easygo-language');
    return savedLanguage || 'en';
  });

  // Get texts based on current language
  const texts = language === 'es' ? esTexts : enTexts;

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('easygo-language', language);
    // Update HTML lang attribute for SEO
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const setLanguageManual = (lang) => {
    if (lang === 'en' || lang === 'es') {
      setLanguage(lang);
    }
  };

  const value = {
    language,
    texts,
    toggleLanguage,
    setLanguage: setLanguageManual
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
