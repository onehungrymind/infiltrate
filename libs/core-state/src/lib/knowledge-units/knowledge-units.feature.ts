import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { KnowledgeUnit } from '@kasita/common-models';
import { KnowledgeUnitsActions } from './knowledge-units.actions';

export const KNOWLEDGE_UNITS_FEATURE_KEY = 'knowledgeUnits';

// --- State & Adapter ---
export interface KnowledgeUnitsState extends EntityState<KnowledgeUnit> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
}

export const knowledgeUnitsAdapter: EntityAdapter<KnowledgeUnit> =
  createEntityAdapter<KnowledgeUnit>();

export const initialKnowledgeUnitsState: KnowledgeUnitsState =
  knowledgeUnitsAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
  });

// --- Helper Functions ---
const onFailure = (
  state: KnowledgeUnitsState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
});

const knowledgeUnitsReducer = createReducer(
  initialKnowledgeUnitsState,

  // Load flags
  on(KnowledgeUnitsActions.loadKnowledgeUnits, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(KnowledgeUnitsActions.loadKnowledgeUnit, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(KnowledgeUnitsActions.loadKnowledgeUnitsByPath, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(KnowledgeUnitsActions.loadKnowledgeUnitsBySubConcept, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // Selection / Reset
  on(KnowledgeUnitsActions.selectKnowledgeUnit, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(KnowledgeUnitsActions.resetSelectedKnowledgeUnit, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(KnowledgeUnitsActions.resetKnowledgeUnits, (state) =>
    knowledgeUnitsAdapter.removeAll({
      ...state,
      selectedId: null,
      loaded: false,
    }),
  ),

  // CRUD Success
  on(
    KnowledgeUnitsActions.loadKnowledgeUnitsSuccess,
    (state, { knowledgeUnits }) =>
      knowledgeUnitsAdapter.setAll(knowledgeUnits, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    KnowledgeUnitsActions.loadKnowledgeUnitSuccess,
    (state, { knowledgeUnit }) =>
      knowledgeUnitsAdapter.upsertOne(knowledgeUnit, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    KnowledgeUnitsActions.loadKnowledgeUnitsByPathSuccess,
    (state, { knowledgeUnits }) =>
      knowledgeUnitsAdapter.setAll(knowledgeUnits, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    KnowledgeUnitsActions.loadKnowledgeUnitsBySubConceptSuccess,
    (state, { knowledgeUnits }) =>
      knowledgeUnitsAdapter.upsertMany(knowledgeUnits, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    KnowledgeUnitsActions.createKnowledgeUnitSuccess,
    (state, { knowledgeUnit }) =>
      knowledgeUnitsAdapter.addOne(knowledgeUnit, { ...state, error: null }),
  ),
  on(
    KnowledgeUnitsActions.updateKnowledgeUnitSuccess,
    (state, { knowledgeUnit }) =>
      knowledgeUnitsAdapter.updateOne(
        { id: knowledgeUnit.id ?? '', changes: knowledgeUnit },
        { ...state, error: null },
      ),
  ),
  on(
    KnowledgeUnitsActions.deleteKnowledgeUnitSuccess,
    (state, { knowledgeUnit }) =>
      knowledgeUnitsAdapter.removeOne(knowledgeUnit?.id ?? '', {
        ...state,
        error: null,
      }),
  ),

  // Failures (deduped)
  on(
    KnowledgeUnitsActions.loadKnowledgeUnitsFailure,
    KnowledgeUnitsActions.loadKnowledgeUnitFailure,
    KnowledgeUnitsActions.loadKnowledgeUnitsByPathFailure,
    KnowledgeUnitsActions.loadKnowledgeUnitsBySubConceptFailure,
    KnowledgeUnitsActions.createKnowledgeUnitFailure,
    KnowledgeUnitsActions.updateKnowledgeUnitFailure,
    KnowledgeUnitsActions.deleteKnowledgeUnitFailure,
    onFailure,
  ),
);

// --- Feature (selectors included) ---
export const knowledgeUnitsFeature = createFeature({
  name: KNOWLEDGE_UNITS_FEATURE_KEY,
  reducer: knowledgeUnitsReducer,
  extraSelectors: ({ selectKnowledgeUnitsState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      knowledgeUnitsAdapter.getSelectors(selectKnowledgeUnitsState);

    const selectSelectedId = createSelector(
      selectKnowledgeUnitsState,
      (s) => s.selectedId,
    );

    const selectSelectedKnowledgeUnit = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    const selectKnowledgeUnitsByPathId = (pathId: string) =>
      createSelector(selectAll, (knowledgeUnits) =>
        knowledgeUnits.filter((k) => k.pathId === pathId),
      );

    return {
      // Adapter-powered
      selectAllKnowledgeUnits: selectAll,
      selectKnowledgeUnitEntities: selectEntities,
      selectKnowledgeUnitIds: selectIds,
      selectKnowledgeUnitsTotal: selectTotal,

      // Additional
      selectKnowledgeUnitsLoaded: createSelector(
        selectKnowledgeUnitsState,
        (s) => s.loaded,
      ),
      selectKnowledgeUnitsError: createSelector(
        selectKnowledgeUnitsState,
        (s) => s.error,
      ),
      selectSelectedId,
      selectSelectedKnowledgeUnit,
      selectKnowledgeUnitsByPathId,
    };
  },
});

// Optional re-exports for convenience
export const {
  selectAllKnowledgeUnits,
  selectKnowledgeUnitEntities,
  selectKnowledgeUnitIds,
  selectKnowledgeUnitsTotal,
  selectKnowledgeUnitsLoaded,
  selectKnowledgeUnitsError,
  selectSelectedId,
  selectSelectedKnowledgeUnit,
  selectKnowledgeUnitsByPathId,
} = knowledgeUnitsFeature;
