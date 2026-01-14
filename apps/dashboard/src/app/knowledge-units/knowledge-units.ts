import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KnowledgeUnit } from '@kasita/common-models';
import { KnowledgeUnitFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';
import { KnowledgeUnitDetail } from './knowledge-unit-detail/knowledge-unit-detail';
import { KnowledgeUnitsList } from './knowledge-units-list/knowledge-units-list';
import { SearchFilterBar, FilterConfig, SearchFilterState } from '../shared/search-filter-bar/search-filter-bar';
import { filterEntities, commonFilterMatchers } from '../shared/search-filter-bar/filter-utils';

@Component({
  selector: 'app-knowledge-units',
  imports: [KnowledgeUnitsList, KnowledgeUnitDetail, AsyncPipe, MaterialModule, SearchFilterBar],
  templateUrl: './knowledge-units.html',
  styleUrl: './knowledge-units.scss',
})
export class KnowledgeUnits implements OnInit {
  private knowledgeUnitsFacade = inject(KnowledgeUnitFacade);

  private allKnowledgeUnits = toSignal(this.knowledgeUnitsFacade.allKnowledgeUnits$, { initialValue: [] as KnowledgeUnit[] });
  selectedKnowledgeUnit$ = this.knowledgeUnitsFacade.selectedKnowledgeUnit$;
  loaded$ = this.knowledgeUnitsFacade.loaded$;
  error$ = this.knowledgeUnitsFacade.error$;
  mutations$ = this.knowledgeUnitsFacade.mutations$;

  // Search/Filter state
  searchFilterState = signal<SearchFilterState>({ searchTerm: '', filters: {} });

  // Filter configuration
  filterConfigs: FilterConfig[] = [
    {
      field: 'status',
      label: 'Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
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
    },
  ];

  // Filtered knowledge units
  knowledgeUnits = computed(() => {
    const all = this.allKnowledgeUnits();
    const state = this.searchFilterState();
    return filterEntities(
      all,
      state,
      ['concept', 'question', 'answer'],
      {
        status: commonFilterMatchers.exactMatch<KnowledgeUnit>('status'),
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
