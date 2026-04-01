import { createApp } from 'vue';
import I18NextVue from 'i18next-vue';
import { i18next, i18nReady } from './i18n';
import App from './App.vue';

async function bootstrap(): Promise<void> {
  await i18nReady;
  createApp(App).use(I18NextVue, { i18next }).mount('#app');
}

bootstrap().catch(console.error);
