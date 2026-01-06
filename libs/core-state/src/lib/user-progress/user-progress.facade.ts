import { Injectable, inject } from '@angular/core';
import { UserProgress } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { UserProgressActions } from './user-progress.actions';

import {
  selectAllUserProgress,
  selectUserProgressLoaded,
  selectSelectedUserProgress,
} from './user-progress.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserProgressFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectUserProgressLoaded);
  allUserProgress$ = this.store.select(selectAllUserProgress);
  selectedUserProgress$ = this.store.select(selectSelectedUserProgress);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === UserProgressActions.createUserProgress.type ||
        action.type === UserProgressActions.updateUserProgress.type ||
        action.type === UserProgressActions.deleteUserProgress.type,
    ),
  );

  resetSelectedUserProgress() {
    this.dispatch(UserProgressActions.resetSelectedUserProgress());
  }

  selectUserProgress(selectedId: string) {
    this.dispatch(UserProgressActions.selectUserProgress({ selectedId }));
  }

  loadUserProgress() {
    this.dispatch(UserProgressActions.loadUserProgress());
  }

  loadUserProgressItem(userProgressId: string) {
    this.dispatch(UserProgressActions.loadUserProgressItem({ userProgressId }));
  }

  saveUserProgress(userProgress: UserProgress) {
    if (userProgress.id) {
      this.updateUserProgress(userProgress);
    } else {
      this.createUserProgress(userProgress);
    }
  }

  createUserProgress(userProgress: UserProgress) {
    this.dispatch(UserProgressActions.createUserProgress({ userProgress }));
  }

  updateUserProgress(userProgress: UserProgress) {
    this.dispatch(UserProgressActions.updateUserProgress({ userProgress }));
  }

  deleteUserProgress(userProgress: UserProgress) {
    this.dispatch(UserProgressActions.deleteUserProgress({ userProgress }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
