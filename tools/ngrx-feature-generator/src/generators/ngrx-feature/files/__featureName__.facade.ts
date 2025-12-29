import { Injectable, inject } from '@angular/core';
import { <%= singularClassName %> } from '@articool/api-interfaces';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { <%= pluralClassName %>Actions } from './<%= featureName %>.actions';

import {
  selectAll<%= pluralClassName %>,
  select<%= pluralClassName %>Loaded,
  selectSelected<%= singularClassName %>,
} from './<%= featureName %>.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class <%= singularClassName %>Facade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(select<%= pluralClassName %>Loaded);
  all<%= pluralClassName %>$ = this.store.select(selectAll<%= pluralClassName %>);
  selected<%= singularClassName %>$ = this.store.select(selectSelected<%= singularClassName %>);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === <%= pluralClassName %>Actions.create<%= singularClassName %>.type ||
        action.type === <%= pluralClassName %>Actions.update<%= singularClassName %>.type ||
        action.type === <%= pluralClassName %>Actions.delete<%= singularClassName %>.type
    )
  );

  resetSelected<%= singularClassName %>() {
    this.dispatch(<%= pluralClassName %>Actions.resetSelected<%= singularClassName %>());
  }

  select<%= singularClassName %>(selectedId: string) {
    this.dispatch(<%= pluralClassName %>Actions.select<%= singularClassName %>({ selectedId }));
  }

  load<%= pluralClassName %>() {
    this.dispatch(<%= pluralClassName %>Actions.load<%= pluralClassName %>());
  }

  load<%= singularClassName %>(<%= singularPropertyName %>Id: string) {
    this.dispatch(<%= pluralClassName %>Actions.load<%= singularClassName %>({ <%= singularPropertyName %>Id }));
  }

  save<%= singularClassName %>(<%= singularPropertyName %>: <%= singularClassName %>) {
    if (<%= singularPropertyName %>.id) {
      this.update<%= singularClassName %>(<%= singularPropertyName %>);
    } else {
      this.create<%= singularClassName %>(<%= singularPropertyName %>);
    }
  }

  create<%= singularClassName %>(<%= singularPropertyName %>: <%= singularClassName %>) {
    this.dispatch(<%= pluralClassName %>Actions.create<%= singularClassName %>({ <%= singularPropertyName %> }));
  }

  update<%= singularClassName %>(<%= singularPropertyName %>: <%= singularClassName %>) {
    this.dispatch(<%= pluralClassName %>Actions.update<%= singularClassName %>({ <%= singularPropertyName %> }));
  }

  delete<%= singularClassName %>(<%= singularPropertyName %>: <%= singularClassName %>) {
    this.dispatch(<%= pluralClassName %>Actions.delete<%= singularClassName %>({ <%= singularPropertyName %> }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
