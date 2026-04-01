import { useI18n } from './i18n/use-i18n';

export function App() {
  const { t } = useI18n();

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>React i18next Example</h1>

      <section>
        <h2>{t('core:appTitle')}</h2>
        <nav>
          <span>{t('core:nav.home')}</span> |<span> {t('core:nav.products')}</span> |
          <span> {t('core:nav.orders')}</span>
        </nav>
        <p>
          {t('core:dialog.confirm')} / {t('core:dialog.cancel')}
        </p>
      </section>

      <section>
        <h2>{t('products:pageTitle')}</h2>
        <p>
          {t('products:table.name')} | {t('products:table.price')} | {t('products:table.actions')}
        </p>
        <p>{t('products:emptyState')}</p>
      </section>

      <section>
        <h2>{t('orders:pageTitle')}</h2>
        <p>
          {t('orders:status.pending')} → {t('orders:status.shipped')} →{' '}
          {t('orders:status.delivered')}
        </p>
        <p>
          {t('orders:actions.cancel')} | {t('orders:actions.track')}
        </p>
      </section>
    </div>
  );
}
