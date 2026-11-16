import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppLanguage, TRANSLATIONS } from './translations';

const LANG_STORAGE_KEY = 'radia_app_language_v1';

type TranslationDictionary = (typeof TRANSLATIONS)[AppLanguage];

interface LanguageContextValue {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  toggleLang: () => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<AppLanguage>(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en' || saved === 'pt') return saved;
    }
    return 'pt';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    }
  }, [lang]);

  const setLang = (next: AppLanguage) => setLangState(next);
  const toggleLang = () => setLangState((prev) => (prev === 'pt' ? 'en' : 'pt'));

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t: TRANSLATIONS[lang],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
