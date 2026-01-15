import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Challenge } from '@kasita/common-models';

export const ChallengesActions = createActionGroup({
  source: 'Challenges API',
  events: {
    'Select Challenge': props<{ selectedId: string }>(),
    'Reset Selected Challenge': emptyProps(),
    'Reset Challenges': emptyProps(),

    // Load all
    'Load Challenges': emptyProps(),
    'Load Challenges Success': props<{ challenges: Challenge[] }>(),
    'Load Challenges Failure': props<{ error: string | null }>(),

    // Load single
    'Load Challenge': props<{ challengeId: string }>(),
    'Load Challenge Success': props<{ challenge: Challenge }>(),
    'Load Challenge Failure': props<{ error: string | null }>(),

    // Load by unit
    'Load Challenges By Unit': props<{ unitId: string }>(),
    'Load Challenges By Unit Success': props<{ challenges: Challenge[] }>(),
    'Load Challenges By Unit Failure': props<{ error: string | null }>(),

    // CRUD
    'Create Challenge': props<{ challenge: Challenge }>(),
    'Create Challenge Success': props<{ challenge: Challenge }>(),
    'Create Challenge Failure': props<{ error: string | null }>(),

    'Update Challenge': props<{ challenge: Challenge }>(),
    'Update Challenge Success': props<{ challenge: Challenge }>(),
    'Update Challenge Failure': props<{ error: string | null }>(),

    'Delete Challenge': props<{ challenge: Challenge }>(),
    'Delete Challenge Success': props<{ challenge: Challenge }>(),
    'Delete Challenge Failure': props<{ error: string | null }>(),
  },
});
