import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ActionsSubject, Store } from '@ngrx/store';
import { PrincipleFacade } from './principles.facade';
import { PrinciplesActions } from './principles.actions';
import { Principle } from '@kasita/common-models';

describe('PrincipleFacade', () => {
  let facade: PrincipleFacade;
  let store: MockStore;
  let actionsSubject: ActionsSubject;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PrincipleFacade,
        provideMockStore({
          initialState: {
            principles: {
              entities: {},
              ids: [],
              loaded: false,
              selectedId: null,
              error: null,
            },
          },
        }),
        ActionsSubject,
      ],
    });

    facade = TestBed.inject(PrincipleFacade);
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

    it('should expose error$ observable', () => {
      expect(facade.error$).toBeDefined();
    });

    it('should expose allPrinciples$ observable', () => {
      expect(facade.allPrinciples$).toBeDefined();
    });

    it('should expose selectedPrinciple$ observable', () => {
      expect(facade.selectedPrinciple$).toBeDefined();
    });

    it('should expose mutations$ observable', () => {
      expect(facade.mutations$).toBeDefined();
    });
  });

  describe('selectPrinciplesByPath', () => {
    it('should return observable for principles by path', () => {
      const result = facade.selectPrinciplesByPath('path-1');
      expect(result).toBeDefined();
    });
  });

  describe('resetSelectedPrinciple', () => {
    it('should dispatch resetSelectedPrinciple action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.resetSelectedPrinciple();

      expect(dispatchSpy).toHaveBeenCalledWith(
        PrinciplesActions.resetSelectedPrinciple(),
      );
    });
  });

  describe('selectPrinciple', () => {
    it('should dispatch selectPrinciple action with correct id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const principleId = 'test-id';

      facade.selectPrinciple(principleId);

      expect(dispatchSpy).toHaveBeenCalledWith(
        PrinciplesActions.selectPrinciple({ selectedId: principleId }),
      );
    });
  });

  describe('loadPrinciples', () => {
    it('should dispatch loadPrinciples action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.loadPrinciples();

      expect(dispatchSpy).toHaveBeenCalledWith(
        PrinciplesActions.loadPrinciples(),
      );
    });
  });

  describe('loadPrinciple', () => {
    it('should dispatch loadPrinciple action with correct id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const principleId = 'test-id';

      facade.loadPrinciple(principleId);

      expect(dispatchSpy).toHaveBeenCalledWith(
        PrinciplesActions.loadPrinciple({ principleId }),
      );
    });
  });

  describe('loadPrinciplesByPath', () => {
    it('should dispatch loadPrinciplesByPath action with correct pathId', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const pathId = 'path-1';

      facade.loadPrinciplesByPath(pathId);

      expect(dispatchSpy).toHaveBeenCalledWith(
        PrinciplesActions.loadPrinciplesByPath({ pathId }),
      );
    });
  });

  describe('savePrinciple', () => {
    it('should call updatePrinciple when principle has id', () => {
      const updateSpy = jest.spyOn(facade, 'updatePrinciple');
      const principleWithId = { ...mockPrinciple, id: 'existing-id' };

      facade.savePrinciple(principleWithId);

      expect(updateSpy).toHaveBeenCalledWith(principleWithId);
    });

    it('should call createPrinciple when principle has no id', () => {
      const createSpy = jest.spyOn(facade, 'createPrinciple');
      const principleWithoutId = { ...mockPrinciple, id: '' };

      facade.savePrinciple(principleWithoutId);

      expect(createSpy).toHaveBeenCalledWith(principleWithoutId);
    });
  });

  describe('createPrinciple', () => {
    it('should dispatch createPrinciple action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.createPrinciple(mockPrinciple);

      expect(dispatchSpy).toHaveBeenCalledWith(
        PrinciplesActions.createPrinciple({
          principle: mockPrinciple,
        }),
      );
    });
  });

  describe('updatePrinciple', () => {
    it('should dispatch updatePrinciple action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.updatePrinciple(mockPrinciple);

      expect(dispatchSpy).toHaveBeenCalledWith(
        PrinciplesActions.updatePrinciple({
          principle: mockPrinciple,
        }),
      );
    });
  });

  describe('deletePrinciple', () => {
    it('should dispatch deletePrinciple action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.deletePrinciple(mockPrinciple);

      expect(dispatchSpy).toHaveBeenCalledWith(
        PrinciplesActions.deletePrinciple({
          principle: mockPrinciple,
        }),
      );
    });
  });

  describe('dispatch', () => {
    it('should dispatch action to store', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const action = PrinciplesActions.loadPrinciples();

      facade.dispatch(action);

      expect(dispatchSpy).toHaveBeenCalledWith(action);
    });
  });

  describe('mutations$', () => {
    it('should filter createPrinciple actions', (done) => {
      const action = PrinciplesActions.createPrinciple({
        principle: mockPrinciple,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should filter updatePrinciple actions', (done) => {
      const action = PrinciplesActions.updatePrinciple({
        principle: mockPrinciple,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should filter deletePrinciple actions', (done) => {
      const action = PrinciplesActions.deletePrinciple({
        principle: mockPrinciple,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should not filter other actions', (done) => {
      const action = PrinciplesActions.loadPrinciples();
      let hasEmitted = false;

      facade.mutations$.subscribe(() => {
        hasEmitted = true;
      });

      actionsSubject.next(action);

      setTimeout(() => {
        expect(hasEmitted).toBe(false);
        done();
      }, 10);
    });
  });
});
