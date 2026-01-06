import { Injectable, inject } from '@angular/core';
import { KnowledgeUnit } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { KnowledgeUnitsActions } from './knowledge-units.actions';

import {
  selectAllKnowledgeUnits,
  selectKnowledgeUnitsLoaded,
  selectSelectedKnowledgeUnit,
} from './knowledge-units.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KnowledgeUnitFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectKnowledgeUnitsLoaded);
  allKnowledgeUnits$ = this.store.select(selectAllKnowledgeUnits);
  selectedKnowledgeUnit$ = this.store.select(selectSelectedKnowledgeUnit);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === KnowledgeUnitsActions.createKnowledgeUnit.type ||
        action.type === KnowledgeUnitsActions.updateKnowledgeUnit.type ||
        action.type === KnowledgeUnitsActions.deleteKnowledgeUnit.type,
    ),
  );

  resetSelectedKnowledgeUnit() {
    this.dispatch(KnowledgeUnitsActions.resetSelectedKnowledgeUnit());
  }

  selectKnowledgeUnit(selectedId: string) {
    this.dispatch(KnowledgeUnitsActions.selectKnowledgeUnit({ selectedId }));
  }

  loadKnowledgeUnits() {
    this.dispatch(KnowledgeUnitsActions.loadKnowledgeUnits());
  }

  loadKnowledgeUnit(knowledgeUnitId: string) {
    this.dispatch(KnowledgeUnitsActions.loadKnowledgeUnit({ knowledgeUnitId }));
  }

  saveKnowledgeUnit(knowledgeUnit: KnowledgeUnit) {
    if (knowledgeUnit.id) {
      this.updateKnowledgeUnit(knowledgeUnit);
    } else {
      this.createKnowledgeUnit(knowledgeUnit);
    }
  }

  createKnowledgeUnit(knowledgeUnit: KnowledgeUnit) {
    this.dispatch(KnowledgeUnitsActions.createKnowledgeUnit({ knowledgeUnit }));
  }

  updateKnowledgeUnit(knowledgeUnit: KnowledgeUnit) {
    this.dispatch(KnowledgeUnitsActions.updateKnowledgeUnit({ knowledgeUnit }));
  }

  deleteKnowledgeUnit(knowledgeUnit: KnowledgeUnit) {
    this.dispatch(KnowledgeUnitsActions.deleteKnowledgeUnit({ knowledgeUnit }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
