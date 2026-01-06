import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ActionsSubject, Store } from '@ngrx/store';
import { SourceConfigFacade } from './source-configs.facade';
import { SourceConfigsActions } from './source-configs.actions';
import { SourceConfig } from '@kasita/common-models';

describe('SourceConfigFacade', () => {
  let facade: SourceConfigFacade;
  let store: MockStore;
  let actionsSubject: ActionsSubject;

  const mockSourceConfig: SourceConfig = {
    id: '1',
    // Add your entity properties here based on the interface
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SourceConfigFacade,
        provideMockStore({
          initialState: {
            sourceConfigs: {
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

    facade = TestBed.inject(SourceConfigFacade);
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

    it('should expose allSourceConfigs$ observable', () => {
      expect(facade.allSourceConfigs$).toBeDefined();
    });

    it('should expose selectedSourceConfig$ observable', () => {
      expect(facade.selectedSourceConfig$).toBeDefined();
    });

    it('should expose mutations$ observable', () => {
      expect(facade.mutations$).toBeDefined();
    });
  });

  describe('resetSelectedSourceConfig', () => {
    it('should dispatch resetSelectedSourceConfig action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.resetSelectedSourceConfig();

      expect(dispatchSpy).toHaveBeenCalledWith(
        SourceConfigsActions.resetSelectedSourceConfig(),
      );
    });
  });

  describe('selectSourceConfig', () => {
    it('should dispatch selectSourceConfig action with correct id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const sourceConfigId = 'test-id';

      facade.selectSourceConfig(sourceConfigId);

      expect(dispatchSpy).toHaveBeenCalledWith(
        SourceConfigsActions.selectSourceConfig({ selectedId: sourceConfigId }),
      );
    });
  });

  describe('loadSourceConfigs', () => {
    it('should dispatch loadSourceConfigs action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.loadSourceConfigs();

      expect(dispatchSpy).toHaveBeenCalledWith(
        SourceConfigsActions.loadSourceConfigs(),
      );
    });
  });

  describe('loadSourceConfig', () => {
    it('should dispatch loadSourceConfig action with correct id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const sourceConfigId = 'test-id';

      facade.loadSourceConfig(sourceConfigId);

      expect(dispatchSpy).toHaveBeenCalledWith(
        SourceConfigsActions.loadSourceConfig({ sourceConfigId }),
      );
    });
  });

  describe('saveSourceConfig', () => {
    it('should call updateSourceConfig when sourceConfig has id', () => {
      const updateSpy = jest.spyOn(facade, 'updateSourceConfig');
      const sourceConfigWithId = { ...mockSourceConfig, id: 'existing-id' };

      facade.saveSourceConfig(sourceConfigWithId);

      expect(updateSpy).toHaveBeenCalledWith(sourceConfigWithId);
    });

    it('should call createSourceConfig when sourceConfig has no id', () => {
      const createSpy = jest.spyOn(facade, 'createSourceConfig');
      const sourceConfigWithoutId = { ...mockSourceConfig, id: '' };

      facade.saveSourceConfig(sourceConfigWithoutId);

      expect(createSpy).toHaveBeenCalledWith(sourceConfigWithoutId);
    });
  });

  describe('createSourceConfig', () => {
    it('should dispatch createSourceConfig action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.createSourceConfig(mockSourceConfig);

      expect(dispatchSpy).toHaveBeenCalledWith(
        SourceConfigsActions.createSourceConfig({
          sourceConfig: mockSourceConfig,
        }),
      );
    });
  });

  describe('updateSourceConfig', () => {
    it('should dispatch updateSourceConfig action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.updateSourceConfig(mockSourceConfig);

      expect(dispatchSpy).toHaveBeenCalledWith(
        SourceConfigsActions.updateSourceConfig({
          sourceConfig: mockSourceConfig,
        }),
      );
    });
  });

  describe('deleteSourceConfig', () => {
    it('should dispatch deleteSourceConfig action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.deleteSourceConfig(mockSourceConfig);

      expect(dispatchSpy).toHaveBeenCalledWith(
        SourceConfigsActions.deleteSourceConfig({
          sourceConfig: mockSourceConfig,
        }),
      );
    });
  });

  describe('dispatch', () => {
    it('should dispatch action to store', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const action = SourceConfigsActions.loadSourceConfigs();

      facade.dispatch(action);

      expect(dispatchSpy).toHaveBeenCalledWith(action);
    });
  });

  describe('mutations$', () => {
    it('should filter createSourceConfig actions', (done) => {
      const action = SourceConfigsActions.createSourceConfig({
        sourceConfig: mockSourceConfig,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should filter updateSourceConfig actions', (done) => {
      const action = SourceConfigsActions.updateSourceConfig({
        sourceConfig: mockSourceConfig,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should filter deleteSourceConfig actions', (done) => {
      const action = SourceConfigsActions.deleteSourceConfig({
        sourceConfig: mockSourceConfig,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should not filter other actions', (done) => {
      const action = SourceConfigsActions.loadSourceConfigs();
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
