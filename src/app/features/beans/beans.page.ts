import { Component } from '@angular/core';

@Component({
  selector: 'app-beans-page',
  standalone: true,
  template: `<h1>[+] Grãos</h1>`,
  styles: [
    `
      h1 {
        font-size: var(--font-heading-md-size);
        font-weight: var(--font-heading-md-weight);
        line-height: var(--font-heading-md-lh);
        color: var(--color-espresso);
        padding: var(--spacing-xl);
      }
    `,
  ],
})
export default class BeansPage {}
