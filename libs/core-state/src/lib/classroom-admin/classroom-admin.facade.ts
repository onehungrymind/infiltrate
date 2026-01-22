import { Injectable, inject } from '@angular/core';
import { ContentListQuery } from '@kasita/core-data';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { ClassroomAdminActions } from './classroom-admin.actions';
import {
  selectAllContent,
  selectOverview,
  selectPathStatus,
  selectErrors,
  selectJobs,
  selectPagination,
  selectLoading,
  selectError,
  selectSelectedContent,
  selectContentByStatus,
  selectContentByPath,
} from './classroom-admin.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClassroomAdminFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  // Selectors
  allContent$ = this.store.select(selectAllContent);
  overview$ = this.store.select(selectOverview);
  pathStatus$ = this.store.select(selectPathStatus);
  errors$ = this.store.select(selectErrors);
  jobs$ = this.store.select(selectJobs);
  pagination$ = this.store.select(selectPagination);
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);
  selectedContent$ = this.store.select(selectSelectedContent);

  // Success notifications
  generateSuccess$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === ClassroomAdminActions.generateForPathSuccess.type ||
        action.type === ClassroomAdminActions.generateForConceptSuccess.type ||
        action.type === ClassroomAdminActions.generateForSubConceptSuccess.type,
    ),
  );

  contentUpdateSuccess$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === ClassroomAdminActions.updateContentSuccess.type ||
        action.type === ClassroomAdminActions.approveContentSuccess.type,
    ),
  );

  // Parameterized selectors
  selectContentByStatus(status: string) {
    return this.store.select(selectContentByStatus(status));
  }

  selectContentByPath(learningPathId: string) {
    return this.store.select(selectContentByPath(learningPathId));
  }

  // Actions
  loadOverview() {
    this.dispatch(ClassroomAdminActions.loadOverview());
  }

  loadPathStatus(learningPathId: string) {
    this.dispatch(ClassroomAdminActions.loadPathStatus({ learningPathId }));
  }

  loadContentList(query?: ContentListQuery) {
    this.dispatch(ClassroomAdminActions.loadContentList({ query }));
  }

  loadContent(contentId: string) {
    this.dispatch(ClassroomAdminActions.loadContent({ contentId }));
  }

  loadErrors() {
    this.dispatch(ClassroomAdminActions.loadErrors());
  }

  generateForPath(learningPathId: string, force = false) {
    this.dispatch(ClassroomAdminActions.generateForPath({ learningPathId, force }));
  }

  generateForConcept(conceptId: string) {
    this.dispatch(ClassroomAdminActions.generateForConcept({ conceptId }));
  }

  generateForSubConcept(
    subConceptId: string,
    options?: { conceptName?: string; conceptId?: string; learningPathId?: string },
  ) {
    this.dispatch(ClassroomAdminActions.generateForSubConcept({ subConceptId, options }));
  }

  clearPathContent(learningPathId: string) {
    this.dispatch(ClassroomAdminActions.clearPathContent({ learningPathId }));
  }

  updateContent(contentId: string, updates: { title?: string; summary?: string; sections?: any[] }) {
    this.dispatch(ClassroomAdminActions.updateContent({ contentId, updates }));
  }

  approveContent(contentId: string) {
    this.dispatch(ClassroomAdminActions.approveContent({ contentId }));
  }

  regenerateContent(contentId: string) {
    this.dispatch(ClassroomAdminActions.regenerateContent({ contentId }));
  }

  loadJobs() {
    this.dispatch(ClassroomAdminActions.loadJobs());
  }

  cancelJob(jobId: string) {
    this.dispatch(ClassroomAdminActions.cancelJob({ jobId }));
  }

  selectContent(contentId: string | null) {
    this.dispatch(ClassroomAdminActions.selectContent({ contentId }));
  }

  resetState() {
    this.dispatch(ClassroomAdminActions.resetState());
  }

  private dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
