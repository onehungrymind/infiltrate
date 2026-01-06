import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ActionsSubject, Store } from '@ngrx/store';
import { UserProgressFacade } from './user-progress.facade';
import { UserProgressActions } from './user-progress.actions';
import { UserProgress } from '@kasita/common-models';

describe('UserProgressFacade', () => {
  let facade: UserProgressFacade;
  let store: MockStore;
  let actionsSubject: ActionsSubject;

  const mockUserProgress: UserProgress = {
    id: '1',
    // Add your entity properties here based on the interface
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserProgressFacade,
        provideMockStore({
          initialState: {
            userProgress: {
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

    facade = TestBed.inject(UserProgressFacade);
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

    it('should expose allUserProgress$ observable', () => {
      expect(facade.allUserProgress$).toBeDefined();
    });

    it('should expose selectedUserProgress$ observable', () => {
      expect(facade.selectedUserProgress$).toBeDefined();
    });

    it('should expose mutations$ observable', () => {
      expect(facade.mutations$).toBeDefined();
    });
  });

  describe('resetSelectedUserProgress', () => {
    it('should dispatch resetSelectedUserProgress action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.resetSelectedUserProgress();

      expect(dispatchSpy).toHaveBeenCalledWith(
        UserProgressActions.resetSelectedUserProgress(),
      );
    });
  });

  describe('selectUserProgress', () => {
    it('should dispatch selectUserProgress action with correct id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const userProgressId = 'test-id';

      facade.selectUserProgress(userProgressId);

      expect(dispatchSpy).toHaveBeenCalledWith(
        UserProgressActions.selectUserProgress({ selectedId: userProgressId }),
      );
    });
  });

  describe('loadUserProgress', () => {
    it('should dispatch loadUserProgress action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.loadUserProgress();

      expect(dispatchSpy).toHaveBeenCalledWith(
        UserProgressActions.loadUserProgress(),
      );
    });
  });

  describe('loadUserProgress', () => {
    it('should dispatch loadUserProgress action with correct id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const userProgressId = 'test-id';

      facade.loadUserProgress(userProgressId);

      expect(dispatchSpy).toHaveBeenCalledWith(
        UserProgressActions.loadUserProgress({ userProgressId }),
      );
    });
  });

  describe('saveUserProgress', () => {
    it('should call updateUserProgress when userProgress has id', () => {
      const updateSpy = jest.spyOn(facade, 'updateUserProgress');
      const userProgressWithId = { ...mockUserProgress, id: 'existing-id' };

      facade.saveUserProgress(userProgressWithId);

      expect(updateSpy).toHaveBeenCalledWith(userProgressWithId);
    });

    it('should call createUserProgress when userProgress has no id', () => {
      const createSpy = jest.spyOn(facade, 'createUserProgress');
      const userProgressWithoutId = { ...mockUserProgress, id: '' };

      facade.saveUserProgress(userProgressWithoutId);

      expect(createSpy).toHaveBeenCalledWith(userProgressWithoutId);
    });
  });

  describe('createUserProgress', () => {
    it('should dispatch createUserProgress action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.createUserProgress(mockUserProgress);

      expect(dispatchSpy).toHaveBeenCalledWith(
        UserProgressActions.createUserProgress({
          userProgress: mockUserProgress,
        }),
      );
    });
  });

  describe('updateUserProgress', () => {
    it('should dispatch updateUserProgress action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.updateUserProgress(mockUserProgress);

      expect(dispatchSpy).toHaveBeenCalledWith(
        UserProgressActions.updateUserProgress({
          userProgress: mockUserProgress,
        }),
      );
    });
  });

  describe('deleteUserProgress', () => {
    it('should dispatch deleteUserProgress action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.deleteUserProgress(mockUserProgress);

      expect(dispatchSpy).toHaveBeenCalledWith(
        UserProgressActions.deleteUserProgress({
          userProgress: mockUserProgress,
        }),
      );
    });
  });

  describe('dispatch', () => {
    it('should dispatch action to store', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const action = UserProgressActions.loadUserProgress();

      facade.dispatch(action);

      expect(dispatchSpy).toHaveBeenCalledWith(action);
    });
  });

  describe('mutations$', () => {
    it('should filter createUserProgress actions', (done) => {
      const action = UserProgressActions.createUserProgress({
        userProgress: mockUserProgress,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should filter updateUserProgress actions', (done) => {
      const action = UserProgressActions.updateUserProgress({
        userProgress: mockUserProgress,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should filter deleteUserProgress actions', (done) => {
      const action = UserProgressActions.deleteUserProgress({
        userProgress: mockUserProgress,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should not filter other actions', (done) => {
      const action = UserProgressActions.loadUserProgress();
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
