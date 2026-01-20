import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { BuildJob, JobProgressEvent, JobStep } from '@kasita/common-models';

export const BuildJobsActions = createActionGroup({
  source: 'BuildJobs API',
  events: {
    // Create build job
    'Create Build Job': props<{ pathId: string }>(),
    'Create Build Job Success': props<{ buildJob: BuildJob }>(),
    'Create Build Job Failure': props<{ error: string | null }>(),

    // Load jobs for a path
    'Load Jobs By Path': props<{ pathId: string }>(),
    'Load Jobs By Path Success': props<{ buildJobs: BuildJob[] }>(),
    'Load Jobs By Path Failure': props<{ error: string | null }>(),

    // Load active job for a path
    'Load Active Job': props<{ pathId: string }>(),
    'Load Active Job Success': props<{ buildJob: BuildJob | null }>(),
    'Load Active Job Failure': props<{ error: string | null }>(),

    // Load job progress (with steps)
    'Load Job Progress': props<{ jobId: string }>(),
    'Load Job Progress Success': props<{ job: BuildJob; steps: JobStep[]; percentage: number }>(),
    'Load Job Progress Failure': props<{ error: string | null }>(),

    // Cancel job
    'Cancel Job': props<{ jobId: string }>(),
    'Cancel Job Success': props<{ buildJob: BuildJob }>(),
    'Cancel Job Failure': props<{ error: string | null }>(),

    // SSE events
    'Subscribe To Job Events': props<{ jobId: string }>(),
    'Unsubscribe From Job Events': emptyProps(),
    'Job Progress Event': props<{ event: JobProgressEvent }>(),

    // Update from SSE event
    'Update Job From Event': props<{ jobId: string; updates: Partial<BuildJob> }>(),
    'Update Step From Event': props<{ stepId: string; updates: Partial<JobStep> }>(),

    // Clear state
    'Clear Build Jobs': emptyProps(),
  },
});
