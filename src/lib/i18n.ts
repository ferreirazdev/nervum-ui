import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en/landing.json';
import ptBR from '@/locales/pt-BR/landing.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { landing: en },
      'pt-BR': { landing: ptBR },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt-BR'],
    ns: ['landing'],
    defaultNS: 'landing',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
