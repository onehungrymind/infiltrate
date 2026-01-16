import { Component, computed,inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserProgress as UserProgressModel } from '@kasita/common-models';
import { UserProgressFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

import { commonFilterMatchers,filterEntities } from '../shared/search-filter-bar/filter-utils';
import { FilterConfig, SearchFilterBar, SearchFilterState } from '../shared/search-filter-bar/search-filter-bar';
import { UserProgressDetail } from './user-progress-detail/user-progress-detail';
import { UserProgressList } from './user-progress-list/user-progress-list';

@Component({
  selector: 'app-user-progress',
  imports: [UserProgressList, UserProgressDetail, MaterialModule, SearchFilterBar],
  templateUrl: './user-progress.html',
  styleUrl: './user-progress.scss',
})
export class UserProgress implements OnInit {
  private userProgressFacade = inject(UserProgressFacade);

  private allUserProgress = toSignal(this.userProgressFacade.allUserProgress$, { initialValue: [] as UserProgressModel[] });
  selectedUserProgress = toSignal(this.userProgressFacade.selectedUserProgress$, { initialValue: null });
  loaded = toSignal(this.userProgressFacade.loaded$, { initialValue: false });
  error = toSignal(this.userProgressFacade.error$, { initialValue: null });

  // Search/Filter state
  searchFilterState = signal<SearchFilterState>({ searchTerm: '', filters: {} });

  // Filter configuration
  filterConfigs: FilterConfig[] = [
    {
      field: 'masteryLevel',
      label: 'Mastery Level',
      options: [
        { label: 'Learning', value: 'learning' },
        { label: 'Reviewing', value: 'reviewing' },
        { label: 'Mastered', value: 'mastered' },
      ],
    },
  ];

  // Filtered user progress
  userProgress = computed(() => {
    const all = this.allUserProgress();
    const state = this.searchFilterState();
    return filterEntities(
      all,
      state,
      ['userId', 'unitId'],
      {
        masteryLevel: commonFilterMatchers.exactMatch<UserProgressModel>('masteryLevel'),
      }
    );
  });

  onSearchFilterChange(state: SearchFilterState) {
    this.searchFilterState.set(state);
  }

  constructor() {
    this.userProgressFacade.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.reset();
  }

  reset() {
    this.loadUserProgress();
    this.userProgressFacade.resetSelectedUserProgress();
  }

  selectUserProgress(userProgress: UserProgressModel) {
    this.userProgressFacade.selectUserProgress(userProgress.id as string);
  }

  loadUserProgress() {
    this.userProgressFacade.loadUserProgress();
  }

  saveUserProgress(userProgress: UserProgressModel) {
    this.userProgressFacade.saveUserProgress(userProgress);
  }

  deleteUserProgress(userProgress: UserProgressModel) {
    this.userProgressFacade.deleteUserProgress(userProgress);
  }

  cancel() {
    this.userProgressFacade.resetSelectedUserProgress();
  }
}
