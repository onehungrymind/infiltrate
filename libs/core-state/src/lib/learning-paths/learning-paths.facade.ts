import { Injectable, inject } from '@angular/core';
import { LearningPath } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { LearningPathsActions } from './learning-paths.actions';

import {
  selectAllLearningPaths,
  selectLearningPathsLoaded,
  selectSelectedLearningPath,
} from './learning-paths.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LearningPathFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectLearningPathsLoaded);
  allLearningPaths$ = this.store.select(selectAllLearningPaths);
  selectedLearningPath$ = this.store.select(selectSelectedLearningPath);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === LearningPathsActions.createLearningPath.type ||
        action.type === LearningPathsActions.updateLearningPath.type ||
        action.type === LearningPathsActions.deleteLearningPath.type,
    ),
  );

  resetSelectedLearningPath() {
    this.dispatch(LearningPathsActions.resetSelectedLearningPath());
  }

  selectLearningPath(selectedId: string) {
    this.dispatch(LearningPathsActions.selectLearningPath({ selectedId }));
  }

  loadLearningPaths() {
    this.dispatch(LearningPathsActions.loadLearningPaths());
  }

  loadLearningPath(learningPathId: string) {
    this.dispatch(LearningPathsActions.loadLearningPath({ learningPathId }));
  }

  saveLearningPath(learningPath: LearningPath) {
    if (learningPath.id) {
      this.updateLearningPath(learningPath);
    } else {
      this.createLearningPath(learningPath);
    }
  }

  createLearningPath(learningPath: LearningPath) {
    this.dispatch(LearningPathsActions.createLearningPath({ learningPath }));
  }

  updateLearningPath(learningPath: LearningPath) {
    this.dispatch(LearningPathsActions.updateLearningPath({ learningPath }));
  }

  deleteLearningPath(learningPath: LearningPath) {
    this.dispatch(LearningPathsActions.deleteLearningPath({ learningPath }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
