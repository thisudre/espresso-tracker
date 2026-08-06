import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogStore } from '../../core/stores/log.store';
import { RATING_LABELS } from '../../core/models/brew-log.model';
import { formatRatio, hasRating, methodLabelFor } from '../../core/utils/brew-log.util';
import { formatMmSs } from '../../core/utils/timer.util';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';

@Component({
  selector: 'app-log-detail',
  standalone: true,
  imports: [FormsModule, StarRatingComponent, DatePipe],
  template: `
    @if (log(); as log) {
      <div class="log-detail-page">
        <div class="detail-header">
          <h1 class="heading-md">{{ methodLabel() }}</h1>
          <span class="caption-md coffee-mute">{{ log.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>

        <section class="detail-section">
          <h2 class="heading-md">Receita</h2>
          <div class="detail-rows">
            <div class="detail-row">
              <span class="caption-md coffee-mute">Dose</span>
              <span class="body-md">{{ log.dose !== null ? log.dose + 'g' : '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="caption-md coffee-mute">Água</span>
              <span class="body-md">{{ log.water !== null ? log.water + 'g' : '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="caption-md coffee-mute">Ratio</span>
              <span class="body-md">{{ ratioValue() ?? '—' }}</span>
            </div>
            @if (log.grind) {
              <div class="detail-row">
                <span class="caption-md coffee-mute">Moagem</span>
                <span class="body-md">{{ log.grind }}</span>
              </div>
            }
            <div class="detail-row">
              <span class="caption-md coffee-mute">Tempo total</span>
              <span class="body-md">{{ timeValue() }}</span>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <h2 class="heading-md">Grão</h2>
          <span class="body-md">{{ log.beanName ?? 'Sem grão vinculado' }}</span>
        </section>

        <section class="detail-section">
          <h2 class="heading-md">Avaliação</h2>
          @if (hasRatingValue()) {
            <div class="rating-rows">
              @for (key of ratingKeys; track key) {
                @if (log.rating[key] > 0) {
                  <div class="rating-row">
                    <span class="caption-md coffee-mute">{{ ratingLabels[key] }}</span>
                    <app-star-rating [readonly]="true" [ngModel]="log.rating[key]" />
                  </div>
                }
              }
            </div>
          } @else {
            <span class="body-md coffee-mute">Sem avaliação</span>
          }
        </section>

        @if (log.notes) {
          <section class="detail-section">
            <h2 class="heading-md">Observações</h2>
            <span class="body-md">{{ log.notes }}</span>
          </section>
        }

        <div class="detail-actions">
          <button class="button-secondary" (click)="edit()">Editar</button>
          <button class="button-danger" (click)="delete()">Excluir</button>
        </div>
      </div>

      <dialog #confirmDialog class="dialog-confirm">
        <div class="dialog-content">
          <p class="body-md">Excluir este log de <strong>{{ methodLabel() }}</strong>?</p>
          <p class="caption-md coffee-mute">Esta ação não pode ser desfeita.</p>
          <div class="dialog-actions">
            <button class="button-secondary" (click)="cancelDelete()">Cancelar</button>
            <button class="button-danger" (click)="confirmDelete()">Excluir</button>
          </div>
        </div>
      </dialog>
    }
  `,
  styles: `
    .log-detail-page {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
      max-width: 480px;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .detail-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      padding-bottom: var(--spacing-lg);
      border-bottom: 1px solid var(--color-hairline);
    }

    .detail-rows {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .rating-rows {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .rating-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      padding-top: var(--spacing-lg);
    }

    .dialog-confirm {
      position: fixed;
      inset: 0;
      margin: auto;
      border: 1px solid var(--color-hairline);
      border-radius: var(--rounded-sm);
      padding: var(--spacing-xl);
      max-width: 320px;
      background: var(--color-cream);
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .dialog-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
    }

    .heading-md {
      font-size: var(--font-heading-md-size);
      font-weight: var(--font-heading-md-weight);
      line-height: var(--font-heading-md-lh);
      color: var(--color-espresso);
    }

    .caption-md {
      font-size: var(--font-caption-md-size);
      font-weight: var(--font-caption-md-weight);
      line-height: var(--font-caption-md-lh);
    }

    .coffee-mute {
      color: var(--color-coffee-mute);
    }

    .body-md {
      font-size: var(--font-body-md-size);
      font-weight: var(--font-body-md-weight);
      line-height: var(--font-body-md-lh);
      color: var(--color-espresso);
    }

    .button-secondary {
      background: var(--color-cream);
      color: var(--color-espresso);
      border: 1px solid var(--color-hairline-strong);
      font-family: var(--font-family);
      font-size: var(--font-button-md-size);
      font-weight: var(--font-button-md-weight);
      line-height: var(--font-button-md-lh);
      padding: 4px 20px;
      border-radius: var(--rounded-sm);
      cursor: pointer;
    }

    .button-danger {
      background: var(--color-terracota);
      color: var(--color-cream);
      font-family: var(--font-family);
      font-size: var(--font-button-md-size);
      font-weight: var(--font-button-md-weight);
      line-height: var(--font-button-md-lh);
      padding: 4px 16px;
      border: none;
      border-radius: var(--rounded-sm);
      cursor: pointer;
    }
  `,
})
export default class LogDetailPage {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private logStore = inject(LogStore);

  private routeId = signal(this.route.snapshot.paramMap.get('id') ?? '');

  log = computed(() => {
    const id = this.routeId();
    return id ? this.logStore.byId(id) : undefined;
  });

  methodLabel = computed(() => {
    const l = this.log();
    return l ? methodLabelFor(l.method) : '';
  });

  ratioValue = computed(() => {
    const l = this.log();
    return l ? formatRatio(l.dose, l.water) : null;
  });

  timeValue = computed(() => {
    const l = this.log();
    if (!l || l.totalSeconds <= 0) return '—';
    return formatMmSs(l.totalSeconds);
  });

  hasRatingValue = computed(() => {
    const l = this.log();
    return l ? hasRating(l.rating) : false;
  });

  ratingKeys = ['acidity', 'body', 'sweetness', 'overall'] as const;
  ratingLabels = RATING_LABELS;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/logs']);
    }
  }

  edit(): void {
    this.router.navigate(['/logs', this.routeId(), 'edit']);
  }

  delete(): void {
    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    dialog?.showModal();
  }

  confirmDelete(): void {
    this.logStore.remove(this.routeId());
    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    dialog?.close();
    this.router.navigate(['/logs']);
  }

  cancelDelete(): void {
    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    dialog?.close();
  }
}
