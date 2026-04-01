import i18nKeygen from 'i18n-keygen/rollup';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: { dir: 'dist', format: 'esm' },
  plugins: [i18nKeygen(), typescript()],
};
