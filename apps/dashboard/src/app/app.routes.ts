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
    path: 'learning-paths',
    loadComponent: () =>
      import('./learning-paths/learning-paths').then((m) => m.LearningPaths),
    canActivate: [authGuard],
  },
  {
    path: 'knowledge-units',
    loadComponent: () =>
      import('./knowledge-units/knowledge-units').then((m) => m.KnowledgeUnits),
    canActivate: [authGuard],
  },
  {
    path: 'raw-content',
    loadComponent: () =>
      import('./raw-content/raw-content').then((m) => m.RawContent),
    canActivate: [authGuard],
  },
  {
    path: 'source-configs',
    loadComponent: () =>
      import('./source-configs/source-configs').then((m) => m.SourceConfigs),
    canActivate: [authGuard],
  },
  {
    path: 'user-progress',
    loadComponent: () =>
      import('./user-progress/user-progress').then((m) => m.UserProgress),
    canActivate: [authGuard],
  },
  {
    path: 'graph',
    loadComponent: () =>
      import('./pages/graph/graph').then((m) => m.Graph),
    canActivate: [authGuard],
  },
];
