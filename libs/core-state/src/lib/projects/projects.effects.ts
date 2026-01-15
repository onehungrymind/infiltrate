import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Project, ProjectPrinciple } from '@kasita/common-models';
import { ProjectsService, formatErrorMessage } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { ProjectsActions } from './projects.actions';

export const loadProjects = createEffect(
  (
    actions$ = inject(Actions),
    projectsService = inject(ProjectsService),
  ) => {
    return actions$.pipe(
      ofType(ProjectsActions.loadProjects),
      exhaustMap(() =>
        projectsService.all().pipe(
          map((projects: Project[]) =>
            ProjectsActions.loadProjectsSuccess({ projects }),
          ),
          catchError((error) =>
            of(
              ProjectsActions.loadProjectsFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadProject = createEffect(
  (
    actions$ = inject(Actions),
    projectsService = inject(ProjectsService),
  ) => {
    return actions$.pipe(
      ofType(ProjectsActions.loadProject),
      exhaustMap((action) => {
        return projectsService.find(action.projectId).pipe(
          map((project: Project) =>
            ProjectsActions.loadProjectSuccess({ project }),
          ),
          catchError((error) =>
            of(
              ProjectsActions.loadProjectFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const loadProjectsByPath = createEffect(
  (
    actions$ = inject(Actions),
    projectsService = inject(ProjectsService),
  ) => {
    return actions$.pipe(
      ofType(ProjectsActions.loadProjectsByPath),
      exhaustMap((action) => {
        return projectsService.findByPath(action.pathId).pipe(
          map((projects: Project[]) =>
            ProjectsActions.loadProjectsByPathSuccess({ projects }),
          ),
          catchError((error) =>
            of(
              ProjectsActions.loadProjectsByPathFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const createProject = createEffect(
  (
    actions$ = inject(Actions),
    projectsService = inject(ProjectsService),
  ) => {
    return actions$.pipe(
      ofType(ProjectsActions.createProject),
      exhaustMap((action) => {
        return projectsService.create(action.project).pipe(
          map((project: Project) =>
            ProjectsActions.createProjectSuccess({ project }),
          ),
          catchError((error) =>
            of(
              ProjectsActions.createProjectFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const updateProject = createEffect(
  (
    actions$ = inject(Actions),
    projectsService = inject(ProjectsService),
  ) => {
    return actions$.pipe(
      ofType(ProjectsActions.updateProject),
      exhaustMap((action) => {
        return projectsService.update(action.project).pipe(
          map((project: Project) =>
            ProjectsActions.updateProjectSuccess({ project }),
          ),
          catchError((error) =>
            of(
              ProjectsActions.updateProjectFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const deleteProject = createEffect(
  (
    actions$ = inject(Actions),
    projectsService = inject(ProjectsService),
  ) => {
    return actions$.pipe(
      ofType(ProjectsActions.deleteProject),
      exhaustMap((action) => {
        return projectsService.delete(action.project).pipe(
          map(() =>
            ProjectsActions.deleteProjectSuccess({
              project: action.project,
            }),
          ),
          catchError((error) =>
            of(
              ProjectsActions.deleteProjectFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const linkPrinciple = createEffect(
  (
    actions$ = inject(Actions),
    projectsService = inject(ProjectsService),
  ) => {
    return actions$.pipe(
      ofType(ProjectsActions.linkPrinciple),
      exhaustMap((action) => {
        return projectsService.linkPrinciple(action.projectId, action.principleId, action.weight).pipe(
          map((projectPrinciple: ProjectPrinciple) =>
            ProjectsActions.linkPrincipleSuccess({ projectPrinciple }),
          ),
          catchError((error) =>
            of(
              ProjectsActions.linkPrincipleFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const unlinkPrinciple = createEffect(
  (
    actions$ = inject(Actions),
    projectsService = inject(ProjectsService),
  ) => {
    return actions$.pipe(
      ofType(ProjectsActions.unlinkPrinciple),
      exhaustMap((action) => {
        return projectsService.unlinkPrinciple(action.projectId, action.principleId).pipe(
          map(() =>
            ProjectsActions.unlinkPrincipleSuccess({
              projectId: action.projectId,
              principleId: action.principleId,
            }),
          ),
          catchError((error) =>
            of(
              ProjectsActions.unlinkPrincipleFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);
