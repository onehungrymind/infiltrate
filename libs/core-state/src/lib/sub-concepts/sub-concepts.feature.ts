import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { SubConcept } from '@kasita/common-models';
import { SubConceptsActions } from './sub-concepts.actions';

export const SUB_CONCEPTS_FEATURE_KEY = 'subConcepts';

// --- State & Adapter ---
export interface SubConceptsState extends EntityState<SubConcept> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
  generating: boolean;
}

export const subConceptsAdapter: EntityAdapter<SubConcept> =
  createEntityAdapter<SubConcept>();

export const initialSubConceptsState: SubConceptsState =
  subConceptsAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
    generating: false,
  });

// --- Helper Functions ---
const onFailure = (
  state: SubConceptsState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
  generating: false,
});

const subConceptsReducer = createReducer(
  initialSubConceptsState,

  // Load flags
  on(SubConceptsActions.loadSubConcepts, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(SubConceptsActions.loadSubConcept, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(SubConceptsActions.loadSubConceptsByConcept, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // AI generation flags
  on(SubConceptsActions.decomposeConcept, (state) => ({
    ...state,
    generating: true,
    error: null,
  })),
  on(SubConceptsActions.generateStructuredKU, (state) => ({
    ...state,
    generating: true,
    error: null,
  })),

  // Selection / Reset
  on(SubConceptsActions.selectSubConcept, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(SubConceptsActions.resetSelectedSubConcept, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(SubConceptsActions.resetSubConcepts, (state) =>
    subConceptsAdapter.removeAll({
      ...state,
      selectedId: null,
      loaded: false,
    }),
  ),

  // CRUD Success
  on(
    SubConceptsActions.loadSubConceptsSuccess,
    (state, { subConcepts }) =>
      subConceptsAdapter.setAll(subConcepts, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    SubConceptsActions.loadSubConceptsByConceptSuccess,
    (state, { subConcepts }) =>
      subConceptsAdapter.setAll(subConcepts, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    SubConceptsActions.loadSubConceptSuccess,
    (state, { subConcept }) =>
      subConceptsAdapter.upsertOne(subConcept, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    SubConceptsActions.createSubConceptSuccess,
    (state, { subConcept }) =>
      subConceptsAdapter.addOne(subConcept, { ...state, error: null }),
  ),
  on(
    SubConceptsActions.updateSubConceptSuccess,
    (state, { subConcept }) =>
      subConceptsAdapter.updateOne(
        { id: subConcept.id ?? '', changes: subConcept },
        { ...state, error: null },
      ),
  ),
  on(
    SubConceptsActions.deleteSubConceptSuccess,
    (state, { subConcept }) =>
      subConceptsAdapter.removeOne(subConcept?.id ?? '', {
        ...state,
        error: null,
      }),
  ),

  // AI generation success
  on(
    SubConceptsActions.decomposeConceptSuccess,
    (state, { subConcepts }) =>
      subConceptsAdapter.addMany(subConcepts, {
        ...state,
        generating: false,
        error: null,
      }),
  ),
  on(
    SubConceptsActions.generateStructuredKUSuccess,
    (state) => ({
      ...state,
      generating: false,
      error: null,
    }),
  ),

  // Failures (deduped)
  on(
    SubConceptsActions.loadSubConceptsFailure,
    SubConceptsActions.loadSubConceptFailure,
    SubConceptsActions.loadSubConceptsByConceptFailure,
    SubConceptsActions.createSubConceptFailure,
    SubConceptsActions.updateSubConceptFailure,
    SubConceptsActions.deleteSubConceptFailure,
    SubConceptsActions.decomposeConceptFailure,
    SubConceptsActions.generateStructuredKUFailure,
    SubConceptsActions.addDecorationFailure,
    SubConceptsActions.removeDecorationFailure,
    onFailure,
  ),
);

// --- Feature (selectors included) ---
export const subConceptsFeature = createFeature({
  name: SUB_CONCEPTS_FEATURE_KEY,
  reducer: subConceptsReducer,
  extraSelectors: ({ selectSubConceptsState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      subConceptsAdapter.getSelectors(selectSubConceptsState);

    const selectSelectedId = createSelector(
      selectSubConceptsState,
      (s) => s.selectedId,
    );

    const selectSelectedSubConcept = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    const selectSubConceptsByConceptId = (conceptId: string) =>
      createSelector(selectAll, (subConcepts) =>
        subConcepts.filter((sc) => sc.conceptId === conceptId),
      );

    return {
      // Adapter-powered
      selectAllSubConcepts: selectAll,
      selectSubConceptEntities: selectEntities,
      selectSubConceptIds: selectIds,
      selectSubConceptsTotal: selectTotal,

      // Additional
      selectSubConceptsLoaded: createSelector(
        selectSubConceptsState,
        (s) => s.loaded,
      ),
      selectSubConceptsError: createSelector(
        selectSubConceptsState,
        (s) => s.error,
      ),
      selectSubConceptsGenerating: createSelector(
        selectSubConceptsState,
        (s) => s.generating,
      ),
      selectSelectedId,
      selectSelectedSubConcept,
      selectSubConceptsByConceptId,
    };
  },
});

// Optional re-exports for convenience
export const {
  selectAllSubConcepts,
  selectSubConceptEntities,
  selectSubConceptIds,
  selectSubConceptsTotal,
  selectSubConceptsLoaded,
  selectSubConceptsError,
  selectSubConceptsGenerating,
  selectSelectedId,
  selectSelectedSubConcept,
  selectSubConceptsByConceptId,
} = subConceptsFeature;
