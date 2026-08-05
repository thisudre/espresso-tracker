import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BrewLog } from '../../core/models/brew-log.model';
import { formatRatio, hasRating, methodLabelFor } from '../../core/utils/brew-log.util';
import { formatMmSs } from '../../core/utils/timer.util';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';

@Component({
  selector: 'app-log-card',
  standalone: true,
  imports: [FormsModule, RouterLink, StarRatingComponent],
  template: `
    <a class="log-card bean-card" [routerLink]="['/logs', log().id]">
      <div class="log-card-header">
        <span class="card-title">{{ methodLabel() }}</span>
        @if (hasRatingValue()) {
          <app-star-rating [readonly]="true" [ngModel]="log().rating.overall" />
        } @else {
          <span class="caption-md coffee-mute">Sem avaliação</span>
        }
      </div>
      <div class="log-card-meta caption-md coffee-mute">
        @if (log().beanName) {
          <span>{{ log().beanName }}</span>
        }
        @if (ratioValue()) {
          <span>{{ ratioValue() }}</span>
        }
        @if (timeValue() !== '—') {
          <span>{{ timeValue() }}</span>
        }
      </div>
    </a>
  `,
  styles: `
    .log-card {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      padding: var(--spacing-lg);
      background: var(--color-latte);
      border: 1px solid var(--color-hairline);
      border-radius: var(--rounded-sm);
      text-decoration: none;
      color: var(--color-espresso);
      cursor: pointer;
    }

    .log-card:hover {
      border-color: var(--color-espresso);
    }

    .log-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .log-card-meta {
      display: flex;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }
  `,
})
export class LogCardComponent {
  log = input.required<BrewLog>();

  methodLabel = computed(() => methodLabelFor(this.log().method));
  ratioValue = computed(() => formatRatio(this.log().dose, this.log().water));
  timeValue = computed(() =>
    this.log().totalSeconds > 0 ? formatMmSs(this.log().totalSeconds) : '—'
  );
  hasRatingValue = computed(() => hasRating(this.log().rating));
}
