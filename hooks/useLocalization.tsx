
import React, { createContext, useContext, ReactNode } from 'react';
import { translations } from '../lib/translations';

export type Language = 'en' | 'hi' | 'bn' | 'ta' | 'mr';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
    children: ReactNode;
    value: {
        language: Language;
        setLanguage: (language: Language) => void;
    };
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children, value }) => {
  const { language, setLanguage } = value;

  const t = (key: string, replacements?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let text: any = translations[language] || translations['en']; // Fallback to English
    
    for (const k of keys) {
      if (text && typeof text === 'object' && k in text) {
        text = text[k];
      } else {
        // If not found in the current language, try English
        let fallbackText: any = translations['en'];
        for (const k_en of keys) {
            if (fallbackText && typeof fallbackText === 'object' && k_en in fallbackText) {
                fallbackText = fallbackText[k_en];
            } else {
                return key; // Key not found anywhere
            }
        }
        text = fallbackText;
        break;
      }
    }
    
    let result = String(text);

    if (replacements) {
      Object.keys(replacements).forEach(rKey => {
        const regex = new RegExp(`{${rKey}}`, 'g');
        result = result.replace(regex, String(replacements[rKey]));
      });
    }

    return result;
  };


  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};