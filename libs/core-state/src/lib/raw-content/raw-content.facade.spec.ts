import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ActionsSubject, Store } from '@ngrx/store';
import { RawContentFacade } from './raw-content.facade';
import { RawContentActions } from './raw-content.actions';
import { RawContent } from '@kasita/common-models';

describe('RawContentFacade', () => {
  let facade: RawContentFacade;
  let store: MockStore;
  let actionsSubject: ActionsSubject;

  const mockRawContent: RawContent = {
    id: '1',
    // Add your entity properties here based on the interface
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RawContentFacade,
        provideMockStore({
          initialState: {
            rawContent: {
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

    facade = TestBed.inject(RawContentFacade);
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

    it('should expose allRawContent$ observable', () => {
      expect(facade.allRawContent$).toBeDefined();
    });

    it('should expose selectedRawContent$ observable', () => {
      expect(facade.selectedRawContent$).toBeDefined();
    });

    it('should expose mutations$ observable', () => {
      expect(facade.mutations$).toBeDefined();
    });
  });

  describe('resetSelectedRawContent', () => {
    it('should dispatch resetSelectedRawContent action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.resetSelectedRawContent();

      expect(dispatchSpy).toHaveBeenCalledWith(
        RawContentActions.resetSelectedRawContent(),
      );
    });
  });

  describe('selectRawContent', () => {
    it('should dispatch selectRawContent action with correct id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const rawContentId = 'test-id';

      facade.selectRawContent(rawContentId);

      expect(dispatchSpy).toHaveBeenCalledWith(
        RawContentActions.selectRawContent({ selectedId: rawContentId }),
      );
    });
  });

  describe('loadRawContent', () => {
    it('should dispatch loadRawContent action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.loadRawContent();

      expect(dispatchSpy).toHaveBeenCalledWith(
        RawContentActions.loadRawContent(),
      );
    });
  });

  describe('loadRawContent', () => {
    it('should dispatch loadRawContent action with correct id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const rawContentId = 'test-id';

      facade.loadRawContent(rawContentId);

      expect(dispatchSpy).toHaveBeenCalledWith(
        RawContentActions.loadRawContent({ rawContentId }),
      );
    });
  });

  describe('saveRawContent', () => {
    it('should call updateRawContent when rawContent has id', () => {
      const updateSpy = jest.spyOn(facade, 'updateRawContent');
      const rawContentWithId = { ...mockRawContent, id: 'existing-id' };

      facade.saveRawContent(rawContentWithId);

      expect(updateSpy).toHaveBeenCalledWith(rawContentWithId);
    });

    it('should call createRawContent when rawContent has no id', () => {
      const createSpy = jest.spyOn(facade, 'createRawContent');
      const rawContentWithoutId = { ...mockRawContent, id: '' };

      facade.saveRawContent(rawContentWithoutId);

      expect(createSpy).toHaveBeenCalledWith(rawContentWithoutId);
    });
  });

  describe('createRawContent', () => {
    it('should dispatch createRawContent action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.createRawContent(mockRawContent);

      expect(dispatchSpy).toHaveBeenCalledWith(
        RawContentActions.createRawContent({ rawContent: mockRawContent }),
      );
    });
  });

  describe('updateRawContent', () => {
    it('should dispatch updateRawContent action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.updateRawContent(mockRawContent);

      expect(dispatchSpy).toHaveBeenCalledWith(
        RawContentActions.updateRawContent({ rawContent: mockRawContent }),
      );
    });
  });

  describe('deleteRawContent', () => {
    it('should dispatch deleteRawContent action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      facade.deleteRawContent(mockRawContent);

      expect(dispatchSpy).toHaveBeenCalledWith(
        RawContentActions.deleteRawContent({ rawContent: mockRawContent }),
      );
    });
  });

  describe('dispatch', () => {
    it('should dispatch action to store', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const action = RawContentActions.loadRawContent();

      facade.dispatch(action);

      expect(dispatchSpy).toHaveBeenCalledWith(action);
    });
  });

  describe('mutations$', () => {
    it('should filter createRawContent actions', (done) => {
      const action = RawContentActions.createRawContent({
        rawContent: mockRawContent,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should filter updateRawContent actions', (done) => {
      const action = RawContentActions.updateRawContent({
        rawContent: mockRawContent,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should filter deleteRawContent actions', (done) => {
      const action = RawContentActions.deleteRawContent({
        rawContent: mockRawContent,
      });

      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });

      actionsSubject.next(action);
    });

    it('should not filter other actions', (done) => {
      const action = RawContentActions.loadRawContent();
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
