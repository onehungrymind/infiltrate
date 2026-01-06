import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { KnowledgeUnit } from '@kasita/common-models';
import { KnowledgeUnitsActions } from './knowledge-units.actions';
import {
  knowledgeUnitsFeature,
  initialKnowledgeUnitsState,
  knowledgeUnitsAdapter,
  KNOWLEDGE_UNITS_FEATURE_KEY,
  selectAllKnowledgeUnits,
  selectKnowledgeUnitEntities,
  selectKnowledgeUnitIds,
  selectKnowledgeUnitsTotal,
  selectKnowledgeUnitsLoaded,
  selectKnowledgeUnitsError,
  selectSelectedId,
  selectSelectedKnowledgeUnit,
  selectKnowledgeUnitsState,
} from './knowledge-units.feature';

describe('KnowledgeUnits Feature', () => {
  let store: Store;

  const mockKnowledgeUnit: KnowledgeUnit = {
    id: '1',
    // Add your entity properties here based on the interface
  };

  const mockKnowledgeUnit2: KnowledgeUnit = {
    id: '2',
    // Add your entity properties here based on the interface
  };

  const mockKnowledgeUnits: KnowledgeUnit[] = [
    mockKnowledgeUnit,
    mockKnowledgeUnit2,
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({
          [KNOWLEDGE_UNITS_FEATURE_KEY]: knowledgeUnitsFeature.reducer,
        }),
        provideEffects([]),
      ],
    });

    store = TestBed.inject(Store);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const expectedState = initialKnowledgeUnitsState;
      expect(expectedState).toEqual({
        ids: [],
        entities: {},
        selectedId: null,
        error: null,
        loaded: false,
      });
    });

    it('should select initial state', () => {
      const result = selectKnowledgeUnitsState.projector(
        initialKnowledgeUnitsState,
      );
      expect(result).toEqual(initialKnowledgeUnitsState);
    });
  });

  describe('Reducer Direct Tests', () => {
    it('should return initial state when action is unknown', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' };
      const result = knowledgeUnitsFeature.reducer(
        initialKnowledgeUnitsState,
        unknownAction,
      );
      expect(result).toBe(initialKnowledgeUnitsState);
    });

    it('should handle onFailure helper function', () => {
      const error = 'Test error';
      const state = { ...initialKnowledgeUnitsState, loaded: true };
      const result = knowledgeUnitsFeature.reducer(
        state,
        KnowledgeUnitsActions.loadKnowledgeUnitsFailure({ error }),
      );
      expect(result.error).toBe(error);
      expect(result.loaded).toBe(true); // Should not change loaded state
    });
  });

  describe('Actions', () => {
    describe('Load KnowledgeUnits', () => {
      it('should handle loadKnowledgeUnits action', () => {
        const action = KnowledgeUnitsActions.loadKnowledgeUnits();
        const expectedState = {
          ...initialKnowledgeUnitsState,
          loaded: false,
          error: null,
        };

        const result = knowledgeUnitsFeature.reducer(
          initialKnowledgeUnitsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadKnowledgeUnitsSuccess action', () => {
        const action = KnowledgeUnitsActions.loadKnowledgeUnitsSuccess({
          knowledgeUnits: mockKnowledgeUnits,
        });
        const expectedState = knowledgeUnitsAdapter.setAll(mockKnowledgeUnits, {
          ...initialKnowledgeUnitsState,
          loaded: true,
          error: null,
        });

        const result = knowledgeUnitsFeature.reducer(
          initialKnowledgeUnitsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadKnowledgeUnitsFailure action', () => {
        const error = 'Load failed';
        const action = KnowledgeUnitsActions.loadKnowledgeUnitsFailure({
          error,
        });
        const expectedState = {
          ...initialKnowledgeUnitsState,
          error,
        };

        const result = knowledgeUnitsFeature.reducer(
          initialKnowledgeUnitsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Load KnowledgeUnit', () => {
      it('should handle loadKnowledgeUnit action', () => {
        const action = KnowledgeUnitsActions.loadKnowledgeUnit({
          knowledgeUnitId: '1',
        });
        const expectedState = {
          ...initialKnowledgeUnitsState,
          loaded: false,
          error: null,
        };

        const result = knowledgeUnitsFeature.reducer(
          initialKnowledgeUnitsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadKnowledgeUnitSuccess action', () => {
        const action = KnowledgeUnitsActions.loadKnowledgeUnitSuccess({
          knowledgeUnit: mockKnowledgeUnit,
        });
        const expectedState = knowledgeUnitsAdapter.upsertOne(
          mockKnowledgeUnit,
          {
            ...initialKnowledgeUnitsState,
            loaded: true,
            error: null,
          },
        );

        const result = knowledgeUnitsFeature.reducer(
          initialKnowledgeUnitsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadKnowledgeUnitFailure action', () => {
        const error = 'Load failed';
        const action = KnowledgeUnitsActions.loadKnowledgeUnitFailure({
          error,
        });
        const expectedState = {
          ...initialKnowledgeUnitsState,
          error,
        };

        const result = knowledgeUnitsFeature.reducer(
          initialKnowledgeUnitsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Create KnowledgeUnit', () => {
      it('should handle createKnowledgeUnitSuccess action', () => {
        const action = KnowledgeUnitsActions.createKnowledgeUnitSuccess({
          knowledgeUnit: mockKnowledgeUnit,
        });
        const expectedState = knowledgeUnitsAdapter.addOne(mockKnowledgeUnit, {
          ...initialKnowledgeUnitsState,
          error: null,
        });

        const result = knowledgeUnitsFeature.reducer(
          initialKnowledgeUnitsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle createKnowledgeUnitFailure action', () => {
        const error = 'Create failed';
        const action = KnowledgeUnitsActions.createKnowledgeUnitFailure({
          error,
        });
        const expectedState = {
          ...initialKnowledgeUnitsState,
          error,
        };

        const result = knowledgeUnitsFeature.reducer(
          initialKnowledgeUnitsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Update KnowledgeUnit', () => {
      it('should handle updateKnowledgeUnitSuccess action', () => {
        // First add a knowledgeUnit
        const stateWithKnowledgeUnit = knowledgeUnitsAdapter.addOne(
          mockKnowledgeUnit,
          initialKnowledgeUnitsState,
        );

        const updatedKnowledgeUnit = {
          ...mockKnowledgeUnit /* add updated properties */,
        };
        const action = KnowledgeUnitsActions.updateKnowledgeUnitSuccess({
          knowledgeUnit: updatedKnowledgeUnit,
        });
        const expectedState = knowledgeUnitsAdapter.updateOne(
          { id: updatedKnowledgeUnit.id ?? '', changes: updatedKnowledgeUnit },
          { ...stateWithKnowledgeUnit, error: null },
        );

        const result = knowledgeUnitsFeature.reducer(
          stateWithKnowledgeUnit,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle updateKnowledgeUnitFailure action', () => {
        const error = 'Update failed';
        const action = KnowledgeUnitsActions.updateKnowledgeUnitFailure({
          error,
        });
        const expectedState = {
          ...initialKnowledgeUnitsState,
          error,
        };

        const result = knowledgeUnitsFeature.reducer(
          initialKnowledgeUnitsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Delete KnowledgeUnit', () => {
      it('should handle deleteKnowledgeUnitSuccess action', () => {
        // First add a knowledgeUnit
        const stateWithKnowledgeUnit = knowledgeUnitsAdapter.addOne(
          mockKnowledgeUnit,
          initialKnowledgeUnitsState,
        );

        const action = KnowledgeUnitsActions.deleteKnowledgeUnitSuccess({
          knowledgeUnit: mockKnowledgeUnit,
        });
        const expectedState = knowledgeUnitsAdapter.removeOne(
          mockKnowledgeUnit?.id ?? '',
          {
            ...stateWithKnowledgeUnit,
            error: null,
          },
        );

        const result = knowledgeUnitsFeature.reducer(
          stateWithKnowledgeUnit,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle deleteKnowledgeUnitFailure action', () => {
        const error = 'Delete failed';
        const action = KnowledgeUnitsActions.deleteKnowledgeUnitFailure({
          error,
        });
        const expectedState = {
          ...initialKnowledgeUnitsState,
          error,
        };

        const result = knowledgeUnitsFeature.reducer(
          initialKnowledgeUnitsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Selection Actions', () => {
      it('should handle selectKnowledgeUnit action', () => {
        const selectedId = '1';
        const action = KnowledgeUnitsActions.selectKnowledgeUnit({
          selectedId,
        });
        const expectedState = {
          ...initialKnowledgeUnitsState,
          selectedId,
        };

        const result = knowledgeUnitsFeature.reducer(
          initialKnowledgeUnitsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle resetSelectedKnowledgeUnit action', () => {
        const stateWithSelection = {
          ...initialKnowledgeUnitsState,
          selectedId: '1',
        };
        const action = KnowledgeUnitsActions.resetSelectedKnowledgeUnit();
        const expectedState = {
          ...stateWithSelection,
          selectedId: null,
        };

        const result = knowledgeUnitsFeature.reducer(
          stateWithSelection,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle resetKnowledgeUnits action', () => {
        const stateWithKnowledgeUnits = knowledgeUnitsAdapter.setAll(
          mockKnowledgeUnits,
          {
            ...initialKnowledgeUnitsState,
            selectedId: '1',
            loaded: true,
          },
        );

        const action = KnowledgeUnitsActions.resetKnowledgeUnits();
        const expectedState = knowledgeUnitsAdapter.removeAll({
          ...stateWithKnowledgeUnits,
          selectedId: null,
          loaded: false,
        });

        const result = knowledgeUnitsFeature.reducer(
          stateWithKnowledgeUnits,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });
  });

  describe('Selectors', () => {
    describe('Basic Selectors', () => {
      it('should select all knowledgeUnits', () => {
        const state = knowledgeUnitsAdapter.setAll(
          mockKnowledgeUnits,
          initialKnowledgeUnitsState,
        );
        const result = selectAllKnowledgeUnits.projector(state);
        expect(result).toEqual(mockKnowledgeUnits);
      });

      it('should select knowledgeUnit entities', () => {
        const state = knowledgeUnitsAdapter.setAll(
          mockKnowledgeUnits,
          initialKnowledgeUnitsState,
        );
        const result = selectKnowledgeUnitEntities.projector(state);
        expect(result).toEqual({
          '1': mockKnowledgeUnit,
          '2': mockKnowledgeUnit2,
        });
      });

      it('should select knowledgeUnit ids', () => {
        const state = knowledgeUnitsAdapter.setAll(
          mockKnowledgeUnits,
          initialKnowledgeUnitsState,
        );
        const result = selectKnowledgeUnitIds.projector(state);
        expect(result).toEqual(['1', '2']);
      });

      it('should select knowledgeUnits total', () => {
        const state = knowledgeUnitsAdapter.setAll(
          mockKnowledgeUnits,
          initialKnowledgeUnitsState,
        );
        const result = selectKnowledgeUnitsTotal.projector(state);
        expect(result).toBe(2);
      });

      it('should select knowledgeUnits loaded state', () => {
        const state = { ...initialKnowledgeUnitsState, loaded: true };
        const result = selectKnowledgeUnitsLoaded.projector(state);
        expect(result).toBe(true);
      });

      it('should select knowledgeUnits error', () => {
        const error = 'Test error';
        const state = { ...initialKnowledgeUnitsState, error };
        const result = selectKnowledgeUnitsError.projector(state);
        expect(result).toBe(error);
      });

      it('should select selected id', () => {
        const selectedId = '1';
        const state = { ...initialKnowledgeUnitsState, selectedId };
        const result = selectSelectedId.projector(state);
        expect(result).toBe(selectedId);
      });
    });

    describe('Complex Selectors', () => {
      it('should select selected knowledgeUnit', () => {
        const state = knowledgeUnitsAdapter.setAll(mockKnowledgeUnits, {
          ...initialKnowledgeUnitsState,
          selectedId: '1',
        });

        const entities = selectKnowledgeUnitEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedKnowledgeUnit.projector(
          entities,
          selectedId,
        );

        expect(result).toEqual(mockKnowledgeUnit);
      });

      it('should return null for selected knowledgeUnit when no selection', () => {
        const state = knowledgeUnitsAdapter.setAll(mockKnowledgeUnits, {
          ...initialKnowledgeUnitsState,
          selectedId: null,
        });

        const entities = selectKnowledgeUnitEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedKnowledgeUnit.projector(
          entities,
          selectedId,
        );

        expect(result).toBeNull();
      });

      it('should return null for selected knowledgeUnit when entity not found', () => {
        const state = knowledgeUnitsAdapter.setAll(mockKnowledgeUnits, {
          ...initialKnowledgeUnitsState,
          selectedId: 'nonexistent',
        });

        const entities = selectKnowledgeUnitEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedKnowledgeUnit.projector(
          entities,
          selectedId,
        );

        expect(result).toBeNull();
      });
    });
  });

  describe('Feature Integration', () => {
    it('should have correct feature key', () => {
      expect(knowledgeUnitsFeature.name).toBe(KNOWLEDGE_UNITS_FEATURE_KEY);
    });

    it('should provide reducer', () => {
      expect(knowledgeUnitsFeature.reducer).toBeDefined();
    });

    it('should provide extra selectors', () => {
      expect(knowledgeUnitsFeature.selectAllKnowledgeUnits).toBeDefined();
      expect(knowledgeUnitsFeature.selectKnowledgeUnitEntities).toBeDefined();
      expect(knowledgeUnitsFeature.selectKnowledgeUnitsLoaded).toBeDefined();
      expect(knowledgeUnitsFeature.selectKnowledgeUnitsError).toBeDefined();
      expect(knowledgeUnitsFeature.selectSelectedKnowledgeUnit).toBeDefined();
    });
  });

  describe('Store Integration', () => {
    it('should dispatch actions and update state', () => {
      store.dispatch(
        KnowledgeUnitsActions.loadKnowledgeUnitsSuccess({
          knowledgeUnits: mockKnowledgeUnits,
        }),
      );

      const state$ = store.select(selectKnowledgeUnitsState);
      const expected$ = cold('a', {
        a: knowledgeUnitsAdapter.setAll(mockKnowledgeUnits, {
          ...initialKnowledgeUnitsState,
          loaded: true,
          error: null,
        }),
      });

      expect(state$).toBeObservable(expected$);
    });

    it('should handle error actions', () => {
      const error = 'Test error';
      store.dispatch(
        KnowledgeUnitsActions.loadKnowledgeUnitsFailure({ error }),
      );

      const error$ = store.select(selectKnowledgeUnitsError);
      const expected$ = cold('a', { a: error });

      expect(error$).toBeObservable(expected$);
    });

    it('should handle selection', () => {
      store.dispatch(
        KnowledgeUnitsActions.loadKnowledgeUnitsSuccess({
          knowledgeUnits: mockKnowledgeUnits,
        }),
      );
      store.dispatch(
        KnowledgeUnitsActions.selectKnowledgeUnit({ selectedId: '1' }),
      );

      const selectedKnowledgeUnit$ = store.select(selectSelectedKnowledgeUnit);
      const expected$ = cold('a', { a: mockKnowledgeUnit });

      expect(selectedKnowledgeUnit$).toBeObservable(expected$);
    });

    it('should handle knowledgeUnit update', () => {
      store.dispatch(
        KnowledgeUnitsActions.loadKnowledgeUnitsSuccess({
          knowledgeUnits: [mockKnowledgeUnit],
        }),
      );

      const updatedKnowledgeUnit = {
        ...mockKnowledgeUnit /* add updated properties */,
      };
      store.dispatch(
        KnowledgeUnitsActions.updateKnowledgeUnitSuccess({
          knowledgeUnit: updatedKnowledgeUnit,
        }),
      );

      const state$ = store.select(selectKnowledgeUnitEntities);
      const expected$ = cold('a', {
        a: {
          '1': updatedKnowledgeUnit,
        },
      });

      expect(state$).toBeObservable(expected$);
    });

    it('should handle knowledgeUnit deletion', () => {
      store.dispatch(
        KnowledgeUnitsActions.loadKnowledgeUnitsSuccess({
          knowledgeUnits: mockKnowledgeUnits,
        }),
      );
      store.dispatch(
        KnowledgeUnitsActions.deleteKnowledgeUnitSuccess({
          knowledgeUnit: mockKnowledgeUnit,
        }),
      );

      const state$ = store.select(selectAllKnowledgeUnits);
      const expected$ = cold('a', { a: [mockKnowledgeUnit2] });

      expect(state$).toBeObservable(expected$);
    });
  });
});
