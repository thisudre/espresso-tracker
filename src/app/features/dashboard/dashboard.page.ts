import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="dashboard">
      <h1 class="title">[ Espresso & Bean Tracker ]</h1>

      <div class="cards">
        <div class="card">
          <div class="card-header">
            <span class="card-label">[~] Extrair</span>
          </div>
          <div class="card-desc">Cronômetro guiado por receita com dose e ratio ajustáveis.</div>
          <a routerLink="/extract" class="card-link">Extrair →</a>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-label">[≡] Guias</span>
          </div>
          <div class="card-desc">3 receitas V60 — Equilibrada, Intensa e Suave.</div>
          <a routerLink="/guides" class="card-link">Ver guias →</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .dashboard {
      max-width: 960px;
    }

    .title {
      font-size: var(--font-heading-md-size);
      font-weight: var(--font-heading-md-weight);
      line-height: var(--font-heading-md-lh);
      color: var(--color-espresso);
      margin-bottom: var(--spacing-xl);
    }

    .cards {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .card {
      display: flex;
      flex-direction: column;
      background: var(--color-latte);
      border: 1px solid var(--color-hairline);
      border-radius: var(--rounded-sm);
      padding: var(--spacing-lg);
    }

    .card-header {
      margin-bottom: var(--spacing-sm);
    }

    .card-label {
      font-size: var(--font-body-strong-size);
      font-weight: var(--font-body-strong-weight);
      line-height: var(--font-body-strong-lh);
      color: var(--color-espresso);
    }

    .card-value {
      font-size: var(--font-display-md-size);
      font-weight: var(--font-display-md-weight);
      line-height: var(--font-display-md-lh);
      color: var(--color-espresso);
      margin-bottom: var(--spacing-sm);
    }

    .empty-state {
      background: var(--color-latte);
      color: var(--color-coffee-mute);
      font-size: var(--font-body-md-size);
      font-weight: var(--font-body-md-weight);
      line-height: var(--font-body-md-lh);
      padding: var(--spacing-xl) var(--spacing-lg);
      border-radius: var(--rounded-sm);
      margin-bottom: var(--spacing-sm);
    }

    .marker {
      margin-right: var(--spacing-xs);
    }

    .card-link {
      margin-top: auto;
      font-size: var(--font-link-md-size);
      font-weight: var(--font-link-md-weight);
      line-height: var(--font-link-md-lh);
      color: var(--color-espresso);
      text-decoration: underline;
    }

    @media (min-width: 768px) {
      .cards {
        flex-direction: row;
      }

      .card {
        flex: 1;
      }
    }
  `,
})
export default class DashboardPage {}
