import { Route } from '@angular/router';
import { authGuard, adminGuard, studentGuard } from '@kasita/core-data';

export const appRoutes: Route[] = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'session/:slug',
    loadComponent: () => import('./session-page/session-page').then((m) => m.SessionPage),
  },

  // Home (requires auth)
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.Home),
    canActivate: [authGuard],
    pathMatch: 'full',
  },

  // Student routes
  {
    path: 'student',
    canActivate: [authGuard, studentGuard],
    children: [
      {
        path: 'learning-paths',
        loadComponent: () =>
          import('./student/learning-paths-list/learning-paths-list').then((m) => m.LearningPathsList),
      },
      {
        path: 'learning-paths/:id',
        loadComponent: () =>
          import('./student/learning-path-detail/learning-path-detail').then((m) => m.LearningPathDetail),
      },
      {
        path: 'study',
        loadComponent: () => import('./student/study/study').then((m) => m.Study),
        children: [
          {
            path: '',
            redirectTo: 'flashcards',
            pathMatch: 'full',
          },
          {
            path: 'flashcards',
            loadComponent: () =>
              import('./student/study/flashcards/flashcards').then((m) => m.StudyFlashcards),
          },
          {
            path: 'quiz',
            loadComponent: () =>
              import('./student/study/quiz/quiz').then((m) => m.StudyQuiz),
          },
        ],
      },
      {
        path: 'schedule',
        loadComponent: () => import('./student/schedule/schedule').then((m) => m.Schedule),
      },
      {
        path: 'submissions',
        loadComponent: () => import('./student/submissions/submissions').then((m) => m.Submissions),
      },
      {
        path: 'gymnasium',
        loadComponent: () => import('./student/gymnasium/gymnasium').then((m) => m.Gymnasium),
      },
    ],
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'learning-paths',
        loadComponent: () =>
          import('./admin/learning-paths/learning-paths').then((m) => m.LearningPaths),
      },
      {
        path: 'concepts',
        loadComponent: () =>
          import('./admin/concepts/concepts').then((m) => m.Concepts),
      },
      {
        path: 'knowledge-units',
        loadComponent: () =>
          import('./admin/knowledge-units/knowledge-units').then((m) => m.KnowledgeUnits),
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/users/users').then((m) => m.Users),
      },
      {
        path: 'challenges',
        loadComponent: () => import('./admin/challenges/challenges').then((m) => m.Challenges),
      },
      {
        path: 'projects',
        loadComponent: () => import('./admin/projects/projects').then((m) => m.Projects),
      },
      {
        path: 'source-configs',
        loadComponent: () =>
          import('./admin/source-configs/source-configs').then((m) => m.SourceConfigs),
      },
      {
        path: 'raw-content',
        loadComponent: () =>
          import('./admin/raw-content/raw-content').then((m) => m.RawContent),
      },
      {
        path: 'pipeline',
        loadComponent: () => import('./admin/pipeline/pipeline').then((m) => m.Pipeline),
      },
      {
        path: 'mentor-dashboard',
        loadComponent: () =>
          import('./admin/mentor-dashboard/mentor-dashboard').then((m) => m.MentorDashboard),
      },
      {
        path: 'reports/completion-assessment',
        loadComponent: () =>
          import('@kasita/feature-completion-assessment').then((m) => m.CompletionAssessment),
      },
    ],
  },

  // Lab routes (shared visualizations)
  {
    path: 'lab',
    canActivate: [authGuard],
    children: [
      {
        path: 'graph',
        loadComponent: () =>
          import('@kasita/feature-graph').then((m) => m.Graph),
      },
      {
        path: 'learning-map',
        loadComponent: () =>
          import('@kasita/feature-learning-map').then((m) => m.LearningMapComponent),
      },
      {
        path: 'metro-maps',
        loadComponent: () =>
          import('@kasita/feature-metro-maps').then((m) => m.MetroMapsComponent),
      },
      {
        path: 'skill-tree',
        loadComponent: () =>
          import('@kasita/feature-skill-tree').then((m) => m.SkillTreeComponent),
      },
      {
        path: 'linear-dashboard',
        loadComponent: () =>
          import('@kasita/feature-linear-dashboard').then((m) => m.LinearDashboardComponent),
      },
      {
        path: 'mind-map',
        loadComponent: () =>
          import('@kasita/feature-mind-map').then((m) => m.MindMapComponent),
      },
      {
        path: 'visualization/bfs',
        loadComponent: () =>
          import('@kasita/feature-algorithm-viz').then((m) => m.BfsComponent),
      },
      {
        path: 'notebook',
        loadComponent: () =>
          import('@kasita/feature-notebook').then((m) => m.NotebookComponent),
      },
    ],
  },

  // Legacy redirects (temporary, for backward compatibility)
  { path: 'learning-paths', redirectTo: '/admin/learning-paths', pathMatch: 'full' },
  { path: 'concepts', redirectTo: '/admin/concepts', pathMatch: 'full' },
  { path: 'knowledge-units', redirectTo: '/admin/knowledge-units', pathMatch: 'full' },
  { path: 'users', redirectTo: '/admin/users', pathMatch: 'full' },
  { path: 'challenges', redirectTo: '/admin/challenges', pathMatch: 'full' },
  { path: 'projects', redirectTo: '/admin/projects', pathMatch: 'full' },
  { path: 'source-configs', redirectTo: '/admin/source-configs', pathMatch: 'full' },
  { path: 'raw-content', redirectTo: '/admin/raw-content', pathMatch: 'full' },
  { path: 'pipeline', redirectTo: '/admin/pipeline', pathMatch: 'full' },
  { path: 'mentor-dashboard', redirectTo: '/admin/mentor-dashboard', pathMatch: 'full' },
  { path: 'completion-assessment', redirectTo: '/admin/reports/completion-assessment', pathMatch: 'full' },
  { path: 'study', redirectTo: '/student/study', pathMatch: 'full' },
  { path: 'schedule', redirectTo: '/student/schedule', pathMatch: 'full' },
  { path: 'submissions', redirectTo: '/student/submissions', pathMatch: 'full' },
  { path: 'gymnasium', redirectTo: '/student/gymnasium', pathMatch: 'full' },
  { path: 'curriculum', redirectTo: '/student/learning-paths', pathMatch: 'full' },
  { path: 'graph', redirectTo: '/lab/graph', pathMatch: 'full' },
  { path: 'learning-map', redirectTo: '/lab/learning-map', pathMatch: 'full' },
  { path: 'metro-maps', redirectTo: '/lab/metro-maps', pathMatch: 'full' },
  { path: 'skill-tree', redirectTo: '/lab/skill-tree', pathMatch: 'full' },
  { path: 'linear-dashboard', redirectTo: '/lab/linear-dashboard', pathMatch: 'full' },
  { path: 'mind-map', redirectTo: '/lab/mind-map', pathMatch: 'full' },
  { path: 'visualization/bfs', redirectTo: '/lab/visualization/bfs', pathMatch: 'full' },
  { path: 'notebook', redirectTo: '/lab/notebook', pathMatch: 'full' },

  // Fallback
  { path: '**', redirectTo: '/' },
];
