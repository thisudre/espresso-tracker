import { Component, DestroyRef, effect, inject } from '@angular/core';
import { ExtractionStore } from '../../core/stores/extraction.store';
import { GuideStore } from '../../core/stores/guide.store';
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
  private guideStore = inject(GuideStore);
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Receitas vêm da API — garante o carregamento (estados loading/erro no RecipeSelector).
    if (!this.guideStore.recipes().length && !this.guideStore.loading()) {
      this.guideStore.load();
    }
    this.extractStore.routeEntered();
    this.destroyRef.onDestroy(() => this.extractStore.routeExited());

    // A preferência de receita pode ser resolvida depois do carregamento assíncrono
    // (API) — entra no modo receita assim que ela estiver válida, desde que o
    // cronômetro ainda esteja ocioso (não interrompe uma extração em andamento).
    effect(() => {
      const recipe = this.guideStore.selectedRecipe();
      if (!recipe) return undefined;
      if (this.extractStore.method() !== recipe.method) return undefined;
      if (this.extractStore.isRecipeMode()) return undefined;
      if (this.extractStore.timer().status !== 'idle') return undefined;
      this.extractStore.selectRecipe(recipe.id);
      return undefined;
    });
  }
}
