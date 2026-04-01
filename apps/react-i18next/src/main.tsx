import { i18nReady } from './i18n';
import { createRoot } from 'react-dom/client';
import { App } from './App';

async function bootstrap(): Promise<void> {
  await i18nReady;
  createRoot(document.getElementById('root')!).render(<App />);
}

bootstrap().catch(console.error);
