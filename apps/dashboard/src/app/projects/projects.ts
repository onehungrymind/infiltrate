import { Component, computed,inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LearningPath, Concept, Project } from '@kasita/common-models';
import { LearningPathsFacade, ConceptsFacade,ProjectsFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

import {
  commonFilterMatchers,
  filterEntities,
} from '../shared/search-filter-bar/filter-utils';
import {
  FilterConfig,
  SearchFilterBar,
  SearchFilterState,
} from '../shared/search-filter-bar/search-filter-bar';
import { ProjectDetail } from './project-detail/project-detail';
import { ProjectsList } from './projects-list/projects-list';

@Component({
  selector: 'app-projects',
  imports: [
    ProjectsList,
    ProjectDetail,
    MaterialModule,
    SearchFilterBar,
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects implements OnInit {
  private projectsFacade = inject(ProjectsFacade);
  private learningPathsFacade = inject(LearningPathsFacade);
  private conceptsFacade = inject(ConceptsFacade);

  private allProjects = toSignal(this.projectsFacade.allProjects$, {
    initialValue: [] as Project[],
  });
  private allPaths = toSignal(this.learningPathsFacade.allLearningPaths$, {
    initialValue: [] as LearningPath[],
  });
  private allConcepts = toSignal(this.conceptsFacade.allConcepts$, {
    initialValue: [] as Concept[],
  });
  selectedProject = toSignal(this.projectsFacade.selectedProject$, {
    initialValue: null,
  });
  loaded = toSignal(this.projectsFacade.loaded$, { initialValue: false });
  error = toSignal(this.projectsFacade.error$, { initialValue: null });

  // Search/Filter state
  searchFilterState = signal<SearchFilterState>({
    searchTerm: '',
    filters: {},
  });

  // Get paths for dropdown
  paths = computed(() => this.allPaths());

  // Get concepts for linking
  concepts = computed(() => this.allConcepts());

  // Dynamic filter configuration
  filterConfigs = computed<FilterConfig[]>(() => {
    return [
      {
        field: 'difficulty',
        label: 'Difficulty',
        options: [
          { label: 'Beginner', value: 'beginner' },
          { label: 'Intermediate', value: 'intermediate' },
          { label: 'Advanced', value: 'advanced' },
          { label: 'Expert', value: 'expert' },
        ],
        row: 1,
      },
      {
        field: 'isActive',
        label: 'Status',
        options: [
          { label: 'Active', value: 'true' },
          { label: 'Inactive', value: 'false' },
        ],
        row: 1,
      },
    ];
  });

  // Filtered projects
  projects = computed(() => {
    const all = this.allProjects();
    const state = this.searchFilterState();
    return filterEntities(all, state, ['name', 'description'], {
      difficulty: commonFilterMatchers.exactMatch<Project>('difficulty'),
      isActive: (project: Project, value: string | string[]) =>
        String(project.isActive) === (Array.isArray(value) ? value[0] : value),
    });
  });

  onSearchFilterChange(state: SearchFilterState) {
    this.searchFilterState.set(state);
  }

  constructor() {
    this.projectsFacade.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.learningPathsFacade.loadLearningPaths();
    this.conceptsFacade.loadConcepts();
    this.reset();
  }

  reset() {
    this.loadProjects();
    this.projectsFacade.resetSelectedProject();
  }

  selectProject(project: Project) {
    this.projectsFacade.selectProject(project.id as string);
  }

  loadProjects() {
    this.projectsFacade.loadProjects();
  }

  saveProject(project: Project) {
    this.projectsFacade.saveProject(project);
  }

  deleteProject(project: Project) {
    this.projectsFacade.deleteProject(project);
  }

  cancel() {
    this.projectsFacade.resetSelectedProject();
  }
}
