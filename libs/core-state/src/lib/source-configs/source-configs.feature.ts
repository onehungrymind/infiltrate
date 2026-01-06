import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { SourceConfig } from '@kasita/common-models';
import { SourceConfigsActions } from './source-configs.actions';

export const SOURCE_CONFIGS_FEATURE_KEY = 'sourceConfigs';

// --- State & Adapter ---
export interface SourceConfigsState extends EntityState<SourceConfig> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
}

export const sourceConfigsAdapter: EntityAdapter<SourceConfig> =
  createEntityAdapter<SourceConfig>();

export const initialSourceConfigsState: SourceConfigsState =
  sourceConfigsAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
  });

// --- Helper Functions ---
const onFailure = (
  state: SourceConfigsState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
});

const sourceConfigsReducer = createReducer(
  initialSourceConfigsState,

  // Load flags
  on(SourceConfigsActions.loadSourceConfigs, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(SourceConfigsActions.loadSourceConfig, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // Selection / Reset
  on(SourceConfigsActions.selectSourceConfig, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(SourceConfigsActions.resetSelectedSourceConfig, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(SourceConfigsActions.resetSourceConfigs, (state) =>
    sourceConfigsAdapter.removeAll({
      ...state,
      selectedId: null,
      loaded: false,
    }),
  ),

  // CRUD Success
  on(
    SourceConfigsActions.loadSourceConfigsSuccess,
    (state, { sourceConfigs }) =>
      sourceConfigsAdapter.setAll(sourceConfigs, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(SourceConfigsActions.loadSourceConfigSuccess, (state, { sourceConfig }) =>
    sourceConfigsAdapter.upsertOne(sourceConfig, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),
  on(
    SourceConfigsActions.createSourceConfigSuccess,
    (state, { sourceConfig }) =>
      sourceConfigsAdapter.addOne(sourceConfig, { ...state, error: null }),
  ),
  on(
    SourceConfigsActions.updateSourceConfigSuccess,
    (state, { sourceConfig }) =>
      sourceConfigsAdapter.updateOne(
        { id: sourceConfig.id ?? '', changes: sourceConfig },
        { ...state, error: null },
      ),
  ),
  on(
    SourceConfigsActions.deleteSourceConfigSuccess,
    (state, { sourceConfig }) =>
      sourceConfigsAdapter.removeOne(sourceConfig?.id ?? '', {
        ...state,
        error: null,
      }),
  ),

  // Failures (deduped)
  on(
    SourceConfigsActions.loadSourceConfigsFailure,
    SourceConfigsActions.loadSourceConfigFailure,
    SourceConfigsActions.createSourceConfigFailure,
    SourceConfigsActions.updateSourceConfigFailure,
    SourceConfigsActions.deleteSourceConfigFailure,
    onFailure,
  ),
);

// --- Feature (selectors included) ---
export const sourceConfigsFeature = createFeature({
  name: SOURCE_CONFIGS_FEATURE_KEY,
  reducer: sourceConfigsReducer,
  extraSelectors: ({ selectSourceConfigsState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      sourceConfigsAdapter.getSelectors(selectSourceConfigsState);

    const selectSelectedId = createSelector(
      selectSourceConfigsState,
      (s) => s.selectedId,
    );

    const selectSelectedSourceConfig = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    return {
      // Adapter-powered
      selectAllSourceConfigs: selectAll,
      selectSourceConfigEntities: selectEntities,
      selectSourceConfigIds: selectIds,
      selectSourceConfigsTotal: selectTotal,

      // Additional
      selectSourceConfigsLoaded: createSelector(
        selectSourceConfigsState,
        (s) => s.loaded,
      ),
      selectSourceConfigsError: createSelector(
        selectSourceConfigsState,
        (s) => s.error,
      ),
      selectSelectedId,
      selectSelectedSourceConfig,
    };
  },
});

// Optional re-exports for convenience
export const {
  selectAllSourceConfigs,
  selectSourceConfigEntities,
  selectSourceConfigIds,
  selectSourceConfigsTotal,
  selectSourceConfigsLoaded,
  selectSourceConfigsError,
  selectSelectedId,
  selectSelectedSourceConfig,
} = sourceConfigsFeature;
