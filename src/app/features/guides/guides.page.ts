import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuideStore } from '../../core/stores/guide.store';
import { formatMmSs } from '../../core/utils/timer.util';

@Component({
  selector: 'app-guides-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="guides-page">
      <h1 class="heading-md">[~] Guias de Extração</h1>
      <p class="body-md">Receitas passo a passo por método. Na v1: Coado/V60.</p>

      @if(store.loading()){<p>Carregando...</p>}@else if(store.error()){<p class="error">{{store.error()}}</p>}@else{<div class="guides-list">
        @for (recipe of recipes; track recipe.id) {
          <a class="guide-card" [routerLink]="['/guides', recipe.id]">
            <span class="card-title">{{ recipe.nome }}</span>
            <span class="caption-md coffee-mute">{{ recipe.foco }} · Moagem {{ recipe.moagem }} · ~{{ formatTime(recipe.tempoTotalEstimado) }}</span>
          </a>
        }
      </div>}
    </div>
  `,
  styles: [`
    .guides-page {
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

    .body-md {
      font-size: var(--font-body-md-size);
      font-weight: var(--font-body-md-weight);
      line-height: var(--font-body-md-lh);
      color: var(--color-espresso);
    }

    .guides-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .guide-card {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px 16px;
      background: var(--color-cream);
      border: 1px solid var(--color-hairline);
      border-radius: var(--rounded-none);
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }

    .guide-card:hover {
      border-color: var(--color-espresso);
    }

    .card-title {
      font-family: var(--font-family);
      font-size: var(--font-body-strong-size);
      font-weight: var(--font-body-strong-weight);
      line-height: var(--font-body-strong-lh);
      color: var(--color-espresso);
    }

    .caption-md {
      font-family: var(--font-family);
      font-size: var(--font-caption-md-size);
      font-weight: var(--font-caption-md-weight);
      line-height: var(--font-caption-md-lh);
    }

    .coffee-mute {
      color: var(--color-coffee-mute);
    }

    .error {
      font-family: var(--font-family);
      color: var(--color-terracota);
    }
  `],
})
export default class GuidesPage implements OnInit {
  store = inject(GuideStore);
  get recipes() { return this.store.recipes(); }
  ngOnInit(){ if(!this.store.recipes().length) this.store.load(); }

  formatTime(seconds: number): string {
    return formatMmSs(seconds);
  }
}
