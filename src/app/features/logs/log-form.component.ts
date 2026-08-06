import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LogStore } from '../../core/stores/log.store';
import { BeanStore } from '../../core/stores/bean.store';
import { BrewLog } from '../../core/models/brew-log.model';
import { BREW_METHODS, BrewMethod } from '../../core/models/brew.model';
import { formatRatio, parseMmSs, mmSsValidator } from '../../core/utils/brew-log.util';
import { parsePositiveNumber } from '../../core/utils/brew-ratio.util';
import { formatMmSs } from '../../core/utils/timer.util';
import { AutocompleteFieldComponent } from '../../shared/autocomplete-field/autocomplete-field.component';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';

@Component({
  selector: 'app-log-form',
  standalone: true,
  imports: [ReactiveFormsModule, AutocompleteFieldComponent, StarRatingComponent],
  template: `
    <div class="log-form-page">
      <h1 class="heading-md">{{ isEdit() ? 'Editar log' : 'Novo log' }}</h1>

      <form [formGroup]="form" (ngSubmit)="save()" class="log-form">
        <div class="form-group">
          <label class="form-label caption-md coffee-mute" for="method">Método *</label>
          <select id="method" class="select" formControlName="method">
            <option value="">Selecionar…</option>
            @for (m of methods; track m.id) {
              <option [value]="m.id">{{ m.label }}</option>
            }
          </select>
          @if (form.controls.method.invalid && form.controls.method.touched) {
            <span class="error-msg caption-md">Método é obrigatório.</span>
          }
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label caption-md coffee-mute" for="dose">Dose (g)</label>
            <input id="dose" class="text-input" type="text" inputmode="decimal" formControlName="dose" placeholder="0" />
          </div>
          <div class="form-group">
            <label class="form-label caption-md coffee-mute" for="water">Água (g)</label>
            <input id="water" class="text-input" type="text" inputmode="decimal" formControlName="water" placeholder="0" />
          </div>
        </div>

        <div class="form-group ratio-readout">
          <span class="caption-md coffee-mute">Ratio:</span>
          <span class="body-strong">{{ ratioReadout() ?? '—' }}</span>
        </div>

        <div class="form-group">
          <label class="form-label caption-md coffee-mute" for="grind">Moagem</label>
          <app-autocomplete-field
            formControlName="grind"
            [suggestions]="grindSuggestions()"
            placeholder="Ex: Média, Fina…"
          />
        </div>

        <div class="form-group">
          <label class="form-label caption-md coffee-mute" for="beanId">Grão</label>
          <select id="beanId" class="select" formControlName="beanId">
            <option value="">Sem grão vinculado</option>
            @for (bean of beans(); track bean.id) {
              <option [value]="bean.id">{{ bean.brand }}</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label class="form-label caption-md coffee-mute" for="totalTime">Tempo total (mm:ss)</label>
          <input id="totalTime" class="text-input" type="text" formControlName="totalTime" placeholder="00:00" />
          @if (form.controls.totalTime.invalid && form.controls.totalTime.touched) {
            <span class="error-msg caption-md">Use o formato mm:ss (ex.: 02:15).</span>
          }
        </div>

        <div class="form-group">
          <span class="form-label caption-md coffee-mute">Avaliação</span>
          <div class="rating-group">
            @for (key of ratingKeys; track key) {
              <app-star-rating
                [label]="ratingLabels[key]"
                [formControlName]="key"
              />
            }
          </div>
        </div>

        <div class="form-group">
          <label class="form-label caption-md coffee-mute" for="notes">Observações</label>
          <textarea id="notes" class="textarea" formControlName="notes" rows="3" placeholder="Notas sobre a xícara…"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="button-secondary" (click)="cancel()">Cancelar</button>
          <button type="submit" class="button-primary">Salvar</button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .log-form-page {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
      max-width: 480px;
    }

    .log-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .form-row {
      display: flex;
      gap: var(--spacing-lg);
    }

    .form-row .form-group {
      flex: 1;
    }

    .form-label {
      font-size: var(--font-caption-md-size);
      font-weight: var(--font-caption-md-weight);
      line-height: var(--font-caption-md-lh);
      color: var(--color-coffee-mute);
    }

    .ratio-readout {
      flex-direction: row;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .rating-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .error-msg {
      color: var(--color-terracota);
    }

    .form-actions {
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

    .body-strong {
      font-size: var(--font-body-strong-size);
      font-weight: var(--font-body-strong-weight);
      line-height: var(--font-body-strong-lh);
      color: var(--color-espresso);
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
      width: 100%;
      outline: none;
    }

    .text-input:focus {
      background: var(--color-cream);
      border-color: var(--color-espresso);
    }

    .select {
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
      width: 100%;
      outline: none;
    }

    .textarea {
      background: var(--color-latte);
      color: var(--color-espresso);
      font-family: var(--font-family);
      font-size: var(--font-body-md-size);
      font-weight: var(--font-body-md-weight);
      line-height: var(--font-body-md-lh);
      border: 1px solid var(--color-hairline);
      border-radius: var(--rounded-sm);
      padding: 12px;
      width: 100%;
      outline: none;
      resize: vertical;
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
      border: none;
      border-radius: var(--rounded-sm);
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
  `,
})
export default class LogFormComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private logStore = inject(LogStore);
  private beanStore = inject(BeanStore);

  methods = BREW_METHODS;
  ratingKeys = ['acidity', 'body', 'sweetness', 'overall'] as const;
  ratingLabels: Record<string, string> = {
    acidity: 'Acidez',
    body: 'Corpo',
    sweetness: 'Doçura',
    overall: 'Nota Geral',
  };

  form = new FormGroup({
    method: new FormControl('', Validators.required),
    dose: new FormControl(''),
    water: new FormControl(''),
    grind: new FormControl(''),
    beanId: new FormControl(''),
    totalTime: new FormControl('', mmSsValidator),
    acidity: new FormControl(0),
    body: new FormControl(0),
    sweetness: new FormControl(0),
    overall: new FormControl(0),
    notes: new FormControl(''),
  });

  id = signal<string | null>(null);
  isEdit = computed(() => this.id() !== null);

  grindSuggestions = computed(() => this.logStore.grindSuggestions());
  beans = computed(() => this.beanStore.items());
  ratioReadout = computed(() =>
    formatRatio(
      parsePositiveNumber(this.form.value.dose ?? ''),
      parsePositiveNumber(this.form.value.water ?? '')
    )
  );

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
      this.id.set(routeId);
      const log = this.logStore.byId(routeId);
      if (!log) {
        this.router.navigate(['/logs']);
        return;
      }
      this.form.patchValue({
        method: log.method,
        dose: log.dose != null ? String(log.dose) : '',
        water: log.water != null ? String(log.water) : '',
        grind: log.grind ?? '',
        beanId: log.beanId ?? '',
        totalTime: log.totalSeconds > 0 ? formatMmSs(log.totalSeconds) : '',
        acidity: log.rating.acidity,
        body: log.rating.body,
        sweetness: log.rating.sweetness,
        overall: log.rating.overall,
        notes: log.notes ?? '',
      });
    } else {
      const nav = this.router.getCurrentNavigation();
      const brew = nav?.extras?.state?.['brew'];
      if (brew) {
        this.form.patchValue({
          method: brew.method ?? '',
          dose: brew.dose != null ? String(brew.dose) : '',
          water: brew.water != null ? String(brew.water) : '',
          totalTime: brew.totalTime > 0 ? formatMmSs(brew.totalTime) : '',
        });
      }
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const beanId = v.beanId || undefined;
    const bean = beanId ? this.beanStore.byId(beanId) : undefined;

    const log: BrewLog = {
      id: this.id() ?? crypto.randomUUID(),
      method: (v.method as BrewMethod) ?? 'espresso',
      dose: parsePositiveNumber(v.dose ?? ''),
      water: parsePositiveNumber(v.water ?? ''),
      grind: v.grind?.trim() || undefined,
      beanId,
      beanName: bean?.brand,
      totalSeconds: parseMmSs(v.totalTime ?? '') ?? 0,
      rating: {
        acidity: v.acidity ?? 0,
        body: v.body ?? 0,
        sweetness: v.sweetness ?? 0,
        overall: v.overall ?? 0,
      },
      notes: v.notes?.trim() || undefined,
      createdAt: this.id()
        ? this.logStore.byId(this.id()!)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString(),
    };

    if (this.id()) {
      this.logStore.update(this.id()!, log);
    } else {
      this.logStore.add(log);
    }

    this.router.navigate(['/logs']);
  }

  cancel(): void {
    this.router.navigate(['/logs']);
  }
}
