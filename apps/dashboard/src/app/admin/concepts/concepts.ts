import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LearningPath, Concept } from '@kasita/common-models';
import { LearningPathsFacade, ConceptsFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

import { commonFilterMatchers, filterEntities } from '../../shared/search-filter-bar/filter-utils';
import { FilterConfig, SearchFilterBar, SearchFilterState } from '../../shared/search-filter-bar/search-filter-bar';
import { ConceptDetail } from './concept-detail/concept-detail';
import { ConceptsList } from './concepts-list/concepts-list';

@Component({
  selector: 'app-concepts',
  imports: [ConceptsList, ConceptDetail, MaterialModule, SearchFilterBar],
  templateUrl: './concepts.html',
  styleUrl: './concepts.scss',
})
export class Concepts implements OnInit {
  private conceptsFacade = inject(ConceptsFacade);
  private learningPathsFacade = inject(LearningPathsFacade);

  private allConcepts = toSignal(this.conceptsFacade.allConcepts$, { initialValue: [] as Concept[] });
  private allLearningPaths = toSignal(this.learningPathsFacade.allLearningPaths$, { initialValue: [] as LearningPath[] });
  selectedConcept = toSignal(this.conceptsFacade.selectedConcept$, { initialValue: null });
  loaded = toSignal(this.conceptsFacade.loaded$, { initialValue: false });
  error = toSignal(this.conceptsFacade.error$, { initialValue: null });

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

  // Filtered concepts
  concepts = computed(() => {
    const all = this.allConcepts();
    const state = this.searchFilterState();
    return filterEntities(
      all,
      state,
      ['name', 'description'],
      {
        pathId: commonFilterMatchers.exactMatch<Concept>('pathId'),
        status: commonFilterMatchers.exactMatch<Concept>('status'),
        difficulty: commonFilterMatchers.exactMatch<Concept>('difficulty'),
      }
    );
  });

  onSearchFilterChange(state: SearchFilterState) {
    this.searchFilterState.set(state);
  }

  constructor() {
    this.conceptsFacade.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.learningPathsFacade.loadLearningPaths();
    this.reset();
  }

  reset() {
    this.loadConcepts();
    this.conceptsFacade.resetSelectedConcept();
  }

  selectConcept(concept: Concept) {
    this.conceptsFacade.selectConcept(concept.id as string);
  }

  loadConcepts() {
    this.conceptsFacade.loadConcepts();
  }

  saveConcept(concept: Concept) {
    this.conceptsFacade.saveConcept(concept);
  }

  deleteConcept(concept: Concept) {
    this.conceptsFacade.deleteConcept(concept);
  }

  cancel() {
    this.conceptsFacade.resetSelectedConcept();
  }
}
