import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { SourceConfig } from '@kasita/common-models';

export const SourceConfigsActions = createActionGroup({
  source: 'SourceConfigs API',
  events: {
    'Select SourceConfig': props<{ selectedId: string }>(),
    'Reset Selected SourceConfig': emptyProps(),
    'Reset SourceConfigs': emptyProps(),
    'Load SourceConfigs': emptyProps(),
    'Load SourceConfigs Success': props<{ sourceConfigs: SourceConfig[] }>(),
    'Load SourceConfigs Failure': props<{ error: string | null }>(),
    'Load SourceConfig': props<{ sourceConfigId: string }>(),
    'Load SourceConfig Success': props<{ sourceConfig: SourceConfig }>(),
    'Load SourceConfig Failure': props<{ error: string | null }>(),
    'Create SourceConfig': props<{ sourceConfig: SourceConfig }>(),
    'Create SourceConfig Success': props<{ sourceConfig: SourceConfig }>(),
    'Create SourceConfig Failure': props<{ error: string | null }>(),
    'Update SourceConfig': props<{ sourceConfig: SourceConfig }>(),
    'Update SourceConfig Success': props<{ sourceConfig: SourceConfig }>(),
    'Update SourceConfig Failure': props<{ error: string | null }>(),
    'Delete SourceConfig': props<{ sourceConfig: SourceConfig }>(),
    'Delete SourceConfig Success': props<{ sourceConfig: SourceConfig }>(),
    'Delete SourceConfig Failure': props<{ error: string | null }>(),
    'Delete SourceConfig Cancelled': emptyProps(),
    'Upsert SourceConfig': props<{ sourceConfig: SourceConfig }>(),
    'Upsert SourceConfig Success': props<{ sourceConfig: SourceConfig }>(),
    'Upsert SourceConfig Failure': props<{ error: string | null }>(),
  },
});
