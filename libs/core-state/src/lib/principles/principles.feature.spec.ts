import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { Principle } from '@kasita/common-models';
import { PrinciplesActions } from './principles.actions';
import {
  principlesFeature,
  initialPrinciplesState,
  principlesAdapter,
  PRINCIPLES_FEATURE_KEY,
  selectAllPrinciples,
  selectPrincipleEntities,
  selectPrincipleIds,
  selectPrinciplesTotal,
  selectPrinciplesLoaded,
  selectPrinciplesError,
  selectSelectedId,
  selectSelectedPrinciple,
  selectPrinciplesByPathId,
} from './principles.feature';

describe('Principles Feature', () => {
  let store: Store;

  const mockPrinciple: Principle = {
    id: 'principle-1',
    pathId: 'path-1',
    name: 'Server Components Fundamentals',
    description: 'Understanding the core concepts of React Server Components',
    estimatedHours: 2,
    difficulty: 'foundational',
    prerequisites: [],
    order: 0,
    status: 'pending',
  };

  const mockPrinciple2: Principle = {
    id: 'principle-2',
    pathId: 'path-1',
    name: 'Streaming & Suspense',
    description: 'Learn how Server Components enable streaming SSR',
    estimatedHours: 3,
    difficulty: 'intermediate',
    prerequisites: ['principle-1'],
    order: 1,
    status: 'pending',
  };

  const mockPrinciple3: Principle = {
    id: 'principle-3',
    pathId: 'path-2', // Different path
    name: 'Machine Learning Basics',
    description: 'Introduction to ML concepts',
    estimatedHours: 4,
    difficulty: 'foundational',
    prerequisites: [],
    order: 0,
    status: 'pending',
  };

  const mockPrinciples: Principle[] = [mockPrinciple, mockPrinciple2];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({
          [PRINCIPLES_FEATURE_KEY]: principlesFeature.reducer,
        }),
        provideEffects([]),
      ],
    });

    store = TestBed.inject(Store);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const expectedState = initialPrinciplesState;
      expect(expectedState).toEqual({
        ids: [],
        entities: {},
        selectedId: null,
        error: null,
        loaded: false,
      });
    });
  });

  describe('Reducer Direct Tests', () => {
    it('should return initial state when action is unknown', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' };
      const result = principlesFeature.reducer(
        initialPrinciplesState,
        unknownAction,
      );
      expect(result).toBe(initialPrinciplesState);
    });

    it('should handle onFailure helper function', () => {
      const error = 'Test error';
      const state = { ...initialPrinciplesState, loaded: true };
      const result = principlesFeature.reducer(
        state,
        PrinciplesActions.loadPrinciplesFailure({ error }),
      );
      expect(result.error).toBe(error);
    });
  });

  describe('Actions', () => {
    describe('Load Principles', () => {
      it('should handle loadPrinciples action', () => {
        const action = PrinciplesActions.loadPrinciples();
        const expectedState = {
          ...initialPrinciplesState,
          loaded: false,
          error: null,
        };

        const result = principlesFeature.reducer(
          initialPrinciplesState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadPrinciplesSuccess action', () => {
        const action = PrinciplesActions.loadPrinciplesSuccess({
          principles: mockPrinciples,
        });
        const expectedState = principlesAdapter.setAll(mockPrinciples, {
          ...initialPrinciplesState,
          loaded: true,
          error: null,
        });

        const result = principlesFeature.reducer(
          initialPrinciplesState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadPrinciplesFailure action', () => {
        const error = 'Load failed';
        const action = PrinciplesActions.loadPrinciplesFailure({ error });
        const expectedState = {
          ...initialPrinciplesState,
          error,
        };

        const result = principlesFeature.reducer(
          initialPrinciplesState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Load Principle', () => {
      it('should handle loadPrinciple action', () => {
        const action = PrinciplesActions.loadPrinciple({
          principleId: 'principle-1',
        });
        const expectedState = {
          ...initialPrinciplesState,
          loaded: false,
          error: null,
        };

        const result = principlesFeature.reducer(
          initialPrinciplesState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadPrincipleSuccess action', () => {
        const action = PrinciplesActions.loadPrincipleSuccess({
          principle: mockPrinciple,
        });
        const expectedState = principlesAdapter.upsertOne(mockPrinciple, {
          ...initialPrinciplesState,
          loaded: true,
          error: null,
        });

        const result = principlesFeature.reducer(
          initialPrinciplesState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadPrincipleFailure action', () => {
        const error = 'Load failed';
        const action = PrinciplesActions.loadPrincipleFailure({ error });
        const expectedState = {
          ...initialPrinciplesState,
          error,
        };

        const result = principlesFeature.reducer(
          initialPrinciplesState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Load Principles By Path', () => {
      it('should handle loadPrinciplesByPath action', () => {
        const action = PrinciplesActions.loadPrinciplesByPath({
          pathId: 'path-1',
        });
        const expectedState = {
          ...initialPrinciplesState,
          loaded: false,
          error: null,
        };

        const result = principlesFeature.reducer(
          initialPrinciplesState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadPrinciplesByPathSuccess action', () => {
        const action = PrinciplesActions.loadPrinciplesByPathSuccess({
          principles: mockPrinciples,
        });
        const expectedState = principlesAdapter.setAll(mockPrinciples, {
          ...initialPrinciplesState,
          loaded: true,
          error: null,
        });

        const result = principlesFeature.reducer(
          initialPrinciplesState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadPrinciplesByPathFailure action', () => {
        const error = 'Load by path failed';
        const action = PrinciplesActions.loadPrinciplesByPathFailure({ error });
        const expectedState = {
          ...initialPrinciplesState,
          error,
        };

        const result = principlesFeature.reducer(
          initialPrinciplesState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Create Principle', () => {
      it('should handle createPrincipleSuccess action', () => {
        const action = PrinciplesActions.createPrincipleSuccess({
          principle: mockPrinciple,
        });
        const expectedState = principlesAdapter.addOne(mockPrinciple, {
          ...initialPrinciplesState,
          error: null,
        });

        const result = principlesFeature.reducer(
          initialPrinciplesState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle createPrincipleFailure action', () => {
        const error = 'Create failed';
        const action = PrinciplesActions.createPrincipleFailure({
          error,
        });
        const expectedState = {
          ...initialPrinciplesState,
          error,
        };

        const result = principlesFeature.reducer(
          initialPrinciplesState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Update Principle', () => {
      it('should handle updatePrincipleSuccess action', () => {
        const stateWithPrinciple = principlesAdapter.addOne(
          mockPrinciple,
          initialPrinciplesState,
        );

        const updatedPrinciple = {
          ...mockPrinciple,
          name: 'Updated Name',
          status: 'in_progress' as const,
        };
        const action = PrinciplesActions.updatePrincipleSuccess({
          principle: updatedPrinciple,
        });
        const expectedState = principlesAdapter.updateOne(
          { id: updatedPrinciple.id ?? '', changes: updatedPrinciple },
          { ...stateWithPrinciple, error: null },
        );

        const result = principlesFeature.reducer(stateWithPrinciple, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle updatePrincipleFailure action', () => {
        const error = 'Update failed';
        const action = PrinciplesActions.updatePrincipleFailure({
          error,
        });
        const expectedState = {
          ...initialPrinciplesState,
          error,
        };

        const result = principlesFeature.reducer(
          initialPrinciplesState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Delete Principle', () => {
      it('should handle deletePrincipleSuccess action', () => {
        const stateWithPrinciple = principlesAdapter.addOne(
          mockPrinciple,
          initialPrinciplesState,
        );

        const action = PrinciplesActions.deletePrincipleSuccess({
          principle: mockPrinciple,
        });
        const expectedState = principlesAdapter.removeOne(
          mockPrinciple?.id ?? '',
          {
            ...stateWithPrinciple,
            error: null,
          },
        );

        const result = principlesFeature.reducer(stateWithPrinciple, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle deletePrincipleFailure action', () => {
        const error = 'Delete failed';
        const action = PrinciplesActions.deletePrincipleFailure({
          error,
        });
        const expectedState = {
          ...initialPrinciplesState,
          error,
        };

        const result = principlesFeature.reducer(
          initialPrinciplesState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Selection Actions', () => {
      it('should handle selectPrinciple action', () => {
        const selectedId = 'principle-1';
        const action = PrinciplesActions.selectPrinciple({ selectedId });
        const expectedState = {
          ...initialPrinciplesState,
          selectedId,
        };

        const result = principlesFeature.reducer(
          initialPrinciplesState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle resetSelectedPrinciple action', () => {
        const stateWithSelection = {
          ...initialPrinciplesState,
          selectedId: 'principle-1',
        };
        const action = PrinciplesActions.resetSelectedPrinciple();
        const expectedState = {
          ...stateWithSelection,
          selectedId: null,
        };

        const result = principlesFeature.reducer(stateWithSelection, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle resetPrinciples action', () => {
        const stateWithPrinciples = principlesAdapter.setAll(mockPrinciples, {
          ...initialPrinciplesState,
          selectedId: 'principle-1',
          loaded: true,
        });

        const action = PrinciplesActions.resetPrinciples();
        const expectedState = principlesAdapter.removeAll({
          ...stateWithPrinciples,
          selectedId: null,
          loaded: false,
        });

        const result = principlesFeature.reducer(stateWithPrinciples, action);
        expect(result).toEqual(expectedState);
      });
    });
  });

  describe('Selectors', () => {
    describe('Basic Selectors', () => {
      it('should select all principles', () => {
        const state = principlesAdapter.setAll(
          mockPrinciples,
          initialPrinciplesState,
        );
        const result = selectAllPrinciples.projector(state);
        expect(result).toEqual(mockPrinciples);
      });

      it('should select principle entities', () => {
        const state = principlesAdapter.setAll(
          mockPrinciples,
          initialPrinciplesState,
        );
        const result = selectPrincipleEntities.projector(state);
        expect(result).toEqual({
          'principle-1': mockPrinciple,
          'principle-2': mockPrinciple2,
        });
      });

      it('should select principle ids', () => {
        const state = principlesAdapter.setAll(
          mockPrinciples,
          initialPrinciplesState,
        );
        const result = selectPrincipleIds.projector(state);
        expect(result).toEqual(['principle-1', 'principle-2']);
      });

      it('should select principles total', () => {
        const state = principlesAdapter.setAll(
          mockPrinciples,
          initialPrinciplesState,
        );
        const result = selectPrinciplesTotal.projector(state);
        expect(result).toBe(2);
      });

      it('should select principles loaded state', () => {
        const state = { ...initialPrinciplesState, loaded: true };
        const result = selectPrinciplesLoaded.projector(state);
        expect(result).toBe(true);
      });

      it('should select principles error', () => {
        const error = 'Test error';
        const state = { ...initialPrinciplesState, error };
        const result = selectPrinciplesError.projector(state);
        expect(result).toBe(error);
      });

      it('should select selected id', () => {
        const selectedId = 'principle-1';
        const state = { ...initialPrinciplesState, selectedId };
        const result = selectSelectedId.projector(state);
        expect(result).toBe(selectedId);
      });
    });

    describe('Complex Selectors', () => {
      it('should select selected principle', () => {
        const state = principlesAdapter.setAll(mockPrinciples, {
          ...initialPrinciplesState,
          selectedId: 'principle-1',
        });

        const entities = selectPrincipleEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedPrinciple.projector(entities, selectedId);

        expect(result).toEqual(mockPrinciple);
      });

      it('should return null for selected principle when no selection', () => {
        const state = principlesAdapter.setAll(mockPrinciples, {
          ...initialPrinciplesState,
          selectedId: null,
        });

        const entities = selectPrincipleEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedPrinciple.projector(entities, selectedId);

        expect(result).toBeNull();
      });

      it('should return null for selected principle when entity not found', () => {
        const state = principlesAdapter.setAll(mockPrinciples, {
          ...initialPrinciplesState,
          selectedId: 'nonexistent',
        });

        const entities = selectPrincipleEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedPrinciple.projector(entities, selectedId);

        expect(result).toBeNull();
      });

      it('should select principles by path id', () => {
        const allPrinciples = [mockPrinciple, mockPrinciple2, mockPrinciple3];
        const selector = selectPrinciplesByPathId('path-1');
        const result = selector.projector(allPrinciples);

        expect(result).toEqual([mockPrinciple, mockPrinciple2]);
        expect(result).not.toContain(mockPrinciple3);
      });

      it('should return empty array when no principles match path', () => {
        const selector = selectPrinciplesByPathId('nonexistent-path');
        const result = selector.projector(mockPrinciples);

        expect(result).toEqual([]);
      });
    });
  });

  describe('Feature Integration', () => {
    it('should have correct feature key', () => {
      expect(principlesFeature.name).toBe(PRINCIPLES_FEATURE_KEY);
    });

    it('should provide reducer', () => {
      expect(principlesFeature.reducer).toBeDefined();
    });

    it('should provide extra selectors', () => {
      expect(principlesFeature.selectAllPrinciples).toBeDefined();
      expect(principlesFeature.selectPrincipleEntities).toBeDefined();
      expect(principlesFeature.selectPrinciplesLoaded).toBeDefined();
      expect(principlesFeature.selectPrinciplesError).toBeDefined();
      expect(principlesFeature.selectSelectedPrinciple).toBeDefined();
      expect(principlesFeature.selectPrinciplesByPathId).toBeDefined();
    });
  });

  describe('Store Integration', () => {
    it('should dispatch actions and update state', async () => {
      store.dispatch(
        PrinciplesActions.loadPrinciplesSuccess({
          principles: mockPrinciples,
        }),
      );

      const loaded = await firstValueFrom(store.select(selectPrinciplesLoaded));
      expect(loaded).toBe(true);
    });

    it('should handle error actions', async () => {
      const error = 'Test error';
      store.dispatch(PrinciplesActions.loadPrinciplesFailure({ error }));

      const result = await firstValueFrom(store.select(selectPrinciplesError));
      expect(result).toBe(error);
    });

    it('should handle selection', async () => {
      store.dispatch(
        PrinciplesActions.loadPrinciplesSuccess({
          principles: mockPrinciples,
        }),
      );
      store.dispatch(
        PrinciplesActions.selectPrinciple({ selectedId: 'principle-1' }),
      );

      const selected = await firstValueFrom(store.select(selectSelectedPrinciple));
      expect(selected).toEqual(mockPrinciple);
    });

    it('should handle principle update', async () => {
      store.dispatch(
        PrinciplesActions.loadPrinciplesSuccess({
          principles: [mockPrinciple],
        }),
      );

      const updatedPrinciple = {
        ...mockPrinciple,
        name: 'Updated Name',
      };
      store.dispatch(
        PrinciplesActions.updatePrincipleSuccess({
          principle: updatedPrinciple,
        }),
      );

      const entities = await firstValueFrom(store.select(selectPrincipleEntities));
      expect(entities['principle-1']).toEqual(updatedPrinciple);
    });

    it('should handle principle deletion', async () => {
      store.dispatch(
        PrinciplesActions.loadPrinciplesSuccess({
          principles: mockPrinciples,
        }),
      );
      store.dispatch(
        PrinciplesActions.deletePrincipleSuccess({
          principle: mockPrinciple,
        }),
      );

      const result = await firstValueFrom(store.select(selectAllPrinciples));
      expect(result).toEqual([mockPrinciple2]);
    });
  });
});
