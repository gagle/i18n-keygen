import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';

export const i18nReady = i18next.use(HttpBackend).init({
  lng: 'en-GB',
  fallbackLng: 'en',
  ns: ['core', 'products', 'orders'],
  defaultNS: 'core',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.module.json',
  },
});

export { i18next };
