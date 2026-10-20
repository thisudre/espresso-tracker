import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-async-state',
  standalone: true,
  template: `
    @if (error()) {
      <p class="error">{{ error() }}</p>
      <button class="retry" type="button" (click)="retry.emit()">Tentar novamente</button>
    } @else {
      <p class="hint">{{ slow() ? 'Acordando a API… pode levar até 1 min.' : 'Carregando...' }}</p>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }

    .hint,
    .error {
      font-family: var(--font-family);
      font-size: var(--font-caption-md-size);
      font-weight: var(--font-caption-md-weight);
      line-height: var(--font-caption-md-lh);
    }

    .hint {
      color: var(--color-coffee-mute);
    }

    .error {
      color: var(--color-terracota);
    }

    .retry {
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
export class AsyncStateComponent {
  slow = input(false);
  error = input<string | null>(null);
  retry = output<void>();
}
