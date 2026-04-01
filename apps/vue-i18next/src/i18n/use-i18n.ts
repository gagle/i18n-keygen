import { useTranslation } from 'i18next-vue';
import type { I18nKey } from './i18n-keys.generated';

type TypedTFunction = (
  key: I18nKey,
  params?: Record<string, unknown>,
) => string;

export function useI18n(): { t: TypedTFunction } {
  const { t } = useTranslation();
  return { t: t as unknown as TypedTFunction };
}

// DO NOT DELETE (forces dev-server to detect i18n type changes) — https://github.com/gagle/i18n-keygen#where-errors-surface
export const I18N_KEYS_STAMP = '1mr3tp1';
