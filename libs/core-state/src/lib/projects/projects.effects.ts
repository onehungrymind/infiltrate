import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Project, ProjectConcept } from '@kasita/common-models';
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

export const linkConcept = createEffect(
  (
    actions$ = inject(Actions),
    projectsService = inject(ProjectsService),
  ) => {
    return actions$.pipe(
      ofType(ProjectsActions.linkConcept),
      exhaustMap((action) => {
        return projectsService.linkConcept(action.projectId, action.conceptId, action.weight).pipe(
          map((projectConcept: ProjectConcept) =>
            ProjectsActions.linkConceptSuccess({ projectConcept }),
          ),
          catchError((error) =>
            of(
              ProjectsActions.linkConceptFailure({
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

export const unlinkConcept = createEffect(
  (
    actions$ = inject(Actions),
    projectsService = inject(ProjectsService),
  ) => {
    return actions$.pipe(
      ofType(ProjectsActions.unlinkConcept),
      exhaustMap((action) => {
        return projectsService.unlinkConcept(action.projectId, action.conceptId).pipe(
          map(() =>
            ProjectsActions.unlinkConceptSuccess({
              projectId: action.projectId,
              conceptId: action.conceptId,
            }),
          ),
          catchError((error) =>
            of(
              ProjectsActions.unlinkConceptFailure({
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
