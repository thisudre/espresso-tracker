import { Component, DestroyRef, inject } from '@angular/core';
import { ExtractionStore } from '../../core/stores/extraction.store';
import { BrewTimerComponent } from './brew-timer.component';
import MethodSelectorComponent from './method-selector.component';
import { RecipeSelectorComponent } from './recipe-selector.component';
import { RatioCalculatorComponent } from './ratio-calculator.component';

@Component({
  selector: 'app-extract-page',
  standalone: true,
  imports: [BrewTimerComponent, MethodSelectorComponent, RecipeSelectorComponent, RatioCalculatorComponent],
  template: `
    <div class="extract-page">
      <h1 class="heading-md">[~] Extrair</h1>

      <app-brew-timer />

      <app-method-selector />

      <app-recipe-selector />

      <app-ratio-calculator />
    </div>
  `,
  styles: [
    `
      .extract-page {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
      }

      .heading-md {
        font-size: var(--font-heading-md-size);
        font-weight: var(--font-heading-md-weight);
        line-height: var(--font-heading-md-lh);
        color: var(--color-espresso);
      }
    `,
  ],
})
export default class ExtractPage {
  private extractStore = inject(ExtractionStore);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.extractStore.routeEntered();
    this.destroyRef.onDestroy(() => this.extractStore.routeExited());
  }
}
