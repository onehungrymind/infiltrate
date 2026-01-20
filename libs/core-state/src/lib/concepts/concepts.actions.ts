import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Concept } from '@kasita/common-models';

export const ConceptsActions = createActionGroup({
  source: 'Concepts API',
  events: {
    'Select Concept': props<{ selectedId: string }>(),
    'Reset Selected Concept': emptyProps(),
    'Reset Concepts': emptyProps(),
    'Load Concepts': emptyProps(),
    'Load Concepts Success': props<{ concepts: Concept[] }>(),
    'Load Concepts Failure': props<{ error: string | null }>(),
    'Load Concept': props<{ conceptId: string }>(),
    'Load Concept Success': props<{ concept: Concept }>(),
    'Load Concept Failure': props<{ error: string | null }>(),
    'Load Concepts By Path': props<{ pathId: string }>(),
    'Load Concepts By Path Success': props<{ concepts: Concept[] }>(),
    'Load Concepts By Path Failure': props<{ error: string | null }>(),
    'Create Concept': props<{ concept: Concept }>(),
    'Create Concept Success': props<{ concept: Concept }>(),
    'Create Concept Failure': props<{ error: string | null }>(),
    'Update Concept': props<{ concept: Concept }>(),
    'Update Concept Success': props<{ concept: Concept }>(),
    'Update Concept Failure': props<{ error: string | null }>(),
    'Delete Concept': props<{ concept: Concept }>(),
    'Delete Concept Success': props<{ concept: Concept }>(),
    'Delete Concept Failure': props<{ error: string | null }>(),
    'Delete Concept Cancelled': emptyProps(),
  },
});
