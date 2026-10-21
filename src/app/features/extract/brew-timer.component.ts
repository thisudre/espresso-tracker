import { Component, computed, inject } from '@angular/core';
import { ExtractionStore } from '../../core/stores/extraction.store';
import { formatMmSs } from '../../core/utils/timer.util';

@Component({
  selector: 'app-brew-timer',
  standalone: true,
  template: `
    <div class="timer-section">
      <div class="timer-display">
        <div class="phase-label heading-md">{{ phaseLabel() }}</div>
        @if (isRecipeMode()) {
          <div class="phase-time timer-xl">{{ recipeTotalTime() }}</div>
          <div class="total-time display-md">
            Meta {{ phaseTarget() }}@if (phaseWeight(); as weight) { · {{ weight }} }
          </div>
          @if (isCompleted()) {
            <div class="completed-badge caption-md">[OK] Concluída</div>
          }
        } @else {
          <div class="phase-time timer-xl">{{ phaseTime() }}</div>
          <div class="total-time display-md">Total {{ totalTime() }}</div>
        }
      </div>

      <div class="timer-controls">
        <button class="btn-primary button-primary" type="button" (click)="startOrPause()">
          {{ isRunning() ? 'Pausar' : 'Iniciar' }}
        </button>
        <button class="btn-secondary button-secondary" type="button" (click)="extractStore.reset()">
          Reiniciar
        </button>
        <button class="btn-secondary button-secondary" type="button" (click)="extractStore.advancePhase()">
          Avançar fase
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .timer-section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
      }

      .timer-display {
        background: var(--color-caramel-cream);
        color: var(--color-espresso);
        padding: 16px 24px;
        border-radius: var(--rounded-sm);
        text-align: center;
      }

      .phase-label {
        font-size: var(--font-heading-md-size);
        font-weight: var(--font-heading-md-weight);
        line-height: var(--font-heading-md-lh);
        color: var(--color-espresso);
        margin-bottom: var(--spacing-sm);
      }

      .phase-time {
        font-size: var(--font-timer-xl-size);
        font-weight: var(--font-timer-xl-weight);
        line-height: var(--font-timer-xl-lh);
        color: var(--color-espresso);
      }

      .total-time {
        font-size: var(--font-display-md-size);
        font-weight: var(--font-display-md-weight);
        line-height: var(--font-display-md-lh);
        color: var(--color-espresso);
        margin-top: var(--spacing-sm);
      }

      .completed-badge {
        font-size: var(--font-caption-md-size);
        font-weight: var(--font-caption-md-weight);
        line-height: var(--font-caption-md-lh);
        color: var(--color-verde-erva);
        margin-top: var(--spacing-sm);
        font-family: var(--font-family);
      }

      .timer-controls {
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
      }

      .button-primary {
        background: var(--color-espresso);
        color: var(--color-on-espresso);
        font-family: var(--font-family);
        font-size: var(--font-button-md-size);
        font-weight: var(--font-button-md-weight);
        line-height: var(--font-button-md-lh);
        padding: 4px 20px;
        height: 40px;
        border-radius: var(--rounded-sm);
        border: none;
        cursor: pointer;
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

      @media (max-width: 480px) {
        .phase-time {
          font-size: 32px;
        }
      }
    `,
  ],
})
export class BrewTimerComponent {
  extractStore = inject(ExtractionStore);

  timer = computed(() => this.extractStore.timer());
  phaseLabel = computed(() => this.extractStore.currentPhaseLabel());
  phaseTime = computed(() => formatMmSs(this.timer().phaseSeconds));
  totalTime = computed(() => formatMmSs(this.timer().totalSeconds));
  recipeTotalTime = computed(() => formatMmSs(this.timer().totalSeconds));
  isRunning = computed(() => this.timer().status === 'running');
  isRecipeMode = computed(() => this.extractStore.isRecipeMode());
  isCompleted = computed(() => this.extractStore.isCompleted());
  phaseTarget = computed(() => {
    const target = this.extractStore.currentPhaseTarget();
    return target !== null ? formatMmSs(target) : '—';
  });
  phaseWeight = computed(() => {
    const weight = this.extractStore.currentPhaseWeightG();
    return weight !== null ? `até ${weight}g` : null;
  });

  startOrPause(): void {
    if (this.isRunning()) {
      this.extractStore.pause();
    } else {
      this.extractStore.start();
    }
  }
}
