import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bean, BeanStatus, STATUS_LABEL, STATUS_ORDER } from '../../core/models/bean.model';
import { degassInfo } from '../../core/utils/degass.util';
import { BeanStore } from '../../core/stores/bean.store';

@Component({
  selector: 'app-bean-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="bean-card">
      <div class="bean-header">
        <a class="bean-brand card-title" [routerLink]="['/beans', bean().id, 'edit']">{{ bean().brand }}</a>
        @if (degass()) {
          <span class="badge badge-degass-{{ degass()!.state }}">{{ degass()!.label }}</span>
        }
      </div>
      @if (bean().origin || bean().process) {
        <div class="bean-meta caption-md coffee-mute">
          {{ bean().origin }}{{ bean().origin && bean().process ? ' · ' : '' }}{{ bean().process }}
        </div>
      }
      <div class="bean-footer">
        <div class="status-area">
          @if (!selectorOpen()) {
            <button class="status-selector" type="button" (click)="selectorOpen.set(true)">{{ statusLabel() }}</button>
          } @else {
            <div class="status-options">
              @for (status of statusOptions; track status) {
                <button
                  class="status-selector"
                  type="button"
                  [class.status-selector-active]="status === bean().status"
                  (click)="setStatus(status)"
                >{{ statusLabelMap[status] }}</button>
              }
            </div>
          }
        </div>
        <button class="delete-btn" type="button" (click)="onDelete()">[x]</button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .bean-card {
      background-color: var(--color-cream);
      color: var(--color-espresso);
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--color-hairline);
    }

    .bean-header {
      display: flex;
      align-items: baseline;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .bean-brand {
      color: var(--color-espresso);
      text-decoration: none;
      font-size: var(--font-card-title-size);
      font-weight: var(--font-card-title-weight);
      line-height: var(--font-card-title-lh);
    }

    .bean-brand:hover {
      text-decoration: underline;
    }

    .badge {
      display: inline-block;
      font-size: var(--font-badge-md-size);
      font-weight: var(--font-badge-md-weight);
      line-height: var(--font-badge-md-lh);
      padding: 2px 8px;
      border-radius: var(--rounded-sm);
    }

    .badge-degass-fresco {
      background-color: var(--color-amber-caramelo);
      color: var(--color-cream);
    }

    .badge-degass-ideal {
      background-color: var(--color-verde-erva);
      color: var(--color-cream);
    }

    .badge-degass-passou {
      background-color: var(--color-terracota);
      color: var(--color-cream);
    }

    .bean-meta {
      margin-top: var(--spacing-xs);
      font-size: var(--font-caption-md-size);
      font-weight: var(--font-caption-md-weight);
      line-height: var(--font-caption-md-lh);
      color: var(--color-coffee-mute);
    }

    .bean-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: var(--spacing-sm);
    }

    .status-area {
      display: flex;
      gap: var(--spacing-xs);
    }

    .status-options {
      display: flex;
      gap: var(--spacing-xs);
    }

    .status-selector {
      display: inline-block;
      font-family: var(--font-family);
      font-size: var(--font-badge-md-size);
      font-weight: var(--font-badge-md-weight);
      line-height: var(--font-badge-md-lh);
      padding: var(--spacing-xs) 10px;
      border-radius: var(--rounded-sm);
      background-color: var(--color-cream);
      color: var(--color-espresso);
      cursor: pointer;
      border: 1px solid var(--color-hairline);
    }

    .status-selector-active {
      background-color: var(--color-espresso);
      color: var(--color-on-espresso);
      border-color: var(--color-espresso);
    }

    .delete-btn {
      font-family: var(--font-family);
      color: var(--color-terracota);
      cursor: pointer;
      font-size: var(--font-badge-md-size);
      font-weight: var(--font-badge-md-weight);
      line-height: var(--font-badge-md-lh);
      background: none;
      border: none;
      padding: 0;
    }

    .delete-btn:hover {
      color: var(--color-terracota-hover);
    }
  `,
})
export class BeanCardComponent {
  bean = input.required<Bean>();
  delete = output<void>();

  private beanStore = inject(BeanStore);

  readonly degass = computed(() => degassInfo(this.bean().roastDate ?? null));
  readonly statusLabel = computed(() => STATUS_LABEL[this.bean().status]);
  readonly selectorOpen = signal(false);
  readonly statusOptions = STATUS_ORDER;
  readonly statusLabelMap = STATUS_LABEL;

  setStatus(status: BeanStatus): void {
    this.beanStore.update(this.bean().id, { status });
    this.selectorOpen.set(false);
  }

  onDelete(): void {
    this.delete.emit();
  }
}
