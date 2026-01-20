import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BuildJob, JobProgressResponse } from '@kasita/common-models';
import { JobsService, formatErrorMessage } from '@kasita/core-data';
import { of, Subscription } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap, takeUntil, filter } from 'rxjs/operators';
import { BuildJobsActions } from './build-jobs.actions';

// Keep track of WebSocket subscription for cleanup
let wsSubscription: Subscription | null = null;

export const createBuildJob = createEffect(
  (actions$ = inject(Actions), jobsService = inject(JobsService)) => {
    return actions$.pipe(
      ofType(BuildJobsActions.createBuildJob),
      exhaustMap((action) =>
        jobsService.createBuildJob({ pathId: action.pathId }).pipe(
          map((buildJob: BuildJob) =>
            BuildJobsActions.createBuildJobSuccess({ buildJob }),
          ),
          catchError((error) =>
            of(
              BuildJobsActions.createBuildJobFailure({
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

export const loadJobsByPath = createEffect(
  (actions$ = inject(Actions), jobsService = inject(JobsService)) => {
    return actions$.pipe(
      ofType(BuildJobsActions.loadJobsByPath),
      exhaustMap((action) =>
        jobsService.findByPath(action.pathId).pipe(
          map((buildJobs: BuildJob[]) =>
            BuildJobsActions.loadJobsByPathSuccess({ buildJobs }),
          ),
          catchError((error) =>
            of(
              BuildJobsActions.loadJobsByPathFailure({
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

export const loadActiveJob = createEffect(
  (actions$ = inject(Actions), jobsService = inject(JobsService)) => {
    return actions$.pipe(
      ofType(BuildJobsActions.loadActiveJob),
      exhaustMap((action) =>
        jobsService.getActiveJob(action.pathId).pipe(
          map((buildJob: BuildJob | null) =>
            BuildJobsActions.loadActiveJobSuccess({ buildJob }),
          ),
          catchError((error) =>
            of(
              BuildJobsActions.loadActiveJobFailure({
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

export const loadJobProgress = createEffect(
  (actions$ = inject(Actions), jobsService = inject(JobsService)) => {
    return actions$.pipe(
      ofType(BuildJobsActions.loadJobProgress),
      exhaustMap((action) =>
        jobsService.getProgress(action.jobId).pipe(
          map((response: JobProgressResponse) =>
            BuildJobsActions.loadJobProgressSuccess({
              job: response.job,
              steps: response.steps,
              percentage: response.percentage,
            }),
          ),
          catchError((error) =>
            of(
              BuildJobsActions.loadJobProgressFailure({
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

export const cancelJob = createEffect(
  (actions$ = inject(Actions), jobsService = inject(JobsService)) => {
    return actions$.pipe(
      ofType(BuildJobsActions.cancelJob),
      exhaustMap((action) =>
        jobsService.cancel(action.jobId).pipe(
          map((buildJob: BuildJob) =>
            BuildJobsActions.cancelJobSuccess({ buildJob }),
          ),
          catchError((error) =>
            of(
              BuildJobsActions.cancelJobFailure({
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

// After creating a build job, subscribe to its WebSocket events
export const subscribeToJobEventsAfterCreate = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(BuildJobsActions.createBuildJobSuccess),
      tap((action) => console.log('[Effect] createBuildJobSuccess, subscribing to job:', action.buildJob.id)),
      map((action) =>
        BuildJobsActions.subscribeToJobEvents({ jobId: action.buildJob.id }),
      ),
    );
  },
  { functional: true },
);

// Subscribe to WebSocket events when an active job is loaded (e.g., on page refresh)
export const subscribeToActiveJobOnLoad = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(BuildJobsActions.loadActiveJobSuccess),
      filter((action) => {
        const job = action.buildJob;
        // Only subscribe if job exists and is still running
        return !!job && (job.status === 'pending' || job.status === 'running');
      }),
      tap((action) => console.log('[Effect] Active job loaded, subscribing to job:', action.buildJob!.id)),
      map((action) =>
        BuildJobsActions.subscribeToJobEvents({ jobId: action.buildJob!.id }),
      ),
    );
  },
  { functional: true },
);

// Subscribe to WebSocket events for a job
export const subscribeToJobEvents = createEffect(
  (actions$ = inject(Actions), jobsService = inject(JobsService)) => {
    return actions$.pipe(
      ofType(BuildJobsActions.subscribeToJobEvents),
      tap((action) => console.log('[Effect] subscribeToJobEvents triggered for job:', action.jobId)),
      switchMap((action) => {
        // Clean up any existing subscription
        if (wsSubscription) {
          wsSubscription.unsubscribe();
          wsSubscription = null;
        }

        console.log('[Effect] Calling jobsService.subscribeToJobEvents');
        return jobsService.subscribeToJobEvents(action.jobId).pipe(
          map((event) => BuildJobsActions.jobProgressEvent({ event })),
          takeUntil(
            actions$.pipe(
              ofType(
                BuildJobsActions.unsubscribeFromJobEvents,
                BuildJobsActions.clearBuildJobs,
              ),
            ),
          ),
          catchError((error) => {
            console.error('WebSocket subscription error:', error);
            return of(
              BuildJobsActions.loadJobProgressFailure({
                error: 'WebSocket connection failed',
              }),
            );
          }),
        );
      }),
    );
  },
  { functional: true },
);

// When a job is done, load its final progress
export const loadProgressOnJobComplete = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(BuildJobsActions.jobProgressEvent),
      filter(
        (action) =>
          action.event.type === 'job-completed' ||
          action.event.type === 'job-failed',
      ),
      map((action) =>
        BuildJobsActions.loadJobProgress({ jobId: action.event.buildJobId }),
      ),
    );
  },
  { functional: true },
);
