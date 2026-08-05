import { Component, input, signal, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StarRatingComponent),
      multi: true,
    },
  ],
  template: `
    <div class="star-rating">
      @if (label()) {
        <span class="star-label caption-md coffee-mute">{{ label() }}</span>
      }
      <div class="stars">
        @for (star of stars; track star) {
          <button
            type="button"
            class="star-btn"
            [class.filled]="star <= currentValue()"
            [disabled]="readonly() || disabled()"
            (click)="tap(star)"
            [attr.aria-label]="'Estrela ' + star"
          >
            {{ star <= currentValue() ? '★' : '☆' }}
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    .star-rating {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .star-label {
      font-size: var(--font-caption-md-size);
      font-weight: var(--font-caption-md-weight);
      line-height: var(--font-caption-md-lh);
      color: var(--color-coffee-mute);
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .star-btn {
      background: none;
      border: none;
      padding: 0;
      font-family: var(--font-family);
      font-size: var(--font-body-md-size);
      line-height: 1;
      color: var(--color-ash);
      cursor: pointer;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--rounded-sm);
    }

    .star-btn:not(:disabled):hover {
      background: var(--color-latte);
    }

    .star-btn.filled {
      color: var(--color-espresso);
    }

    .star-btn:disabled {
      cursor: default;
    }
  `,
})
export class StarRatingComponent implements ControlValueAccessor {
  label = input<string>();
  readonly = input(false);

  stars = [1, 2, 3, 4, 5];
  private internalValue = signal(0);
  disabled = signal(false);

  private onChange: (v: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  currentValue(): number {
    return this.internalValue();
  }

  tap(index: number): void {
    if (this.readonly() || this.disabled()) return;
    const next = this.internalValue() === index ? 0 : index;
    this.internalValue.set(next);
    this.onChange(next);
  }

  writeValue(v: number): void {
    this.internalValue.set(v ?? 0);
  }

  registerOnChange(fn: (v: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
