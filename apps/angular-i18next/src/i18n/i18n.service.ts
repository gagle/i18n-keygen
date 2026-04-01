import { inject, Injectable } from '@angular/core';
import { I18NEXT_SERVICE } from 'angular-i18next';
import type { I18nKey } from './i18n-keys.generated';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _i18next = inject(I18NEXT_SERVICE);

  public translate(key: I18nKey, params?: Record<string, unknown>): string {
    return this._i18next.t(key, params);
  }
}
