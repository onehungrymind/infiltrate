import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { KnowledgeUnit } from '@kasita/common-models';
import { KnowledgeUnitsFacade } from '@kasita/core-state';
import { Observable } from 'rxjs';
import { KnowledgeUnitDetail } from './knowledge-unit-detail/knowledge-unit-detail';
import { KnowledgeUnitsList } from './knowledge-units-list/knowledge-units-list';

@Component({
  selector: 'app-knowledge-units',
  imports: [KnowledgeUnitsList, KnowledgeUnitDetail, AsyncPipe],
  templateUrl: './knowledge-units.html',
  styleUrl: './knowledge-units.scss',
})
export class KnowledgeUnits implements OnInit {
  private knowledgeUnitsFacade = inject(KnowledgeUnitsFacade);

  knowledgeUnits$: Observable<KnowledgeUnit[]> =
    this.knowledgeUnitsFacade.allKnowledgeUnits$;
  selectedKnowledgeUnit$: Observable<KnowledgeUnit | null> =
    this.knowledgeUnitsFacade.selectedKnowledgeUnit$;
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
