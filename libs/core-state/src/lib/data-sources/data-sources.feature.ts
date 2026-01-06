import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { DataSource } from '@kasita/common-models';
import { DataSourcesActions } from './data-sources.actions';

export const DATA_SOURCES_FEATURE_KEY = 'dataSources';

// --- State & Adapter ---
export interface DataSourcesState extends EntityState<DataSource> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
}

export const dataSourcesAdapter: EntityAdapter<DataSource> =
  createEntityAdapter<DataSource>();

export const initialDataSourcesState: DataSourcesState =
  dataSourcesAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
  });

// --- Helper Functions ---
const onFailure = (
  state: DataSourcesState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
});

const dataSourcesReducer = createReducer(
  initialDataSourcesState,

  // Load flags
  on(DataSourcesActions.loadDataSources, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(DataSourcesActions.loadDataSource, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // Selection / Reset
  on(DataSourcesActions.selectDataSource, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(DataSourcesActions.resetSelectedDataSource, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(DataSourcesActions.resetDataSources, (state) =>
    dataSourcesAdapter.removeAll({
      ...state,
      selectedId: null,
      loaded: false,
    }),
  ),

  // CRUD Success
  on(
    DataSourcesActions.loadDataSourcesSuccess,
    (state, { dataSources }) =>
      dataSourcesAdapter.setAll(dataSources, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(DataSourcesActions.loadDataSourceSuccess, (state, { dataSource }) =>
    dataSourcesAdapter.upsertOne(dataSource, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),
  on(
    DataSourcesActions.createDataSourceSuccess,
    (state, { dataSource }) =>
      dataSourcesAdapter.addOne(dataSource, { ...state, error: null }),
  ),
  on(
    DataSourcesActions.updateDataSourceSuccess,
    (state, { dataSource }) =>
      dataSourcesAdapter.updateOne(
        { id: dataSource.id ?? '', changes: dataSource },
        { ...state, error: null },
      ),
  ),
  on(
    DataSourcesActions.deleteDataSourceSuccess,
    (state, { dataSource }) =>
      dataSourcesAdapter.removeOne(dataSource?.id ?? '', {
        ...state,
        error: null,
      }),
  ),

  // Failures (deduped)
  on(
    DataSourcesActions.loadDataSourcesFailure,
    DataSourcesActions.loadDataSourceFailure,
    DataSourcesActions.createDataSourceFailure,
    DataSourcesActions.updateDataSourceFailure,
    DataSourcesActions.deleteDataSourceFailure,
    onFailure,
  ),
);

// --- Feature (selectors included) ---
export const dataSourcesFeature = createFeature({
  name: DATA_SOURCES_FEATURE_KEY,
  reducer: dataSourcesReducer,
  extraSelectors: ({ selectDataSourcesState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      dataSourcesAdapter.getSelectors(selectDataSourcesState);

    const selectSelectedId = createSelector(
      selectDataSourcesState,
      (s) => s.selectedId,
    );

    const selectSelectedDataSource = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    return {
      // Adapter-powered
      selectAllDataSources: selectAll,
      selectDataSourceEntities: selectEntities,
      selectDataSourceIds: selectIds,
      selectDataSourcesTotal: selectTotal,

      // Additional
      selectDataSourcesLoaded: createSelector(
        selectDataSourcesState,
        (s) => s.loaded,
      ),
      selectDataSourcesError: createSelector(
        selectDataSourcesState,
        (s) => s.error,
      ),
      selectSelectedId,
      selectSelectedDataSource,
    };
  },
});

// Optional re-exports for convenience
export const {
  selectAllDataSources,
  selectDataSourceEntities,
  selectDataSourceIds,
  selectDataSourcesTotal,
  selectDataSourcesLoaded,
  selectDataSourcesError,
  selectSelectedId,
  selectSelectedDataSource,
} = dataSourcesFeature;

