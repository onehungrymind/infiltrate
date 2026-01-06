import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UserProgress } from '@kasita/common-models';
import { UserProgressService } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { UserProgressActions } from './user-progress.actions';

export const loadUserProgress = createEffect(
  (
    actions$ = inject(Actions),
    userProgressService = inject(UserProgressService),
  ) => {
    return actions$.pipe(
      ofType(UserProgressActions.loadUserProgress),
      exhaustMap(() =>
        userProgressService.all().pipe(
          map((userProgress: UserProgress[]) =>
            UserProgressActions.loadUserProgressSuccess({ userProgress }),
          ),
          catchError((error) =>
            of(
              UserProgressActions.loadUserProgressFailure({
                error: error?.message || 'Failed to load userProgress',
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadUserProgress = createEffect(
  (
    actions$ = inject(Actions),
    userProgressService = inject(UserProgressService),
  ) => {
    return actions$.pipe(
      ofType(UserProgressActions.loadUserProgress),
      exhaustMap((action) => {
        return userProgressService.find(action.userProgressId).pipe(
          map((userProgress: UserProgress) =>
            UserProgressActions.loadUserProgressSuccess({ userProgress }),
          ),
          catchError((error) =>
            of(
              UserProgressActions.loadUserProgressFailure({
                error: error?.message || 'Failed to load userProgress',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const createUserProgress = createEffect(
  (
    actions$ = inject(Actions),
    userProgressService = inject(UserProgressService),
  ) => {
    return actions$.pipe(
      ofType(UserProgressActions.createUserProgress),
      exhaustMap((action) => {
        return userProgressService.create(action.userProgress).pipe(
          map((userProgress: any) =>
            UserProgressActions.createUserProgressSuccess({ userProgress }),
          ),
          catchError((error) =>
            of(
              UserProgressActions.createUserProgressFailure({
                error: error?.message || 'Failed to create userProgress',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const updateUserProgress = createEffect(
  (
    actions$ = inject(Actions),
    userProgressService = inject(UserProgressService),
  ) => {
    return actions$.pipe(
      ofType(UserProgressActions.updateUserProgress),
      exhaustMap((action) => {
        return userProgressService.update(action.userProgress).pipe(
          map((userProgress: any) =>
            UserProgressActions.updateUserProgressSuccess({ userProgress }),
          ),
          catchError((error) =>
            of(
              UserProgressActions.updateUserProgressFailure({
                error: error?.message || 'Failed to update userProgress',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const deleteUserProgress = createEffect(
  (
    actions$ = inject(Actions),
    userProgressService = inject(UserProgressService),
  ) => {
    return actions$.pipe(
      ofType(UserProgressActions.deleteUserProgress),
      exhaustMap((action) => {
        return userProgressService.delete(action.userProgress).pipe(
          map((userProgress: any) =>
            UserProgressActions.deleteUserProgressSuccess({ userProgress }),
          ),
          catchError((error) =>
            of(
              UserProgressActions.deleteUserProgressFailure({
                error: error?.message || 'Failed to delete userProgress',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);
