import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { RawContent } from '@kasita/common-models';
import { RawContentActions } from './raw-content.actions';

export const RAW_CONTENT_FEATURE_KEY = 'rawContent';

// --- State & Adapter ---
export interface RawContentState extends EntityState<RawContent> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
}

export const rawContentAdapter: EntityAdapter<RawContent> =
  createEntityAdapter<RawContent>();

export const initialRawContentState: RawContentState =
  rawContentAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
  });

// --- Helper Functions ---
const onFailure = (
  state: RawContentState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
});

const rawContentReducer = createReducer(
  initialRawContentState,

  // Load flags
  on(RawContentActions.loadRawContent, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(RawContentActions.loadRawContent, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // Selection / Reset
  on(RawContentActions.selectRawContent, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(RawContentActions.resetSelectedRawContent, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(RawContentActions.resetRawContent, (state) =>
    rawContentAdapter.removeAll({ ...state, selectedId: null, loaded: false }),
  ),

  // CRUD Success
  on(RawContentActions.loadRawContentSuccess, (state, { rawContent }) =>
    rawContentAdapter.setAll(rawContent, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),
  on(RawContentActions.loadRawContentSuccess, (state, { rawContent }) =>
    rawContentAdapter.upsertOne(rawContent, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),
  on(RawContentActions.createRawContentSuccess, (state, { rawContent }) =>
    rawContentAdapter.addOne(rawContent, { ...state, error: null }),
  ),
  on(RawContentActions.updateRawContentSuccess, (state, { rawContent }) =>
    rawContentAdapter.updateOne(
      { id: rawContent.id ?? '', changes: rawContent },
      { ...state, error: null },
    ),
  ),
  on(RawContentActions.deleteRawContentSuccess, (state, { rawContent }) =>
    rawContentAdapter.removeOne(rawContent?.id ?? '', {
      ...state,
      error: null,
    }),
  ),

  // Failures (deduped)
  on(
    RawContentActions.loadRawContentFailure,
    RawContentActions.loadRawContentFailure,
    RawContentActions.createRawContentFailure,
    RawContentActions.updateRawContentFailure,
    RawContentActions.deleteRawContentFailure,
    onFailure,
  ),
);

// --- Feature (selectors included) ---
export const rawContentFeature = createFeature({
  name: RAW_CONTENT_FEATURE_KEY,
  reducer: rawContentReducer,
  extraSelectors: ({ selectRawContentState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      rawContentAdapter.getSelectors(selectRawContentState);

    const selectSelectedId = createSelector(
      selectRawContentState,
      (s) => s.selectedId,
    );

    const selectSelectedRawContent = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    return {
      // Adapter-powered
      selectAllRawContent: selectAll,
      selectRawContentEntities: selectEntities,
      selectRawContentIds: selectIds,
      selectRawContentTotal: selectTotal,

      // Additional
      selectRawContentLoaded: createSelector(
        selectRawContentState,
        (s) => s.loaded,
      ),
      selectRawContentError: createSelector(
        selectRawContentState,
        (s) => s.error,
      ),
      selectSelectedId,
      selectSelectedRawContent,
    };
  },
});

// Optional re-exports for convenience
export const {
  selectAllRawContent,
  selectRawContentEntities,
  selectRawContentIds,
  selectRawContentTotal,
  selectRawContentLoaded,
  selectRawContentError,
  selectSelectedId,
  selectSelectedRawContent,
} = rawContentFeature;
