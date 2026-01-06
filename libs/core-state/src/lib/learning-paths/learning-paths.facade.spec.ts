import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ActionsSubject, Store } from '@ngrx/store';
import { LearningPathFacade } from './learning-paths.facade';
import { LearningPathsActions } from './learning-paths.actions';
import { LearningPath } from '@kasita/common-models';

describe('LearningPathFacade', () => {
  let facade: LearningPathFacade;
  let store: MockStore;
  let actionsSubject: ActionsSubject;

  const mockLearningPath: LearningPath = {
    id: '1',
    // Add your entity properties here based on the interface
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LearningPathFacade,
        provideMockStore({
          initialState: {
            learningPaths: {
              entities: {},
              ids: [],
              loaded: false,
              selectedId: null,
            },
          },
        }),
        ActionsSubject,
      ],
    });

    facade = TestBed.inject(LearningPathFacade);
    store = TestBed.inject(Store) as MockStore;
    actionsSubject = TestBed.inject(ActionsSubject);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  describe('Observables', () => {
    it('should expose loaded$ observable', () => {
      expect(facade.loaded$).toBeDefined();
    });

    it('should expose allLearningPaths$ observable', () => {
      expect(facade.allLearningPaths$).toBeDefined();
    });

    it('should expose selectedLearningPath$ observable', () => {
      expect(facade.selectedLearningPath$).toBeDefined();
    });

    it('should expose mutations$ observable', () => {
      expect(facade.mutations$).toBeDefined();
    });
  });

  describe('resetSelectedLearningPath', () => {
    it('should dispatch resetSelectedLearningPath action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.resetSelectedLearningPath();

      expect(dispatchSpy).toHaveBeenCalledWith(
        LearningPathsActions.resetSelectedLearningPath(),
      );
    });
  });

  describe('selectLearningPath', () => {
    it('should dispatch selectLearningPath action with correct id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const learningPathId = 'test-id';

      facade.selectLearningPath(learningPathId);

      expect(dispatchSpy).toHaveBeenCalledWith(
        LearningPathsActions.selectLearningPath({ selectedId: learningPathId }),
      );
    });
  });

  describe('loadLearningPaths', () => {
    it('should dispatch loadLearningPaths action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.loadLearningPaths();

      expect(dispatchSpy).toHaveBeenCalledWith(
        LearningPathsActions.loadLearningPaths(),
      );
    });
  });

  describe('loadLearningPath', () => {
    it('should dispatch loadLearningPath action with correct id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const learningPathId = 'test-id';

      facade.loadLearningPath(learningPathId);

      expect(dispatchSpy).toHaveBeenCalledWith(
        LearningPathsActions.loadLearningPath({ learningPathId }),
      );
    });
  });

  describe('saveLearningPath', () => {
    it('should call updateLearningPath when learningPath has id', () => {
      const updateSpy = jest.spyOn(facade, 'updateLearningPath');
      const learningPathWithId = { ...mockLearningPath, id: 'existing-id' };

      facade.saveLearningPath(learningPathWithId);

      expect(updateSpy).toHaveBeenCalledWith(learningPathWithId);
    });

    it('should call createLearningPath when learningPath has no id', () => {
      const createSpy = jest.spyOn(facade, 'createLearningPath');
      const learningPathWithoutId = { ...mockLearningPath, id: '' };

      facade.saveLearningPath(learningPathWithoutId);

      expect(createSpy).toHaveBeenCalledWith(learningPathWithoutId);
    });
  });

  describe('createLearningPath', () => {
    it('should dispatch createLearningPath action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.createLearningPath(mockLearningPath);

      expect(dispatchSpy).toHaveBeenCalledWith(
        LearningPathsActions.createLearningPath({
          learningPath: mockLearningPath,
        }),
      );
    });
  });

  describe('updateLearningPath', () => {
    it('should dispatch updateLearningPath action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.updateLearningPath(mockLearningPath);

      expect(dispatchSpy).toHaveBeenCalledWith(
        LearningPathsActions.updateLearningPath({
          learningPath: mockLearningPath,
        }),
      );
    });
  });

  describe('deleteLearningPath', () => {
    it('should dispatch deleteLearningPath action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.deleteLearningPath(mockLearningPath);

      expect(dispatchSpy).toHaveBeenCalledWith(
        LearningPathsActions.deleteLearningPath({
          learningPath: mockLearningPath,
        }),
      );
    });
  });

  describe('dispatch', () => {
    it('should dispatch action to store', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const action = LearningPathsActions.loadLearningPaths();

      facade.dispatch(action);

      expect(dispatchSpy).toHaveBeenCalledWith(action);
    });
  });

  describe('mutations$', () => {
    it('should filter createLearningPath actions', (done) => {
      const action = LearningPathsActions.createLearningPath({
        learningPath: mockLearningPath,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should filter updateLearningPath actions', (done) => {
      const action = LearningPathsActions.updateLearningPath({
        learningPath: mockLearningPath,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should filter deleteLearningPath actions', (done) => {
      const action = LearningPathsActions.deleteLearningPath({
        learningPath: mockLearningPath,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should not filter other actions', (done) => {
      const action = LearningPathsActions.loadLearningPaths();
      let hasEmitted = false;

      facade.mutations$.subscribe(() => {
        hasEmitted = true;
      });

      actionsSubject.next(action);

      // Give it a moment to process
      setTimeout(() => {
        expect(hasEmitted).toBe(false);
        done();
      }, 10);
    });
  });
});
