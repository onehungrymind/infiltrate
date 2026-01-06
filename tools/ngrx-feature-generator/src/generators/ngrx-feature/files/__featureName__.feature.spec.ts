import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { <%= singularClassName %> } from '<%= npmScope %>/api-interfaces';
import { <%= pluralClassName %>Actions } from './<%= featureName %>.actions';
import { 
  <%= pluralPropertyName %>Feature,
  initial<%= pluralClassName %>State,
  <%= pluralPropertyName %>Adapter,
  <%= featureScreamingSnakeCase %>_FEATURE_KEY,
  selectAll<%= pluralClassName %>,
  select<%= singularClassName %>Entities,
  select<%= singularClassName %>Ids,
  select<%= pluralClassName %>Total,
  select<%= pluralClassName %>Loaded,
  select<%= pluralClassName %>Error,
  selectSelectedId,
  selectSelected<%= singularClassName %>,
  select<%= pluralClassName %>State
} from './<%= featureName %>.feature';

describe('<%= pluralClassName %> Feature', () => {
  let store: Store;
  
  const mock<%= singularClassName %>: <%= singularClassName %> = {
    id: '1',
    // Add your entity properties here based on the interface
  };

  const mock<%= singularClassName %>2: <%= singularClassName %> = {
    id: '2',
    // Add your entity properties here based on the interface
  };

  const mock<%= pluralClassName %>: <%= singularClassName %>[] = [mock<%= singularClassName %>, mock<%= singularClassName %>2];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({
          [<%= featureScreamingSnakeCase %>_FEATURE_KEY]: <%= pluralPropertyName %>Feature.reducer
        }),
        provideEffects([])
      ]
    });

    store = TestBed.inject(Store);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const expectedState = initial<%= pluralClassName %>State;
      expect(expectedState).toEqual({
        ids: [],
        entities: {},
        selectedId: null,
        error: null,
        loaded: false
      });
    });

    it('should select initial state', () => {
      const result = select<%= pluralClassName %>State.projector(initial<%= pluralClassName %>State);
      expect(result).toEqual(initial<%= pluralClassName %>State);
    });
  });

  describe('Reducer Direct Tests', () => {
    it('should return initial state when action is unknown', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' };
      const result = <%= pluralPropertyName %>Feature.reducer(initial<%= pluralClassName %>State, unknownAction);
      expect(result).toBe(initial<%= pluralClassName %>State);
    });

    it('should handle onFailure helper function', () => {
      const error = 'Test error';
      const state = { ...initial<%= pluralClassName %>State, loaded: true };
      const result = <%= pluralPropertyName %>Feature.reducer(state, <%= pluralClassName %>Actions.load<%= pluralClassName %>Failure({ error }));
      expect(result.error).toBe(error);
      expect(result.loaded).toBe(true); // Should not change loaded state
    });
  });

  describe('Actions', () => {
    describe('Load <%= pluralClassName %>', () => {
      it('should handle load<%= pluralClassName %> action', () => {
        const action = <%= pluralClassName %>Actions.load<%= pluralClassName %>();
        const expectedState = {
          ...initial<%= pluralClassName %>State,
          loaded: false,
          error: null
        };

        const result = <%= pluralPropertyName %>Feature.reducer(initial<%= pluralClassName %>State, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle load<%= pluralClassName %>Success action', () => {
        const action = <%= pluralClassName %>Actions.load<%= pluralClassName %>Success({ <%= pluralPropertyName %>: mock<%= pluralClassName %> });
        const expectedState = <%= pluralPropertyName %>Adapter.setAll(mock<%= pluralClassName %>, {
          ...initial<%= pluralClassName %>State,
          loaded: true,
          error: null
        });

        const result = <%= pluralPropertyName %>Feature.reducer(initial<%= pluralClassName %>State, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle load<%= pluralClassName %>Failure action', () => {
        const error = 'Load failed';
        const action = <%= pluralClassName %>Actions.load<%= pluralClassName %>Failure({ error });
        const expectedState = {
          ...initial<%= pluralClassName %>State,
          error
        };

        const result = <%= pluralPropertyName %>Feature.reducer(initial<%= pluralClassName %>State, action);
        expect(result).toEqual(expectedState);
      });
    });

    describe('Load <%= singularClassName %>', () => {
      it('should handle load<%= singularClassName %> action', () => {
        const action = <%= pluralClassName %>Actions.load<%= singularClassName %>({ <%= singularPropertyName %>Id: '1' });
        const expectedState = {
          ...initial<%= pluralClassName %>State,
          loaded: false,
          error: null
        };

        const result = <%= pluralPropertyName %>Feature.reducer(initial<%= pluralClassName %>State, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle load<%= singularClassName %>Success action', () => {
        const action = <%= pluralClassName %>Actions.load<%= singularClassName %>Success({ <%= singularPropertyName %>: mock<%= singularClassName %> });
        const expectedState = <%= pluralPropertyName %>Adapter.upsertOne(mock<%= singularClassName %>, {
          ...initial<%= pluralClassName %>State,
          loaded: true,
          error: null
        });

        const result = <%= pluralPropertyName %>Feature.reducer(initial<%= pluralClassName %>State, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle load<%= singularClassName %>Failure action', () => {
        const error = 'Load failed';
        const action = <%= pluralClassName %>Actions.load<%= singularClassName %>Failure({ error });
        const expectedState = {
          ...initial<%= pluralClassName %>State,
          error
        };

        const result = <%= pluralPropertyName %>Feature.reducer(initial<%= pluralClassName %>State, action);
        expect(result).toEqual(expectedState);
      });
    });

    describe('Create <%= singularClassName %>', () => {
      it('should handle create<%= singularClassName %>Success action', () => {
        const action = <%= pluralClassName %>Actions.create<%= singularClassName %>Success({ <%= singularPropertyName %>: mock<%= singularClassName %> });
        const expectedState = <%= pluralPropertyName %>Adapter.addOne(mock<%= singularClassName %>, {
          ...initial<%= pluralClassName %>State,
          error: null
        });

        const result = <%= pluralPropertyName %>Feature.reducer(initial<%= pluralClassName %>State, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle create<%= singularClassName %>Failure action', () => {
        const error = 'Create failed';
        const action = <%= pluralClassName %>Actions.create<%= singularClassName %>Failure({ error });
        const expectedState = {
          ...initial<%= pluralClassName %>State,
          error
        };

        const result = <%= pluralPropertyName %>Feature.reducer(initial<%= pluralClassName %>State, action);
        expect(result).toEqual(expectedState);
      });
    });

    describe('Update <%= singularClassName %>', () => {
      it('should handle update<%= singularClassName %>Success action', () => {
        // First add a <%= singularPropertyName %>
        const stateWith<%= singularClassName %> = <%= pluralPropertyName %>Adapter.addOne(mock<%= singularClassName %>, initial<%= pluralClassName %>State);
        
        const updated<%= singularClassName %> = { ...mock<%= singularClassName %>, /* add updated properties */ };
        const action = <%= pluralClassName %>Actions.update<%= singularClassName %>Success({ <%= singularPropertyName %>: updated<%= singularClassName %> });
        const expectedState = <%= pluralPropertyName %>Adapter.updateOne(
          { id: updated<%= singularClassName %>.id ?? '', changes: updated<%= singularClassName %> },
          { ...stateWith<%= singularClassName %>, error: null }
        );

        const result = <%= pluralPropertyName %>Feature.reducer(stateWith<%= singularClassName %>, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle update<%= singularClassName %>Failure action', () => {
        const error = 'Update failed';
        const action = <%= pluralClassName %>Actions.update<%= singularClassName %>Failure({ error });
        const expectedState = {
          ...initial<%= pluralClassName %>State,
          error
        };

        const result = <%= pluralPropertyName %>Feature.reducer(initial<%= pluralClassName %>State, action);
        expect(result).toEqual(expectedState);
      });
    });

    describe('Delete <%= singularClassName %>', () => {
      it('should handle delete<%= singularClassName %>Success action', () => {
        // First add a <%= singularPropertyName %>
        const stateWith<%= singularClassName %> = <%= pluralPropertyName %>Adapter.addOne(mock<%= singularClassName %>, initial<%= pluralClassName %>State);
        
        const action = <%= pluralClassName %>Actions.delete<%= singularClassName %>Success({ <%= singularPropertyName %>: mock<%= singularClassName %> });
        const expectedState = <%= pluralPropertyName %>Adapter.removeOne(mock<%= singularClassName %>?.id ?? '', {
          ...stateWith<%= singularClassName %>,
          error: null
        });

        const result = <%= pluralPropertyName %>Feature.reducer(stateWith<%= singularClassName %>, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle delete<%= singularClassName %>Failure action', () => {
        const error = 'Delete failed';
        const action = <%= pluralClassName %>Actions.delete<%= singularClassName %>Failure({ error });
        const expectedState = {
          ...initial<%= pluralClassName %>State,
          error
        };

        const result = <%= pluralPropertyName %>Feature.reducer(initial<%= pluralClassName %>State, action);
        expect(result).toEqual(expectedState);
      });
    });

    describe('Selection Actions', () => {
      it('should handle select<%= singularClassName %> action', () => {
        const selectedId = '1';
        const action = <%= pluralClassName %>Actions.select<%= singularClassName %>({ selectedId });
        const expectedState = {
          ...initial<%= pluralClassName %>State,
          selectedId
        };

        const result = <%= pluralPropertyName %>Feature.reducer(initial<%= pluralClassName %>State, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle resetSelected<%= singularClassName %> action', () => {
        const stateWithSelection = { ...initial<%= pluralClassName %>State, selectedId: '1' };
        const action = <%= pluralClassName %>Actions.resetSelected<%= singularClassName %>();
        const expectedState = {
          ...stateWithSelection,
          selectedId: null
        };

        const result = <%= pluralPropertyName %>Feature.reducer(stateWithSelection, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle reset<%= pluralClassName %> action', () => {
        const stateWith<%= pluralClassName %> = <%= pluralPropertyName %>Adapter.setAll(mock<%= pluralClassName %>, {
          ...initial<%= pluralClassName %>State,
          selectedId: '1',
          loaded: true
        });
        
        const action = <%= pluralClassName %>Actions.reset<%= pluralClassName %>();
        const expectedState = <%= pluralPropertyName %>Adapter.removeAll({
          ...stateWith<%= pluralClassName %>,
          selectedId: null,
          loaded: false
        });

        const result = <%= pluralPropertyName %>Feature.reducer(stateWith<%= pluralClassName %>, action);
        expect(result).toEqual(expectedState);
      });
    });
  });

  describe('Selectors', () => {
    describe('Basic Selectors', () => {
      it('should select all <%= pluralPropertyName %>', () => {
        const state = <%= pluralPropertyName %>Adapter.setAll(mock<%= pluralClassName %>, initial<%= pluralClassName %>State);
        const result = selectAll<%= pluralClassName %>.projector(state);
        expect(result).toEqual(mock<%= pluralClassName %>);
      });

      it('should select <%= singularPropertyName %> entities', () => {
        const state = <%= pluralPropertyName %>Adapter.setAll(mock<%= pluralClassName %>, initial<%= pluralClassName %>State);
        const result = select<%= singularClassName %>Entities.projector(state);
        expect(result).toEqual({
          '1': mock<%= singularClassName %>,
          '2': mock<%= singularClassName %>2
        });
      });

      it('should select <%= singularPropertyName %> ids', () => {
        const state = <%= pluralPropertyName %>Adapter.setAll(mock<%= pluralClassName %>, initial<%= pluralClassName %>State);
        const result = select<%= singularClassName %>Ids.projector(state);
        expect(result).toEqual(['1', '2']);
      });

      it('should select <%= pluralPropertyName %> total', () => {
        const state = <%= pluralPropertyName %>Adapter.setAll(mock<%= pluralClassName %>, initial<%= pluralClassName %>State);
        const result = select<%= pluralClassName %>Total.projector(state);
        expect(result).toBe(2);
      });

      it('should select <%= pluralPropertyName %> loaded state', () => {
        const state = { ...initial<%= pluralClassName %>State, loaded: true };
        const result = select<%= pluralClassName %>Loaded.projector(state);
        expect(result).toBe(true);
      });

      it('should select <%= pluralPropertyName %> error', () => {
        const error = 'Test error';
        const state = { ...initial<%= pluralClassName %>State, error };
        const result = select<%= pluralClassName %>Error.projector(state);
        expect(result).toBe(error);
      });

      it('should select selected id', () => {
        const selectedId = '1';
        const state = { ...initial<%= pluralClassName %>State, selectedId };
        const result = selectSelectedId.projector(state);
        expect(result).toBe(selectedId);
      });
    });

    describe('Complex Selectors', () => {
      it('should select selected <%= singularPropertyName %>', () => {
        const state = <%= pluralPropertyName %>Adapter.setAll(mock<%= pluralClassName %>, {
          ...initial<%= pluralClassName %>State,
          selectedId: '1'
        });
        
        const entities = select<%= singularClassName %>Entities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelected<%= singularClassName %>.projector(entities, selectedId);
        
        expect(result).toEqual(mock<%= singularClassName %>);
      });

      it('should return null for selected <%= singularPropertyName %> when no selection', () => {
        const state = <%= pluralPropertyName %>Adapter.setAll(mock<%= pluralClassName %>, {
          ...initial<%= pluralClassName %>State,
          selectedId: null
        });
        
        const entities = select<%= singularClassName %>Entities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelected<%= singularClassName %>.projector(entities, selectedId);
        
        expect(result).toBeNull();
      });

      it('should return null for selected <%= singularPropertyName %> when entity not found', () => {
        const state = <%= pluralPropertyName %>Adapter.setAll(mock<%= pluralClassName %>, {
          ...initial<%= pluralClassName %>State,
          selectedId: 'nonexistent'
        });
        
        const entities = select<%= singularClassName %>Entities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelected<%= singularClassName %>.projector(entities, selectedId);
        
        expect(result).toBeNull();
      });
    });
  });

  describe('Feature Integration', () => {
    it('should have correct feature key', () => {
      expect(<%= pluralPropertyName %>Feature.name).toBe(<%= featureScreamingSnakeCase %>_FEATURE_KEY);
    });

    it('should provide reducer', () => {
      expect(<%= pluralPropertyName %>Feature.reducer).toBeDefined();
    });

    it('should provide extra selectors', () => {
      expect(<%= pluralPropertyName %>Feature.selectAll<%= pluralClassName %>).toBeDefined();
      expect(<%= pluralPropertyName %>Feature.select<%= singularClassName %>Entities).toBeDefined();
      expect(<%= pluralPropertyName %>Feature.select<%= pluralClassName %>Loaded).toBeDefined();
      expect(<%= pluralPropertyName %>Feature.select<%= pluralClassName %>Error).toBeDefined();
      expect(<%= pluralPropertyName %>Feature.selectSelected<%= singularClassName %>).toBeDefined();
    });
  });

  describe('Store Integration', () => {
    it('should dispatch actions and update state', () => {
      store.dispatch(<%= pluralClassName %>Actions.load<%= pluralClassName %>Success({ <%= pluralPropertyName %>: mock<%= pluralClassName %> }));
      
      const state$ = store.select(select<%= pluralClassName %>State);
      const expected$ = cold('a', {
        a: <%= pluralPropertyName %>Adapter.setAll(mock<%= pluralClassName %>, {
          ...initial<%= pluralClassName %>State,
          loaded: true,
          error: null
        })
      });
      
      expect(state$).toBeObservable(expected$);
    });

    it('should handle error actions', () => {
      const error = 'Test error';
      store.dispatch(<%= pluralClassName %>Actions.load<%= pluralClassName %>Failure({ error }));
      
      const error$ = store.select(select<%= pluralClassName %>Error);
      const expected$ = cold('a', { a: error });
      
      expect(error$).toBeObservable(expected$);
    });

    it('should handle selection', () => {
      store.dispatch(<%= pluralClassName %>Actions.load<%= pluralClassName %>Success({ <%= pluralPropertyName %>: mock<%= pluralClassName %> }));
      store.dispatch(<%= pluralClassName %>Actions.select<%= singularClassName %>({ selectedId: '1' }));
      
      const selected<%= singularClassName %>$ = store.select(selectSelected<%= singularClassName %>);
      const expected$ = cold('a', { a: mock<%= singularClassName %> });
      
      expect(selected<%= singularClassName %>$).toBeObservable(expected$);
    });

    it('should handle <%= singularPropertyName %> update', () => {
      store.dispatch(<%= pluralClassName %>Actions.load<%= pluralClassName %>Success({ <%= pluralPropertyName %>: [mock<%= singularClassName %>] }));
      
      const updated<%= singularClassName %> = { ...mock<%= singularClassName %>, /* add updated properties */ };
      store.dispatch(<%= pluralClassName %>Actions.update<%= singularClassName %>Success({ <%= singularPropertyName %>: updated<%= singularClassName %> }));
      
      const state$ = store.select(select<%= singularClassName %>Entities);
      const expected$ = cold('a', {
        a: {
          '1': updated<%= singularClassName %>
        }
      });
      
      expect(state$).toBeObservable(expected$);
    });

    it('should handle <%= singularPropertyName %> deletion', () => {
      store.dispatch(<%= pluralClassName %>Actions.load<%= pluralClassName %>Success({ <%= pluralPropertyName %>: mock<%= pluralClassName %> }));
      store.dispatch(<%= pluralClassName %>Actions.delete<%= singularClassName %>Success({ <%= singularPropertyName %>: mock<%= singularClassName %> }));
      
      const state$ = store.select(selectAll<%= pluralClassName %>);
      const expected$ = cold('a', { a: [mock<%= singularClassName %>2] });
      
      expect(state$).toBeObservable(expected$);
    });
  });
});
