import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { KnowledgeUnit } from '@kasita/common-models';

export const KnowledgeUnitsActions = createActionGroup({
  source: 'KnowledgeUnits API',
  events: {
    'Select KnowledgeUnit': props<{ selectedId: string }>(),
    'Reset Selected KnowledgeUnit': emptyProps(),
    'Reset KnowledgeUnits': emptyProps(),
    'Load KnowledgeUnits': emptyProps(),
    'Load KnowledgeUnits Success': props<{ knowledgeUnits: KnowledgeUnit[] }>(),
    'Load KnowledgeUnits Failure': props<{ error: string | null }>(),
    'Load KnowledgeUnit': props<{ knowledgeUnitId: string }>(),
    'Load KnowledgeUnit Success': props<{ knowledgeUnit: KnowledgeUnit }>(),
    'Load KnowledgeUnit Failure': props<{ error: string | null }>(),
    'Create KnowledgeUnit': props<{ knowledgeUnit: KnowledgeUnit }>(),
    'Create KnowledgeUnit Success': props<{ knowledgeUnit: KnowledgeUnit }>(),
    'Create KnowledgeUnit Failure': props<{ error: string | null }>(),
    'Update KnowledgeUnit': props<{ knowledgeUnit: KnowledgeUnit }>(),
    'Update KnowledgeUnit Success': props<{ knowledgeUnit: KnowledgeUnit }>(),
    'Update KnowledgeUnit Failure': props<{ error: string | null }>(),
    'Delete KnowledgeUnit': props<{ knowledgeUnit: KnowledgeUnit }>(),
    'Delete KnowledgeUnit Success': props<{ knowledgeUnit: KnowledgeUnit }>(),
    'Delete KnowledgeUnit Failure': props<{ error: string | null }>(),
    'Delete KnowledgeUnit Cancelled': emptyProps(),
    'Upsert KnowledgeUnit': props<{ knowledgeUnit: KnowledgeUnit }>(),
    'Upsert KnowledgeUnit Success': props<{ knowledgeUnit: KnowledgeUnit }>(),
    'Upsert KnowledgeUnit Failure': props<{ error: string | null }>(),
  },
});
