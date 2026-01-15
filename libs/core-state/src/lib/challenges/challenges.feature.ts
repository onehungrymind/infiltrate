import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Challenge } from '@kasita/common-models';
import { ChallengesActions } from './challenges.actions';

export const CHALLENGES_FEATURE_KEY = 'challenges';

export interface ChallengesState extends EntityState<Challenge> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
}

export const challengesAdapter: EntityAdapter<Challenge> =
  createEntityAdapter<Challenge>();

export const initialChallengesState: ChallengesState =
  challengesAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
  });

const onFailure = (
  state: ChallengesState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
});

const challengesReducer = createReducer(
  initialChallengesState,

  // Load flags
  on(ChallengesActions.loadChallenges, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(ChallengesActions.loadChallenge, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(ChallengesActions.loadChallengesByUnit, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // Selection / Reset
  on(ChallengesActions.selectChallenge, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(ChallengesActions.resetSelectedChallenge, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(ChallengesActions.resetChallenges, (state) =>
    challengesAdapter.removeAll({
      ...state,
      selectedId: null,
      loaded: false,
    }),
  ),

  // Load Success
  on(ChallengesActions.loadChallengesSuccess, (state, { challenges }) =>
    challengesAdapter.setAll(challenges, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),
  on(ChallengesActions.loadChallengesByUnitSuccess, (state, { challenges }) =>
    challengesAdapter.setAll(challenges, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),
  on(ChallengesActions.loadChallengeSuccess, (state, { challenge }) =>
    challengesAdapter.upsertOne(challenge, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),

  // CRUD Success
  on(ChallengesActions.createChallengeSuccess, (state, { challenge }) =>
    challengesAdapter.addOne(challenge, { ...state, error: null }),
  ),
  on(ChallengesActions.updateChallengeSuccess, (state, { challenge }) =>
    challengesAdapter.updateOne(
      { id: challenge.id ?? '', changes: challenge },
      { ...state, error: null },
    ),
  ),
  on(ChallengesActions.deleteChallengeSuccess, (state, { challenge }) =>
    challengesAdapter.removeOne(challenge?.id ?? '', {
      ...state,
      error: null,
    }),
  ),

  // Failures
  on(
    ChallengesActions.loadChallengesFailure,
    ChallengesActions.loadChallengeFailure,
    ChallengesActions.loadChallengesByUnitFailure,
    ChallengesActions.createChallengeFailure,
    ChallengesActions.updateChallengeFailure,
    ChallengesActions.deleteChallengeFailure,
    onFailure,
  ),
);

export const challengesFeature = createFeature({
  name: CHALLENGES_FEATURE_KEY,
  reducer: challengesReducer,
  extraSelectors: ({ selectChallengesState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      challengesAdapter.getSelectors(selectChallengesState);

    const selectSelectedId = createSelector(
      selectChallengesState,
      (s) => s.selectedId,
    );

    const selectSelectedChallenge = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    const selectChallengesByUnitId = (unitId: string) =>
      createSelector(selectAll, (challenges) =>
        challenges.filter((c) => c.unitId === unitId),
      );

    return {
      selectAllChallenges: selectAll,
      selectChallengeEntities: selectEntities,
      selectChallengeIds: selectIds,
      selectChallengesTotal: selectTotal,
      selectChallengesLoaded: createSelector(
        selectChallengesState,
        (s) => s.loaded,
      ),
      selectChallengesError: createSelector(
        selectChallengesState,
        (s) => s.error,
      ),
      selectSelectedId,
      selectSelectedChallenge,
      selectChallengesByUnitId,
    };
  },
});

export const {
  selectAllChallenges,
  selectChallengeEntities,
  selectChallengeIds,
  selectChallengesTotal,
  selectChallengesLoaded,
  selectChallengesError,
  selectSelectedId,
  selectSelectedChallenge,
  selectChallengesByUnitId,
} = challengesFeature;
