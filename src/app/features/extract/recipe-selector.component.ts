import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExtractionStore } from '../../core/stores/extraction.store';
import { RECIPES } from '../../core/models/guide.model';
import { scaledPhases } from '../../core/utils/guide.util';
import { formatMmSs } from '../../core/utils/timer.util';

@Component({
  selector: 'app-recipe-selector',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="recipe-selector">
      <div class="selector-header">
        <h2 class="heading-md">[~] Guias de extração</h2>
        <a class="link-inline" routerLink="/guides">biblioteca →</a>
      </div>

      @if (isV60()) {
        <div class="recipe-cards">
          @for (recipe of recipes; track recipe.id) {
            <button
              class="recipe-card"
              [class.recipe-card-active]="selectedId() === recipe.id"
              type="button"
              (click)="selectRecipe(recipe.id)"
            >
              <span class="marker">{{ selectedId() === recipe.id ? '[*]' : '[ ]' }}</span>
              <span class="recipe-name body-strong">{{ recipe.nome }}</span>
              <span class="caption-md coffee-mute">{{ recipe.foco }} · {{ recipe.moagem }} · ~{{ formatTime(recipe.tempoTotalEstimado) }}</span>
            </button>
          }
        </div>

        @if (isRecipeMode()) {
          <div class="active-phases">
            @for (phase of scaledPhases(); track phase.nome; let i = $index) {
              <div class="phase-row" [class.phase-active]="i === phaseIndex()" [class.phase-done]="i < phaseIndex()">
                <span class="marker">{{ phaseMarker(i) }}</span>
                <span class="body-strong">{{ phase.nome }}</span>
                <span class="caption-md coffee-mute">{{ phase.volumeAgua }}g · {{ formatTime(phase.tempoObjetivo) }}</span>
              </div>
            }
            <button class="button-secondary simple-btn" type="button" (click)="exitRecipe()">
              Modo simples
            </button>
          </div>
        }
      } @else {
        <p class="caption-md coffee-mute">Receitas disponíveis para Coado/V60.</p>
      }
    </div>
  `,
  styles: [`
    .recipe-selector {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .selector-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .heading-md {
      font-size: var(--font-heading-md-size);
      font-weight: var(--font-heading-md-weight);
      line-height: var(--font-heading-md-lh);
      color: var(--color-espresso);
    }

    .link-inline {
      font-family: var(--font-family);
      font-size: var(--font-caption-md-size);
      font-weight: var(--font-caption-md-weight);
      line-height: var(--font-caption-md-lh);
      color: var(--color-coffee-mute);
      text-decoration: none;
      cursor: pointer;
    }

    .link-inline:hover {
      color: var(--color-espresso);
    }

    .recipe-cards {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .recipe-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      background: var(--color-cream);
      color: var(--color-coffee-mute);
      font-family: var(--font-family);
      font-size: var(--font-button-md-size);
      font-weight: var(--font-button-md-weight);
      line-height: var(--font-button-md-lh);
      padding: 8px 12px;
      border: 1px solid var(--color-hairline);
      border-radius: var(--rounded-none);
      cursor: pointer;
      text-align: left;
      width: 100%;
    }

    .recipe-card-active {
      background: var(--color-cream);
      color: var(--color-espresso);
      border-color: var(--color-espresso);
    }

    .marker {
      font-family: var(--font-family);
      font-size: var(--font-body-md-size);
      font-weight: var(--font-body-md-weight);
    }

    .recipe-name {
      font-size: var(--font-body-strong-size);
      font-weight: var(--font-body-strong-weight);
      line-height: var(--font-body-strong-lh);
      color: inherit;
    }

    .caption-md {
      font-size: var(--font-caption-md-size);
      font-weight: var(--font-caption-md-weight);
      line-height: var(--font-caption-md-lh);
      font-family: var(--font-family);
    }

    .coffee-mute {
      color: var(--color-coffee-mute);
    }

    .body-strong {
      font-size: var(--font-body-strong-size);
      font-weight: var(--font-body-strong-weight);
      line-height: var(--font-body-strong-lh);
      color: var(--color-espresso);
    }

    .active-phases {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      padding-top: var(--spacing-sm);
      border-top: 1px solid var(--color-hairline);
    }

    .phase-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: 4px 0;
    }

    .phase-active .body-strong {
      color: var(--color-espresso);
    }

    .phase-done .caption-md {
      text-decoration: line-through;
      opacity: 0.6;
    }

    .simple-btn {
      margin-top: var(--spacing-sm);
      align-self: flex-start;
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
  `],
})
export class RecipeSelectorComponent {
  private extractStore = inject(ExtractionStore);

  recipes = RECIPES;
  isV60 = computed(() => this.extractStore.method() === 'v60');
  selectedId = computed(() => this.extractStore.selectedRecipe()?.id ?? null);
  isRecipeMode = computed(() => this.extractStore.isRecipeMode());
  phaseIndex = computed(() => this.extractStore.timer().phaseIndex);
  isCompleted = computed(() => this.extractStore.isCompleted());
  scaledPhases = computed(() => this.extractStore.scaledActivePhases());

  selectRecipe(id: string): void {
    this.extractStore.selectRecipe(id);
  }

  exitRecipe(): void {
    this.extractStore.exitRecipe();
  }

  phaseMarker(i: number): string {
    if (i < this.phaseIndex()) return '[x]';
    if (i === this.phaseIndex()) return '[*]';
    return '[ ]';
  }

  formatTime(seconds: number): string {
    return formatMmSs(seconds);
  }
}
