import { Injectable, inject } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { BuildJobsActions } from './build-jobs.actions';

import {
  selectAllBuildJobs,
  selectBuildJobsLoading,
  selectBuildJobsError,
  selectActiveJob,
  selectActiveJobId,
  selectSteps,
  selectCurrentProgress,
  selectLatestEvent,
  selectIsRunning,
} from './build-jobs.feature';

@Injectable({
  providedIn: 'root',
})
export class BuildJobsFacade {
  private readonly store = inject(Store);

  // Selectors
  allBuildJobs$ = this.store.select(selectAllBuildJobs);
  loading$ = this.store.select(selectBuildJobsLoading);
  error$ = this.store.select(selectBuildJobsError);
  activeJob$ = this.store.select(selectActiveJob);
  activeJobId$ = this.store.select(selectActiveJobId);
  steps$ = this.store.select(selectSteps);
  currentProgress$ = this.store.select(selectCurrentProgress);
  latestEvent$ = this.store.select(selectLatestEvent);
  isRunning$ = this.store.select(selectIsRunning);

  /**
   * Create a new build job for a learning path
   * This will automatically subscribe to SSE events
   */
  createBuildJob(pathId: string): void {
    this.dispatch(BuildJobsActions.createBuildJob({ pathId }));
  }

  /**
   * Load all jobs for a learning path
   */
  loadJobsByPath(pathId: string): void {
    this.dispatch(BuildJobsActions.loadJobsByPath({ pathId }));
  }

  /**
   * Load the active (pending/running) job for a path
   */
  loadActiveJob(pathId: string): void {
    this.dispatch(BuildJobsActions.loadActiveJob({ pathId }));
  }

  /**
   * Load progress details for a specific job
   */
  loadJobProgress(jobId: string): void {
    this.dispatch(BuildJobsActions.loadJobProgress({ jobId }));
  }

  /**
   * Cancel a running job
   */
  cancelJob(jobId: string): void {
    this.dispatch(BuildJobsActions.cancelJob({ jobId }));
  }

  /**
   * Manually subscribe to job events (usually automatic after create)
   */
  subscribeToJobEvents(jobId: string): void {
    this.dispatch(BuildJobsActions.subscribeToJobEvents({ jobId }));
  }

  /**
   * Unsubscribe from job events
   */
  unsubscribeFromJobEvents(): void {
    this.dispatch(BuildJobsActions.unsubscribeFromJobEvents());
  }

  /**
   * Clear all build job state
   */
  clear(): void {
    this.dispatch(BuildJobsActions.clearBuildJobs());
  }

  private dispatch(action: Action): void {
    this.store.dispatch(action);
  }
}
