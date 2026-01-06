import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { LearningPath } from '@kasita/common-models';
import { LearningPathsActions } from './learning-paths.actions';

export const LEARNING_PATHS_FEATURE_KEY = 'learningPaths';

// --- State & Adapter ---
export interface LearningPathsState extends EntityState<LearningPath> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
}

export const learningPathsAdapter: EntityAdapter<LearningPath> =
  createEntityAdapter<LearningPath>();

export const initialLearningPathsState: LearningPathsState =
  learningPathsAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
  });

// --- Helper Functions ---
const onFailure = (
  state: LearningPathsState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
});

const learningPathsReducer = createReducer(
  initialLearningPathsState,

  // Load flags
  on(LearningPathsActions.loadLearningPaths, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(LearningPathsActions.loadLearningPath, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // Selection / Reset
  on(LearningPathsActions.selectLearningPath, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(LearningPathsActions.resetSelectedLearningPath, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(LearningPathsActions.resetLearningPaths, (state) =>
    learningPathsAdapter.removeAll({
      ...state,
      selectedId: null,
      loaded: false,
    }),
  ),

  // CRUD Success
  on(
    LearningPathsActions.loadLearningPathsSuccess,
    (state, { learningPaths }) =>
      learningPathsAdapter.setAll(learningPaths, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(LearningPathsActions.loadLearningPathSuccess, (state, { learningPath }) =>
    learningPathsAdapter.upsertOne(learningPath, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),
  on(
    LearningPathsActions.createLearningPathSuccess,
    (state, { learningPath }) =>
      learningPathsAdapter.addOne(learningPath, { ...state, error: null }),
  ),
  on(
    LearningPathsActions.updateLearningPathSuccess,
    (state, { learningPath }) =>
      learningPathsAdapter.updateOne(
        { id: learningPath.id ?? '', changes: learningPath },
        { ...state, error: null },
      ),
  ),
  on(
    LearningPathsActions.deleteLearningPathSuccess,
    (state, { learningPath }) =>
      learningPathsAdapter.removeOne(learningPath?.id ?? '', {
        ...state,
        error: null,
      }),
  ),

  // Failures (deduped)
  on(
    LearningPathsActions.loadLearningPathsFailure,
    LearningPathsActions.loadLearningPathFailure,
    LearningPathsActions.createLearningPathFailure,
    LearningPathsActions.updateLearningPathFailure,
    LearningPathsActions.deleteLearningPathFailure,
    onFailure,
  ),
);

// --- Feature (selectors included) ---
export const learningPathsFeature = createFeature({
  name: LEARNING_PATHS_FEATURE_KEY,
  reducer: learningPathsReducer,
  extraSelectors: ({ selectLearningPathsState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      learningPathsAdapter.getSelectors(selectLearningPathsState);

    const selectSelectedId = createSelector(
      selectLearningPathsState,
      (s) => s.selectedId,
    );

    const selectSelectedLearningPath = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    return {
      // Adapter-powered
      selectAllLearningPaths: selectAll,
      selectLearningPathEntities: selectEntities,
      selectLearningPathIds: selectIds,
      selectLearningPathsTotal: selectTotal,

      // Additional
      selectLearningPathsLoaded: createSelector(
        selectLearningPathsState,
        (s) => s.loaded,
      ),
      selectLearningPathsError: createSelector(
        selectLearningPathsState,
        (s) => s.error,
      ),
      selectSelectedId,
      selectSelectedLearningPath,
    };
  },
});

// Optional re-exports for convenience
export const {
  selectAllLearningPaths,
  selectLearningPathEntities,
  selectLearningPathIds,
  selectLearningPathsTotal,
  selectLearningPathsLoaded,
  selectLearningPathsError,
  selectSelectedId,
  selectSelectedLearningPath,
} = learningPathsFeature;
