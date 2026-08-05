import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BeanStore } from '../../core/stores/bean.store';
import { Bean, BeanProcess, DEFAULT_BEAN_STATUS } from '../../core/models/bean.model';
import { requiredTrimmed } from '../../core/utils/validators.util';
import { AutocompleteFieldComponent } from '../../shared/autocomplete-field/autocomplete-field.component';

@Component({
  selector: 'app-bean-form',
  standalone: true,
  imports: [ReactiveFormsModule, AutocompleteFieldComponent],
  template: `
    <div class="bean-form">
      <h1 class="heading-md">{{ isEditing() ? 'Editar grão' : 'Novo grão' }}</h1>
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="field">
          <label class="field-label heading-md">Marca / Torrefação *</label>
          <input class="text-input" formControlName="brand" type="text" placeholder="Ex: Coffee Bean Co." />
          @if (form.get('brand')?.invalid && form.get('brand')?.touched) {
            <span class="error caption-md">Marca é obrigatória.</span>
          }
        </div>
        <div class="field">
          <app-autocomplete-field
            formControlName="origin"
            label="Origem"
            placeholder="Ex: Brasil"
            [suggestions]="beanStore.originSuggestions()"
          />
        </div>
        <div class="field">
          <app-autocomplete-field
            formControlName="variety"
            label="Variedade"
            placeholder="Ex: Bourbon"
            [suggestions]="beanStore.varietySuggestions()"
          />
        </div>
        <div class="field">
          <label class="field-label heading-md">Processo</label>
          <select class="select" formControlName="process">
            <option value="">Selecionar…</option>
            <option value="Washed">Washed</option>
            <option value="Natural">Natural</option>
            <option value="Honey">Honey</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label heading-md">Data de Torra</label>
          <input class="text-input" formControlName="roastDate" type="date" />
        </div>
        <div class="field">
          <label class="field-label heading-md">Notas Sensoriais</label>
          <textarea class="textarea" formControlName="notes" rows="3" placeholder="Notas de aroma, sabor, corpo…"></textarea>
        </div>
        <div class="actions">
          <button class="button-secondary" type="button" (click)="cancel()">Cancelar</button>
          <button class="button-primary" type="submit">Salvar</button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .bean-form {
      padding: var(--spacing-xl);
      max-width: 480px;
    }

    .bean-form h1 {
      margin-bottom: var(--spacing-xl);
    }

    .field {
      margin-bottom: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .field-label {
      font-size: var(--font-heading-md-size);
      font-weight: var(--font-heading-md-weight);
      line-height: var(--font-heading-md-lh);
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

    .error {
      font-size: var(--font-caption-md-size);
      font-weight: var(--font-caption-md-weight);
      line-height: var(--font-caption-md-lh);
      color: var(--color-terracota);
    }

    .actions {
      display: flex;
      gap: var(--spacing-sm);
      justify-content: flex-end;
      margin-top: var(--spacing-xl);
    }

    .button-primary {
      background: var(--color-espresso);
      color: var(--color-on-espresso);
      font-family: var(--font-family);
      font-size: var(--font-button-md-size);
      font-weight: var(--font-button-md-weight);
      line-height: var(--font-button-md-lh);
      border: none;
      border-radius: var(--rounded-sm);
      padding: 4px 20px;
      cursor: pointer;
    }

    .button-secondary {
      background: var(--color-cream);
      color: var(--color-espresso);
      font-family: var(--font-family);
      font-size: var(--font-button-md-size);
      font-weight: var(--font-button-md-weight);
      line-height: var(--font-button-md-lh);
      border: 1px solid var(--color-hairline-strong);
      border-radius: var(--rounded-sm);
      padding: 4px 20px;
      cursor: pointer;
    }
  `,
})
export default class BeanFormComponent implements OnInit {
  readonly beanStore = inject(BeanStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isEditing = signal(false);

  private editingId: string | null = null;

  readonly form = new FormGroup({
    brand: new FormControl('', {
      nonNullable: true,
      validators: [requiredTrimmed],
    }),
    origin: new FormControl('', { nonNullable: true }),
    variety: new FormControl('', { nonNullable: true }),
    process: new FormControl('', { nonNullable: true }),
    roastDate: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const bean = this.beanStore.byId(id);
      if (!bean) {
        this.router.navigate(['/beans']);
        return;
      }
      this.isEditing.set(true);
      this.editingId = id;
      this.form.patchValue({
        brand: bean.brand,
        origin: bean.origin ?? '',
        variety: bean.variety ?? '',
        process: bean.process ?? '',
        roastDate: bean.roastDate ?? '',
        notes: bean.notes ?? '',
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.get('brand')?.markAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const process = v.process as BeanProcess | '';

    if (this.isEditing() && this.editingId) {
      this.beanStore.update(this.editingId, {
        brand: v.brand,
        origin: v.origin || undefined,
        variety: v.variety || undefined,
        process: process || undefined,
        roastDate: v.roastDate || undefined,
        notes: v.notes || undefined,
      });
    } else {
      const bean: Bean = {
        id: crypto.randomUUID(),
        brand: v.brand,
        origin: v.origin || undefined,
        variety: v.variety || undefined,
        process: process || undefined,
        roastDate: v.roastDate || undefined,
        notes: v.notes || undefined,
        status: DEFAULT_BEAN_STATUS,
        createdAt: new Date().toISOString(),
      };
      this.beanStore.add(bean);
    }

    this.router.navigate(['/beans']);
  }

  cancel(): void {
    this.router.navigate(['/beans']);
  }
}
