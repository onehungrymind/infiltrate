import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Principle } from '@kasita/common-models';

export const PrinciplesActions = createActionGroup({
  source: 'Principles API',
  events: {
    'Select Principle': props<{ selectedId: string }>(),
    'Reset Selected Principle': emptyProps(),
    'Reset Principles': emptyProps(),
    'Load Principles': emptyProps(),
    'Load Principles Success': props<{ principles: Principle[] }>(),
    'Load Principles Failure': props<{ error: string | null }>(),
    'Load Principle': props<{ principleId: string }>(),
    'Load Principle Success': props<{ principle: Principle }>(),
    'Load Principle Failure': props<{ error: string | null }>(),
    'Load Principles By Path': props<{ pathId: string }>(),
    'Load Principles By Path Success': props<{ principles: Principle[] }>(),
    'Load Principles By Path Failure': props<{ error: string | null }>(),
    'Create Principle': props<{ principle: Principle }>(),
    'Create Principle Success': props<{ principle: Principle }>(),
    'Create Principle Failure': props<{ error: string | null }>(),
    'Update Principle': props<{ principle: Principle }>(),
    'Update Principle Success': props<{ principle: Principle }>(),
    'Update Principle Failure': props<{ error: string | null }>(),
    'Delete Principle': props<{ principle: Principle }>(),
    'Delete Principle Success': props<{ principle: Principle }>(),
    'Delete Principle Failure': props<{ error: string | null }>(),
    'Delete Principle Cancelled': emptyProps(),
  },
});
