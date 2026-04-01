import type { PipeTransform } from '@angular/core';
import { inject, Pipe } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import type { I18nKey } from './i18n-keys.generated';

@Pipe({ name: 'i18n', standalone: true })
export class I18nPipe implements PipeTransform {
  private readonly _service = inject(TranslocoService);

  public transform(key: I18nKey, params?: Record<string, unknown>): string {
    return this._service.translate(key, params);
  }
}

// DO NOT DELETE (forces dev-server to detect i18n type changes) — https://github.com/gagle/i18n-keygen#where-errors-surface
export const I18N_KEYS_STAMP = 'at80w9';
