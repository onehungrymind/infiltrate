import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UserProgress, StudyStats } from '@kasita/common-models';
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
            UserProgressActions.loadUserProgressSuccess({ userProgress: userProgress }),
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

export const loadUserProgressItem = createEffect(
  (
    actions$ = inject(Actions),
    userProgressService = inject(UserProgressService),
  ) => {
    return actions$.pipe(
      ofType(UserProgressActions.loadUserProgressItem),
      exhaustMap((action) => {
        return userProgressService.find(action.userProgressId).pipe(
          map((userProgress: UserProgress) =>
            UserProgressActions.loadUserProgressItemSuccess({ userProgress }),
          ),
          catchError((error) =>
            of(
              UserProgressActions.loadUserProgressItemFailure({
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

// Study effects

export const recordAttempt = createEffect(
  (
    actions$ = inject(Actions),
    userProgressService = inject(UserProgressService),
  ) => {
    return actions$.pipe(
      ofType(UserProgressActions.recordAttempt),
      exhaustMap((action) => {
        return userProgressService.recordAttempt(action.attempt).pipe(
          map((userProgress: UserProgress) =>
            UserProgressActions.recordAttemptSuccess({ userProgress }),
          ),
          catchError((error) =>
            of(
              UserProgressActions.recordAttemptFailure({
                error: error?.message || 'Failed to record attempt',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const loadDueForReview = createEffect(
  (
    actions$ = inject(Actions),
    userProgressService = inject(UserProgressService),
  ) => {
    return actions$.pipe(
      ofType(UserProgressActions.loadDueForReview),
      exhaustMap((action) => {
        return userProgressService.getDueForReview(action.userId).pipe(
          map((userProgress: UserProgress[]) =>
            UserProgressActions.loadDueForReviewSuccess({ userProgress }),
          ),
          catchError((error) =>
            of(
              UserProgressActions.loadDueForReviewFailure({
                error: error?.message || 'Failed to load due for review',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const loadStudyStats = createEffect(
  (
    actions$ = inject(Actions),
    userProgressService = inject(UserProgressService),
  ) => {
    return actions$.pipe(
      ofType(UserProgressActions.loadStudyStats),
      exhaustMap((action) => {
        return userProgressService.getStudyStats(action.userId).pipe(
          map((stats: StudyStats) =>
            UserProgressActions.loadStudyStatsSuccess({ stats }),
          ),
          catchError((error) =>
            of(
              UserProgressActions.loadStudyStatsFailure({
                error: error?.message || 'Failed to load study stats',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const loadUserProgressByUser = createEffect(
  (
    actions$ = inject(Actions),
    userProgressService = inject(UserProgressService),
  ) => {
    return actions$.pipe(
      ofType(UserProgressActions.loadUserProgressByUser),
      exhaustMap((action) => {
        return userProgressService.getByUser(action.userId).pipe(
          map((userProgress: UserProgress[]) =>
            UserProgressActions.loadUserProgressByUserSuccess({ userProgress }),
          ),
          catchError((error) =>
            of(
              UserProgressActions.loadUserProgressByUserFailure({
                error: error?.message || 'Failed to load user progress',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);
