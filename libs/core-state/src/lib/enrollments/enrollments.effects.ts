import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Enrollment } from '@kasita/common-models';
import { EnrollmentsService, formatErrorMessage } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { EnrollmentsActions } from './enrollments.actions';

export const loadEnrollments = createEffect(
  (
    actions$ = inject(Actions),
    enrollmentsService = inject(EnrollmentsService),
  ) => {
    return actions$.pipe(
      ofType(EnrollmentsActions.loadEnrollments),
      exhaustMap(() =>
        enrollmentsService.all().pipe(
          map((enrollments: Enrollment[]) =>
            EnrollmentsActions.loadEnrollmentsSuccess({ enrollments }),
          ),
          catchError((error) =>
            of(
              EnrollmentsActions.loadEnrollmentsFailure({
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

export const loadEnrollmentsByUser = createEffect(
  (
    actions$ = inject(Actions),
    enrollmentsService = inject(EnrollmentsService),
  ) => {
    return actions$.pipe(
      ofType(EnrollmentsActions.loadEnrollmentsByUser),
      exhaustMap((action) =>
        enrollmentsService.findByUser(action.userId).pipe(
          map((enrollments: Enrollment[]) =>
            EnrollmentsActions.loadEnrollmentsByUserSuccess({ enrollments }),
          ),
          catchError((error) =>
            of(
              EnrollmentsActions.loadEnrollmentsByUserFailure({
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

export const loadEnrollmentsByPath = createEffect(
  (
    actions$ = inject(Actions),
    enrollmentsService = inject(EnrollmentsService),
  ) => {
    return actions$.pipe(
      ofType(EnrollmentsActions.loadEnrollmentsByPath),
      exhaustMap((action) =>
        enrollmentsService.findByPath(action.pathId, action.activeOnly).pipe(
          map((enrollments: Enrollment[]) =>
            EnrollmentsActions.loadEnrollmentsByPathSuccess({ enrollments }),
          ),
          catchError((error) =>
            of(
              EnrollmentsActions.loadEnrollmentsByPathFailure({
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

export const checkEnrollment = createEffect(
  (
    actions$ = inject(Actions),
    enrollmentsService = inject(EnrollmentsService),
  ) => {
    return actions$.pipe(
      ofType(EnrollmentsActions.checkEnrollment),
      exhaustMap((action) =>
        enrollmentsService.checkEnrollment(action.userId, action.pathId).pipe(
          map((result) =>
            EnrollmentsActions.checkEnrollmentSuccess({
              isEnrolled: result.isEnrolled,
              enrollment: result.enrollment,
            }),
          ),
          catchError((error) =>
            of(
              EnrollmentsActions.checkEnrollmentFailure({
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

export const enroll = createEffect(
  (
    actions$ = inject(Actions),
    enrollmentsService = inject(EnrollmentsService),
  ) => {
    return actions$.pipe(
      ofType(EnrollmentsActions.enroll),
      exhaustMap((action) =>
        enrollmentsService.enroll(action.enrollment).pipe(
          map((enrollment: Enrollment) =>
            EnrollmentsActions.enrollSuccess({ enrollment }),
          ),
          catchError((error) =>
            of(
              EnrollmentsActions.enrollFailure({
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

export const updateEnrollment = createEffect(
  (
    actions$ = inject(Actions),
    enrollmentsService = inject(EnrollmentsService),
  ) => {
    return actions$.pipe(
      ofType(EnrollmentsActions.updateEnrollment),
      exhaustMap((action) =>
        enrollmentsService.update(action.userId, action.pathId, action.updateDto).pipe(
          map((enrollment: Enrollment) =>
            EnrollmentsActions.updateEnrollmentSuccess({ enrollment }),
          ),
          catchError((error) =>
            of(
              EnrollmentsActions.updateEnrollmentFailure({
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

export const unenroll = createEffect(
  (
    actions$ = inject(Actions),
    enrollmentsService = inject(EnrollmentsService),
  ) => {
    return actions$.pipe(
      ofType(EnrollmentsActions.unenroll),
      exhaustMap((action) =>
        enrollmentsService.unenroll(action.userId, action.pathId).pipe(
          map(() =>
            EnrollmentsActions.unenrollSuccess({
              userId: action.userId,
              pathId: action.pathId,
            }),
          ),
          catchError((error) =>
            of(
              EnrollmentsActions.unenrollFailure({
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

export const loadLeaderboard = createEffect(
  (
    actions$ = inject(Actions),
    enrollmentsService = inject(EnrollmentsService),
  ) => {
    return actions$.pipe(
      ofType(EnrollmentsActions.loadLeaderboard),
      exhaustMap((action) =>
        enrollmentsService.getLeaderboard(action.pathId).pipe(
          map((leaderboard: any[]) =>
            EnrollmentsActions.loadLeaderboardSuccess({
              pathId: action.pathId,
              leaderboard,
            }),
          ),
          catchError((error) =>
            of(
              EnrollmentsActions.loadLeaderboardFailure({
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
