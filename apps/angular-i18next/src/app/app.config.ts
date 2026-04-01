import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { I18NEXT_SERVICE, provideI18Next } from 'angular-i18next';
import HttpBackend from 'i18next-http-backend';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideI18Next(),
    provideAppInitializer(() => {
      const i18next = inject(I18NEXT_SERVICE);
      return i18next.use(HttpBackend).init({
        lng: 'en-GB',
        fallbackLng: 'en',
        ns: ['core', 'products', 'orders'],
        defaultNS: 'core',
        backend: {
          loadPath: '/assets/locales/{{lng}}/{{ns}}.module.json',
        },
      });
    }),
  ],
};
