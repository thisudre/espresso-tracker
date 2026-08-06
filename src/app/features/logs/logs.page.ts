import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogStore } from '../../core/stores/log.store';
import { BeanStore } from '../../core/stores/bean.store';
import { BrewMethod } from '../../core/models/brew.model';
import { BREW_METHODS } from '../../core/models/brew.model';
import { filterLogs } from '../../core/utils/brew-log.util';
import { LogCardComponent } from './log-card.component';

@Component({
  selector: 'app-logs-page',
  standalone: true,
  imports: [RouterLink, LogCardComponent],
  template: `
    <div class="logs-page">
      <div class="logs-header">
        <h1 class="heading-md">[=] Histórico</h1>
        <a class="button-primary" routerLink="/logs/new">+ Novo log</a>
      </div>

      <div class="logs-filters">
        <select class="select" [value]="beanFilter()" (change)="onBeanFilter($event)">
          <option value="">Todos os grãos</option>
          @for (bean of beans(); track bean.id) {
            <option [value]="bean.id">{{ bean.brand }}</option>
          }
        </select>
        <select class="select" [value]="methodFilter()" (change)="onMethodFilter($event)">
          <option value="">Todos os métodos</option>
          @for (m of methods; track m.id) {
            <option [value]="m.id">{{ m.label }}</option>
          }
        </select>
      </div>

      @if (logs().length === 0) {
        <div class="empty-state">
          <p class="body-md">[+] Nenhuma xícara registrada</p>
          <a class="button-primary" routerLink="/logs/new">+ Criar primeiro log</a>
        </div>
      } @else if (filtered().length === 0) {
        <div class="empty-state">
          <p class="body-md">Nenhuma xícara para este filtro</p>
          <button class="button-secondary" (click)="clearFilters()">Limpar filtros</button>
        </div>
      } @else {
        <div class="logs-list">
          @for (log of filtered(); track log.id) {
            <app-log-card [log]="log" />
          }
        </div>
      }
    </div>
  `,
  styles: `
    .logs-page {
      padding: var(--spacing-xl);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .logs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logs-filters {
      display: flex;
      gap: var(--spacing-md);
    }

    .logs-filters .select {
      flex: 1;
      min-width: 0;
    }

    .logs-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-xxl);
      background: var(--color-latte);
      border: 1px solid var(--color-hairline);
      border-radius: var(--rounded-sm);
      text-align: center;
      color: var(--color-coffee-mute);
    }

    .heading-md {
      font-size: var(--font-heading-md-size);
      font-weight: var(--font-heading-md-weight);
      line-height: var(--font-heading-md-lh);
      color: var(--color-espresso);
    }

    .body-md {
      font-size: var(--font-body-md-size);
      font-weight: var(--font-body-md-weight);
      line-height: var(--font-body-md-lh);
      color: var(--color-espresso);
    }

    .button-primary {
      display: inline-block;
      background: var(--color-espresso);
      color: var(--color-on-espresso);
      font-family: var(--font-family);
      font-size: var(--font-button-md-size);
      font-weight: var(--font-button-md-weight);
      line-height: var(--font-button-md-lh);
      padding: 4px 20px;
      height: 40px;
      border: none;
      border-radius: var(--rounded-sm);
      cursor: pointer;
      text-decoration: none;
    }

    .button-secondary {
      display: inline-block;
      background: var(--color-cream);
      color: var(--color-espresso);
      font-family: var(--font-family);
      font-size: var(--font-button-md-size);
      font-weight: var(--font-button-md-weight);
      line-height: var(--font-button-md-lh);
      padding: 4px 20px;
      border: 1px solid var(--color-hairline-strong);
      border-radius: var(--rounded-sm);
      cursor: pointer;
    }

    .select {
      background: var(--color-latte);
      color: var(--color-espresso);
      font-family: var(--font-family);
      font-size: var(--font-body-md-size);
      font-weight: var(--font-body-md-weight);
      line-height: var(--font-body-md-lh);
      border: 1px solid var(--color-hairline);
      border-radius: var(--rounded-sm);
      padding: 8px 12px;
      height: 40px;
      outline: none;
    }
  `,
})
export default class LogsPage {
  private logStore = inject(LogStore);
  private beanStore = inject(BeanStore);

  methods = BREW_METHODS;
  beanFilter = signal('');
  methodFilter = signal<BrewMethod | ''>('');

  logs = computed(() =>
    [...this.logStore.items()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)
    )
  );

  beans = computed(() => this.beanStore.items());

  filtered = computed(() =>
    filterLogs(this.logs(), {
      beanId: this.beanFilter() || null,
      method: (this.methodFilter() as BrewMethod) || null,
    })
  );

  onBeanFilter(event: Event): void {
    this.beanFilter.set((event.target as HTMLSelectElement).value);
  }

  onMethodFilter(event: Event): void {
    this.methodFilter.set((event.target as HTMLSelectElement).value as BrewMethod | '');
  }

  clearFilters(): void {
    this.beanFilter.set('');
    this.methodFilter.set('');
  }
}
