import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DataSource } from '@kasita/common-models';

export const DataSourcesActions = createActionGroup({
  source: 'DataSources API',
  events: {
    'Select DataSource': props<{ selectedId: string }>(),
    'Reset Selected DataSource': emptyProps(),
    'Reset DataSources': emptyProps(),
    'Load DataSources': emptyProps(),
    'Load DataSources Success': props<{ dataSources: DataSource[] }>(),
    'Load DataSources Failure': props<{ error: string | null }>(),
    'Load DataSource': props<{ dataSourceId: string }>(),
    'Load DataSource Success': props<{ dataSource: DataSource }>(),
    'Load DataSource Failure': props<{ error: string | null }>(),
    'Create DataSource': props<{ dataSource: DataSource }>(),
    'Create DataSource Success': props<{ dataSource: DataSource }>(),
    'Create DataSource Failure': props<{ error: string | null }>(),
    'Update DataSource': props<{ dataSource: DataSource }>(),
    'Update DataSource Success': props<{ dataSource: DataSource }>(),
    'Update DataSource Failure': props<{ error: string | null }>(),
    'Delete DataSource': props<{ dataSource: DataSource }>(),
    'Delete DataSource Success': props<{ dataSource: DataSource }>(),
    'Delete DataSource Failure': props<{ error: string | null }>(),
    'Delete DataSource Cancelled': emptyProps(),
    'Upsert DataSource': props<{ dataSource: DataSource }>(),
    'Upsert DataSource Success': props<{ dataSource: DataSource }>(),
    'Upsert DataSource Failure': props<{ error: string | null }>(),
  },
});

