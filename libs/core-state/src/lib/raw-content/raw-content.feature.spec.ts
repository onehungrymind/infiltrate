import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { RawContent } from '@kasita/common-models';
import { RawContentActions } from './raw-content.actions';
import {
  rawContentFeature,
  initialRawContentState,
  rawContentAdapter,
  RAW_CONTENT_FEATURE_KEY,
  selectAllRawContent,
  selectRawContentEntities,
  selectRawContentIds,
  selectRawContentTotal,
  selectRawContentLoaded,
  selectRawContentError,
  selectSelectedId,
  selectSelectedRawContent,
  selectRawContentState,
} from './raw-content.feature';

describe('RawContent Feature', () => {
  let store: Store;

  const mockRawContent: RawContent = {
    id: '1',
    // Add your entity properties here based on the interface
  };

  const mockRawContent2: RawContent = {
    id: '2',
    // Add your entity properties here based on the interface
  };

  const mockRawContent: RawContent[] = [mockRawContent, mockRawContent2];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({
          [RAW_CONTENT_FEATURE_KEY]: rawContentFeature.reducer,
        }),
        provideEffects([]),
      ],
    });

    store = TestBed.inject(Store);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const expectedState = initialRawContentState;
      expect(expectedState).toEqual({
        ids: [],
        entities: {},
        selectedId: null,
        error: null,
        loaded: false,
      });
    });

    it('should select initial state', () => {
      const result = selectRawContentState.projector(initialRawContentState);
      expect(result).toEqual(initialRawContentState);
    });
  });

  describe('Reducer Direct Tests', () => {
    it('should return initial state when action is unknown', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' };
      const result = rawContentFeature.reducer(
        initialRawContentState,
        unknownAction,
      );
      expect(result).toBe(initialRawContentState);
    });

    it('should handle onFailure helper function', () => {
      const error = 'Test error';
      const state = { ...initialRawContentState, loaded: true };
      const result = rawContentFeature.reducer(
        state,
        RawContentActions.loadRawContentFailure({ error }),
      );
      expect(result.error).toBe(error);
      expect(result.loaded).toBe(true); // Should not change loaded state
    });
  });

  describe('Actions', () => {
    describe('Load RawContent', () => {
      it('should handle loadRawContent action', () => {
        const action = RawContentActions.loadRawContent();
        const expectedState = {
          ...initialRawContentState,
          loaded: false,
          error: null,
        };

        const result = rawContentFeature.reducer(
          initialRawContentState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadRawContentSuccess action', () => {
        const action = RawContentActions.loadRawContentSuccess({
          rawContent: mockRawContent,
        });
        const expectedState = rawContentAdapter.setAll(mockRawContent, {
          ...initialRawContentState,
          loaded: true,
          error: null,
        });

        const result = rawContentFeature.reducer(
          initialRawContentState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadRawContentFailure action', () => {
        const error = 'Load failed';
        const action = RawContentActions.loadRawContentFailure({ error });
        const expectedState = {
          ...initialRawContentState,
          error,
        };

        const result = rawContentFeature.reducer(
          initialRawContentState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Load RawContent', () => {
      it('should handle loadRawContent action', () => {
        const action = RawContentActions.loadRawContent({ rawContentId: '1' });
        const expectedState = {
          ...initialRawContentState,
          loaded: false,
          error: null,
        };

        const result = rawContentFeature.reducer(
          initialRawContentState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadRawContentSuccess action', () => {
        const action = RawContentActions.loadRawContentSuccess({
          rawContent: mockRawContent,
        });
        const expectedState = rawContentAdapter.upsertOne(mockRawContent, {
          ...initialRawContentState,
          loaded: true,
          error: null,
        });

        const result = rawContentFeature.reducer(
          initialRawContentState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle loadRawContentFailure action', () => {
        const error = 'Load failed';
        const action = RawContentActions.loadRawContentFailure({ error });
        const expectedState = {
          ...initialRawContentState,
          error,
        };

        const result = rawContentFeature.reducer(
          initialRawContentState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Create RawContent', () => {
      it('should handle createRawContentSuccess action', () => {
        const action = RawContentActions.createRawContentSuccess({
          rawContent: mockRawContent,
        });
        const expectedState = rawContentAdapter.addOne(mockRawContent, {
          ...initialRawContentState,
          error: null,
        });

        const result = rawContentFeature.reducer(
          initialRawContentState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle createRawContentFailure action', () => {
        const error = 'Create failed';
        const action = RawContentActions.createRawContentFailure({ error });
        const expectedState = {
          ...initialRawContentState,
          error,
        };

        const result = rawContentFeature.reducer(
          initialRawContentState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Update RawContent', () => {
      it('should handle updateRawContentSuccess action', () => {
        // First add a rawContent
        const stateWithRawContent = rawContentAdapter.addOne(
          mockRawContent,
          initialRawContentState,
        );

        const updatedRawContent = {
          ...mockRawContent /* add updated properties */,
        };
        const action = RawContentActions.updateRawContentSuccess({
          rawContent: updatedRawContent,
        });
        const expectedState = rawContentAdapter.updateOne(
          { id: updatedRawContent.id ?? '', changes: updatedRawContent },
          { ...stateWithRawContent, error: null },
        );

        const result = rawContentFeature.reducer(stateWithRawContent, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle updateRawContentFailure action', () => {
        const error = 'Update failed';
        const action = RawContentActions.updateRawContentFailure({ error });
        const expectedState = {
          ...initialRawContentState,
          error,
        };

        const result = rawContentFeature.reducer(
          initialRawContentState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Delete RawContent', () => {
      it('should handle deleteRawContentSuccess action', () => {
        // First add a rawContent
        const stateWithRawContent = rawContentAdapter.addOne(
          mockRawContent,
          initialRawContentState,
        );

        const action = RawContentActions.deleteRawContentSuccess({
          rawContent: mockRawContent,
        });
        const expectedState = rawContentAdapter.removeOne(
          mockRawContent?.id ?? '',
          {
            ...stateWithRawContent,
            error: null,
          },
        );

        const result = rawContentFeature.reducer(stateWithRawContent, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle deleteRawContentFailure action', () => {
        const error = 'Delete failed';
        const action = RawContentActions.deleteRawContentFailure({ error });
        const expectedState = {
          ...initialRawContentState,
          error,
        };

        const result = rawContentFeature.reducer(
          initialRawContentState,
          action,
        );
        expect(result).toEqual(expectedState);
      });
    });

    describe('Selection Actions', () => {
      it('should handle selectRawContent action', () => {
        const selectedId = '1';
        const action = RawContentActions.selectRawContent({ selectedId });
        const expectedState = {
          ...initialRawContentState,
          selectedId,
        };

        const result = rawContentFeature.reducer(
          initialRawContentState,
          action,
        );
        expect(result).toEqual(expectedState);
      });

      it('should handle resetSelectedRawContent action', () => {
        const stateWithSelection = {
          ...initialRawContentState,
          selectedId: '1',
        };
        const action = RawContentActions.resetSelectedRawContent();
        const expectedState = {
          ...stateWithSelection,
          selectedId: null,
        };

        const result = rawContentFeature.reducer(stateWithSelection, action);
        expect(result).toEqual(expectedState);
      });

      it('should handle resetRawContent action', () => {
        const stateWithRawContent = rawContentAdapter.setAll(mockRawContent, {
          ...initialRawContentState,
          selectedId: '1',
          loaded: true,
        });

        const action = RawContentActions.resetRawContent();
        const expectedState = rawContentAdapter.removeAll({
          ...stateWithRawContent,
          selectedId: null,
          loaded: false,
        });

        const result = rawContentFeature.reducer(stateWithRawContent, action);
        expect(result).toEqual(expectedState);
      });
    });
  });

  describe('Selectors', () => {
    describe('Basic Selectors', () => {
      it('should select all rawContent', () => {
        const state = rawContentAdapter.setAll(
          mockRawContent,
          initialRawContentState,
        );
        const result = selectAllRawContent.projector(state);
        expect(result).toEqual(mockRawContent);
      });

      it('should select rawContent entities', () => {
        const state = rawContentAdapter.setAll(
          mockRawContent,
          initialRawContentState,
        );
        const result = selectRawContentEntities.projector(state);
        expect(result).toEqual({
          '1': mockRawContent,
          '2': mockRawContent2,
        });
      });

      it('should select rawContent ids', () => {
        const state = rawContentAdapter.setAll(
          mockRawContent,
          initialRawContentState,
        );
        const result = selectRawContentIds.projector(state);
        expect(result).toEqual(['1', '2']);
      });

      it('should select rawContent total', () => {
        const state = rawContentAdapter.setAll(
          mockRawContent,
          initialRawContentState,
        );
        const result = selectRawContentTotal.projector(state);
        expect(result).toBe(2);
      });

      it('should select rawContent loaded state', () => {
        const state = { ...initialRawContentState, loaded: true };
        const result = selectRawContentLoaded.projector(state);
        expect(result).toBe(true);
      });

      it('should select rawContent error', () => {
        const error = 'Test error';
        const state = { ...initialRawContentState, error };
        const result = selectRawContentError.projector(state);
        expect(result).toBe(error);
      });

      it('should select selected id', () => {
        const selectedId = '1';
        const state = { ...initialRawContentState, selectedId };
        const result = selectSelectedId.projector(state);
        expect(result).toBe(selectedId);
      });
    });

    describe('Complex Selectors', () => {
      it('should select selected rawContent', () => {
        const state = rawContentAdapter.setAll(mockRawContent, {
          ...initialRawContentState,
          selectedId: '1',
        });

        const entities = selectRawContentEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedRawContent.projector(entities, selectedId);

        expect(result).toEqual(mockRawContent);
      });

      it('should return null for selected rawContent when no selection', () => {
        const state = rawContentAdapter.setAll(mockRawContent, {
          ...initialRawContentState,
          selectedId: null,
        });

        const entities = selectRawContentEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedRawContent.projector(entities, selectedId);

        expect(result).toBeNull();
      });

      it('should return null for selected rawContent when entity not found', () => {
        const state = rawContentAdapter.setAll(mockRawContent, {
          ...initialRawContentState,
          selectedId: 'nonexistent',
        });

        const entities = selectRawContentEntities.projector(state);
        const selectedId = selectSelectedId.projector(state);
        const result = selectSelectedRawContent.projector(entities, selectedId);

        expect(result).toBeNull();
      });
    });
  });

  describe('Feature Integration', () => {
    it('should have correct feature key', () => {
      expect(rawContentFeature.name).toBe(RAW_CONTENT_FEATURE_KEY);
    });

    it('should provide reducer', () => {
      expect(rawContentFeature.reducer).toBeDefined();
    });

    it('should provide extra selectors', () => {
      expect(rawContentFeature.selectAllRawContent).toBeDefined();
      expect(rawContentFeature.selectRawContentEntities).toBeDefined();
      expect(rawContentFeature.selectRawContentLoaded).toBeDefined();
      expect(rawContentFeature.selectRawContentError).toBeDefined();
      expect(rawContentFeature.selectSelectedRawContent).toBeDefined();
    });
  });

  describe('Store Integration', () => {
    it('should dispatch actions and update state', () => {
      store.dispatch(
        RawContentActions.loadRawContentSuccess({ rawContent: mockRawContent }),
      );

      const state$ = store.select(selectRawContentState);
      const expected$ = cold('a', {
        a: rawContentAdapter.setAll(mockRawContent, {
          ...initialRawContentState,
          loaded: true,
          error: null,
        }),
      });

      expect(state$).toBeObservable(expected$);
    });

    it('should handle error actions', () => {
      const error = 'Test error';
      store.dispatch(RawContentActions.loadRawContentFailure({ error }));

      const error$ = store.select(selectRawContentError);
      const expected$ = cold('a', { a: error });

      expect(error$).toBeObservable(expected$);
    });

    it('should handle selection', () => {
      store.dispatch(
        RawContentActions.loadRawContentSuccess({ rawContent: mockRawContent }),
      );
      store.dispatch(RawContentActions.selectRawContent({ selectedId: '1' }));

      const selectedRawContent$ = store.select(selectSelectedRawContent);
      const expected$ = cold('a', { a: mockRawContent });

      expect(selectedRawContent$).toBeObservable(expected$);
    });

    it('should handle rawContent update', () => {
      store.dispatch(
        RawContentActions.loadRawContentSuccess({
          rawContent: [mockRawContent],
        }),
      );

      const updatedRawContent = {
        ...mockRawContent /* add updated properties */,
      };
      store.dispatch(
        RawContentActions.updateRawContentSuccess({
          rawContent: updatedRawContent,
        }),
      );

      const state$ = store.select(selectRawContentEntities);
      const expected$ = cold('a', {
        a: {
          '1': updatedRawContent,
        },
      });

      expect(state$).toBeObservable(expected$);
    });

    it('should handle rawContent deletion', () => {
      store.dispatch(
        RawContentActions.loadRawContentSuccess({ rawContent: mockRawContent }),
      );
      store.dispatch(
        RawContentActions.deleteRawContentSuccess({
          rawContent: mockRawContent,
        }),
      );

      const state$ = store.select(selectAllRawContent);
      const expected$ = cold('a', { a: [mockRawContent2] });

      expect(state$).toBeObservable(expected$);
    });
  });
});
