import { Component, DestroyRef, inject } from '@angular/core';
import { ExtractionStore } from '../../core/stores/extraction.store';
import { BrewTimerComponent } from './brew-timer.component';
import MethodSelectorComponent from './method-selector.component';
import { RatioCalculatorComponent } from './ratio-calculator.component';

@Component({
  selector: 'app-extract-page',
  standalone: true,
  imports: [BrewTimerComponent, MethodSelectorComponent, RatioCalculatorComponent],
  template: `
    <div class="extract-page">
      <h1 class="heading-md">Extrair</h1>

      <app-brew-timer />

      <app-method-selector />

      <app-ratio-calculator />
    </div>
  `,
  styles: [
    `
      .extract-page {
        padding: var(--spacing-xl);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-section);
      }

      h1 {
        margin-bottom: var(--spacing-lg);
      }
    `,
  ],
})
export default class ExtractPage {
  private extractStore = inject(ExtractionStore);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => this.extractStore.routeExited());
  }
}
