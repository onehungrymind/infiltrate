import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'flashcards',
    pathMatch: 'full',
  },
  {
    path: 'flashcards',
    loadComponent: () =>
      import('./flashcards/flashcards').then((m) => m.Flashcards),
  },
];
