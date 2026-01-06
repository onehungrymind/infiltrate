import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { UserProgress } from '@kasita/common-models';
import { UserProgressActions } from './user-progress.actions';
import {
  userProgressFeature,
  initialUserProgressState,
  userProgressAdapter,
  USER_PROGRESS_FEATURE_KEY,
  selectAllUserProgress,
  selectUserProgressEntities,
  selectUserProgressIds,
  selectUserProgressTotal,
  selectUserProgressLoaded,
  selectUserProgressError,
  selectSelectedId,
  selectSelectedUserProgress,
  selectUserProgressState,
} from './user-progress.feature';

describe('UserProgress Feature', () => {
  let store: Store;

  const mockUserProgress: UserProgress = {
    id: '1',
    // Add your entity properties here based on the interface
  };

  const mockUserProgress2: UserProgress = {
    id: '2',
    // Add your entity properties here based on the interface
  };

  const mockUserProgress: UserProgress[] = [
    mockUserProgress,
    mockUserProgress2,
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({
          [USER_PROGRESS_FEATURE_KEY]: userProgressFeature.reducer,
        }),
        provideEffects([]),
      ],
    });

    store = TestBed.inject(Store);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const expectedState = initialUserProgressState;
      expect(expectedState).toEqual({
        ids: [],
        entities: {},
        selectedId: null,
        error: null,
        loaded: false,
      });
    });

    it('should select initial state', () => {
      const result = selectUserProgressState.projector(
        initialUserProgressState,
      );
      expect(result).toEqual(initialUserProgressState);
    });
  });

  describe('Reducer Direct Tests', () => {
    it('should return initial state when action is unknown', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' };
      const result = userProgressFeature.reducer(
        initialUserProgressState,
        unknownAction,
      );
      expect(result).toBe(initialUserProgressState);
    });

    it('should handle onFailure helper function', () => {
      const error = 'Test error';
      const state = { ...initialUserProgressState, loaded: true };
      const result = userProgressFeature.reducer(
        state,
        UserProgressActions.loadUserProgressFailure({ error }),
      );
      expect(result.error).toBe(error);
      expect(result.loaded).toBe(true); // Should not change loaded state
    });
  });

  describe('Actions', () => {
    describe('Load UserProgress', () => {
      it('should handle loadUserProgress action', () => {
        const action = UserProgressActions.loadUserProgress();
        const expectedState = {
          ...initialUserProgressState,
          loaded: false,
          error: null,
        };

        const result = userProgressFeature.reducer(
          initialUserProgressState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadUserProgressSuccess action', () => {
        const action = UserProgressActions.loadUserProgressSuccess({
          userProgress: mockUserProgress,
        });
        const expectedState = userProgressAdapter.setAll(mockUserProgress, {
          ...initialUserProgressState,
          loaded: true,
          error: null,
        });

        const result = userProgressFeature.reducer(
          initialUserProgressState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadUserProgressFailure action', () => {
        const error = 'Load failed';
        const action = UserProgressActions.loadUserProgressFailure({ error });
        const expectedState = {
          ...initialUserProgressState,
          error,
        };

        const result = userProgressFeature.reducer(
          initialUserProgressState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Load UserProgress', () => {
      it('should handle loadUserProgress action', () => {
        const action = UserProgressActions.loadUserProgress({
          userProgressId: '1',
        });
        const expectedState = {
          ...initialUserProgressState,
          loaded: false,
          error: null,
        };

        const result = userProgressFeature.reducer(
          initialUserProgressState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadUserProgressSuccess action', () => {
        const action = UserProgressActions.loadUserProgressSuccess({
          userProgress: mockUserProgress,
        });
        const expectedState = userProgressAdapter.upsertOne(mockUserProgress, {
          ...initialUserProgressState,
          loaded: true,
          error: null,
        });

        const result = userProgressFeature.reducer(
          initialUserProgressState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadUserProgressFailure action', () => {
        const error = 'Load failed';
        const action = UserProgressActions.loadUserProgressFailure({ error });
        const expectedState = {
          ...initialUserProgressState,
          error,
        };

        const result = userProgressFeature.reducer(
          initialUserProgressState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Create UserProgress', () => {
      it('should handle createUserProgressSuccess action', () => {
        const action = UserProgressActions.createUserProgressSuccess({
          userProgress: mockUserProgress,
        });
        const expectedState = userProgressAdapter.addOne(mockUserProgress, {
          ...initialUserProgressState,
          error: null,
        });

        const result = userProgressFeature.reducer(
          initialUserProgressState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle createUserProgressFailure action', () => {
        const error = 'Create failed';
        const action = UserProgressActions.createUserProgressFailure({ error });
        const expectedState = {
          ...initialUserProgressState,
          error,
        };

        const result = userProgressFeature.reducer(
          initialUserProgressState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Update UserProgress', () => {
      it('should handle updateUserProgressSuccess action', () => {
        // First add a userProgress
        const stateWithUserProgress = userProgressAdapter.addOne(
          mockUserProgress,
          initialUserProgressState,
        );

        const updatedUserProgress = {
          ...mockUserProgress /* add updated properties */,
        };
        const action = UserProgressActions.updateUserProgressSuccess({
          userProgress: updatedUserProgress,
        });
        const expectedState = userProgressAdapter.updateOne(
          { id: updatedUserProgress.id ?? '', changes: updatedUserProgress },
          { ...stateWithUserProgress, error: null },
        );

        const result = userProgressFeature.reducer(
          stateWithUserProgress,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle updateUserProgressFailure action', () => {
        const error = 'Update failed';
        const action = UserProgressActions.updateUserProgressFailure({ error });
        const expectedState = {
          ...initialUserProgressState,
          error,
        };

        const result = userProgressFeature.reducer(
          initialUserProgressState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Delete UserProgress', () => {
      it('should handle deleteUserProgressSuccess action', () => {
        // First add a userProgress
        const stateWithUserProgress = userProgressAdapter.addOne(
          mockUserProgress,
          initialUserProgressState,
        );

        const action = UserProgressActions.deleteUserProgressSuccess({
          userProgress: mockUserProgress,
        });
        const expectedState = userProgressAdapter.removeOne(
          mockUserProgress?.id ?? '',
          {
            ...stateWithUserProgress,
            error: null,
          },
        );

        const result = userProgressFeature.reducer(
          stateWithUserProgress,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle deleteUserProgressFailure action', () => {
        const error = 'Delete failed';
        const action = UserProgressActions.deleteUserProgressFailure({ error });
        const expectedState = {
          ...initialUserProgressState,
          error,
        };

        const result = userProgressFeature.reducer(
          initialUserProgressState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Selection Actions', () => {
      it('should handle selectUserProgress action', () => {
        const selectedId = '1';
        const action = UserProgressActions.selectUserProgress({ selectedId });
        const expectedState = {
          ...initialUserProgressState,
          selectedId,
        };

        const result = userProgressFeature.reducer(
          initialUserProgressState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle resetSelectedUserProgress action', () => {
        const stateWithSelection = {
          ...initialUserProgressState,
          selectedId: '1',
        };
        const action = UserProgressActions.resetSelectedUserProgress();
        const expectedState = {
          ...stateWithSelection,
          selectedId: null,
        };

        const result = userProgressFeature.reducer(stateWithSelection, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle resetUserProgress action', () => {
        const stateWithUserProgress = userProgressAdapter.setAll(
          mockUserProgress,
          {
            ...initialUserProgressState,
            selectedId: '1',
            loaded: true,
          },
        );

        const action = UserProgressActions.resetUserProgress();
        const expectedState = userProgressAdapter.removeAll({
          ...stateWithUserProgress,
          selectedId: null,
          loaded: false,
        });

        const result = userProgressFeature.reducer(
          stateWithUserProgress,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });
  });

  describe('Selectors', () => {
    describe('Basic Selectors', () => {
      it('should select all userProgress', () => {
        const state = userProgressAdapter.setAll(
          mockUserProgress,
          initialUserProgressState,
        );
        const result = selectAllUserProgress.projector(state);
        expect(result).toEqual(mockUserProgress);
      });

      it('should select userProgress entities', () => {
        const state = userProgressAdapter.setAll(
          mockUserProgress,
          initialUserProgressState,
        );
        const result = selectUserProgressEntities.projector(state);
        expect(result).toEqual({
          '1': mockUserProgress,
          '2': mockUserProgress2,
        });
      });

      it('should select userProgress ids', () => {
        const state = userProgressAdapter.setAll(
          mockUserProgress,
          initialUserProgressState,
        );
        const result = selectUserProgressIds.projector(state);
        expect(result).toEqual(['1', '2']);
      });

      it('should select userProgress total', () => {
        const state = userProgressAdapter.setAll(
          mockUserProgress,
          initialUserProgressState,
        );
        const result = selectUserProgressTotal.projector(state);
        expect(result).toBe(2);
      });

      it('should select userProgress loaded state', () => {
        const state = { ...initialUserProgressState, loaded: true };
        const result = selectUserProgressLoaded.projector(state);
        expect(result).toBe(true);
      });

      it('should select userProgress error', () => {
        const error = 'Test error';
        const state = { ...initialUserProgressState, error };
        const result = selectUserProgressError.projector(state);
        expect(result).toBe(error);
      });

      it('should select selected id', () => {
        const selectedId = '1';
        const state = { ...initialUserProgressState, selectedId };
        const result = selectSelectedId.projector(state);
        expect(result).toBe(selectedId);
      });
    });

    describe('Complex Selectors', () => {
      it('should select selected userProgress', () => {
        const state = userProgressAdapter.setAll(mockUserProgress, {
          ...initialUserProgressState,
          selectedId: '1',
        });

        const entities = selectUserProgressEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedUserProgress.projector(
          entities,
          selectedId,
        );

        expect(result).toEqual(mockUserProgress);
      });

      it('should return null for selected userProgress when no selection', () => {
        const state = userProgressAdapter.setAll(mockUserProgress, {
          ...initialUserProgressState,
          selectedId: null,
        });

        const entities = selectUserProgressEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedUserProgress.projector(
          entities,
          selectedId,
        );

        expect(result).toBeNull();
      });

      it('should return null for selected userProgress when entity not found', () => {
        const state = userProgressAdapter.setAll(mockUserProgress, {
          ...initialUserProgressState,
          selectedId: 'nonexistent',
        });

        const entities = selectUserProgressEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedUserProgress.projector(
          entities,
          selectedId,
        );

        expect(result).toBeNull();
      });
    });
  });

  describe('Feature Integration', () => {
    it('should have correct feature key', () => {
      expect(userProgressFeature.name).toBe(USER_PROGRESS_FEATURE_KEY);
    });

    it('should provide reducer', () => {
      expect(userProgressFeature.reducer).toBeDefined();
    });

    it('should provide extra selectors', () => {
      expect(userProgressFeature.selectAllUserProgress).toBeDefined();
      expect(userProgressFeature.selectUserProgressEntities).toBeDefined();
      expect(userProgressFeature.selectUserProgressLoaded).toBeDefined();
      expect(userProgressFeature.selectUserProgressError).toBeDefined();
      expect(userProgressFeature.selectSelectedUserProgress).toBeDefined();
    });
  });

  describe('Store Integration', () => {
    it('should dispatch actions and update state', () => {
      store.dispatch(
        UserProgressActions.loadUserProgressSuccess({
          userProgress: mockUserProgress,
        }),
      );

      const state$ = store.select(selectUserProgressState);
      const expected$ = cold('a', {
        a: userProgressAdapter.setAll(mockUserProgress, {
          ...initialUserProgressState,
          loaded: true,
          error: null,
        }),
      });

      expect(state$).toBeObservable(expected$);
    });

    it('should handle error actions', () => {
      const error = 'Test error';
      store.dispatch(UserProgressActions.loadUserProgressFailure({ error }));

      const error$ = store.select(selectUserProgressError);
      const expected$ = cold('a', { a: error });

      expect(error$).toBeObservable(expected$);
    });

    it('should handle selection', () => {
      store.dispatch(
        UserProgressActions.loadUserProgressSuccess({
          userProgress: mockUserProgress,
        }),
      );
      store.dispatch(
        UserProgressActions.selectUserProgress({ selectedId: '1' }),
      );

      const selectedUserProgress$ = store.select(selectSelectedUserProgress);
      const expected$ = cold('a', { a: mockUserProgress });

      expect(selectedUserProgress$).toBeObservable(expected$);
    });

    it('should handle userProgress update', () => {
      store.dispatch(
        UserProgressActions.loadUserProgressSuccess({
          userProgress: [mockUserProgress],
        }),
      );

      const updatedUserProgress = {
        ...mockUserProgress /* add updated properties */,
      };
      store.dispatch(
        UserProgressActions.updateUserProgressSuccess({
          userProgress: updatedUserProgress,
        }),
      );

      const state$ = store.select(selectUserProgressEntities);
      const expected$ = cold('a', {
        a: {
          '1': updatedUserProgress,
        },
      });

      expect(state$).toBeObservable(expected$);
    });

    it('should handle userProgress deletion', () => {
      store.dispatch(
        UserProgressActions.loadUserProgressSuccess({
          userProgress: mockUserProgress,
        }),
      );
      store.dispatch(
        UserProgressActions.deleteUserProgressSuccess({
          userProgress: mockUserProgress,
        }),
      );

      const state$ = store.select(selectAllUserProgress);
      const expected$ = cold('a', { a: [mockUserProgress2] });

      expect(state$).toBeObservable(expected$);
    });
  });
});
