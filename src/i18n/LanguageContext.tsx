import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppLanguage, TRANSLATIONS } from './translations';

const LANG_STORAGE_KEY = 'radia_app_language_v1';

type TranslationDictionary = (typeof TRANSLATIONS)[AppLanguage];

interface LanguageContextValue {
  lang: AppLanguage;
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
      if (saved === 'en' || saved === 'pt' || saved === 'es') return saved;
    }
    return 'pt';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang =
        lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es' : 'en';
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    }
  }, [lang]);

  const toggleLang = () =>
    setLangState((prev) =>
      prev === 'pt' ? 'en' : prev === 'en' ? 'es' : 'pt'
    );

  return (
    <LanguageContext.Provider
      value={{
        lang,
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
