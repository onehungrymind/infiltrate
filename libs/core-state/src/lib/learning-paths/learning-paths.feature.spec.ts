import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { LearningPath } from '@kasita/common-models';
import { LearningPathsActions } from './learning-paths.actions';
import {
  learningPathsFeature,
  initialLearningPathsState,
  learningPathsAdapter,
  LEARNING_PATHS_FEATURE_KEY,
  selectAllLearningPaths,
  selectLearningPathEntities,
  selectLearningPathIds,
  selectLearningPathsTotal,
  selectLearningPathsLoaded,
  selectLearningPathsError,
  selectSelectedId,
  selectSelectedLearningPath,
  selectLearningPathsState,
} from './learning-paths.feature';

describe('LearningPaths Feature', () => {
  let store: Store;

  const mockLearningPath: LearningPath = {
    id: '1',
    // Add your entity properties here based on the interface
  };

  const mockLearningPath2: LearningPath = {
    id: '2',
    // Add your entity properties here based on the interface
  };

  const mockLearningPaths: LearningPath[] = [
    mockLearningPath,
    mockLearningPath2,
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({
          [LEARNING_PATHS_FEATURE_KEY]: learningPathsFeature.reducer,
        }),
        provideEffects([]),
      ],
    });

    store = TestBed.inject(Store);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const expectedState = initialLearningPathsState;
      expect(expectedState).toEqual({
        ids: [],
        entities: {},
        selectedId: null,
        error: null,
        loaded: false,
      });
    });

    it('should select initial state', () => {
      const result = selectLearningPathsState.projector(
        initialLearningPathsState,
      );
      expect(result).toEqual(initialLearningPathsState);
    });
  });

  describe('Reducer Direct Tests', () => {
    it('should return initial state when action is unknown', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' };
      const result = learningPathsFeature.reducer(
        initialLearningPathsState,
        unknownAction,
      );
      expect(result).toBe(initialLearningPathsState);
    });

    it('should handle onFailure helper function', () => {
      const error = 'Test error';
      const state = { ...initialLearningPathsState, loaded: true };
      const result = learningPathsFeature.reducer(
        state,
        LearningPathsActions.loadLearningPathsFailure({ error }),
      );
      expect(result.error).toBe(error);
      expect(result.loaded).toBe(true); // Should not change loaded state
    });
  });

  describe('Actions', () => {
    describe('Load LearningPaths', () => {
      it('should handle loadLearningPaths action', () => {
        const action = LearningPathsActions.loadLearningPaths();
        const expectedState = {
          ...initialLearningPathsState,
          loaded: false,
          error: null,
        };

        const result = learningPathsFeature.reducer(
          initialLearningPathsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadLearningPathsSuccess action', () => {
        const action = LearningPathsActions.loadLearningPathsSuccess({
          learningPaths: mockLearningPaths,
        });
        const expectedState = learningPathsAdapter.setAll(mockLearningPaths, {
          ...initialLearningPathsState,
          loaded: true,
          error: null,
        });

        const result = learningPathsFeature.reducer(
          initialLearningPathsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadLearningPathsFailure action', () => {
        const error = 'Load failed';
        const action = LearningPathsActions.loadLearningPathsFailure({ error });
        const expectedState = {
          ...initialLearningPathsState,
          error,
        };

        const result = learningPathsFeature.reducer(
          initialLearningPathsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Load LearningPath', () => {
      it('should handle loadLearningPath action', () => {
        const action = LearningPathsActions.loadLearningPath({
          learningPathId: '1',
        });
        const expectedState = {
          ...initialLearningPathsState,
          loaded: false,
          error: null,
        };

        const result = learningPathsFeature.reducer(
          initialLearningPathsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadLearningPathSuccess action', () => {
        const action = LearningPathsActions.loadLearningPathSuccess({
          learningPath: mockLearningPath,
        });
        const expectedState = learningPathsAdapter.upsertOne(mockLearningPath, {
          ...initialLearningPathsState,
          loaded: true,
          error: null,
        });

        const result = learningPathsFeature.reducer(
          initialLearningPathsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadLearningPathFailure action', () => {
        const error = 'Load failed';
        const action = LearningPathsActions.loadLearningPathFailure({ error });
        const expectedState = {
          ...initialLearningPathsState,
          error,
        };

        const result = learningPathsFeature.reducer(
          initialLearningPathsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Create LearningPath', () => {
      it('should handle createLearningPathSuccess action', () => {
        const action = LearningPathsActions.createLearningPathSuccess({
          learningPath: mockLearningPath,
        });
        const expectedState = learningPathsAdapter.addOne(mockLearningPath, {
          ...initialLearningPathsState,
          error: null,
        });

        const result = learningPathsFeature.reducer(
          initialLearningPathsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle createLearningPathFailure action', () => {
        const error = 'Create failed';
        const action = LearningPathsActions.createLearningPathFailure({
          error,
        });
        const expectedState = {
          ...initialLearningPathsState,
          error,
        };

        const result = learningPathsFeature.reducer(
          initialLearningPathsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Update LearningPath', () => {
      it('should handle updateLearningPathSuccess action', () => {
        // First add a learningPath
        const stateWithLearningPath = learningPathsAdapter.addOne(
          mockLearningPath,
          initialLearningPathsState,
        );

        const updatedLearningPath = {
          ...mockLearningPath /* add updated properties */,
        };
        const action = LearningPathsActions.updateLearningPathSuccess({
          learningPath: updatedLearningPath,
        });
        const expectedState = learningPathsAdapter.updateOne(
          { id: updatedLearningPath.id ?? '', changes: updatedLearningPath },
          { ...stateWithLearningPath, error: null },
        );

        const result = learningPathsFeature.reducer(
          stateWithLearningPath,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle updateLearningPathFailure action', () => {
        const error = 'Update failed';
        const action = LearningPathsActions.updateLearningPathFailure({
          error,
        });
        const expectedState = {
          ...initialLearningPathsState,
          error,
        };

        const result = learningPathsFeature.reducer(
          initialLearningPathsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Delete LearningPath', () => {
      it('should handle deleteLearningPathSuccess action', () => {
        // First add a learningPath
        const stateWithLearningPath = learningPathsAdapter.addOne(
          mockLearningPath,
          initialLearningPathsState,
        );

        const action = LearningPathsActions.deleteLearningPathSuccess({
          learningPath: mockLearningPath,
        });
        const expectedState = learningPathsAdapter.removeOne(
          mockLearningPath?.id ?? '',
          {
            ...stateWithLearningPath,
            error: null,
          },
        );

        const result = learningPathsFeature.reducer(
          stateWithLearningPath,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle deleteLearningPathFailure action', () => {
        const error = 'Delete failed';
        const action = LearningPathsActions.deleteLearningPathFailure({
          error,
        });
        const expectedState = {
          ...initialLearningPathsState,
          error,
        };

        const result = learningPathsFeature.reducer(
          initialLearningPathsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Selection Actions', () => {
      it('should handle selectLearningPath action', () => {
        const selectedId = '1';
        const action = LearningPathsActions.selectLearningPath({ selectedId });
        const expectedState = {
          ...initialLearningPathsState,
          selectedId,
        };

        const result = learningPathsFeature.reducer(
          initialLearningPathsState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle resetSelectedLearningPath action', () => {
        const stateWithSelection = {
          ...initialLearningPathsState,
          selectedId: '1',
        };
        const action = LearningPathsActions.resetSelectedLearningPath();
        const expectedState = {
          ...stateWithSelection,
          selectedId: null,
        };

        const result = learningPathsFeature.reducer(stateWithSelection, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle resetLearningPaths action', () => {
        const stateWithLearningPaths = learningPathsAdapter.setAll(
          mockLearningPaths,
          {
            ...initialLearningPathsState,
            selectedId: '1',
            loaded: true,
          },
        );

        const action = LearningPathsActions.resetLearningPaths();
        const expectedState = learningPathsAdapter.removeAll({
          ...stateWithLearningPaths,
          selectedId: null,
          loaded: false,
        });

        const result = learningPathsFeature.reducer(
          stateWithLearningPaths,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });
  });

  describe('Selectors', () => {
    describe('Basic Selectors', () => {
      it('should select all learningPaths', () => {
        const state = learningPathsAdapter.setAll(
          mockLearningPaths,
          initialLearningPathsState,
        );
        const result = selectAllLearningPaths.projector(state);
        expect(result).toEqual(mockLearningPaths);
      });

      it('should select learningPath entities', () => {
        const state = learningPathsAdapter.setAll(
          mockLearningPaths,
          initialLearningPathsState,
        );
        const result = selectLearningPathEntities.projector(state);
        expect(result).toEqual({
          '1': mockLearningPath,
          '2': mockLearningPath2,
        });
      });

      it('should select learningPath ids', () => {
        const state = learningPathsAdapter.setAll(
          mockLearningPaths,
          initialLearningPathsState,
        );
        const result = selectLearningPathIds.projector(state);
        expect(result).toEqual(['1', '2']);
      });

      it('should select learningPaths total', () => {
        const state = learningPathsAdapter.setAll(
          mockLearningPaths,
          initialLearningPathsState,
        );
        const result = selectLearningPathsTotal.projector(state);
        expect(result).toBe(2);
      });

      it('should select learningPaths loaded state', () => {
        const state = { ...initialLearningPathsState, loaded: true };
        const result = selectLearningPathsLoaded.projector(state);
        expect(result).toBe(true);
      });

      it('should select learningPaths error', () => {
        const error = 'Test error';
        const state = { ...initialLearningPathsState, error };
        const result = selectLearningPathsError.projector(state);
        expect(result).toBe(error);
      });

      it('should select selected id', () => {
        const selectedId = '1';
        const state = { ...initialLearningPathsState, selectedId };
        const result = selectSelectedId.projector(state);
        expect(result).toBe(selectedId);
      });
    });

    describe('Complex Selectors', () => {
      it('should select selected learningPath', () => {
        const state = learningPathsAdapter.setAll(mockLearningPaths, {
          ...initialLearningPathsState,
          selectedId: '1',
        });

        const entities = selectLearningPathEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedLearningPath.projector(
          entities,
          selectedId,
        );

        expect(result).toEqual(mockLearningPath);
      });

      it('should return null for selected learningPath when no selection', () => {
        const state = learningPathsAdapter.setAll(mockLearningPaths, {
          ...initialLearningPathsState,
          selectedId: null,
        });

        const entities = selectLearningPathEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedLearningPath.projector(
          entities,
          selectedId,
        );

        expect(result).toBeNull();
      });

      it('should return null for selected learningPath when entity not found', () => {
        const state = learningPathsAdapter.setAll(mockLearningPaths, {
          ...initialLearningPathsState,
          selectedId: 'nonexistent',
        });

        const entities = selectLearningPathEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedLearningPath.projector(
          entities,
          selectedId,
        );

        expect(result).toBeNull();
      });
    });
  });

  describe('Feature Integration', () => {
    it('should have correct feature key', () => {
      expect(learningPathsFeature.name).toBe(LEARNING_PATHS_FEATURE_KEY);
    });

    it('should provide reducer', () => {
      expect(learningPathsFeature.reducer).toBeDefined();
    });

    it('should provide extra selectors', () => {
      expect(learningPathsFeature.selectAllLearningPaths).toBeDefined();
      expect(learningPathsFeature.selectLearningPathEntities).toBeDefined();
      expect(learningPathsFeature.selectLearningPathsLoaded).toBeDefined();
      expect(learningPathsFeature.selectLearningPathsError).toBeDefined();
      expect(learningPathsFeature.selectSelectedLearningPath).toBeDefined();
    });
  });

  describe('Store Integration', () => {
    it('should dispatch actions and update state', () => {
      store.dispatch(
        LearningPathsActions.loadLearningPathsSuccess({
          learningPaths: mockLearningPaths,
        }),
      );

      const state$ = store.select(selectLearningPathsState);
      const expected$ = cold('a', {
        a: learningPathsAdapter.setAll(mockLearningPaths, {
          ...initialLearningPathsState,
          loaded: true,
          error: null,
        }),
      });

      expect(state$).toBeObservable(expected$);
    });

    it('should handle error actions', () => {
      const error = 'Test error';
      store.dispatch(LearningPathsActions.loadLearningPathsFailure({ error }));

      const error$ = store.select(selectLearningPathsError);
      const expected$ = cold('a', { a: error });

      expect(error$).toBeObservable(expected$);
    });

    it('should handle selection', () => {
      store.dispatch(
        LearningPathsActions.loadLearningPathsSuccess({
          learningPaths: mockLearningPaths,
        }),
      );
      store.dispatch(
        LearningPathsActions.selectLearningPath({ selectedId: '1' }),
      );

      const selectedLearningPath$ = store.select(selectSelectedLearningPath);
      const expected$ = cold('a', { a: mockLearningPath });

      expect(selectedLearningPath$).toBeObservable(expected$);
    });

    it('should handle learningPath update', () => {
      store.dispatch(
        LearningPathsActions.loadLearningPathsSuccess({
          learningPaths: [mockLearningPath],
        }),
      );

      const updatedLearningPath = {
        ...mockLearningPath /* add updated properties */,
      };
      store.dispatch(
        LearningPathsActions.updateLearningPathSuccess({
          learningPath: updatedLearningPath,
        }),
      );

      const state$ = store.select(selectLearningPathEntities);
      const expected$ = cold('a', {
        a: {
          '1': updatedLearningPath,
        },
      });

      expect(state$).toBeObservable(expected$);
    });

    it('should handle learningPath deletion', () => {
      store.dispatch(
        LearningPathsActions.loadLearningPathsSuccess({
          learningPaths: mockLearningPaths,
        }),
      );
      store.dispatch(
        LearningPathsActions.deleteLearningPathSuccess({
          learningPath: mockLearningPath,
        }),
      );

      const state$ = store.select(selectAllLearningPaths);
      const expected$ = cold('a', { a: [mockLearningPath2] });

      expect(state$).toBeObservable(expected$);
    });
  });
});
