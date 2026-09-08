import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.page'),
  },
  {
    path: 'extract',
    loadComponent: () =>
      import('./features/extract/extract.page'),
  },
  {
    path: 'guides',
    loadComponent: () =>
      import('./features/guides/guides.page'),
  },
  {
    path: 'guides/:id',
    loadComponent: () =>
      import('./features/guides/guide-detail.page'),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.page'),
  },
];
