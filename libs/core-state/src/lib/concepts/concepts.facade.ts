import { Injectable, inject } from '@angular/core';
import { Concept } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { ConceptsActions } from './concepts.actions';

import {
  selectAllConcepts,
  selectConceptsLoaded,
  selectConceptsError,
  selectSelectedConcept,
  selectConceptsByPathId,
} from './concepts.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConceptFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectConceptsLoaded);
  error$ = this.store.select(selectConceptsError);
  allConcepts$ = this.store.select(selectAllConcepts);
  selectedConcept$ = this.store.select(selectSelectedConcept);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === ConceptsActions.createConcept.type ||
        action.type === ConceptsActions.updateConcept.type ||
        action.type === ConceptsActions.deleteConcept.type,
    ),
  );

  selectConceptsByPath(pathId: string) {
    return this.store.select(selectConceptsByPathId(pathId));
  }

  resetSelectedConcept() {
    this.dispatch(ConceptsActions.resetSelectedConcept());
  }

  selectConcept(selectedId: string) {
    this.dispatch(ConceptsActions.selectConcept({ selectedId }));
  }

  loadConcepts() {
    this.dispatch(ConceptsActions.loadConcepts());
  }

  loadConcept(conceptId: string) {
    this.dispatch(ConceptsActions.loadConcept({ conceptId }));
  }

  loadConceptsByPath(pathId: string) {
    this.dispatch(ConceptsActions.loadConceptsByPath({ pathId }));
  }

  saveConcept(concept: Concept) {
    if (concept.id) {
      this.updateConcept(concept);
    } else {
      this.createConcept(concept);
    }
  }

  createConcept(concept: Concept) {
    this.dispatch(ConceptsActions.createConcept({ concept }));
  }

  updateConcept(concept: Concept) {
    this.dispatch(ConceptsActions.updateConcept({ concept }));
  }

  deleteConcept(concept: Concept) {
    this.dispatch(ConceptsActions.deleteConcept({ concept }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
