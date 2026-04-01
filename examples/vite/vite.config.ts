import { defineConfig } from 'vite';
import i18nKeygen from 'i18n-keygen/vite';

export default defineConfig({
  plugins: [i18nKeygen()],
});
