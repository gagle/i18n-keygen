import i18nKeygen from 'i18n-keygen/webpack';

export default {
  mode: 'development',
  entry: './src/index.ts',
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }],
  },
  resolve: { extensions: ['.ts', '.js'] },
  plugins: [i18nKeygen()],
};
