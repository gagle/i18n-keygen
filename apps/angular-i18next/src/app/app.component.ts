import { Component } from '@angular/core';
import { I18nPipe } from '../i18n/i18n.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [I18nPipe],
  template: `
    <h1>Angular i18next Example</h1>

    <section>
      <h2>{{ 'core:appTitle' | i18n }}</h2>
      <nav>
        <span>{{ 'core:nav.home' | i18n }}</span> |
        <span>{{ 'core:nav.products' | i18n }}</span> |
        <span>{{ 'core:nav.orders' | i18n }}</span>
      </nav>
      <p>{{ 'core:dialog.confirm' | i18n }} / {{ 'core:dialog.cancel' | i18n }}</p>
    </section>

    <section>
      <h2>{{ 'products:pageTitle' | i18n }}</h2>
      <p>{{ 'products:table.name' | i18n }} | {{ 'products:table.price' | i18n }} | {{ 'products:table.actions' | i18n }}</p>
      <p>{{ 'products:emptyState' | i18n }}</p>
    </section>

    <section>
      <h2>{{ 'orders:pageTitle' | i18n }}</h2>
      <p>{{ 'orders:status.pending' | i18n }} → {{ 'orders:status.shipped' | i18n }} → {{ 'orders:status.delivered' | i18n }}</p>
      <p>{{ 'orders:actions.cancel' | i18n }} | {{ 'orders:actions.track' | i18n }}</p>
    </section>
  `,
})
export class AppComponent {}

// DO NOT DELETE (forces dev-server to detect i18n type changes) — https://github.com/gagle/i18n-keygen#where-errors-surface
export const I18N_KEYS_STAMP = '1mr3tp1';
