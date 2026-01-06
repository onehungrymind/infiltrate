import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { <%= singularClassName %> } from '<%= npmScope %>/api-interfaces';

export const <%= pluralClassName %>Actions = createActionGroup({
  source: '<%= pluralClassName %> API',
  events: {
    'Select <%= singularClassName %>': props<{ selectedId: string }>(),
    'Reset Selected <%= singularClassName %>': emptyProps(),
    'Reset <%= pluralClassName %>': emptyProps(),
    'Load <%= pluralClassName %>': emptyProps(),
    'Load <%= pluralClassName %> Success': props<{ <%= pluralPropertyName %>: <%= singularClassName %>[] }>(),
    'Load <%= pluralClassName %> Failure': props<{ error: string | null }>(),
    'Load <%= singularClassName %>': props<{ <%= singularPropertyName %>Id: string }>(),
    'Load <%= singularClassName %> Success': props<{ <%= singularPropertyName %>: <%= singularClassName %> }>(),
    'Load <%= singularClassName %> Failure': props<{ error: string | null }>(),
    'Create <%= singularClassName %>': props<{ <%= singularPropertyName %>: <%= singularClassName %> }>(),
    'Create <%= singularClassName %> Success': props<{ <%= singularPropertyName %>: <%= singularClassName %> }>(),
    'Create <%= singularClassName %> Failure': props<{ error: string | null }>(),
    'Update <%= singularClassName %>': props<{ <%= singularPropertyName %>: <%= singularClassName %> }>(),
    'Update <%= singularClassName %> Success': props<{ <%= singularPropertyName %>: <%= singularClassName %> }>(),
    'Update <%= singularClassName %> Failure': props<{ error: string | null }>(),
    'Delete <%= singularClassName %>': props<{ <%= singularPropertyName %>: <%= singularClassName %> }>(),
    'Delete <%= singularClassName %> Success': props<{ <%= singularPropertyName %>: <%= singularClassName %> }>(),
    'Delete <%= singularClassName %> Failure': props<{ error: string | null }>(),
    'Delete <%= singularClassName %> Cancelled': emptyProps(),
    'Upsert <%= singularClassName %>': props<{ <%= singularPropertyName %>: <%= singularClassName %> }>(),
    'Upsert <%= singularClassName %> Success': props<{ <%= singularPropertyName %>: <%= singularClassName %> }>(),
    'Upsert <%= singularClassName %> Failure': props<{ error: string | null }>(),
  },
});