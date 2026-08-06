import { Component, computed, inject } from '@angular/core';
import { BREW_METHODS, BrewMethod } from '../../core/models/brew.model';
import { ExtractionStore } from '../../core/stores/extraction.store';

@Component({
  selector: 'app-method-selector',
  standalone: true,
  template: `
    <div class="chip-container">
      @for (method of methods; track method.id) {
        <button
          type="button"
          class="button-tab"
          [class.button-tab-active]="method.id === selected()"
          (click)="select(method.id)"
        >
          {{ method.id === selected() ? '[*]' : '[ ]' }} {{ method.label }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .chip-container {
        overflow-x: auto;
        white-space: nowrap;
        display: flex;
        gap: 0;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }

      .chip-container::-webkit-scrollbar {
        display: none;
      }

      .button-tab {
        background: var(--color-cream);
        color: var(--color-coffee-mute);
        font-family: var(--font-family);
        font-size: var(--font-button-md-size);
        font-weight: var(--font-button-md-weight);
        line-height: var(--font-button-md-lh);
        padding: 8px 12px;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        white-space: nowrap;
      }

      .button-tab-active {
        color: var(--color-espresso);
        border-bottom: 2px solid var(--color-ash);
      }
    `,
  ],
})
export default class MethodSelectorComponent {
  private extractStore = inject(ExtractionStore);
  methods = BREW_METHODS;
  selected = computed(() => this.extractStore.method());

  select(m: BrewMethod): void {
    this.extractStore.selectMethod(m);
  }
}
