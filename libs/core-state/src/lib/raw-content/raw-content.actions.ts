import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { RawContent } from '@kasita/common-models';

export const RawContentActions = createActionGroup({
  source: 'RawContent API',
  events: {
    'Select RawContent': props<{ selectedId: string }>(),
    'Reset Selected RawContent': emptyProps(),
    'Reset RawContent': emptyProps(),
    'Load RawContent': emptyProps(),
    'Load RawContent Success': props<{ rawContent: RawContent[] }>(),
    'Load RawContent Failure': props<{ error: string | null }>(),
    'Load RawContent By Path': props<{ pathId: string }>(),
    'Load RawContent By Path Success': props<{ rawContent: RawContent[] }>(),
    'Load RawContent By Path Failure': props<{ error: string | null }>(),
    'Load RawContent Item': props<{ rawContentId: string }>(),
    'Load RawContent Item Success': props<{ rawContent: RawContent }>(),
    'Load RawContent Item Failure': props<{ error: string | null }>(),
    'Create RawContent': props<{ rawContent: RawContent }>(),
    'Create RawContent Success': props<{ rawContent: RawContent }>(),
    'Create RawContent Failure': props<{ error: string | null }>(),
    'Update RawContent': props<{ rawContent: RawContent }>(),
    'Update RawContent Success': props<{ rawContent: RawContent }>(),
    'Update RawContent Failure': props<{ error: string | null }>(),
    'Delete RawContent': props<{ rawContent: RawContent }>(),
    'Delete RawContent Success': props<{ rawContent: RawContent }>(),
    'Delete RawContent Failure': props<{ error: string | null }>(),
    'Delete RawContent Cancelled': emptyProps(),
    'Upsert RawContent': props<{ rawContent: RawContent }>(),
    'Upsert RawContent Success': props<{ rawContent: RawContent }>(),
    'Upsert RawContent Failure': props<{ error: string | null }>(),
  },
});
