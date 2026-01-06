import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ActionsSubject, Store } from '@ngrx/store';
import { KnowledgeUnitFacade } from './knowledge-units.facade';
import { KnowledgeUnitsActions } from './knowledge-units.actions';
import { KnowledgeUnit } from '@kasita/common-models';

describe('KnowledgeUnitFacade', () => {
  let facade: KnowledgeUnitFacade;
  let store: MockStore;
  let actionsSubject: ActionsSubject;

  const mockKnowledgeUnit: KnowledgeUnit = {
    id: '1',
    // Add your entity properties here based on the interface
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        KnowledgeUnitFacade,
        provideMockStore({
          initialState: {
            knowledgeUnits: {
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

    facade = TestBed.inject(KnowledgeUnitFacade);
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

    it('should expose allKnowledgeUnits$ observable', () => {
      expect(facade.allKnowledgeUnits$).toBeDefined();
    });

    it('should expose selectedKnowledgeUnit$ observable', () => {
      expect(facade.selectedKnowledgeUnit$).toBeDefined();
    });

    it('should expose mutations$ observable', () => {
      expect(facade.mutations$).toBeDefined();
    });
  });

  describe('resetSelectedKnowledgeUnit', () => {
    it('should dispatch resetSelectedKnowledgeUnit action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.resetSelectedKnowledgeUnit();

      expect(dispatchSpy).toHaveBeenCalledWith(
        KnowledgeUnitsActions.resetSelectedKnowledgeUnit(),
      );
    });
  });

  describe('selectKnowledgeUnit', () => {
    it('should dispatch selectKnowledgeUnit action with correct id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const knowledgeUnitId = 'test-id';

      facade.selectKnowledgeUnit(knowledgeUnitId);

      expect(dispatchSpy).toHaveBeenCalledWith(
        KnowledgeUnitsActions.selectKnowledgeUnit({
          selectedId: knowledgeUnitId,
        }),
      );
    });
  });

  describe('loadKnowledgeUnits', () => {
    it('should dispatch loadKnowledgeUnits action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.loadKnowledgeUnits();

      expect(dispatchSpy).toHaveBeenCalledWith(
        KnowledgeUnitsActions.loadKnowledgeUnits(),
      );
    });
  });

  describe('loadKnowledgeUnit', () => {
    it('should dispatch loadKnowledgeUnit action with correct id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const knowledgeUnitId = 'test-id';

      facade.loadKnowledgeUnit(knowledgeUnitId);

      expect(dispatchSpy).toHaveBeenCalledWith(
        KnowledgeUnitsActions.loadKnowledgeUnit({ knowledgeUnitId }),
      );
    });
  });

  describe('saveKnowledgeUnit', () => {
    it('should call updateKnowledgeUnit when knowledgeUnit has id', () => {
      const updateSpy = jest.spyOn(facade, 'updateKnowledgeUnit');
      const knowledgeUnitWithId = { ...mockKnowledgeUnit, id: 'existing-id' };

      facade.saveKnowledgeUnit(knowledgeUnitWithId);

      expect(updateSpy).toHaveBeenCalledWith(knowledgeUnitWithId);
    });

    it('should call createKnowledgeUnit when knowledgeUnit has no id', () => {
      const createSpy = jest.spyOn(facade, 'createKnowledgeUnit');
      const knowledgeUnitWithoutId = { ...mockKnowledgeUnit, id: '' };

      facade.saveKnowledgeUnit(knowledgeUnitWithoutId);

      expect(createSpy).toHaveBeenCalledWith(knowledgeUnitWithoutId);
    });
  });

  describe('createKnowledgeUnit', () => {
    it('should dispatch createKnowledgeUnit action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.createKnowledgeUnit(mockKnowledgeUnit);

      expect(dispatchSpy).toHaveBeenCalledWith(
        KnowledgeUnitsActions.createKnowledgeUnit({
          knowledgeUnit: mockKnowledgeUnit,
        }),
      );
    });
  });

  describe('updateKnowledgeUnit', () => {
    it('should dispatch updateKnowledgeUnit action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.updateKnowledgeUnit(mockKnowledgeUnit);

      expect(dispatchSpy).toHaveBeenCalledWith(
        KnowledgeUnitsActions.updateKnowledgeUnit({
          knowledgeUnit: mockKnowledgeUnit,
        }),
      );
    });
  });

  describe('deleteKnowledgeUnit', () => {
    it('should dispatch deleteKnowledgeUnit action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.deleteKnowledgeUnit(mockKnowledgeUnit);

      expect(dispatchSpy).toHaveBeenCalledWith(
        KnowledgeUnitsActions.deleteKnowledgeUnit({
          knowledgeUnit: mockKnowledgeUnit,
        }),
      );
    });
  });

  describe('dispatch', () => {
    it('should dispatch action to store', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const action = KnowledgeUnitsActions.loadKnowledgeUnits();

      facade.dispatch(action);

      expect(dispatchSpy).toHaveBeenCalledWith(action);
    });
  });

  describe('mutations$', () => {
    it('should filter createKnowledgeUnit actions', (done) => {
      const action = KnowledgeUnitsActions.createKnowledgeUnit({
        knowledgeUnit: mockKnowledgeUnit,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should filter updateKnowledgeUnit actions', (done) => {
      const action = KnowledgeUnitsActions.updateKnowledgeUnit({
        knowledgeUnit: mockKnowledgeUnit,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should filter deleteKnowledgeUnit actions', (done) => {
      const action = KnowledgeUnitsActions.deleteKnowledgeUnit({
        knowledgeUnit: mockKnowledgeUnit,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should not filter other actions', (done) => {
      const action = KnowledgeUnitsActions.loadKnowledgeUnits();
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
