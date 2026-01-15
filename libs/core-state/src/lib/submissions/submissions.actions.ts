import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Submission, Feedback } from '@kasita/common-models';

export const SubmissionsActions = createActionGroup({
  source: 'Submissions API',
  events: {
    'Select Submission': props<{ selectedId: string }>(),
    'Reset Selected Submission': emptyProps(),
    'Reset Submissions': emptyProps(),

    // Load all
    'Load Submissions': emptyProps(),
    'Load Submissions Success': props<{ submissions: Submission[] }>(),
    'Load Submissions Failure': props<{ error: string | null }>(),

    // Load single
    'Load Submission': props<{ submissionId: string }>(),
    'Load Submission Success': props<{ submission: Submission }>(),
    'Load Submission Failure': props<{ error: string | null }>(),

    // Load by filters
    'Load Submissions By User': props<{ userId: string }>(),
    'Load Submissions By User Success': props<{ submissions: Submission[] }>(),
    'Load Submissions By User Failure': props<{ error: string | null }>(),

    'Load Submissions By Unit': props<{ unitId: string }>(),
    'Load Submissions By Unit Success': props<{ submissions: Submission[] }>(),
    'Load Submissions By Unit Failure': props<{ error: string | null }>(),

    'Load Submissions By Path': props<{ pathId: string }>(),
    'Load Submissions By Path Success': props<{ submissions: Submission[] }>(),
    'Load Submissions By Path Failure': props<{ error: string | null }>(),

    // CRUD
    'Create Submission': props<{ submission: Submission }>(),
    'Create Submission Success': props<{ submission: Submission }>(),
    'Create Submission Failure': props<{ error: string | null }>(),

    'Update Submission': props<{ submission: Submission }>(),
    'Update Submission Success': props<{ submission: Submission }>(),
    'Update Submission Failure': props<{ error: string | null }>(),

    'Delete Submission': props<{ submission: Submission }>(),
    'Delete Submission Success': props<{ submission: Submission }>(),
    'Delete Submission Failure': props<{ error: string | null }>(),
    'Delete Submission Cancelled': emptyProps(),

    // Domain actions
    'Submit For Review': props<{ submissionId: string }>(),
    'Submit For Review Success': props<{ submission: Submission }>(),
    'Submit For Review Failure': props<{ error: string | null }>(),

    'Request AI Feedback': props<{ submissionId: string; rubricCriteria?: string[] }>(),
    'Request AI Feedback Success': props<{ feedback: Feedback; submission: Submission }>(),
    'Request AI Feedback Failure': props<{ error: string | null }>(),

    // Feedback
    'Load Feedback': props<{ submissionId: string }>(),
    'Load Feedback Success': props<{ submissionId: string; feedback: Feedback[] }>(),
    'Load Feedback Failure': props<{ error: string | null }>(),
  },
});
