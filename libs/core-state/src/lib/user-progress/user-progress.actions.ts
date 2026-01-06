import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { UserProgress } from '@kasita/common-models';

export const UserProgressActions = createActionGroup({
  source: 'UserProgress API',
  events: {
    'Select UserProgress': props<{ selectedId: string }>(),
    'Reset Selected UserProgress': emptyProps(),
    'Reset UserProgress': emptyProps(),
    'Load UserProgress': emptyProps(),
    'Load UserProgress Success': props<{ userProgress: UserProgress[] }>(),
    'Load UserProgress Failure': props<{ error: string | null }>(),
    'Load UserProgress': props<{ userProgressId: string }>(),
    'Load UserProgress Success': props<{ userProgress: UserProgress }>(),
    'Load UserProgress Failure': props<{ error: string | null }>(),
    'Create UserProgress': props<{ userProgress: UserProgress }>(),
    'Create UserProgress Success': props<{ userProgress: UserProgress }>(),
    'Create UserProgress Failure': props<{ error: string | null }>(),
    'Update UserProgress': props<{ userProgress: UserProgress }>(),
    'Update UserProgress Success': props<{ userProgress: UserProgress }>(),
    'Update UserProgress Failure': props<{ error: string | null }>(),
    'Delete UserProgress': props<{ userProgress: UserProgress }>(),
    'Delete UserProgress Success': props<{ userProgress: UserProgress }>(),
    'Delete UserProgress Failure': props<{ error: string | null }>(),
    'Delete UserProgress Cancelled': emptyProps(),
    'Upsert UserProgress': props<{ userProgress: UserProgress }>(),
    'Upsert UserProgress Success': props<{ userProgress: UserProgress }>(),
    'Upsert UserProgress Failure': props<{ error: string | null }>(),
  },
});
