import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Submission, Feedback } from '@kasita/common-models';
import { SubmissionsService, formatErrorMessage } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { SubmissionsActions } from './submissions.actions';

export const loadSubmissions = createEffect(
  (
    actions$ = inject(Actions),
    submissionsService = inject(SubmissionsService),
  ) => {
    return actions$.pipe(
      ofType(SubmissionsActions.loadSubmissions),
      exhaustMap(() =>
        submissionsService.all().pipe(
          map((submissions: Submission[]) =>
            SubmissionsActions.loadSubmissionsSuccess({ submissions }),
          ),
          catchError((error) =>
            of(
              SubmissionsActions.loadSubmissionsFailure({
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

export const loadSubmission = createEffect(
  (
    actions$ = inject(Actions),
    submissionsService = inject(SubmissionsService),
  ) => {
    return actions$.pipe(
      ofType(SubmissionsActions.loadSubmission),
      exhaustMap((action) => {
        return submissionsService.find(action.submissionId).pipe(
          map((submission: Submission) =>
            SubmissionsActions.loadSubmissionSuccess({ submission }),
          ),
          catchError((error) =>
            of(
              SubmissionsActions.loadSubmissionFailure({
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

export const loadSubmissionsByUser = createEffect(
  (
    actions$ = inject(Actions),
    submissionsService = inject(SubmissionsService),
  ) => {
    return actions$.pipe(
      ofType(SubmissionsActions.loadSubmissionsByUser),
      exhaustMap((action) => {
        return submissionsService.findByUser(action.userId).pipe(
          map((submissions: Submission[]) =>
            SubmissionsActions.loadSubmissionsByUserSuccess({ submissions }),
          ),
          catchError((error) =>
            of(
              SubmissionsActions.loadSubmissionsByUserFailure({
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

export const loadSubmissionsByUnit = createEffect(
  (
    actions$ = inject(Actions),
    submissionsService = inject(SubmissionsService),
  ) => {
    return actions$.pipe(
      ofType(SubmissionsActions.loadSubmissionsByUnit),
      exhaustMap((action) => {
        return submissionsService.findByUnit(action.unitId).pipe(
          map((submissions: Submission[]) =>
            SubmissionsActions.loadSubmissionsByUnitSuccess({ submissions }),
          ),
          catchError((error) =>
            of(
              SubmissionsActions.loadSubmissionsByUnitFailure({
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

export const loadSubmissionsByPath = createEffect(
  (
    actions$ = inject(Actions),
    submissionsService = inject(SubmissionsService),
  ) => {
    return actions$.pipe(
      ofType(SubmissionsActions.loadSubmissionsByPath),
      exhaustMap((action) => {
        return submissionsService.findByPath(action.pathId).pipe(
          map((submissions: Submission[]) =>
            SubmissionsActions.loadSubmissionsByPathSuccess({ submissions }),
          ),
          catchError((error) =>
            of(
              SubmissionsActions.loadSubmissionsByPathFailure({
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

export const createSubmission = createEffect(
  (
    actions$ = inject(Actions),
    submissionsService = inject(SubmissionsService),
  ) => {
    return actions$.pipe(
      ofType(SubmissionsActions.createSubmission),
      exhaustMap((action) => {
        return submissionsService.create(action.submission).pipe(
          map((submission: Submission) =>
            SubmissionsActions.createSubmissionSuccess({ submission }),
          ),
          catchError((error) =>
            of(
              SubmissionsActions.createSubmissionFailure({
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

export const updateSubmission = createEffect(
  (
    actions$ = inject(Actions),
    submissionsService = inject(SubmissionsService),
  ) => {
    return actions$.pipe(
      ofType(SubmissionsActions.updateSubmission),
      exhaustMap((action) => {
        return submissionsService.update(action.submission).pipe(
          map((submission: Submission) =>
            SubmissionsActions.updateSubmissionSuccess({ submission }),
          ),
          catchError((error) =>
            of(
              SubmissionsActions.updateSubmissionFailure({
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

export const deleteSubmission = createEffect(
  (
    actions$ = inject(Actions),
    submissionsService = inject(SubmissionsService),
  ) => {
    return actions$.pipe(
      ofType(SubmissionsActions.deleteSubmission),
      exhaustMap((action) => {
        return submissionsService.delete(action.submission).pipe(
          map(() =>
            SubmissionsActions.deleteSubmissionSuccess({
              submission: action.submission,
            }),
          ),
          catchError((error) =>
            of(
              SubmissionsActions.deleteSubmissionFailure({
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

// Domain actions
export const submitForReview = createEffect(
  (
    actions$ = inject(Actions),
    submissionsService = inject(SubmissionsService),
  ) => {
    return actions$.pipe(
      ofType(SubmissionsActions.submitForReview),
      exhaustMap((action) => {
        return submissionsService.submit(action.submissionId).pipe(
          map((submission: Submission) =>
            SubmissionsActions.submitForReviewSuccess({ submission }),
          ),
          catchError((error) =>
            of(
              SubmissionsActions.submitForReviewFailure({
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

export const requestAiFeedback = createEffect(
  (
    actions$ = inject(Actions),
    submissionsService = inject(SubmissionsService),
  ) => {
    return actions$.pipe(
      ofType(SubmissionsActions.requestAIFeedback),
      exhaustMap((action) => {
        return submissionsService
          .requestAiFeedback(action.submissionId, action.rubricCriteria)
          .pipe(
            map((result: { feedback: Feedback; submission: Submission }) =>
              SubmissionsActions.requestAIFeedbackSuccess({
                feedback: result.feedback,
                submission: result.submission,
              }),
            ),
            catchError((error) =>
              of(
                SubmissionsActions.requestAIFeedbackFailure({
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

export const loadFeedback = createEffect(
  (
    actions$ = inject(Actions),
    submissionsService = inject(SubmissionsService),
  ) => {
    return actions$.pipe(
      ofType(SubmissionsActions.loadFeedback),
      exhaustMap((action) => {
        return submissionsService.getFeedback(action.submissionId).pipe(
          map((feedback: Feedback[]) =>
            SubmissionsActions.loadFeedbackSuccess({
              submissionId: action.submissionId,
              feedback,
            }),
          ),
          catchError((error) =>
            of(
              SubmissionsActions.loadFeedbackFailure({
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
