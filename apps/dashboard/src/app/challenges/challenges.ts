import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KnowledgeUnit, Challenge } from '@kasita/common-models';
import { ChallengesFacade, KnowledgeUnitFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';
import { ChallengeDetail } from './challenge-detail/challenge-detail';
import { ChallengesList } from './challenges-list/challenges-list';
import {
  SearchFilterBar,
  FilterConfig,
  SearchFilterState,
} from '../shared/search-filter-bar/search-filter-bar';
import {
  filterEntities,
  commonFilterMatchers,
} from '../shared/search-filter-bar/filter-utils';

@Component({
  selector: 'app-challenges',
  imports: [
    ChallengesList,
    ChallengeDetail,
    MaterialModule,
    SearchFilterBar,
  ],
  templateUrl: './challenges.html',
  styleUrl: './challenges.scss',
})
export class Challenges implements OnInit {
  private challengesFacade = inject(ChallengesFacade);
  private knowledgeUnitsFacade = inject(KnowledgeUnitFacade);

  private allChallenges = toSignal(this.challengesFacade.allChallenges$, {
    initialValue: [] as Challenge[],
  });
  private allUnits = toSignal(this.knowledgeUnitsFacade.allKnowledgeUnits$, {
    initialValue: [] as KnowledgeUnit[],
  });
  selectedChallenge = toSignal(this.challengesFacade.selectedChallenge$, {
    initialValue: null,
  });
  loaded = toSignal(this.challengesFacade.loaded$, { initialValue: false });
  error = toSignal(this.challengesFacade.error$, { initialValue: null });

  // Search/Filter state
  searchFilterState = signal<SearchFilterState>({
    searchTerm: '',
    filters: {},
  });

  // Get units for dropdown
  units = computed(() => this.allUnits());

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

  // Filtered challenges
  challenges = computed(() => {
    const all = this.allChallenges();
    const state = this.searchFilterState();
    return filterEntities(all, state, ['title', 'description'], {
      difficulty: commonFilterMatchers.exactMatch<Challenge>('difficulty'),
      isActive: (challenge: Challenge, value: string | string[]) =>
        String(challenge.isActive) === (Array.isArray(value) ? value[0] : value),
    });
  });

  onSearchFilterChange(state: SearchFilterState) {
    this.searchFilterState.set(state);
  }

  constructor() {
    this.challengesFacade.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.knowledgeUnitsFacade.loadKnowledgeUnits();
    this.reset();
  }

  reset() {
    this.loadChallenges();
    this.challengesFacade.resetSelectedChallenge();
  }

  selectChallenge(challenge: Challenge) {
    this.challengesFacade.selectChallenge(challenge.id as string);
  }

  loadChallenges() {
    this.challengesFacade.loadChallenges();
  }

  saveChallenge(challenge: Challenge) {
    this.challengesFacade.saveChallenge(challenge);
  }

  deleteChallenge(challenge: Challenge) {
    this.challengesFacade.deleteChallenge(challenge);
  }

  cancel() {
    this.challengesFacade.resetSelectedChallenge();
  }
}
