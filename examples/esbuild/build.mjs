import * as esbuild from 'esbuild';
import i18nKeygen from 'i18n-keygen/esbuild';

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outdir: 'dist',
  plugins: [i18nKeygen()],
});
