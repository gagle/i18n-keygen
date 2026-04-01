import {
  ApplicationConfig,
  Injectable,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import type { Translation, TranslocoLoader } from '@jsverse/transloco';
import { TranslocoService, provideTransloco, provideTranslocoLoader } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

type SupportedLang = 'en' | 'es';

type TranslationLoader = () => Promise<Translation | { default: Translation }>;

const SCOPE_LOADERS: Record<string, Record<SupportedLang, TranslationLoader>> = {
  core: {
    en: () => import('../../i18n/core/en.json'),
    es: () => import('../../i18n/core/es.json'),
  },
  products: {
    en: () => import('../../i18n/products/en.json'),
    es: () => import('../../i18n/products/es.json'),
  },
  orders: {
    en: () => import('../../i18n/orders/en.json'),
    es: () => import('../../i18n/orders/es.json'),
  },
};

@Injectable()
class AppTranslocoLoader implements TranslocoLoader {
  public async getTranslation(lang: string): Promise<Translation> {
    const result: Record<string, Translation> = {};

    for (const [scope, loaders] of Object.entries(SCOPE_LOADERS)) {
      const loader = loaders[lang as SupportedLang] ?? loaders['en'];
      const module = await loader();
      result[scope] = 'default' in module ? module.default : module;
    }

    return result as Translation;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'es'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
      },
    }),
    provideTranslocoLoader(AppTranslocoLoader),
    provideAppInitializer(() => {
      const transloco = inject(TranslocoService);
      return firstValueFrom(transloco.load('en'));
    }),
  ],
};
