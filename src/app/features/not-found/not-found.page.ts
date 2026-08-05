import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>[?] 404</h1>
    <p>Página não encontrada</p>
    <a routerLink="/">[⌂] Voltar para Home</a>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-xxl);
        text-align: center;
      }
      h1 {
        font-size: var(--font-display-md-size);
        font-weight: var(--font-display-md-weight);
        line-height: var(--font-display-md-lh);
        color: var(--color-espresso);
        margin-bottom: var(--spacing-lg);
      }
      p {
        font-size: var(--font-body-md-size);
        font-weight: var(--font-body-md-weight);
        line-height: var(--font-body-md-lh);
        color: var(--color-coffee-mute);
        margin-bottom: var(--spacing-xl);
      }
      a {
        font-size: var(--font-link-md-size);
        font-weight: var(--font-link-md-weight);
        line-height: var(--font-link-md-lh);
        color: var(--color-cocoa);
        text-decoration: underline;
      }
      a:hover {
        color: var(--color-espresso);
      }
    `,
  ],
})
export default class NotFoundPage {}
