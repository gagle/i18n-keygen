import { defineConfig } from '@farmfe/core';
import i18nKeygen from 'i18n-keygen/farm';

export default defineConfig({
  plugins: [i18nKeygen()],
});
