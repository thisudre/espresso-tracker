import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.page'),
  },
  {
    path: 'beans',
    loadComponent: () =>
      import('./features/beans/beans.page'),
  },
  {
    path: 'beans/new',
    loadComponent: () =>
      import('./features/beans/bean-form.component'),
  },
  {
    path: 'beans/:id/edit',
    loadComponent: () =>
      import('./features/beans/bean-form.component'),
  },
  {
    path: 'extract',
    loadComponent: () =>
      import('./features/extract/extract.page'),
  },
  {
    path: 'logs',
    loadComponent: () =>
      import('./features/logs/logs.page'),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.page'),
  },
];
