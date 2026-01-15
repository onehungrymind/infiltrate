import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LearningPath, Principle } from '@kasita/common-models';
import { PrincipleFacade, LearningPathsFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';
import { PrincipleDetail } from './principle-detail/principle-detail';
import { PrinciplesList } from './principles-list/principles-list';
import { SearchFilterBar, FilterConfig, SearchFilterState } from '../shared/search-filter-bar/search-filter-bar';
import { filterEntities, commonFilterMatchers } from '../shared/search-filter-bar/filter-utils';

@Component({
  selector: 'app-principles',
  imports: [PrinciplesList, PrincipleDetail, MaterialModule, SearchFilterBar],
  templateUrl: './principles.html',
  styleUrl: './principles.scss',
})
export class Principles implements OnInit {
  private principleFacade = inject(PrincipleFacade);
  private learningPathsFacade = inject(LearningPathsFacade);

  private allPrinciples = toSignal(this.principleFacade.allPrinciples$, { initialValue: [] as Principle[] });
  private allLearningPaths = toSignal(this.learningPathsFacade.allLearningPaths$, { initialValue: [] as LearningPath[] });
  selectedPrinciple = toSignal(this.principleFacade.selectedPrinciple$, { initialValue: null });
  loaded = toSignal(this.principleFacade.loaded$, { initialValue: false });
  error = toSignal(this.principleFacade.error$, { initialValue: null });

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
        field: 'status',
        label: 'Status',
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Mastered', value: 'mastered' },
        ],
        row: 2,
      },
      {
        field: 'difficulty',
        label: 'Difficulty',
        options: [
          { label: 'Foundational', value: 'foundational' },
          { label: 'Intermediate', value: 'intermediate' },
          { label: 'Advanced', value: 'advanced' },
        ],
        row: 2,
      },
    ];
  });

  // Filtered principles
  principles = computed(() => {
    const all = this.allPrinciples();
    const state = this.searchFilterState();
    return filterEntities(
      all,
      state,
      ['name', 'description'],
      {
        pathId: commonFilterMatchers.exactMatch<Principle>('pathId'),
        status: commonFilterMatchers.exactMatch<Principle>('status'),
        difficulty: commonFilterMatchers.exactMatch<Principle>('difficulty'),
      }
    );
  });

  onSearchFilterChange(state: SearchFilterState) {
    this.searchFilterState.set(state);
  }

  constructor() {
    this.principleFacade.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.learningPathsFacade.loadLearningPaths();
    this.reset();
  }

  reset() {
    this.loadPrinciples();
    this.principleFacade.resetSelectedPrinciple();
  }

  selectPrinciple(principle: Principle) {
    this.principleFacade.selectPrinciple(principle.id as string);
  }

  loadPrinciples() {
    this.principleFacade.loadPrinciples();
  }

  savePrinciple(principle: Principle) {
    this.principleFacade.savePrinciple(principle);
  }

  deletePrinciple(principle: Principle) {
    this.principleFacade.deletePrinciple(principle);
  }

  cancel() {
    this.principleFacade.resetSelectedPrinciple();
  }
}
