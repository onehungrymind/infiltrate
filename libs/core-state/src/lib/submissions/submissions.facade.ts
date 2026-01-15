import { Injectable, inject } from '@angular/core';
import { Submission } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { SubmissionsActions } from './submissions.actions';

import {
  selectAllSubmissions,
  selectSubmissionsLoaded,
  selectSubmissionsError,
  selectSelectedSubmission,
  selectSubmissionsByUserId,
  selectSubmissionsByUnitId,
  selectSubmissionsByPathId,
  selectSubmissionsByStatus,
  selectFeedbackForSubmission,
  selectFeedbackLoading,
} from './submissions.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubmissionsFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectSubmissionsLoaded);
  error$ = this.store.select(selectSubmissionsError);
  allSubmissions$ = this.store.select(selectAllSubmissions);
  selectedSubmission$ = this.store.select(selectSelectedSubmission);
  feedbackLoading$ = this.store.select(selectFeedbackLoading);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === SubmissionsActions.createSubmission.type ||
        action.type === SubmissionsActions.updateSubmission.type ||
        action.type === SubmissionsActions.deleteSubmission.type ||
        action.type === SubmissionsActions.submitForReview.type ||
        action.type === SubmissionsActions.requestAIFeedback.type,
    ),
  );

  selectSubmissionsByUser(userId: string) {
    return this.store.select(selectSubmissionsByUserId(userId));
  }

  selectSubmissionsByUnit(unitId: string) {
    return this.store.select(selectSubmissionsByUnitId(unitId));
  }

  selectSubmissionsByPath(pathId: string) {
    return this.store.select(selectSubmissionsByPathId(pathId));
  }

  selectSubmissionsByStatus(status: string) {
    return this.store.select(selectSubmissionsByStatus(status));
  }

  selectFeedbackForSubmission(submissionId: string) {
    return this.store.select(selectFeedbackForSubmission(submissionId));
  }

  resetSelectedSubmission() {
    this.dispatch(SubmissionsActions.resetSelectedSubmission());
  }

  selectSubmission(selectedId: string) {
    this.dispatch(SubmissionsActions.selectSubmission({ selectedId }));
  }

  loadSubmissions() {
    this.dispatch(SubmissionsActions.loadSubmissions());
  }

  loadSubmission(submissionId: string) {
    this.dispatch(SubmissionsActions.loadSubmission({ submissionId }));
  }

  loadSubmissionsByUser(userId: string) {
    this.dispatch(SubmissionsActions.loadSubmissionsByUser({ userId }));
  }

  loadSubmissionsByUnit(unitId: string) {
    this.dispatch(SubmissionsActions.loadSubmissionsByUnit({ unitId }));
  }

  loadSubmissionsByPath(pathId: string) {
    this.dispatch(SubmissionsActions.loadSubmissionsByPath({ pathId }));
  }

  saveSubmission(submission: Submission) {
    if (submission.id) {
      this.updateSubmission(submission);
    } else {
      this.createSubmission(submission);
    }
  }

  createSubmission(submission: Submission) {
    this.dispatch(SubmissionsActions.createSubmission({ submission }));
  }

  updateSubmission(submission: Submission) {
    this.dispatch(SubmissionsActions.updateSubmission({ submission }));
  }

  deleteSubmission(submission: Submission) {
    this.dispatch(SubmissionsActions.deleteSubmission({ submission }));
  }

  submitForReview(submissionId: string) {
    this.dispatch(SubmissionsActions.submitForReview({ submissionId }));
  }

  requestAiFeedback(submissionId: string, rubricCriteria?: string[]) {
    this.dispatch(
      SubmissionsActions.requestAIFeedback({ submissionId, rubricCriteria }),
    );
  }

  loadFeedback(submissionId: string) {
    this.dispatch(SubmissionsActions.loadFeedback({ submissionId }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
