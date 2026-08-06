import { Component, computed, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BeanStore } from '../../core/stores/bean.store';
import { BeanCardComponent } from './bean-card.component';
import { Bean } from '../../core/models/bean.model';

@Component({
  selector: 'app-beans-page',
  standalone: true,
  imports: [RouterLink, BeanCardComponent],
  template: `
    <div class="beans-page">
      <div class="page-header">
        <h1 class="heading-md">[+] Grãos</h1>
        <a routerLink="/beans/new" class="button-primary">+ Adicionar grão</a>
      </div>

      @if (beans().length === 0) {
        <div class="empty-state">
          <span class="marker">[+]</span> Nenhum grão registrado
        </div>
      } @else {
        <div class="bean-list">
          @for (bean of beans(); track bean.id) {
            <app-bean-card [bean]="bean" (delete)="deleteBean($event, bean)" />
          }
        </div>
      }

      <dialog #confirmDialog class="dialog-confirm">
        <p>Excluir grão <strong>{{ beanToDelete()?.brand }}</strong>?</p>
        <p class="caption-md coffee-mute">Esta ação é permanente e não pode ser desfeita.</p>
        <div class="dialog-actions">
          <button class="button-secondary" (click)="cancelDelete()">Cancelar</button>
          <button class="button-danger" (click)="confirmDelete()">Excluir</button>
        </div>
      </dialog>
    </div>
  `,
  styles: `
    .beans-page {
      padding: var(--spacing-xl);
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-xl);
    }

    .heading-md {
      font-size: var(--font-heading-md-size);
      font-weight: var(--font-heading-md-weight);
      line-height: var(--font-heading-md-lh);
      color: var(--color-espresso);
    }

    .button-primary {
      display: inline-block;
      font-family: var(--font-family);
      font-size: var(--font-button-md-size);
      font-weight: var(--font-button-md-weight);
      line-height: var(--font-button-md-lh);
      padding: var(--spacing-xs) var(--spacing-lg);
      background-color: var(--color-espresso);
      color: var(--color-on-espresso);
      border: none;
      border-radius: var(--rounded-sm);
      cursor: pointer;
      text-decoration: none;
    }

    .button-primary:hover {
      background-color: var(--color-espresso-deep);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-section) var(--spacing-xl);
      font-size: var(--font-body-md-size);
      font-weight: var(--font-body-md-weight);
      line-height: var(--font-body-md-lh);
      color: var(--color-coffee-mute);
    }

    .empty-state .marker {
      color: var(--color-terracota);
      font-weight: var(--font-heading-md-weight);
    }

    .bean-list {
      display: flex;
      flex-direction: column;
    }

    .dialog-confirm {
      position: fixed;
      inset: 0;
      margin: auto;
      background-color: var(--color-cream);
      color: var(--color-espresso);
      border: 1px solid var(--color-hairline-strong);
      border-radius: var(--rounded-sm);
      padding: var(--spacing-xl);
      max-width: 360px;
    }

    .dialog-confirm::backdrop {
      background-color: rgba(59, 47, 42, 0.4);
    }

    .dialog-confirm p {
      font-size: var(--font-body-md-size);
      font-weight: var(--font-body-md-weight);
      line-height: var(--font-body-md-lh);
      margin-bottom: var(--spacing-sm);
    }

    .caption-md {
      font-size: var(--font-caption-md-size);
      font-weight: var(--font-caption-md-weight);
      line-height: var(--font-caption-md-lh);
    }

    .coffee-mute {
      color: var(--color-coffee-mute);
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-lg);
    }

    .button-secondary {
      display: inline-block;
      font-family: var(--font-family);
      font-size: var(--font-button-md-size);
      font-weight: var(--font-button-md-weight);
      line-height: var(--font-button-md-lh);
      padding: var(--spacing-xs) var(--spacing-lg);
      background-color: transparent;
      color: var(--color-espresso);
      border: 1px solid var(--color-hairline-strong);
      border-radius: var(--rounded-sm);
      cursor: pointer;
    }

    .button-secondary:hover {
      background-color: var(--color-latte);
    }

    .button-danger {
      display: inline-block;
      font-family: var(--font-family);
      font-size: var(--font-button-md-size);
      font-weight: var(--font-button-md-weight);
      line-height: var(--font-button-md-lh);
      padding: var(--spacing-xs) var(--spacing-lg);
      background-color: var(--color-terracota);
      color: var(--color-on-espresso);
      border: none;
      border-radius: var(--rounded-sm);
      cursor: pointer;
    }

    .button-danger:hover {
      background-color: var(--color-terracota-hover);
    }
  `,
})
export default class BeansPage {
  private beanStore = inject(BeanStore);

  @ViewChild('confirmDialog') confirmDialog!: ElementRef<HTMLDialogElement>;

  beanToDelete = signal<Bean | null>(null);

  beans = computed(() =>
    [...this.beanStore.items()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  deleteBean(_event: void, bean: Bean): void {
    this.beanToDelete.set(bean);
    this.confirmDialog.nativeElement.showModal();
  }

  confirmDelete(): void {
    const bean = this.beanToDelete();
    if (bean) {
      this.beanStore.remove(bean.id);
    }
    this.beanToDelete.set(null);
    this.confirmDialog.nativeElement.close();
  }

  cancelDelete(): void {
    this.beanToDelete.set(null);
    this.confirmDialog.nativeElement.close();
  }
}
