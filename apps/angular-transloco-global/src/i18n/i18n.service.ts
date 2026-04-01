import { inject, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import type { I18nKey } from './i18n-keys.generated';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _service = inject(TranslocoService);

  public translate(key: I18nKey, params?: Record<string, unknown>): string {
    return this._service.translate(key, params);
  }

  public selectTranslate(key: I18nKey, params?: Record<string, unknown>): Observable<string> {
    return this._service.selectTranslate(key, params);
  }
}
