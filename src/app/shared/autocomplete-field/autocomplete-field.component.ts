import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

const MAX_SUGGESTIONS = 6;

@Component({
  selector: 'app-autocomplete-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteFieldComponent),
      multi: true,
    },
  ],
  template: `
    <label class="autocomplete">
      @if (label()) {
        <span class="autocomplete-label">{{ label() }}</span>
      }
      <input
        #inputEl
        class="text-input"
        type="text"
        [placeholder]="placeholder() ?? ''"
        [value]="value()"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
      />
      @if (open() && filtered().length > 0) {
        <ul class="suggestions">
          @for (suggestion of filtered(); track suggestion) {
            <li
              class="suggestion-item"
              (mousedown)="select(suggestion)"
            >
              {{ suggestion }}
            </li>
          }
        </ul>
      }
    </label>
  `,
  styles: `
    .autocomplete {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      position: relative;
    }

    .autocomplete-label {
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

    .suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 10;
      background: var(--color-cream);
      border: 1px solid var(--color-hairline);
      border-radius: var(--rounded-sm);
      list-style: none;
      max-height: 240px;
      overflow-y: auto;
    }

    .suggestion-item {
      padding: 8px 12px;
      font-size: var(--font-body-md-size);
      font-weight: var(--font-body-md-weight);
      line-height: var(--font-body-md-lh);
      color: var(--color-espresso);
      border-bottom: 1px solid var(--color-hairline);
      cursor: pointer;
    }

    .suggestion-item:last-child {
      border-bottom: none;
    }

    .suggestion-item:hover {
      background: var(--color-latte);
    }
  `,
})
export class AutocompleteFieldComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  suggestions = input<string[]>([]);
  label = input<string>();
  placeholder = input<string>();

  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

  value = signal('');
  open = signal(false);
  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  filtered = computed(() => {
    const query = this.value().toLowerCase();
    const all = this.suggestions();
    if (!query) {
      return all.slice(0, MAX_SUGGESTIONS);
    }
    return all
      .filter((s) => s.toLowerCase().includes(query))
      .slice(0, MAX_SUGGESTIONS);
  });

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  writeValue(v: string): void {
    this.value.set(v ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);
    this.onChange(input.value);
    this.open.set(true);
  }

  onFocus(): void {
    this.open.set(true);
  }

  onBlur(): void {
    this.onTouched();
    setTimeout(() => this.open.set(false), 150);
  }

  select(v: string): void {
    this.value.set(v);
    this.onChange(v);
    this.open.set(false);
    this.inputEl?.nativeElement.blur();
  }
}
