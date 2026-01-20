import { AsyncPipe } from '@angular/common';
import { Component, computed,inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KnowledgeUnit, LearningPath } from '@kasita/common-models';
import { KnowledgeUnitFacade, LearningPathsFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

import { commonFilterMatchers,filterEntities } from '../../shared/search-filter-bar/filter-utils';
import { FilterConfig, SearchFilterBar, SearchFilterState } from '../../shared/search-filter-bar/search-filter-bar';
import { KnowledgeUnitDetail } from './knowledge-unit-detail/knowledge-unit-detail';
import { KnowledgeUnitsList } from './knowledge-units-list/knowledge-units-list';

@Component({
  selector: 'app-knowledge-units',
  imports: [KnowledgeUnitsList, KnowledgeUnitDetail, AsyncPipe, MaterialModule, SearchFilterBar],
  templateUrl: './knowledge-units.html',
  styleUrl: './knowledge-units.scss',
})
export class KnowledgeUnits implements OnInit {
  private knowledgeUnitsFacade = inject(KnowledgeUnitFacade);
  private learningPathsFacade = inject(LearningPathsFacade);

  private allKnowledgeUnits = toSignal(this.knowledgeUnitsFacade.allKnowledgeUnits$, { initialValue: [] as KnowledgeUnit[] });
  private allLearningPaths = toSignal(this.learningPathsFacade.allLearningPaths$, { initialValue: [] as LearningPath[] });
  selectedKnowledgeUnit$ = this.knowledgeUnitsFacade.selectedKnowledgeUnit$;
  loaded$ = this.knowledgeUnitsFacade.loaded$;
  error$ = this.knowledgeUnitsFacade.error$;
  mutations$ = this.knowledgeUnitsFacade.mutations$;

  // Search/Filter state
  searchFilterState = signal<SearchFilterState>({ searchTerm: '', filters: {} });

  // Dynamic filter configuration based on loaded learning paths
  filterConfigs = computed<FilterConfig[]>(() => {
    const paths = this.allLearningPaths();
    const pathOptions = paths.map(p => ({ label: p.name, value: p.id }));

    return [
      {
        field: 'pathId',
        label: 'Learning Path',
        options: pathOptions,
        fullWidth: true,
        row: 1,
      },
      {
        field: 'difficulty',
        label: 'Difficulty',
        options: [
          { label: 'Beginner', value: 'beginner' },
          { label: 'Intermediate', value: 'intermediate' },
          { label: 'Advanced', value: 'advanced' },
          { label: 'Expert', value: 'expert' },
        ],
        row: 2,
      },
    ];
  });

  // Filtered knowledge units
  knowledgeUnits = computed(() => {
    const all = this.allKnowledgeUnits();
    const state = this.searchFilterState();
    return filterEntities(
      all,
      state,
      ['concept', 'question', 'answer'],
      {
        pathId: commonFilterMatchers.exactMatch<KnowledgeUnit>('pathId'),
        difficulty: commonFilterMatchers.exactMatch<KnowledgeUnit>('difficulty'),
      }
    );
  });

  onSearchFilterChange(state: SearchFilterState) {
    this.searchFilterState.set(state);
  }

  constructor() {
    this.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.learningPathsFacade.loadLearningPaths();
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
