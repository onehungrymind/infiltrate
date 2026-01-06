import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { <%= singularClassName %> } from '<%= npmScope %>/api-interfaces';
import { <%= pluralClassName %>Actions } from './<%= featureName %>.actions';

export const <%= featureScreamingSnakeCase %>_FEATURE_KEY = '<%= pluralPropertyName %>';

// --- State & Adapter ---
export interface <%= pluralClassName %>State extends EntityState<<%= singularClassName %>> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
}

export const <%= pluralPropertyName %>Adapter: EntityAdapter<<%= singularClassName %>> =
  createEntityAdapter<<%= singularClassName %>>();

export const initial<%= pluralClassName %>State: <%= pluralClassName %>State =
  <%= pluralPropertyName %>Adapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
  });

// --- Helper Functions ---
const onFailure = (state: <%= pluralClassName %>State, { error }: { error: string | null }) => ({
  ...state,
  error,
});

const <%= pluralPropertyName %>Reducer = createReducer(
  initial<%= pluralClassName %>State,

  // Load flags
  on(<%= pluralClassName %>Actions.load<%= pluralClassName %>, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(<%= pluralClassName %>Actions.load<%= singularClassName %>, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // Selection / Reset
  on(<%= pluralClassName %>Actions.select<%= singularClassName %>, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(<%= pluralClassName %>Actions.resetSelected<%= singularClassName %>, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(<%= pluralClassName %>Actions.reset<%= pluralClassName %>, (state) =>
    <%= pluralPropertyName %>Adapter.removeAll({ ...state, selectedId: null, loaded: false })
  ),

  // CRUD Success
  on(<%= pluralClassName %>Actions.load<%= pluralClassName %>Success, (state, { <%= pluralPropertyName %> }) =>
    <%= pluralPropertyName %>Adapter.setAll(<%= pluralPropertyName %>, { ...state, loaded: true, error: null })
  ),
  on(<%= pluralClassName %>Actions.load<%= singularClassName %>Success, (state, { <%= singularPropertyName %> }) =>
    <%= pluralPropertyName %>Adapter.upsertOne(<%= singularPropertyName %>, { ...state, loaded: true, error: null })
  ),
  on(<%= pluralClassName %>Actions.create<%= singularClassName %>Success, (state, { <%= singularPropertyName %> }) =>
    <%= pluralPropertyName %>Adapter.addOne(<%= singularPropertyName %>, { ...state, error: null })
  ),
  on(<%= pluralClassName %>Actions.update<%= singularClassName %>Success, (state, { <%= singularPropertyName %> }) =>
    <%= pluralPropertyName %>Adapter.updateOne(
      { id: <%= singularPropertyName %>.id ?? '', changes: <%= singularPropertyName %> },
      { ...state, error: null }
    )
  ),
  on(<%= pluralClassName %>Actions.delete<%= singularClassName %>Success, (state, { <%= singularPropertyName %> }) =>
    <%= pluralPropertyName %>Adapter.removeOne(<%= singularPropertyName %>?.id ?? '', { ...state, error: null })
  ),

  // Failures (deduped)
  on(
    <%= pluralClassName %>Actions.load<%= pluralClassName %>Failure,
    <%= pluralClassName %>Actions.load<%= singularClassName %>Failure,
    <%= pluralClassName %>Actions.create<%= singularClassName %>Failure,
    <%= pluralClassName %>Actions.update<%= singularClassName %>Failure,
    <%= pluralClassName %>Actions.delete<%= singularClassName %>Failure,
    onFailure
  )
);

// --- Feature (selectors included) ---
export const <%= pluralPropertyName %>Feature = createFeature({
  name: <%= featureScreamingSnakeCase %>_FEATURE_KEY,
  reducer: <%= pluralPropertyName %>Reducer,
  extraSelectors: ({ select<%= pluralClassName %>State }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      <%= pluralPropertyName %>Adapter.getSelectors(select<%= pluralClassName %>State);

    const selectSelectedId = createSelector(
      select<%= pluralClassName %>State,
      (s) => s.selectedId
    );

    const selectSelected<%= singularClassName %> = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? entities[id] ?? null : null)
    );

    return {
      // Adapter-powered
      selectAll<%= pluralClassName %>: selectAll,
      select<%= singularClassName %>Entities: selectEntities,
      select<%= singularClassName %>Ids: selectIds,
      select<%= pluralClassName %>Total: selectTotal,

      // Additional
      select<%= pluralClassName %>Loaded: createSelector(
        select<%= pluralClassName %>State,
        (s) => s.loaded
      ),
      select<%= pluralClassName %>Error: createSelector(select<%= pluralClassName %>State, (s) => s.error),
      selectSelectedId,
      selectSelected<%= singularClassName %>,
    };
  },
});

// Optional re-exports for convenience
export const {
  selectAll<%= pluralClassName %>,
  select<%= singularClassName %>Entities,
  select<%= singularClassName %>Ids,
  select<%= pluralClassName %>Total,
  select<%= pluralClassName %>Loaded,
  select<%= pluralClassName %>Error,
  selectSelectedId,
  selectSelected<%= singularClassName %>,
} = <%= pluralPropertyName %>Feature;
