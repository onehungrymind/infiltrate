import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { UserProgress } from '@kasita/common-models';
import { UserProgressActions } from './user-progress.actions';

export const USER_PROGRESS_FEATURE_KEY = 'userProgress';

// --- State & Adapter ---
export interface UserProgressState extends EntityState<UserProgress> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
}

export const userProgressAdapter: EntityAdapter<UserProgress> =
  createEntityAdapter<UserProgress>();

export const initialUserProgressState: UserProgressState =
  userProgressAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
  });

// --- Helper Functions ---
const onFailure = (
  state: UserProgressState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
});

const userProgressReducer = createReducer(
  initialUserProgressState,

  // Load flags
  on(UserProgressActions.loadUserProgress, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(UserProgressActions.loadUserProgress, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // Selection / Reset
  on(UserProgressActions.selectUserProgress, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(UserProgressActions.resetSelectedUserProgress, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(UserProgressActions.resetUserProgress, (state) =>
    userProgressAdapter.removeAll({
      ...state,
      selectedId: null,
      loaded: false,
    }),
  ),

  // CRUD Success
  on(UserProgressActions.loadUserProgressSuccess, (state, { userProgress }) =>
    userProgressAdapter.setAll(userProgress, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),
  on(UserProgressActions.loadUserProgressSuccess, (state, { userProgress }) =>
    userProgressAdapter.upsertOne(userProgress, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),
  on(UserProgressActions.createUserProgressSuccess, (state, { userProgress }) =>
    userProgressAdapter.addOne(userProgress, { ...state, error: null }),
  ),
  on(UserProgressActions.updateUserProgressSuccess, (state, { userProgress }) =>
    userProgressAdapter.updateOne(
      { id: userProgress.id ?? '', changes: userProgress },
      { ...state, error: null },
    ),
  ),
  on(UserProgressActions.deleteUserProgressSuccess, (state, { userProgress }) =>
    userProgressAdapter.removeOne(userProgress?.id ?? '', {
      ...state,
      error: null,
    }),
  ),

  // Failures (deduped)
  on(
    UserProgressActions.loadUserProgressFailure,
    UserProgressActions.loadUserProgressFailure,
    UserProgressActions.createUserProgressFailure,
    UserProgressActions.updateUserProgressFailure,
    UserProgressActions.deleteUserProgressFailure,
    onFailure,
  ),
);

// --- Feature (selectors included) ---
export const userProgressFeature = createFeature({
  name: USER_PROGRESS_FEATURE_KEY,
  reducer: userProgressReducer,
  extraSelectors: ({ selectUserProgressState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      userProgressAdapter.getSelectors(selectUserProgressState);

    const selectSelectedId = createSelector(
      selectUserProgressState,
      (s) => s.selectedId,
    );

    const selectSelectedUserProgress = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    return {
      // Adapter-powered
      selectAllUserProgress: selectAll,
      selectUserProgressEntities: selectEntities,
      selectUserProgressIds: selectIds,
      selectUserProgressTotal: selectTotal,

      // Additional
      selectUserProgressLoaded: createSelector(
        selectUserProgressState,
        (s) => s.loaded,
      ),
      selectUserProgressError: createSelector(
        selectUserProgressState,
        (s) => s.error,
      ),
      selectSelectedId,
      selectSelectedUserProgress,
    };
  },
});

// Optional re-exports for convenience
export const {
  selectAllUserProgress,
  selectUserProgressEntities,
  selectUserProgressIds,
  selectUserProgressTotal,
  selectUserProgressLoaded,
  selectUserProgressError,
  selectSelectedId,
  selectSelectedUserProgress,
} = userProgressFeature;
