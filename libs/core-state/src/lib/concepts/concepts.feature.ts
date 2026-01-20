import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Concept } from '@kasita/common-models';
import { ConceptsActions } from './concepts.actions';

export const CONCEPTS_FEATURE_KEY = 'concepts';

// --- State & Adapter ---
export interface ConceptsState extends EntityState<Concept> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
}

export const conceptsAdapter: EntityAdapter<Concept> =
  createEntityAdapter<Concept>();

export const initialConceptsState: ConceptsState =
  conceptsAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
  });

// --- Helper Functions ---
const onFailure = (
  state: ConceptsState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
});

const conceptsReducer = createReducer(
  initialConceptsState,

  // Load flags
  on(ConceptsActions.loadConcepts, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(ConceptsActions.loadConcept, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(ConceptsActions.loadConceptsByPath, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // Selection / Reset
  on(ConceptsActions.selectConcept, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(ConceptsActions.resetSelectedConcept, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(ConceptsActions.resetConcepts, (state) =>
    conceptsAdapter.removeAll({
      ...state,
      selectedId: null,
      loaded: false,
    }),
  ),

  // CRUD Success
  on(
    ConceptsActions.loadConceptsSuccess,
    (state, { concepts }) =>
      conceptsAdapter.setAll(concepts, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    ConceptsActions.loadConceptsByPathSuccess,
    (state, { concepts }) =>
      conceptsAdapter.setAll(concepts, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    ConceptsActions.loadConceptSuccess,
    (state, { concept }) =>
      conceptsAdapter.upsertOne(concept, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    ConceptsActions.createConceptSuccess,
    (state, { concept }) =>
      conceptsAdapter.addOne(concept, { ...state, error: null }),
  ),
  on(
    ConceptsActions.updateConceptSuccess,
    (state, { concept }) =>
      conceptsAdapter.updateOne(
        { id: concept.id ?? '', changes: concept },
        { ...state, error: null },
      ),
  ),
  on(
    ConceptsActions.deleteConceptSuccess,
    (state, { concept }) =>
      conceptsAdapter.removeOne(concept?.id ?? '', {
        ...state,
        error: null,
      }),
  ),

  // Failures (deduped)
  on(
    ConceptsActions.loadConceptsFailure,
    ConceptsActions.loadConceptFailure,
    ConceptsActions.loadConceptsByPathFailure,
    ConceptsActions.createConceptFailure,
    ConceptsActions.updateConceptFailure,
    ConceptsActions.deleteConceptFailure,
    onFailure,
  ),
);

// --- Feature (selectors included) ---
export const conceptsFeature = createFeature({
  name: CONCEPTS_FEATURE_KEY,
  reducer: conceptsReducer,
  extraSelectors: ({ selectConceptsState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      conceptsAdapter.getSelectors(selectConceptsState);

    const selectSelectedId = createSelector(
      selectConceptsState,
      (s) => s.selectedId,
    );

    const selectSelectedConcept = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    const selectConceptsByPathId = (pathId: string) =>
      createSelector(selectAll, (concepts) =>
        concepts.filter((p) => p.pathId === pathId),
      );

    return {
      // Adapter-powered
      selectAllConcepts: selectAll,
      selectConceptEntities: selectEntities,
      selectConceptIds: selectIds,
      selectConceptsTotal: selectTotal,

      // Additional
      selectConceptsLoaded: createSelector(
        selectConceptsState,
        (s) => s.loaded,
      ),
      selectConceptsError: createSelector(
        selectConceptsState,
        (s) => s.error,
      ),
      selectSelectedId,
      selectSelectedConcept,
      selectConceptsByPathId,
    };
  },
});

// Optional re-exports for convenience
export const {
  selectAllConcepts,
  selectConceptEntities,
  selectConceptIds,
  selectConceptsTotal,
  selectConceptsLoaded,
  selectConceptsError,
  selectSelectedId,
  selectSelectedConcept,
  selectConceptsByPathId,
} = conceptsFeature;
