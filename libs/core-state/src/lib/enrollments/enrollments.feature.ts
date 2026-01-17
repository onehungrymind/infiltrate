import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Enrollment } from '@kasita/common-models';
import { EnrollmentsActions } from './enrollments.actions';

export const ENROLLMENTS_FEATURE_KEY = 'enrollments';

// --- State & Adapter ---
export interface EnrollmentsState extends EntityState<Enrollment> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
  currentEnrollmentCheck: {
    isEnrolled: boolean;
    enrollment: Enrollment | null;
  } | null;
  leaderboardByPathId: Record<string, any[]>;
}

export const enrollmentsAdapter: EntityAdapter<Enrollment> =
  createEntityAdapter<Enrollment>();

export const initialEnrollmentsState: EnrollmentsState =
  enrollmentsAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
    currentEnrollmentCheck: null,
    leaderboardByPathId: {},
  });

// --- Helper Functions ---
const onFailure = (
  state: EnrollmentsState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
});

const enrollmentsReducer = createReducer(
  initialEnrollmentsState,

  // Load flags
  on(EnrollmentsActions.loadEnrollments, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(EnrollmentsActions.loadEnrollmentsByUser, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(EnrollmentsActions.loadEnrollmentsByPath, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // Selection / Reset
  on(EnrollmentsActions.selectEnrollment, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(EnrollmentsActions.resetSelectedEnrollment, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(EnrollmentsActions.resetEnrollments, (state) =>
    enrollmentsAdapter.removeAll({
      ...state,
      selectedId: null,
      loaded: false,
      currentEnrollmentCheck: null,
    }),
  ),

  // Load Success
  on(
    EnrollmentsActions.loadEnrollmentsSuccess,
    (state, { enrollments }) =>
      enrollmentsAdapter.setAll(enrollments, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    EnrollmentsActions.loadEnrollmentsByUserSuccess,
    (state, { enrollments }) =>
      enrollmentsAdapter.setAll(enrollments, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    EnrollmentsActions.loadEnrollmentsByPathSuccess,
    (state, { enrollments }) =>
      enrollmentsAdapter.setAll(enrollments, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),

  // Check enrollment
  on(EnrollmentsActions.checkEnrollmentSuccess, (state, { isEnrolled, enrollment }) => ({
    ...state,
    currentEnrollmentCheck: { isEnrolled, enrollment },
  })),

  // Enroll success
  on(
    EnrollmentsActions.enrollSuccess,
    (state, { enrollment }) =>
      enrollmentsAdapter.addOne(enrollment, { ...state, error: null }),
  ),

  // Update success
  on(
    EnrollmentsActions.updateEnrollmentSuccess,
    (state, { enrollment }) =>
      enrollmentsAdapter.updateOne(
        { id: enrollment.id ?? '', changes: enrollment },
        { ...state, error: null },
      ),
  ),

  // Unenroll success - remove from entity state
  on(
    EnrollmentsActions.unenrollSuccess,
    (state, { userId, pathId }) => {
      const enrollmentToRemove = Object.values(state.entities).find(
        (e) => e?.userId === userId && e?.pathId === pathId
      );
      if (enrollmentToRemove) {
        return enrollmentsAdapter.removeOne(enrollmentToRemove.id, {
          ...state,
          error: null,
        });
      }
      return state;
    },
  ),

  // Leaderboard
  on(
    EnrollmentsActions.loadLeaderboardSuccess,
    (state, { pathId, leaderboard }) => ({
      ...state,
      leaderboardByPathId: {
        ...state.leaderboardByPathId,
        [pathId]: leaderboard,
      },
    }),
  ),

  // Failures
  on(
    EnrollmentsActions.loadEnrollmentsFailure,
    EnrollmentsActions.loadEnrollmentsByUserFailure,
    EnrollmentsActions.loadEnrollmentsByPathFailure,
    EnrollmentsActions.checkEnrollmentFailure,
    EnrollmentsActions.enrollFailure,
    EnrollmentsActions.updateEnrollmentFailure,
    EnrollmentsActions.unenrollFailure,
    EnrollmentsActions.loadLeaderboardFailure,
    onFailure,
  ),
);

// --- Feature (selectors included) ---
export const enrollmentsFeature = createFeature({
  name: ENROLLMENTS_FEATURE_KEY,
  reducer: enrollmentsReducer,
  extraSelectors: ({ selectEnrollmentsState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      enrollmentsAdapter.getSelectors(selectEnrollmentsState);

    const selectSelectedId = createSelector(
      selectEnrollmentsState,
      (s) => s.selectedId,
    );

    const selectSelectedEnrollment = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    const selectEnrollmentsByUserId = (userId: string) =>
      createSelector(selectAll, (enrollments) =>
        enrollments.filter((e) => e.userId === userId),
      );

    const selectEnrollmentsByPathId = (pathId: string) =>
      createSelector(selectAll, (enrollments) =>
        enrollments.filter((e) => e.pathId === pathId),
      );

    const selectActiveEnrollmentsByPathId = (pathId: string) =>
      createSelector(selectAll, (enrollments) =>
        enrollments.filter((e) => e.pathId === pathId && e.status === 'active'),
      );

    const selectCurrentEnrollmentCheck = createSelector(
      selectEnrollmentsState,
      (s) => s.currentEnrollmentCheck,
    );

    const selectLeaderboardByPathId = createSelector(
      selectEnrollmentsState,
      (s) => s.leaderboardByPathId,
    );

    const selectLeaderboardForPath = (pathId: string) =>
      createSelector(
        selectLeaderboardByPathId,
        (leaderboards) => leaderboards[pathId] || [],
      );

    return {
      // Adapter-powered
      selectAllEnrollments: selectAll,
      selectEnrollmentEntities: selectEntities,
      selectEnrollmentIds: selectIds,
      selectEnrollmentsTotal: selectTotal,

      // Additional
      selectEnrollmentsLoaded: createSelector(
        selectEnrollmentsState,
        (s) => s.loaded,
      ),
      selectEnrollmentsError: createSelector(
        selectEnrollmentsState,
        (s) => s.error,
      ),
      selectSelectedId,
      selectSelectedEnrollment,
      selectEnrollmentsByUserId,
      selectEnrollmentsByPathId,
      selectActiveEnrollmentsByPathId,
      selectCurrentEnrollmentCheck,
      selectLeaderboardByPathId,
      selectLeaderboardForPath,
    };
  },
});

// Optional re-exports for convenience
export const {
  selectAllEnrollments,
  selectEnrollmentEntities,
  selectEnrollmentIds,
  selectEnrollmentsTotal,
  selectEnrollmentsLoaded,
  selectEnrollmentsError,
  selectSelectedId,
  selectSelectedEnrollment,
  selectEnrollmentsByUserId,
  selectEnrollmentsByPathId,
  selectActiveEnrollmentsByPathId,
  selectCurrentEnrollmentCheck,
  selectLeaderboardByPathId,
  selectLeaderboardForPath,
} = enrollmentsFeature;
