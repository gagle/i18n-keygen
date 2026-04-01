import i18nKeygen from 'i18n-keygen/rspack';

export default {
  mode: 'development',
  entry: './src/index.ts',
  module: {
    rules: [{ test: /\.ts$/, use: 'builtin:swc-loader', exclude: /node_modules/ }],
  },
  resolve: { extensions: ['.ts', '.js'] },
  plugins: [i18nKeygen()],
};
