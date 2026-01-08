import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from '@kasita/common-models';

export const UsersActions = createActionGroup({
  source: 'Users API',
  events: {
    'Select User': props<{ selectedId: string }>(),
    'Reset Selected User': emptyProps(),
    'Reset Users': emptyProps(),
    'Load Users': emptyProps(),
    'Load Users Success': props<{ users: User[] }>(),
    'Load Users Failure': props<{ error: string | null }>(),
    'Load User': props<{ userId: string }>(),
    'Load User Success': props<{ user: User }>(),
    'Load User Failure': props<{ error: string | null }>(),
    'Create User': props<{ user: User }>(),
    'Create User Success': props<{ user: User }>(),
    'Create User Failure': props<{ error: string | null }>(),
    'Update User': props<{ user: User }>(),
    'Update User Success': props<{ user: User }>(),
    'Update User Failure': props<{ error: string | null }>(),
    'Delete User': props<{ user: User }>(),
    'Delete User Success': props<{ user: User }>(),
    'Delete User Failure': props<{ error: string | null }>(),
    'Delete User Cancelled': emptyProps(),
    'Upsert User': props<{ user: User }>(),
    'Upsert User Success': props<{ user: User }>(),
    'Upsert User Failure': props<{ error: string | null }>(),
  },
});
