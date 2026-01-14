import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { UserProgress, StudyStats } from '@kasita/common-models';
import { UserProgressActions } from './user-progress.actions';

export const USER_PROGRESS_FEATURE_KEY = 'userProgress';

// --- State & Adapter ---
export interface UserProgressState extends EntityState<UserProgress> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
  // Study-related state
  dueForReview: UserProgress[];
  studyStats: StudyStats | null;
  studyLoading: boolean;
}

export const userProgressAdapter: EntityAdapter<UserProgress> =
  createEntityAdapter<UserProgress>();

export const initialUserProgressState: UserProgressState =
  userProgressAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
    dueForReview: [],
    studyStats: null,
    studyLoading: false,
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
  on(UserProgressActions.loadUserProgressItem, (state) => ({
    ...state,
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
  on(UserProgressActions.loadUserProgressItemSuccess, (state, { userProgress }) =>
    userProgressAdapter.upsertOne(userProgress, {
      ...state,
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

  // Study actions
  on(UserProgressActions.recordAttempt, (state) => ({
    ...state,
    studyLoading: true,
    error: null,
  })),
  on(UserProgressActions.recordAttemptSuccess, (state, { userProgress }) =>
    userProgressAdapter.upsertOne(userProgress, {
      ...state,
      studyLoading: false,
      error: null,
      // Update dueForReview list - remove this item if it was due
      dueForReview: state.dueForReview.filter((p) => p.id !== userProgress.id),
    }),
  ),
  on(UserProgressActions.loadDueForReview, (state) => ({
    ...state,
    studyLoading: true,
    error: null,
  })),
  on(UserProgressActions.loadDueForReviewSuccess, (state, { userProgress }) => ({
    ...state,
    dueForReview: userProgress,
    studyLoading: false,
    error: null,
  })),
  on(UserProgressActions.loadStudyStats, (state) => ({
    ...state,
    studyLoading: true,
    error: null,
  })),
  on(UserProgressActions.loadStudyStatsSuccess, (state, { stats }) => ({
    ...state,
    studyStats: stats,
    studyLoading: false,
    error: null,
  })),
  on(UserProgressActions.loadUserProgressByUser, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(UserProgressActions.loadUserProgressByUserSuccess, (state, { userProgress }) =>
    userProgressAdapter.setAll(userProgress, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),

  // Failures (deduped)
  on(
    UserProgressActions.loadUserProgressFailure,
    UserProgressActions.loadUserProgressItemFailure,
    UserProgressActions.createUserProgressFailure,
    UserProgressActions.updateUserProgressFailure,
    UserProgressActions.deleteUserProgressFailure,
    UserProgressActions.recordAttemptFailure,
    UserProgressActions.loadDueForReviewFailure,
    UserProgressActions.loadStudyStatsFailure,
    UserProgressActions.loadUserProgressByUserFailure,
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

      // Study selectors
      selectDueForReview: createSelector(
        selectUserProgressState,
        (s) => s.dueForReview,
      ),
      selectStudyStats: createSelector(
        selectUserProgressState,
        (s) => s.studyStats,
      ),
      selectStudyLoading: createSelector(
        selectUserProgressState,
        (s) => s.studyLoading,
      ),
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
  selectDueForReview,
  selectStudyStats,
  selectStudyLoading,
} = userProgressFeature;
