import { Injectable, inject } from '@angular/core';
import { Principle } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { PrinciplesActions } from './principles.actions';

import {
  selectAllPrinciples,
  selectPrinciplesLoaded,
  selectPrinciplesError,
  selectSelectedPrinciple,
  selectPrinciplesByPathId,
} from './principles.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrincipleFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectPrinciplesLoaded);
  error$ = this.store.select(selectPrinciplesError);
  allPrinciples$ = this.store.select(selectAllPrinciples);
  selectedPrinciple$ = this.store.select(selectSelectedPrinciple);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === PrinciplesActions.createPrinciple.type ||
        action.type === PrinciplesActions.updatePrinciple.type ||
        action.type === PrinciplesActions.deletePrinciple.type,
    ),
  );

  selectPrinciplesByPath(pathId: string) {
    return this.store.select(selectPrinciplesByPathId(pathId));
  }

  resetSelectedPrinciple() {
    this.dispatch(PrinciplesActions.resetSelectedPrinciple());
  }

  selectPrinciple(selectedId: string) {
    this.dispatch(PrinciplesActions.selectPrinciple({ selectedId }));
  }

  loadPrinciples() {
    this.dispatch(PrinciplesActions.loadPrinciples());
  }

  loadPrinciple(principleId: string) {
    this.dispatch(PrinciplesActions.loadPrinciple({ principleId }));
  }

  loadPrinciplesByPath(pathId: string) {
    this.dispatch(PrinciplesActions.loadPrinciplesByPath({ pathId }));
  }

  savePrinciple(principle: Principle) {
    if (principle.id) {
      this.updatePrinciple(principle);
    } else {
      this.createPrinciple(principle);
    }
  }

  createPrinciple(principle: Principle) {
    this.dispatch(PrinciplesActions.createPrinciple({ principle }));
  }

  updatePrinciple(principle: Principle) {
    this.dispatch(PrinciplesActions.updatePrinciple({ principle }));
  }

  deletePrinciple(principle: Principle) {
    this.dispatch(PrinciplesActions.deletePrinciple({ principle }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
