import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GuideStore } from '../../core/stores/guide.store';
import { GuideApiService } from '../../core/api/guide-api.service';
import { scaledPhases } from '../../core/utils/guide.util';
import { suggestedWater } from '../../core/utils/brew-ratio.util';
import { formatMmSs } from '../../core/utils/timer.util';
import { AsyncStateComponent } from '../../shared/async-state/async-state.component';

@Component({
  selector: 'app-guide-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, AsyncStateComponent],
  template: `
    @if(loading() || error()){<app-async-state [slow]="slow()" [error]="error()" (retry)="load()" />}@else if (recipe(); as r) {
      <div class="guide-detail">
        <a class="back-link caption-md" routerLink="/guides">← Voltar para guias</a>

        <h1 class="heading-md">{{ r.nome }}</h1>
        <p class="body-md">{{ r.foco }}</p>
        <p class="caption-md coffee-mute">Moagem: {{ r.moagem }}</p>

        <div class="dose-field">
          <label class="caption-md coffee-mute" for="dose-input">Dose (g)</label>
          <input
            id="dose-input"
            class="text-input"
            type="number"
            inputmode="decimal"
            min="0"
            [value]="doseInput()"
            (input)="onDoseInput($event)"
          />
        </div>

        <div class="dose-field">
          <label class="caption-md coffee-mute" for="ratio-input">Ratio (1 :)</label>
          <input
            id="ratio-input"
            class="text-input"
            type="number"
            inputmode="decimal"
            min="0"
            [value]="ratioInput()"
            (input)="onRatioInput($event)"
          />
        </div>

        <p class="caption-md coffee-mute note">Volumes acumulados ao fim da fase · Tempos cumulativos</p>

        <div class="phases-list">
          @for (phase of phases(); track phase.nome) {
            <div class="phase-item">
              <div class="phase-header">
                <span class="body-strong">{{ phase.nome }}</span>
                <span class="caption-md coffee-mute">{{ phase.volumeAgua }}g · {{ formatTime(phase.tempoObjetivo) }}</span>
              </div>
              <p class="body-md">{{ phase.descricao }}</p>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .guide-detail {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .back-link {
      font-family: var(--font-family);
      font-size: var(--font-caption-md-size);
      font-weight: var(--font-caption-md-weight);
      line-height: var(--font-caption-md-lh);
      color: var(--color-coffee-mute);
      text-decoration: none;
    }

    .back-link:hover {
      color: var(--color-espresso);
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

    .body-strong {
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

    .note {
      font-style: italic;
    }

    .dose-field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .dose-field label {
      font-family: var(--font-family);
    }

    .text-input {
      background: var(--color-latte);
      color: var(--color-espresso);
      font-family: var(--font-family);
      font-size: var(--font-body-md-size);
      font-weight: var(--font-body-md-weight);
      line-height: var(--font-body-md-lh);
      border: 1px solid var(--color-hairline);
      border-radius: var(--rounded-sm);
      padding: 8px 12px;
      height: 40px;
      outline: none;
      max-width: 120px;
    }

    .phases-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .phase-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      padding-bottom: var(--spacing-lg);
      border-bottom: 1px solid var(--color-hairline);
    }

    .phase-item:last-child {
      border-bottom: none;
    }

    .phase-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
  `],
})
export default class GuideDetailPage implements OnInit {
  private guideStore = inject(GuideStore);
  private api = inject(GuideApiService);
  loading = signal(false); error = signal<string|null>(null); slow = signal(false);
  private slowTimer: ReturnType<typeof setTimeout> | null = null;
  private recipeId: string | null = null;
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  doseInput = signal('20');
  ratioInput = signal('15');

  recipe = signal<import('../../core/models/guide.model').ExtractionRecipe | null>(null);

  phases = computed(() => {
    const r = this.recipe();
    if (!r) return [];
    const total = suggestedWater(this.doseInput(), this.ratioInput());
    return scaledPhases(r, total);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); if(!id){ this.router.navigate(['/guides']); return; }
    this.recipeId = id;
    const cached = this.guideStore.recipesById()[id]; if(cached){ this.recipe.set(cached); return; }
    this.load();
  }

  load(): void {
    if (!this.recipeId) return;
    this.loading.set(true); this.error.set(null);
    this.startSlowTimer();
    this.api.getById(this.recipeId).subscribe({
      next: v => { this.clearSlowTimer(); this.recipe.set(v); this.loading.set(false); },
      error: e => { this.clearSlowTimer(); this.error.set(e?.message ?? 'Erro'); this.loading.set(false); },
    });
  }

  private startSlowTimer(): void {
    this.clearSlowTimer();
    this.slowTimer = setTimeout(() => this.slow.set(true), 3000);
  }

  private clearSlowTimer(): void {
    if (this.slowTimer !== null) { clearTimeout(this.slowTimer); this.slowTimer = null; }
    this.slow.set(false);
  }

  onDoseInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.doseInput.set(value);
  }

  onRatioInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.ratioInput.set(value);
  }

  formatTime(seconds: number): string {
    return formatMmSs(seconds);
  }
}
