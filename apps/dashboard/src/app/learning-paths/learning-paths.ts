import { Component, computed,inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LearningPath } from '@kasita/common-models';
import { LearningPathsFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

import { commonFilterMatchers,filterEntities } from '../shared/search-filter-bar/filter-utils';
import { FilterConfig, SearchFilterBar, SearchFilterState } from '../shared/search-filter-bar/search-filter-bar';
import { LearningPathDetail } from './learning-path-detail/learning-path-detail';
import { LearningPathsList } from './learning-paths-list/learning-paths-list';

@Component({
  selector: 'app-learning-paths',
  imports: [LearningPathsList, LearningPathDetail, MaterialModule, SearchFilterBar],
  templateUrl: './learning-paths.html',
  styleUrl: './learning-paths.scss',
})
export class LearningPaths implements OnInit {
  private learningPathsFacade = inject(LearningPathsFacade);

  private allLearningPaths = toSignal(this.learningPathsFacade.allLearningPaths$, { initialValue: [] as LearningPath[] });
  selectedLearningPath = toSignal(this.learningPathsFacade.selectedLearningPath$, { initialValue: null });
  loaded = toSignal(this.learningPathsFacade.loaded$, { initialValue: false });
  error = toSignal(this.learningPathsFacade.error$, { initialValue: null });

  // Search/Filter state
  searchFilterState = signal<SearchFilterState>({ searchTerm: '', filters: {} });

  // Filter configuration
  filterConfigs: FilterConfig[] = [
    {
      field: 'status',
      label: 'Status',
      options: [
        { label: 'Not Started', value: 'not-started' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' },
      ],
    },
  ];

  // Filtered learning paths
  learningPaths = computed(() => {
    const all = this.allLearningPaths();
    const state = this.searchFilterState();
    return filterEntities(
      all,
      state,
      ['name', 'domain', 'targetSkill'],
      {
        status: commonFilterMatchers.exactMatch<LearningPath>('status'),
      }
    );
  });

  onSearchFilterChange(state: SearchFilterState) {
    this.searchFilterState.set(state);
  }

  constructor() {
    this.learningPathsFacade.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.reset();
  }

  reset() {
    this.loadLearningPaths();
    this.learningPathsFacade.resetSelectedLearningPath();
  }

  selectLearningPath(learningPath: LearningPath) {
    this.learningPathsFacade.selectLearningPath(learningPath.id as string);
  }

  loadLearningPaths() {
    this.learningPathsFacade.loadLearningPaths();
  }

  saveLearningPath(learningPath: LearningPath) {
    this.learningPathsFacade.saveLearningPath(learningPath);
  }

  deleteLearningPath(learningPath: LearningPath) {
    this.learningPathsFacade.deleteLearningPath(learningPath);
  }

  cancel() {
    this.learningPathsFacade.resetSelectedLearningPath();
  }
}
