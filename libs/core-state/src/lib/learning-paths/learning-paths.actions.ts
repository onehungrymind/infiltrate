import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LearningPath } from '@kasita/common-models';

export const LearningPathsActions = createActionGroup({
  source: 'LearningPaths API',
  events: {
    'Select LearningPath': props<{ selectedId: string }>(),
    'Reset Selected LearningPath': emptyProps(),
    'Reset LearningPaths': emptyProps(),
    'Load LearningPaths': emptyProps(),
    'Load LearningPaths Success': props<{ learningPaths: LearningPath[] }>(),
    'Load LearningPaths Failure': props<{ error: string | null }>(),
    'Load LearningPath': props<{ learningPathId: string }>(),
    'Load LearningPath Success': props<{ learningPath: LearningPath }>(),
    'Load LearningPath Failure': props<{ error: string | null }>(),
    'Create LearningPath': props<{ learningPath: LearningPath }>(),
    'Create LearningPath Success': props<{ learningPath: LearningPath }>(),
    'Create LearningPath Failure': props<{ error: string | null }>(),
    'Update LearningPath': props<{ learningPath: LearningPath }>(),
    'Update LearningPath Success': props<{ learningPath: LearningPath }>(),
    'Update LearningPath Failure': props<{ error: string | null }>(),
    'Delete LearningPath': props<{ learningPath: LearningPath }>(),
    'Delete LearningPath Success': props<{ learningPath: LearningPath }>(),
    'Delete LearningPath Failure': props<{ error: string | null }>(),
    'Delete LearningPath Cancelled': emptyProps(),
    'Upsert LearningPath': props<{ learningPath: LearningPath }>(),
    'Upsert LearningPath Success': props<{ learningPath: LearningPath }>(),
    'Upsert LearningPath Failure': props<{ error: string | null }>(),
  },
});
