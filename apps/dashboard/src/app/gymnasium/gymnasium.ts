import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Session } from '@kasita/common-models';
import { GymnasiumFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

import {
  FilterConfig,
  SearchFilterBar,
  SearchFilterState,
} from '../shared/search-filter-bar/search-filter-bar';
import {
  commonFilterMatchers,
  filterEntities,
} from '../shared/search-filter-bar/filter-utils';
import { SessionsList } from './sessions-list/sessions-list';
import { SessionViewer } from './session-viewer/session-viewer';
import { SessionGenerator } from './session-generator/session-generator';

@Component({
  selector: 'app-gymnasium',
  imports: [
    SessionsList,
    SessionViewer,
    SessionGenerator,
    MaterialModule,
    SearchFilterBar,
  ],
  templateUrl: './gymnasium.html',
  styleUrl: './gymnasium.scss',
})
export class Gymnasium implements OnInit {
  private gymnasiumFacade = inject(GymnasiumFacade);

  private allSessions = toSignal(this.gymnasiumFacade.allSessions$, {
    initialValue: [] as Session[],
  });
  selectedSession = toSignal(this.gymnasiumFacade.selectedSession$, {
    initialValue: null,
  });
  loaded = toSignal(this.gymnasiumFacade.loaded$, { initialValue: false });
  loading = toSignal(this.gymnasiumFacade.loading$, { initialValue: false });
  generating = toSignal(this.gymnasiumFacade.generating$, { initialValue: false });
  error = toSignal(this.gymnasiumFacade.error$, { initialValue: null });

  // UI state
  isGenerating = signal(false);

  // Search/Filter state
  searchFilterState = signal<SearchFilterState>({
    searchTerm: '',
    filters: {},
  });

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
        field: 'visibility',
        label: 'Visibility',
        options: [
          { label: 'Public', value: 'public' },
          { label: 'Private', value: 'private' },
          { label: 'Unlisted', value: 'unlisted' },
        ],
        row: 1,
      },
    ];
  });

  // Filtered sessions
  sessions = computed(() => {
    const all = this.allSessions();
    const state = this.searchFilterState();
    return filterEntities(all, state, ['title', 'description', 'domain'], {
      difficulty: commonFilterMatchers.exactMatch<Session>('difficulty'),
      visibility: commonFilterMatchers.exactMatch<Session>('visibility'),
    });
  });

  onSearchFilterChange(state: SearchFilterState) {
    this.searchFilterState.set(state);
  }

  constructor() {
    this.gymnasiumFacade.mutations$.subscribe(() => {
      this.loadSessions();
    });

    this.gymnasiumFacade.generationSuccess$.subscribe(() => {
      this.isGenerating.set(false);
    });
  }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions() {
    this.gymnasiumFacade.loadSessions();
  }

  selectSession(session: Session) {
    this.gymnasiumFacade.selectSession(session.id);
  }

  openGenerator() {
    this.isGenerating.set(true);
  }

  closeGenerator() {
    this.isGenerating.set(false);
  }

  deleteSession(session: Session) {
    if (confirm(`Delete session "${session.title}"?`)) {
      this.gymnasiumFacade.deleteSession(session);
    }
  }

  onSessionGenerated() {
    // Generator will close when generation succeeds via subscription
  }

  onSessionUpdated() {
    // Session was updated - list will auto-refresh via mutations$ subscription
    // Could add a toast notification here
  }
}
