import { Injectable, inject } from '@angular/core';
import { Enrollment, CreateEnrollmentDto, UpdateEnrollmentDto } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { EnrollmentsActions } from './enrollments.actions';

import {
  selectAllEnrollments,
  selectEnrollmentsLoaded,
  selectEnrollmentsError,
  selectSelectedEnrollment,
  selectEnrollmentsByUserId,
  selectEnrollmentsByPathId,
  selectActiveEnrollmentsByPathId,
  selectCurrentEnrollmentCheck,
  selectLeaderboardForPath,
} from './enrollments.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentsFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectEnrollmentsLoaded);
  error$ = this.store.select(selectEnrollmentsError);
  allEnrollments$ = this.store.select(selectAllEnrollments);
  selectedEnrollment$ = this.store.select(selectSelectedEnrollment);
  currentEnrollmentCheck$ = this.store.select(selectCurrentEnrollmentCheck);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === EnrollmentsActions.enroll.type ||
        action.type === EnrollmentsActions.updateEnrollment.type ||
        action.type === EnrollmentsActions.unenroll.type,
    ),
  );

  selectEnrollmentsByUser(userId: string) {
    return this.store.select(selectEnrollmentsByUserId(userId));
  }

  selectEnrollmentsByPath(pathId: string) {
    return this.store.select(selectEnrollmentsByPathId(pathId));
  }

  selectActiveEnrollmentsByPath(pathId: string) {
    return this.store.select(selectActiveEnrollmentsByPathId(pathId));
  }

  selectLeaderboardForPath(pathId: string) {
    return this.store.select(selectLeaderboardForPath(pathId));
  }

  resetSelectedEnrollment() {
    this.dispatch(EnrollmentsActions.resetSelectedEnrollment());
  }

  selectEnrollment(selectedId: string) {
    this.dispatch(EnrollmentsActions.selectEnrollment({ selectedId }));
  }

  loadEnrollments() {
    this.dispatch(EnrollmentsActions.loadEnrollments());
  }

  loadEnrollmentsByUser(userId: string) {
    this.dispatch(EnrollmentsActions.loadEnrollmentsByUser({ userId }));
  }

  loadEnrollmentsByPath(pathId: string, activeOnly = false) {
    this.dispatch(EnrollmentsActions.loadEnrollmentsByPath({ pathId, activeOnly }));
  }

  checkEnrollment(userId: string, pathId: string) {
    this.dispatch(EnrollmentsActions.checkEnrollment({ userId, pathId }));
  }

  enroll(enrollment: CreateEnrollmentDto) {
    this.dispatch(EnrollmentsActions.enroll({ enrollment }));
  }

  updateEnrollment(userId: string, pathId: string, updateDto: UpdateEnrollmentDto) {
    this.dispatch(EnrollmentsActions.updateEnrollment({ userId, pathId, updateDto }));
  }

  unenroll(userId: string, pathId: string) {
    this.dispatch(EnrollmentsActions.unenroll({ userId, pathId }));
  }

  loadLeaderboard(pathId: string) {
    this.dispatch(EnrollmentsActions.loadLeaderboard({ pathId }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
