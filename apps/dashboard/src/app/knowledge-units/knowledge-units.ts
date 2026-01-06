import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { KnowledgeUnit } from '@kasita/common-models';
import { KnowledgeUnitFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';
import { Observable } from 'rxjs';
import { KnowledgeUnitDetail } from './knowledge-unit-detail/knowledge-unit-detail';
import { KnowledgeUnitsList } from './knowledge-units-list/knowledge-units-list';

@Component({
  selector: 'app-knowledge-units',
  imports: [KnowledgeUnitsList, KnowledgeUnitDetail, AsyncPipe, MaterialModule],
  templateUrl: './knowledge-units.html',
  styleUrl: './knowledge-units.scss',
})
export class KnowledgeUnits implements OnInit {
  private knowledgeUnitsFacade = inject(KnowledgeUnitFacade);

  knowledgeUnits$: Observable<KnowledgeUnit[]> =
    this.knowledgeUnitsFacade.allKnowledgeUnits$;
  selectedKnowledgeUnit$: Observable<KnowledgeUnit | null> =
    this.knowledgeUnitsFacade.selectedKnowledgeUnit$;
  loaded$ = this.knowledgeUnitsFacade.loaded$;
  error$ = this.knowledgeUnitsFacade.error$;
  mutations$ = this.knowledgeUnitsFacade.mutations$;

  constructor() {
    this.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.reset();
  }

  reset() {
    this.loadKnowledgeUnits();
    this.knowledgeUnitsFacade.resetSelectedKnowledgeUnit();
  }

  selectKnowledgeUnit(knowledgeUnit: KnowledgeUnit) {
    this.knowledgeUnitsFacade.selectKnowledgeUnit(knowledgeUnit.id as string);
  }

  loadKnowledgeUnits() {
    this.knowledgeUnitsFacade.loadKnowledgeUnits();
  }

  saveKnowledgeUnit(knowledgeUnit: KnowledgeUnit) {
    this.knowledgeUnitsFacade.saveKnowledgeUnit(knowledgeUnit);
  }

  deleteKnowledgeUnit(knowledgeUnit: KnowledgeUnit) {
    this.knowledgeUnitsFacade.deleteKnowledgeUnit(knowledgeUnit);
  }

  cancel() {
    this.knowledgeUnitsFacade.resetSelectedKnowledgeUnit();
  }
}
