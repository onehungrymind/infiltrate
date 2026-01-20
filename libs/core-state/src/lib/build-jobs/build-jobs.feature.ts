import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { BuildJob, JobStep, JobProgressEvent } from '@kasita/common-models';
import { BuildJobsActions } from './build-jobs.actions';

export const BUILD_JOBS_FEATURE_KEY = 'buildJobs';

// --- State & Adapter ---
export interface BuildJobsState extends EntityState<BuildJob> {
  activeJobId: string | null;
  steps: JobStep[];
  currentProgress: number;
  latestEvent: JobProgressEvent | null;
  loading: boolean;
  error: string | null;
}

export const buildJobsAdapter: EntityAdapter<BuildJob> = createEntityAdapter<BuildJob>({
  sortComparer: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
});

export const initialBuildJobsState: BuildJobsState = buildJobsAdapter.getInitialState({
  activeJobId: null,
  steps: [],
  currentProgress: 0,
  latestEvent: null,
  loading: false,
  error: null,
});

// --- Helper Functions ---
const onFailure = (state: BuildJobsState, { error }: { error: string | null }) => ({
  ...state,
  loading: false,
  error,
});

const buildJobsReducer = createReducer(
  initialBuildJobsState,

  // Create build job
  on(BuildJobsActions.createBuildJob, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(BuildJobsActions.createBuildJobSuccess, (state, { buildJob }) =>
    buildJobsAdapter.addOne(buildJob, {
      ...state,
      activeJobId: buildJob.id,
      loading: false,
      error: null,
    }),
  ),
  on(BuildJobsActions.createBuildJobFailure, onFailure),

  // Load jobs by path
  on(BuildJobsActions.loadJobsByPath, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(BuildJobsActions.loadJobsByPathSuccess, (state, { buildJobs }) =>
    buildJobsAdapter.setAll(buildJobs, {
      ...state,
      loading: false,
      error: null,
    }),
  ),
  on(BuildJobsActions.loadJobsByPathFailure, onFailure),

  // Load active job
  on(BuildJobsActions.loadActiveJob, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(BuildJobsActions.loadActiveJobSuccess, (state, { buildJob }) => {
    const baseState = buildJob
      ? buildJobsAdapter.upsertOne(buildJob, state)
      : state;
    return {
      ...baseState,
      activeJobId: buildJob?.id ?? null,
      loading: false,
      error: null,
    };
  }),
  on(BuildJobsActions.loadActiveJobFailure, onFailure),

  // Load job progress
  on(BuildJobsActions.loadJobProgress, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(BuildJobsActions.loadJobProgressSuccess, (state, { job, steps, percentage }) =>
    buildJobsAdapter.upsertOne(job, {
      ...state,
      steps,
      currentProgress: percentage,
      loading: false,
      error: null,
    }),
  ),
  on(BuildJobsActions.loadJobProgressFailure, onFailure),

  // Cancel job
  on(BuildJobsActions.cancelJob, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(BuildJobsActions.cancelJobSuccess, (state, { buildJob }) =>
    buildJobsAdapter.updateOne(
      { id: buildJob.id, changes: buildJob },
      {
        ...state,
        activeJobId: null,
        loading: false,
        error: null,
      },
    ),
  ),
  on(BuildJobsActions.cancelJobFailure, onFailure),

  // SSE events
  on(BuildJobsActions.jobProgressEvent, (state, { event }) => {
    const updatedState = {
      ...state,
      latestEvent: event,
    };

    // Update progress from event
    if (event.progress) {
      updatedState.currentProgress = event.progress.percentage;
    }

    // Clear activeJobId if job is done
    if (event.type === 'job-completed' || event.type === 'job-failed') {
      updatedState.activeJobId = null;
    }

    return updatedState;
  }),

  on(BuildJobsActions.updateJobFromEvent, (state, { jobId, updates }) =>
    buildJobsAdapter.updateOne({ id: jobId, changes: updates }, state),
  ),

  on(BuildJobsActions.updateStepFromEvent, (state, { stepId, updates }) => ({
    ...state,
    steps: state.steps.map((step) =>
      step.id === stepId ? { ...step, ...updates } : step,
    ),
  })),

  // Clear state
  on(BuildJobsActions.clearBuildJobs, () => initialBuildJobsState),
);

// --- Feature (selectors included) ---
export const buildJobsFeature = createFeature({
  name: BUILD_JOBS_FEATURE_KEY,
  reducer: buildJobsReducer,
  extraSelectors: ({ selectBuildJobsState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      buildJobsAdapter.getSelectors(selectBuildJobsState);

    const selectActiveJobId = createSelector(
      selectBuildJobsState,
      (s) => s.activeJobId,
    );

    const selectActiveJob = createSelector(
      selectEntities,
      selectActiveJobId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    const selectSteps = createSelector(
      selectBuildJobsState,
      (s) => s.steps,
    );

    const selectCurrentProgress = createSelector(
      selectBuildJobsState,
      (s) => s.currentProgress,
    );

    const selectLatestEvent = createSelector(
      selectBuildJobsState,
      (s) => s.latestEvent,
    );

    const selectIsRunning = createSelector(
      selectActiveJob,
      (job) => job?.status === 'running' || job?.status === 'pending',
    );

    return {
      // Adapter-powered
      selectAllBuildJobs: selectAll,
      selectBuildJobEntities: selectEntities,
      selectBuildJobIds: selectIds,
      selectBuildJobsTotal: selectTotal,

      // Additional
      selectBuildJobsLoading: createSelector(
        selectBuildJobsState,
        (s) => s.loading,
      ),
      selectBuildJobsError: createSelector(
        selectBuildJobsState,
        (s) => s.error,
      ),
      selectActiveJobId,
      selectActiveJob,
      selectSteps,
      selectCurrentProgress,
      selectLatestEvent,
      selectIsRunning,
    };
  },
});

// Optional re-exports for convenience
export const {
  selectAllBuildJobs,
  selectBuildJobEntities,
  selectBuildJobIds,
  selectBuildJobsTotal,
  selectBuildJobsLoading,
  selectBuildJobsError,
  selectActiveJobId,
  selectActiveJob,
  selectSteps,
  selectCurrentProgress,
  selectLatestEvent,
  selectIsRunning,
} = buildJobsFeature;
