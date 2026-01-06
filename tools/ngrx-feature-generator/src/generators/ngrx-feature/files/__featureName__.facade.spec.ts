import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ActionsSubject, Store } from '@ngrx/store';
import { <%= singularClassName %>Facade } from './<%= featureName %>.facade';
import { <%= pluralClassName %>Actions } from './<%= featureName %>.actions';
import { <%= singularClassName %> } from '<%= npmScope %>/api-interfaces';

describe('<%= singularClassName %>Facade', () => {
  let facade: <%= singularClassName %>Facade;
  let store: MockStore;
  let actionsSubject: ActionsSubject;

  const mock<%= singularClassName %>: <%= singularClassName %> = {
    id: '1',
    // Add your entity properties here based on the interface
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        <%= singularClassName %>Facade,
        provideMockStore({
          initialState: {
            <%= pluralPropertyName %>: {
              entities: {},
              ids: [],
              loaded: false,
              selectedId: null
            }
          }
        }),
        ActionsSubject
      ]
    });

    facade = TestBed.inject(<%= singularClassName %>Facade);
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

    it('should expose all<%= pluralClassName %>$ observable', () => {
      expect(facade.all<%= pluralClassName %>$).toBeDefined();
    });

    it('should expose selected<%= singularClassName %>$ observable', () => {
      expect(facade.selected<%= singularClassName %>$).toBeDefined();
    });

    it('should expose mutations$ observable', () => {
      expect(facade.mutations$).toBeDefined();
    });
  });

  describe('resetSelected<%= singularClassName %>', () => {
    it('should dispatch resetSelected<%= singularClassName %> action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      
      facade.resetSelected<%= singularClassName %>();
      
      expect(dispatchSpy).toHaveBeenCalledWith(<%= pluralClassName %>Actions.resetSelected<%= singularClassName %>());
    });
  });

  describe('select<%= singularClassName %>', () => {
    it('should dispatch select<%= singularClassName %> action with correct id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const <%= singularPropertyName %>Id = 'test-id';
      
      facade.select<%= singularClassName %>(<%= singularPropertyName %>Id);
      
      expect(dispatchSpy).toHaveBeenCalledWith(<%= pluralClassName %>Actions.select<%= singularClassName %>({ selectedId: <%= singularPropertyName %>Id }));
    });
  });

  describe('load<%= pluralClassName %>', () => {
    it('should dispatch load<%= pluralClassName %> action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      
      facade.load<%= pluralClassName %>();
      
      expect(dispatchSpy).toHaveBeenCalledWith(<%= pluralClassName %>Actions.load<%= pluralClassName %>());
    });
  });

  describe('load<%= singularClassName %>', () => {
    it('should dispatch load<%= singularClassName %> action with correct id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const <%= singularPropertyName %>Id = 'test-id';
      
      facade.load<%= singularClassName %>(<%= singularPropertyName %>Id);
      
      expect(dispatchSpy).toHaveBeenCalledWith(<%= pluralClassName %>Actions.load<%= singularClassName %>({ <%= singularPropertyName %>Id }));
    });
  });

  describe('save<%= singularClassName %>', () => {
    it('should call update<%= singularClassName %> when <%= singularPropertyName %> has id', () => {
      const updateSpy = jest.spyOn(facade, 'update<%= singularClassName %>');
      const <%= singularPropertyName %>WithId = { ...mock<%= singularClassName %>, id: 'existing-id' };
      
      facade.save<%= singularClassName %>(<%= singularPropertyName %>WithId);
      
      expect(updateSpy).toHaveBeenCalledWith(<%= singularPropertyName %>WithId);
    });

    it('should call create<%= singularClassName %> when <%= singularPropertyName %> has no id', () => {
      const createSpy = jest.spyOn(facade, 'create<%= singularClassName %>');
      const <%= singularPropertyName %>WithoutId = { ...mock<%= singularClassName %>, id: '' };
      
      facade.save<%= singularClassName %>(<%= singularPropertyName %>WithoutId);
      
      expect(createSpy).toHaveBeenCalledWith(<%= singularPropertyName %>WithoutId);
    });
  });

  describe('create<%= singularClassName %>', () => {
    it('should dispatch create<%= singularClassName %> action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      
      facade.create<%= singularClassName %>(mock<%= singularClassName %>);
      
      expect(dispatchSpy).toHaveBeenCalledWith(<%= pluralClassName %>Actions.create<%= singularClassName %>({ <%= singularPropertyName %>: mock<%= singularClassName %> }));
    });
  });

  describe('update<%= singularClassName %>', () => {
    it('should dispatch update<%= singularClassName %> action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      
      facade.update<%= singularClassName %>(mock<%= singularClassName %>);
      
      expect(dispatchSpy).toHaveBeenCalledWith(<%= pluralClassName %>Actions.update<%= singularClassName %>({ <%= singularPropertyName %>: mock<%= singularClassName %> }));
    });
  });

  describe('delete<%= singularClassName %>', () => {
    it('should dispatch delete<%= singularClassName %> action', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      
      facade.delete<%= singularClassName %>(mock<%= singularClassName %>);
      
      expect(dispatchSpy).toHaveBeenCalledWith(<%= pluralClassName %>Actions.delete<%= singularClassName %>({ <%= singularPropertyName %>: mock<%= singularClassName %> }));
    });
  });

  describe('dispatch', () => {
    it('should dispatch action to store', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const action = <%= pluralClassName %>Actions.load<%= pluralClassName %>();
      
      facade.dispatch(action);
      
      expect(dispatchSpy).toHaveBeenCalledWith(action);
    });
  });

  describe('mutations$', () => {
    it('should filter create<%= singularClassName %> actions', (done) => {
      const action = <%= pluralClassName %>Actions.create<%= singularClassName %>({ <%= singularPropertyName %>: mock<%= singularClassName %> });
      
      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });
      
      actionsSubject.next(action);
    });

    it('should filter update<%= singularClassName %> actions', (done) => {
      const action = <%= pluralClassName %>Actions.update<%= singularClassName %>({ <%= singularPropertyName %>: mock<%= singularClassName %> });
      
      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });
      
      actionsSubject.next(action);
    });

    it('should filter delete<%= singularClassName %> actions', (done) => {
      const action = <%= pluralClassName %>Actions.delete<%= singularClassName %>({ <%= singularPropertyName %>: mock<%= singularClassName %> });
      
      facade.mutations$.subscribe((filteredAction) => {
        expect(filteredAction).toEqual(action);
        done();
      });
      
      actionsSubject.next(action);
    });

    it('should not filter other actions', (done) => {
      const action = <%= pluralClassName %>Actions.load<%= pluralClassName %>();
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
