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
    path: 'session/:slug',
    loadComponent: () => import('./session-page/session-page').then((m) => m.SessionPage),
    // No authGuard - sessions can be public
  },
  {
    path: 'curriculum',
    loadComponent: () => import('./curriculum/curriculum').then((m) => m.Curriculum),
    canActivate: [authGuard],
  },
  {
    path: 'challenges',
    loadComponent: () => import('./challenges/challenges').then((m) => m.Challenges),
    canActivate: [authGuard],
  },
  {
    path: 'projects',
    loadComponent: () => import('./projects/projects').then((m) => m.Projects),
    canActivate: [authGuard],
  },
  {
    path: 'schedule',
    loadComponent: () => import('./schedule/schedule').then((m) => m.Schedule),
    canActivate: [authGuard],
  },
  {
    path: 'study',
    loadComponent: () => import('./study/study').then((m) => m.Study),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'flashcards',
        pathMatch: 'full',
      },
      {
        path: 'flashcards',
        loadComponent: () =>
          import('./study/flashcards/flashcards').then((m) => m.StudyFlashcards),
      },
      {
        path: 'quiz',
        loadComponent: () =>
          import('./study/quiz/quiz').then((m) => m.StudyQuiz),
      },
    ],
  },
  {
    path: 'graph',
    loadComponent: () =>
      import('@kasita/feature-graph').then((m) => m.Graph),
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
    path: 'principles',
    loadComponent: () =>
      import('./principles/principles').then((m) => m.Principles),
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
      import('@kasita/feature-algorithm-viz').then((m) => m.AlgorithmVizComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'bfs',
        loadComponent: () =>
          import('@kasita/feature-algorithm-viz').then((m) => m.BfsComponent),
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
    loadComponent: () => import('@kasita/feature-notebook').then((m) => m.NotebookComponent),
    canActivate: [authGuard],
  },
  {
    path: 'learning-map',
    loadComponent: () => import('@kasita/feature-learning-map').then((m) => m.LearningMapComponent),
    canActivate: [authGuard],
  },
  {
    path: 'metro-maps',
    loadComponent: () => import('@kasita/feature-metro-maps').then((m) => m.MetroMapsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'skill-tree',
    loadComponent: () => import('@kasita/feature-skill-tree').then((m) => m.SkillTreeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'linear-dashboard',
    loadComponent: () => import('@kasita/feature-linear-dashboard').then((m) => m.LinearDashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'mind-map',
    loadComponent: () => import('@kasita/feature-mind-map').then((m) => m.MindMapComponent),
    canActivate: [authGuard],
  },
  {
    path: 'completion-assessment',
    loadComponent: () => import('@kasita/feature-completion-assessment').then((m) => m.CompletionAssessment),
    canActivate: [authGuard],
  },
  {
    path: 'submissions',
    loadComponent: () => import('./submissions/submissions').then((m) => m.Submissions),
    canActivate: [authGuard],
  },
  {
    path: 'mentor-dashboard',
    loadComponent: () => import('./mentor-dashboard/mentor-dashboard').then((m) => m.MentorDashboard),
    canActivate: [authGuard],
  },
  {
    path: 'gymnasium',
    loadComponent: () => import('./gymnasium/gymnasium').then((m) => m.Gymnasium),
    canActivate: [authGuard],
  },
];
