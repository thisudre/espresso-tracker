import { Component, computed, inject } from '@angular/core';
import { ExtractionStore } from '../../core/stores/extraction.store';

@Component({
  selector: 'app-ratio-calculator',
  standalone: true,
  template: `
    <div class="calculator">
      <div class="input-group">
        <label class="caption-md coffee-mute" for="dose-input">Dose (g)</label>
        <input id="dose-input" class="text-input" type="text" inputmode="decimal"
               [value]="dose()" (input)="onDose($event)" />
      </div>

      <div class="input-group">
        <label class="caption-md coffee-mute" for="ratio-input">Ratio (1 :)</label>
        <div class="ratio-input-row">
          <span class="caption-md coffee-mute">1 :</span>
          <input id="ratio-input" class="text-input" type="text" inputmode="decimal"
                 [value]="ratio()" (input)="onRatio($event)" />
        </div>
      </div>

      <div class="water-readout">
        <span class="caption-md coffee-mute">Água sugerida</span>
        <div class="display-md espresso-on-latte">
          @if (water() !== null) {
            {{ water() }}<span class="unit caption-md coffee-mute"> g</span>
          } @else {
            <span class="placeholder">—</span>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .calculator {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .caption-md {
      font-size: var(--font-caption-md-size);
      font-weight: var(--font-caption-md-weight);
      line-height: var(--font-caption-md-lh);
    }

    .coffee-mute {
      color: var(--color-coffee-mute);
    }

    .text-input {
      background: var(--color-latte);
      color: var(--color-espresso);
      font-family: var(--font-family);
      font-size: var(--font-body-md-size);
      font-weight: var(--font-body-md-weight);
      line-height: var(--font-body-md-lh);
      padding: 8px 12px;
      height: 40px;
      border-radius: var(--rounded-sm);
      border: 1px solid var(--color-hairline);
      outline: none;
    }

    .text-input:focus {
      background: var(--color-cream);
      border-color: var(--color-espresso);
    }

    .ratio-input-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .water-readout {
      background: var(--color-latte);
      padding: var(--spacing-lg);
      border-radius: var(--rounded-sm);
      text-align: center;
    }

    .display-md {
      font-size: var(--font-display-md-size);
      font-weight: var(--font-display-md-weight);
      line-height: var(--font-display-md-lh);
      color: var(--color-espresso);
      margin-top: var(--spacing-xs);
    }

    .placeholder {
      color: var(--color-coffee-mute);
    }

    .unit {
      font-size: var(--font-caption-md-size);
      margin-left: var(--spacing-xs);
    }
  `,
})
export class RatioCalculatorComponent {
  private extractStore = inject(ExtractionStore);

  dose = computed(() => this.extractStore.doseInput());
  ratio = computed(() => this.extractStore.ratioInput());
  water = computed(() => this.extractStore.water());

  onDose(v: Event): void {
    this.extractStore.setDose((v.target as HTMLInputElement).value);
  }

  onRatio(v: Event): void {
    this.extractStore.setRatio((v.target as HTMLInputElement).value);
  }
}
