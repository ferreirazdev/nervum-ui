import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enLanding from '@/locales/en/landing.json';
import enBilling from '@/locales/en/billing.json';
import enDashboard from '@/locales/en/dashboard.json';
import enInternalAdmin from '@/locales/en/internalAdmin.json';
import ptBRLanding from '@/locales/pt-BR/landing.json';
import ptBRBilling from '@/locales/pt-BR/billing.json';
import ptBRDashboard from '@/locales/pt-BR/dashboard.json';
import ptBRInternalAdmin from '@/locales/pt-BR/internalAdmin.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { landing: enLanding, billing: enBilling, dashboard: enDashboard, internalAdmin: enInternalAdmin },
      'pt-BR': {
        landing: ptBRLanding,
        billing: ptBRBilling,
        dashboard: ptBRDashboard,
        internalAdmin: ptBRInternalAdmin,
      },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt-BR'],
    ns: ['landing', 'billing', 'dashboard', 'internalAdmin'],
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
