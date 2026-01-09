import { Route } from '@angular/router';
import { authGuard } from '@kasita/core-data';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.Home),
    canActivate: [authGuard],
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'content',
    loadComponent: () => import('./content/content').then((m) => m.Content),
    canActivate: [authGuard],
  },
  {
    path: 'challenges',
    loadComponent: () => import('./challenges/challenges').then((m) => m.Challenges),
    canActivate: [authGuard],
  },
  {
    path: 'schedule',
    loadComponent: () => import('./schedule/schedule').then((m) => m.Schedule),
    canActivate: [authGuard],
  },
  {
    path: 'graph',
    loadComponent: () =>
      import('./pages/graph/graph').then((m) => m.Graph),
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users').then((m) => m.Users),
    canActivate: [authGuard],
  },
  {
    path: 'learning-paths',
    loadComponent: () =>
      import('./learning-paths/learning-paths').then((m) => m.LearningPaths),
    canActivate: [authGuard],
  },
  {
    path: 'source-configs',
    loadComponent: () =>
      import('./source-configs/source-configs').then((m) => m.SourceConfigs),
    canActivate: [authGuard],
  },
  {
    path: 'raw-content',
    loadComponent: () =>
      import('./raw-content/raw-content').then((m) => m.RawContent),
    canActivate: [authGuard],
  },
  {
    path: 'knowledge-units',
    loadComponent: () =>
      import('./knowledge-units/knowledge-units').then((m) => m.KnowledgeUnits),
    canActivate: [authGuard],
  },
  {
    path: 'visualization',
    loadComponent: () =>
      import('./pages/visualization/visualization').then((m) => m.Visualization),
    canActivate: [authGuard],
    children: [
      {
        path: 'bfs',
        loadComponent: () =>
          import('./pages/visualization/bfs/bfs').then((m) => m.BfsComponent),
      },
      {
        path: '',
        redirectTo: 'bfs',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'notebook',
    loadComponent: () => import('./pages/notebook/notebook').then((m) => m.NotebookComponent),
    canActivate: [authGuard],
  },
  {
    path: 'learning-map',
    loadComponent: () => import('./pages/learning-map/learning-map.component').then((m) => m.LearningMapComponent),
    canActivate: [authGuard],
  },
];
