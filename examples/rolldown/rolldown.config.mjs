import i18nKeygen from 'i18n-keygen/rolldown';

export default {
  input: 'src/index.ts',
  output: { dir: 'dist', format: 'esm' },
  plugins: [i18nKeygen()],
};
