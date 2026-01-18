import { Injectable, inject } from '@angular/core';
import { RawContent } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { RawContentActions } from './raw-content.actions';

import {
  selectAllRawContent,
  selectRawContentLoaded,
  selectRawContentError,
  selectSelectedRawContent,
  selectRawContentByPathId,
} from './raw-content.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RawContentFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectRawContentLoaded);
  error$ = this.store.select(selectRawContentError);
  allRawContent$ = this.store.select(selectAllRawContent);
  selectedRawContent$ = this.store.select(selectSelectedRawContent);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === RawContentActions.createRawContent.type ||
        action.type === RawContentActions.updateRawContent.type ||
        action.type === RawContentActions.deleteRawContent.type,
    ),
  );

  selectRawContentByPath(pathId: string) {
    return this.store.select(selectRawContentByPathId(pathId));
  }

  resetSelectedRawContent() {
    this.dispatch(RawContentActions.resetSelectedRawContent());
  }

  selectRawContent(selectedId: string) {
    this.dispatch(RawContentActions.selectRawContent({ selectedId }));
  }

  loadRawContent() {
    this.dispatch(RawContentActions.loadRawContent());
  }

  loadRawContentItem(rawContentId: string) {
    this.dispatch(RawContentActions.loadRawContentItem({ rawContentId }));
  }

  loadRawContentByPath(pathId: string) {
    this.dispatch(RawContentActions.loadRawContentByPath({ pathId }));
  }

  saveRawContent(rawContent: RawContent) {
    if (rawContent.id) {
      this.updateRawContent(rawContent);
    } else {
      this.createRawContent(rawContent);
    }
  }

  createRawContent(rawContent: RawContent) {
    this.dispatch(RawContentActions.createRawContent({ rawContent }));
  }

  updateRawContent(rawContent: RawContent) {
    this.dispatch(RawContentActions.updateRawContent({ rawContent }));
  }

  deleteRawContent(rawContent: RawContent) {
    this.dispatch(RawContentActions.deleteRawContent({ rawContent }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
