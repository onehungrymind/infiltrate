import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { SourceConfig } from '@kasita/common-models';
import { SourceConfigsActions } from './source-configs.actions';
import {
  sourceConfigsFeature,
  initialSourceConfigsState,
  sourceConfigsAdapter,
  SOURCE_CONFIGS_FEATURE_KEY,
  selectAllSourceConfigs,
  selectSourceConfigEntities,
  selectSourceConfigIds,
  selectSourceConfigsTotal,
  selectSourceConfigsLoaded,
  selectSourceConfigsError,
  selectSelectedId,
  selectSelectedSourceConfig,
  selectSourceConfigsState,
} from './source-configs.feature';

describe('SourceConfigs Feature', () => {
  let store: Store;

  const mockSourceConfig: SourceConfig = {
    id: '1',
    // Add your entity properties here based on the interface
  };

  const mockSourceConfig2: SourceConfig = {
    id: '2',
    // Add your entity properties here based on the interface
  };

  const mockSourceConfigs: SourceConfig[] = [
    mockSourceConfig,
    mockSourceConfig2,
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({
          [SOURCE_CONFIGS_FEATURE_KEY]: sourceConfigsFeature.reducer,
        }),
        provideEffects([]),
      ],
    });

    store = TestBed.inject(Store);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const expectedState = initialSourceConfigsState;
      expect(expectedState).toEqual({
        ids: [],
        entities: {},
        selectedId: null,
        error: null,
        loaded: false,
      });
    });

    it('should select initial state', () => {
      const result = selectSourceConfigsState.projector(
        initialSourceConfigsState,
      );
      expect(result).toEqual(initialSourceConfigsState);
    });
  });

  describe('Reducer Direct Tests', () => {
    it('should return initial state when action is unknown', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' };
      const result = sourceConfigsFeature.reducer(
        initialSourceConfigsState,
        unknownAction,
      );
      expect(result).toBe(initialSourceConfigsState);
    });

    it('should handle onFailure helper function', () => {
      const error = 'Test error';
      const state = { ...initialSourceConfigsState, loaded: true };
      const result = sourceConfigsFeature.reducer(
        state,
        SourceConfigsActions.loadSourceConfigsFailure({ error }),
      );
      expect(result.error).toBe(error);
      expect(result.loaded).toBe(true); // Should not change loaded state
    });
  });

  describe('Actions', () => {
    describe('Load SourceConfigs', () => {
      it('should handle loadSourceConfigs action', () => {
        const action = SourceConfigsActions.loadSourceConfigs();
        const expectedState = {
          ...initialSourceConfigsState,
          loaded: false,
          error: null,
        };

        const result = sourceConfigsFeature.reducer(
          initialSourceConfigsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadSourceConfigsSuccess action', () => {
        const action = SourceConfigsActions.loadSourceConfigsSuccess({
          sourceConfigs: mockSourceConfigs,
        });
        const expectedState = sourceConfigsAdapter.setAll(mockSourceConfigs, {
          ...initialSourceConfigsState,
          loaded: true,
          error: null,
        });

        const result = sourceConfigsFeature.reducer(
          initialSourceConfigsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadSourceConfigsFailure action', () => {
        const error = 'Load failed';
        const action = SourceConfigsActions.loadSourceConfigsFailure({ error });
        const expectedState = {
          ...initialSourceConfigsState,
          error,
        };

        const result = sourceConfigsFeature.reducer(
          initialSourceConfigsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Load SourceConfig', () => {
      it('should handle loadSourceConfig action', () => {
        const action = SourceConfigsActions.loadSourceConfig({
          sourceConfigId: '1',
        });
        const expectedState = {
          ...initialSourceConfigsState,
          loaded: false,
          error: null,
        };

        const result = sourceConfigsFeature.reducer(
          initialSourceConfigsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadSourceConfigSuccess action', () => {
        const action = SourceConfigsActions.loadSourceConfigSuccess({
          sourceConfig: mockSourceConfig,
        });
        const expectedState = sourceConfigsAdapter.upsertOne(mockSourceConfig, {
          ...initialSourceConfigsState,
          loaded: true,
          error: null,
        });

        const result = sourceConfigsFeature.reducer(
          initialSourceConfigsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadSourceConfigFailure action', () => {
        const error = 'Load failed';
        const action = SourceConfigsActions.loadSourceConfigFailure({ error });
        const expectedState = {
          ...initialSourceConfigsState,
          error,
        };

        const result = sourceConfigsFeature.reducer(
          initialSourceConfigsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Create SourceConfig', () => {
      it('should handle createSourceConfigSuccess action', () => {
        const action = SourceConfigsActions.createSourceConfigSuccess({
          sourceConfig: mockSourceConfig,
        });
        const expectedState = sourceConfigsAdapter.addOne(mockSourceConfig, {
          ...initialSourceConfigsState,
          error: null,
        });

        const result = sourceConfigsFeature.reducer(
          initialSourceConfigsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle createSourceConfigFailure action', () => {
        const error = 'Create failed';
        const action = SourceConfigsActions.createSourceConfigFailure({
          error,
        });
        const expectedState = {
          ...initialSourceConfigsState,
          error,
        };

        const result = sourceConfigsFeature.reducer(
          initialSourceConfigsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Update SourceConfig', () => {
      it('should handle updateSourceConfigSuccess action', () => {
        // First add a sourceConfig
        const stateWithSourceConfig = sourceConfigsAdapter.addOne(
          mockSourceConfig,
          initialSourceConfigsState,
        );

        const updatedSourceConfig = {
          ...mockSourceConfig /* add updated properties */,
        };
        const action = SourceConfigsActions.updateSourceConfigSuccess({
          sourceConfig: updatedSourceConfig,
        });
        const expectedState = sourceConfigsAdapter.updateOne(
          { id: updatedSourceConfig.id ?? '', changes: updatedSourceConfig },
          { ...stateWithSourceConfig, error: null },
        );

        const result = sourceConfigsFeature.reducer(
          stateWithSourceConfig,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle updateSourceConfigFailure action', () => {
        const error = 'Update failed';
        const action = SourceConfigsActions.updateSourceConfigFailure({
          error,
        });
        const expectedState = {
          ...initialSourceConfigsState,
          error,
        };

        const result = sourceConfigsFeature.reducer(
          initialSourceConfigsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Delete SourceConfig', () => {
      it('should handle deleteSourceConfigSuccess action', () => {
        // First add a sourceConfig
        const stateWithSourceConfig = sourceConfigsAdapter.addOne(
          mockSourceConfig,
          initialSourceConfigsState,
        );

        const action = SourceConfigsActions.deleteSourceConfigSuccess({
          sourceConfig: mockSourceConfig,
        });
        const expectedState = sourceConfigsAdapter.removeOne(
          mockSourceConfig?.id ?? '',
          {
            ...stateWithSourceConfig,
            error: null,
          },
        );

        const result = sourceConfigsFeature.reducer(
          stateWithSourceConfig,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle deleteSourceConfigFailure action', () => {
        const error = 'Delete failed';
        const action = SourceConfigsActions.deleteSourceConfigFailure({
          error,
        });
        const expectedState = {
          ...initialSourceConfigsState,
          error,
        };

        const result = sourceConfigsFeature.reducer(
          initialSourceConfigsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Selection Actions', () => {
      it('should handle selectSourceConfig action', () => {
        const selectedId = '1';
        const action = SourceConfigsActions.selectSourceConfig({ selectedId });
        const expectedState = {
          ...initialSourceConfigsState,
          selectedId,
        };

        const result = sourceConfigsFeature.reducer(
          initialSourceConfigsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle resetSelectedSourceConfig action', () => {
        const stateWithSelection = {
          ...initialSourceConfigsState,
          selectedId: '1',
        };
        const action = SourceConfigsActions.resetSelectedSourceConfig();
        const expectedState = {
          ...stateWithSelection,
          selectedId: null,
        };

        const result = sourceConfigsFeature.reducer(stateWithSelection, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle resetSourceConfigs action', () => {
        const stateWithSourceConfigs = sourceConfigsAdapter.setAll(
          mockSourceConfigs,
          {
            ...initialSourceConfigsState,
            selectedId: '1',
            loaded: true,
          },
        );

        const action = SourceConfigsActions.resetSourceConfigs();
        const expectedState = sourceConfigsAdapter.removeAll({
          ...stateWithSourceConfigs,
          selectedId: null,
          loaded: false,
        });

        const result = sourceConfigsFeature.reducer(
          stateWithSourceConfigs,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });
  });

  describe('Selectors', () => {
    describe('Basic Selectors', () => {
      it('should select all sourceConfigs', () => {
        const state = sourceConfigsAdapter.setAll(
          mockSourceConfigs,
          initialSourceConfigsState,
        );
        const result = selectAllSourceConfigs.projector(state);
        expect(result).toEqual(mockSourceConfigs);
      });

      it('should select sourceConfig entities', () => {
        const state = sourceConfigsAdapter.setAll(
          mockSourceConfigs,
          initialSourceConfigsState,
        );
        const result = selectSourceConfigEntities.projector(state);
        expect(result).toEqual({
          '1': mockSourceConfig,
          '2': mockSourceConfig2,
        });
      });

      it('should select sourceConfig ids', () => {
        const state = sourceConfigsAdapter.setAll(
          mockSourceConfigs,
          initialSourceConfigsState,
        );
        const result = selectSourceConfigIds.projector(state);
        expect(result).toEqual(['1', '2']);
      });

      it('should select sourceConfigs total', () => {
        const state = sourceConfigsAdapter.setAll(
          mockSourceConfigs,
          initialSourceConfigsState,
        );
        const result = selectSourceConfigsTotal.projector(state);
        expect(result).toBe(2);
      });

      it('should select sourceConfigs loaded state', () => {
        const state = { ...initialSourceConfigsState, loaded: true };
        const result = selectSourceConfigsLoaded.projector(state);
        expect(result).toBe(true);
      });

      it('should select sourceConfigs error', () => {
        const error = 'Test error';
        const state = { ...initialSourceConfigsState, error };
        const result = selectSourceConfigsError.projector(state);
        expect(result).toBe(error);
      });

      it('should select selected id', () => {
        const selectedId = '1';
        const state = { ...initialSourceConfigsState, selectedId };
        const result = selectSelectedId.projector(state);
        expect(result).toBe(selectedId);
      });
    });

    describe('Complex Selectors', () => {
      it('should select selected sourceConfig', () => {
        const state = sourceConfigsAdapter.setAll(mockSourceConfigs, {
          ...initialSourceConfigsState,
          selectedId: '1',
        });

        const entities = selectSourceConfigEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedSourceConfig.projector(
          entities,
          selectedId,
        );

        expect(result).toEqual(mockSourceConfig);
      });

      it('should return null for selected sourceConfig when no selection', () => {
        const state = sourceConfigsAdapter.setAll(mockSourceConfigs, {
          ...initialSourceConfigsState,
          selectedId: null,
        });

        const entities = selectSourceConfigEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedSourceConfig.projector(
          entities,
          selectedId,
        );

        expect(result).toBeNull();
      });

      it('should return null for selected sourceConfig when entity not found', () => {
        const state = sourceConfigsAdapter.setAll(mockSourceConfigs, {
          ...initialSourceConfigsState,
          selectedId: 'nonexistent',
        });

        const entities = selectSourceConfigEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedSourceConfig.projector(
          entities,
          selectedId,
        );

        expect(result).toBeNull();
      });
    });
  });

  describe('Feature Integration', () => {
    it('should have correct feature key', () => {
      expect(sourceConfigsFeature.name).toBe(SOURCE_CONFIGS_FEATURE_KEY);
    });

    it('should provide reducer', () => {
      expect(sourceConfigsFeature.reducer).toBeDefined();
    });

    it('should provide extra selectors', () => {
      expect(sourceConfigsFeature.selectAllSourceConfigs).toBeDefined();
      expect(sourceConfigsFeature.selectSourceConfigEntities).toBeDefined();
      expect(sourceConfigsFeature.selectSourceConfigsLoaded).toBeDefined();
      expect(sourceConfigsFeature.selectSourceConfigsError).toBeDefined();
      expect(sourceConfigsFeature.selectSelectedSourceConfig).toBeDefined();
    });
  });

  describe('Store Integration', () => {
    it('should dispatch actions and update state', () => {
      store.dispatch(
        SourceConfigsActions.loadSourceConfigsSuccess({
          sourceConfigs: mockSourceConfigs,
        }),
      );

      const state$ = store.select(selectSourceConfigsState);
      const expected$ = cold('a', {
        a: sourceConfigsAdapter.setAll(mockSourceConfigs, {
          ...initialSourceConfigsState,
          loaded: true,
          error: null,
        }),
      });

      expect(state$).toBeObservable(expected$);
    });

    it('should handle error actions', () => {
      const error = 'Test error';
      store.dispatch(SourceConfigsActions.loadSourceConfigsFailure({ error }));

      const error$ = store.select(selectSourceConfigsError);
      const expected$ = cold('a', { a: error });

      expect(error$).toBeObservable(expected$);
    });

    it('should handle selection', () => {
      store.dispatch(
        SourceConfigsActions.loadSourceConfigsSuccess({
          sourceConfigs: mockSourceConfigs,
        }),
      );
      store.dispatch(
        SourceConfigsActions.selectSourceConfig({ selectedId: '1' }),
      );

      const selectedSourceConfig$ = store.select(selectSelectedSourceConfig);
      const expected$ = cold('a', { a: mockSourceConfig });

      expect(selectedSourceConfig$).toBeObservable(expected$);
    });

    it('should handle sourceConfig update', () => {
      store.dispatch(
        SourceConfigsActions.loadSourceConfigsSuccess({
          sourceConfigs: [mockSourceConfig],
        }),
      );

      const updatedSourceConfig = {
        ...mockSourceConfig /* add updated properties */,
      };
      store.dispatch(
        SourceConfigsActions.updateSourceConfigSuccess({
          sourceConfig: updatedSourceConfig,
        }),
      );

      const state$ = store.select(selectSourceConfigEntities);
      const expected$ = cold('a', {
        a: {
          '1': updatedSourceConfig,
        },
      });

      expect(state$).toBeObservable(expected$);
    });

    it('should handle sourceConfig deletion', () => {
      store.dispatch(
        SourceConfigsActions.loadSourceConfigsSuccess({
          sourceConfigs: mockSourceConfigs,
        }),
      );
      store.dispatch(
        SourceConfigsActions.deleteSourceConfigSuccess({
          sourceConfig: mockSourceConfig,
        }),
      );

      const state$ = store.select(selectAllSourceConfigs);
      const expected$ = cold('a', { a: [mockSourceConfig2] });

      expect(state$).toBeObservable(expected$);
    });
  });
});
