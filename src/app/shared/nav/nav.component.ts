import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  template: `
    <!-- Top nav (desktop ≥768px) -->
    <nav class="nav-top">
      @for (link of links; track link.path) {
        <a [routerLink]="link.path" routerLinkActive="active" class="nav-link">
          {{ link.label }}
        </a>
      }
    </nav>
    <!-- Bottom nav (mobile ≤480px) -->
    <nav class="nav-bottom">
      @for (link of links; track link.path) {
        <a [routerLink]="link.path" routerLinkActive="active" class="nav-link">
          <span class="marker">{{ link.marker }}</span>
          <span class="label">{{ link.label }}</span>
        </a>
      }
    </nav>
  `,
  styles: [`
    .nav-top {
      display: none;
    }
    .nav-bottom {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 56px;
      background: var(--color-cream);
      border-top: 1px solid var(--color-hairline);
      z-index: 100;
    }
    .nav-link {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      color: var(--color-coffee-mute);
      font-family: var(--font-family);
      font-size: var(--font-badge-md-size);
      font-weight: var(--font-badge-md-weight);
      line-height: var(--font-badge-md-lh);
    }
    .nav-link.active {
      color: var(--color-espresso);
    }
    .marker {
      font-size: 16px;
      margin-bottom: 2px;
    }
    @media (min-width: 768px) {
      .nav-top {
        display: flex;
        gap: var(--spacing-lg);
        padding: var(--spacing-sm) var(--spacing-xl);
        border-bottom: 1px solid var(--color-hairline);
      }
      .nav-bottom {
        display: none;
      }
    }
  `],
  imports: [RouterLink, RouterLinkActive]
})
export class NavComponent {
  links = [
    { label: 'Home', path: '/', marker: '[⌂]' },
    { label: 'Extrair', path: '/extract', marker: '[~]' },
    { label: 'Guias', path: '/guides', marker: '[≡]' },
  ];
}
