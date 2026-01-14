import { Injectable, inject } from '@angular/core';
import { UserProgress, RecordAttemptDto } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { UserProgressActions } from './user-progress.actions';

import {
  selectAllUserProgress,
  selectUserProgressLoaded,
  selectUserProgressError,
  selectSelectedUserProgress,
  selectDueForReview,
  selectStudyStats,
  selectStudyLoading,
} from './user-progress.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserProgressFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectUserProgressLoaded);
  error$ = this.store.select(selectUserProgressError);
  allUserProgress$ = this.store.select(selectAllUserProgress);
  selectedUserProgress$ = this.store.select(selectSelectedUserProgress);

  // Study selectors
  dueForReview$ = this.store.select(selectDueForReview);
  studyStats$ = this.store.select(selectStudyStats);
  studyLoading$ = this.store.select(selectStudyLoading);

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

  // Study methods
  recordAttempt(attempt: RecordAttemptDto) {
    this.dispatch(UserProgressActions.recordAttempt({ attempt }));
  }

  loadDueForReview(userId: string) {
    this.dispatch(UserProgressActions.loadDueForReview({ userId }));
  }

  loadStudyStats(userId: string) {
    this.dispatch(UserProgressActions.loadStudyStats({ userId }));
  }

  loadUserProgressByUser(userId: string) {
    this.dispatch(UserProgressActions.loadUserProgressByUser({ userId }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
