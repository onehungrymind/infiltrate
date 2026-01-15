import { Injectable, inject } from '@angular/core';
import { Challenge } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { ChallengesActions } from './challenges.actions';
import {
  selectAllChallenges,
  selectChallengesLoaded,
  selectChallengesError,
  selectSelectedChallenge,
  selectChallengesByUnitId,
} from './challenges.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChallengesFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectChallengesLoaded);
  error$ = this.store.select(selectChallengesError);
  allChallenges$ = this.store.select(selectAllChallenges);
  selectedChallenge$ = this.store.select(selectSelectedChallenge);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === ChallengesActions.createChallenge.type ||
        action.type === ChallengesActions.updateChallenge.type ||
        action.type === ChallengesActions.deleteChallenge.type,
    ),
  );

  selectChallengesByUnit(unitId: string) {
    return this.store.select(selectChallengesByUnitId(unitId));
  }

  resetSelectedChallenge() {
    this.dispatch(ChallengesActions.resetSelectedChallenge());
  }

  selectChallenge(selectedId: string) {
    this.dispatch(ChallengesActions.selectChallenge({ selectedId }));
  }

  loadChallenges() {
    this.dispatch(ChallengesActions.loadChallenges());
  }

  loadChallenge(challengeId: string) {
    this.dispatch(ChallengesActions.loadChallenge({ challengeId }));
  }

  loadChallengesByUnit(unitId: string) {
    this.dispatch(ChallengesActions.loadChallengesByUnit({ unitId }));
  }

  saveChallenge(challenge: Challenge) {
    if (challenge.id) {
      this.updateChallenge(challenge);
    } else {
      this.createChallenge(challenge);
    }
  }

  createChallenge(challenge: Challenge) {
    this.dispatch(ChallengesActions.createChallenge({ challenge }));
  }

  updateChallenge(challenge: Challenge) {
    this.dispatch(ChallengesActions.updateChallenge({ challenge }));
  }

  deleteChallenge(challenge: Challenge) {
    this.dispatch(ChallengesActions.deleteChallenge({ challenge }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
