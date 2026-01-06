import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LearningPath } from '@kasita/common-models';
import { LearningPathsService } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { LearningPathsActions } from './learning-paths.actions';

export const loadLearningPaths = createEffect(
  (
    actions$ = inject(Actions),
    learningPathsService = inject(LearningPathsService),
  ) => {
    return actions$.pipe(
      ofType(LearningPathsActions.loadLearningPaths),
      exhaustMap(() =>
        learningPathsService.all().pipe(
          map((learningPaths: LearningPath[]) =>
            LearningPathsActions.loadLearningPathsSuccess({ learningPaths }),
          ),
          catchError((error) =>
            of(
              LearningPathsActions.loadLearningPathsFailure({
                error: error?.message || 'Failed to load learningPaths',
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadLearningPath = createEffect(
  (
    actions$ = inject(Actions),
    learningPathsService = inject(LearningPathsService),
  ) => {
    return actions$.pipe(
      ofType(LearningPathsActions.loadLearningPath),
      exhaustMap((action) => {
        return learningPathsService.find(action.learningPathId).pipe(
          map((learningPath: LearningPath) =>
            LearningPathsActions.loadLearningPathSuccess({ learningPath }),
          ),
          catchError((error) =>
            of(
              LearningPathsActions.loadLearningPathFailure({
                error: error?.message || 'Failed to load learningPath',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const createLearningPath = createEffect(
  (
    actions$ = inject(Actions),
    learningPathsService = inject(LearningPathsService),
  ) => {
    return actions$.pipe(
      ofType(LearningPathsActions.createLearningPath),
      exhaustMap((action) => {
        return learningPathsService.create(action.learningPath).pipe(
          map((learningPath: any) =>
            LearningPathsActions.createLearningPathSuccess({ learningPath }),
          ),
          catchError((error) =>
            of(
              LearningPathsActions.createLearningPathFailure({
                error: error?.message || 'Failed to create learningPath',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const updateLearningPath = createEffect(
  (
    actions$ = inject(Actions),
    learningPathsService = inject(LearningPathsService),
  ) => {
    return actions$.pipe(
      ofType(LearningPathsActions.updateLearningPath),
      exhaustMap((action) => {
        return learningPathsService.update(action.learningPath).pipe(
          map((learningPath: any) =>
            LearningPathsActions.updateLearningPathSuccess({ learningPath }),
          ),
          catchError((error) =>
            of(
              LearningPathsActions.updateLearningPathFailure({
                error: error?.message || 'Failed to update learningPath',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const deleteLearningPath = createEffect(
  (
    actions$ = inject(Actions),
    learningPathsService = inject(LearningPathsService),
  ) => {
    return actions$.pipe(
      ofType(LearningPathsActions.deleteLearningPath),
      exhaustMap((action) => {
        return learningPathsService.delete(action.learningPath).pipe(
          map((learningPath: any) =>
            LearningPathsActions.deleteLearningPathSuccess({ learningPath }),
          ),
          catchError((error) =>
            of(
              LearningPathsActions.deleteLearningPathFailure({
                error: error?.message || 'Failed to delete learningPath',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);
