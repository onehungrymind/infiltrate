import { Injectable, inject } from '@angular/core';
import { SubConcept } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { SubConceptsActions } from './sub-concepts.actions';

import {
  selectAllSubConcepts,
  selectSubConceptsLoaded,
  selectSubConceptsError,
  selectSubConceptsGenerating,
  selectSelectedSubConcept,
  selectSubConceptsByConceptId,
} from './sub-concepts.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubConceptsFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectSubConceptsLoaded);
  error$ = this.store.select(selectSubConceptsError);
  generating$ = this.store.select(selectSubConceptsGenerating);
  allSubConcepts$ = this.store.select(selectAllSubConcepts);
  selectedSubConcept$ = this.store.select(selectSelectedSubConcept);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === SubConceptsActions.createSubConcept.type ||
        action.type === SubConceptsActions.updateSubConcept.type ||
        action.type === SubConceptsActions.deleteSubConcept.type,
    ),
  );

  aiGenerationComplete$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === SubConceptsActions.decomposeConceptSuccess.type ||
        action.type === SubConceptsActions.generateStructuredKUSuccess.type,
    ),
  );

  selectSubConceptsByConcept(conceptId: string) {
    return this.store.select(selectSubConceptsByConceptId(conceptId));
  }

  resetSelectedSubConcept() {
    this.dispatch(SubConceptsActions.resetSelectedSubConcept());
  }

  selectSubConcept(selectedId: string) {
    this.dispatch(SubConceptsActions.selectSubConcept({ selectedId }));
  }

  loadSubConcepts() {
    this.dispatch(SubConceptsActions.loadSubConcepts());
  }

  loadSubConcept(subConceptId: string) {
    this.dispatch(SubConceptsActions.loadSubConcept({ subConceptId }));
  }

  loadSubConceptsByConcept(conceptId: string) {
    this.dispatch(SubConceptsActions.loadSubConceptsByConcept({ conceptId }));
  }

  saveSubConcept(subConcept: SubConcept) {
    if (subConcept.id) {
      this.updateSubConcept(subConcept);
    } else {
      this.createSubConcept(subConcept);
    }
  }

  createSubConcept(subConcept: SubConcept) {
    this.dispatch(SubConceptsActions.createSubConcept({ subConcept }));
  }

  updateSubConcept(subConcept: SubConcept) {
    this.dispatch(SubConceptsActions.updateSubConcept({ subConcept }));
  }

  deleteSubConcept(subConcept: SubConcept) {
    this.dispatch(SubConceptsActions.deleteSubConcept({ subConcept }));
  }

  // AI generation methods
  decomposeConcept(conceptId: string) {
    this.dispatch(SubConceptsActions.decomposeConcept({ conceptId }));
  }

  generateStructuredKU(subConceptId: string) {
    this.dispatch(SubConceptsActions.generateStructuredKU({ subConceptId }));
  }

  // Decoration methods
  addDecoration(subConceptId: string, knowledgeUnitId: string) {
    this.dispatch(SubConceptsActions.addDecoration({ subConceptId, knowledgeUnitId }));
  }

  removeDecoration(subConceptId: string, knowledgeUnitId: string) {
    this.dispatch(SubConceptsActions.removeDecoration({ subConceptId, knowledgeUnitId }));
  }

  /**
   * Add sub-concepts directly to the store (e.g., after AI decomposition returns them)
   * This avoids needing to reload from the API
   */
  addSubConceptsToStore(subConcepts: SubConcept[], message = '') {
    this.dispatch(SubConceptsActions.decomposeConceptSuccess({ subConcepts, message }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
