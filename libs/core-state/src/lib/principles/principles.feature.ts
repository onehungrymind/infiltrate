import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Principle } from '@kasita/common-models';
import { PrinciplesActions } from './principles.actions';

export const PRINCIPLES_FEATURE_KEY = 'principles';

// --- State & Adapter ---
export interface PrinciplesState extends EntityState<Principle> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
}

export const principlesAdapter: EntityAdapter<Principle> =
  createEntityAdapter<Principle>();

export const initialPrinciplesState: PrinciplesState =
  principlesAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
  });

// --- Helper Functions ---
const onFailure = (
  state: PrinciplesState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
});

const principlesReducer = createReducer(
  initialPrinciplesState,

  // Load flags
  on(PrinciplesActions.loadPrinciples, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(PrinciplesActions.loadPrinciple, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(PrinciplesActions.loadPrinciplesByPath, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // Selection / Reset
  on(PrinciplesActions.selectPrinciple, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(PrinciplesActions.resetSelectedPrinciple, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(PrinciplesActions.resetPrinciples, (state) =>
    principlesAdapter.removeAll({
      ...state,
      selectedId: null,
      loaded: false,
    }),
  ),

  // CRUD Success
  on(
    PrinciplesActions.loadPrinciplesSuccess,
    (state, { principles }) =>
      principlesAdapter.setAll(principles, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    PrinciplesActions.loadPrinciplesByPathSuccess,
    (state, { principles }) =>
      principlesAdapter.setAll(principles, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    PrinciplesActions.loadPrincipleSuccess,
    (state, { principle }) =>
      principlesAdapter.upsertOne(principle, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    PrinciplesActions.createPrincipleSuccess,
    (state, { principle }) =>
      principlesAdapter.addOne(principle, { ...state, error: null }),
  ),
  on(
    PrinciplesActions.updatePrincipleSuccess,
    (state, { principle }) =>
      principlesAdapter.updateOne(
        { id: principle.id ?? '', changes: principle },
        { ...state, error: null },
      ),
  ),
  on(
    PrinciplesActions.deletePrincipleSuccess,
    (state, { principle }) =>
      principlesAdapter.removeOne(principle?.id ?? '', {
        ...state,
        error: null,
      }),
  ),

  // Failures (deduped)
  on(
    PrinciplesActions.loadPrinciplesFailure,
    PrinciplesActions.loadPrincipleFailure,
    PrinciplesActions.loadPrinciplesByPathFailure,
    PrinciplesActions.createPrincipleFailure,
    PrinciplesActions.updatePrincipleFailure,
    PrinciplesActions.deletePrincipleFailure,
    onFailure,
  ),
);

// --- Feature (selectors included) ---
export const principlesFeature = createFeature({
  name: PRINCIPLES_FEATURE_KEY,
  reducer: principlesReducer,
  extraSelectors: ({ selectPrinciplesState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      principlesAdapter.getSelectors(selectPrinciplesState);

    const selectSelectedId = createSelector(
      selectPrinciplesState,
      (s) => s.selectedId,
    );

    const selectSelectedPrinciple = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    const selectPrinciplesByPathId = (pathId: string) =>
      createSelector(selectAll, (principles) =>
        principles.filter((p) => p.pathId === pathId),
      );

    return {
      // Adapter-powered
      selectAllPrinciples: selectAll,
      selectPrincipleEntities: selectEntities,
      selectPrincipleIds: selectIds,
      selectPrinciplesTotal: selectTotal,

      // Additional
      selectPrinciplesLoaded: createSelector(
        selectPrinciplesState,
        (s) => s.loaded,
      ),
      selectPrinciplesError: createSelector(
        selectPrinciplesState,
        (s) => s.error,
      ),
      selectSelectedId,
      selectSelectedPrinciple,
      selectPrinciplesByPathId,
    };
  },
});

// Optional re-exports for convenience
export const {
  selectAllPrinciples,
  selectPrincipleEntities,
  selectPrincipleIds,
  selectPrinciplesTotal,
  selectPrinciplesLoaded,
  selectPrinciplesError,
  selectSelectedId,
  selectSelectedPrinciple,
  selectPrinciplesByPathId,
} = principlesFeature;
