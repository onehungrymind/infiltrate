import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '@kasita/common-models';
import { UsersFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';
import { UserDetail } from './user-detail/user-detail';
import { UsersList } from './users-list/users-list';
import { SearchFilterBar, FilterConfig, SearchFilterState } from '../shared/search-filter-bar/search-filter-bar';
import { filterEntities, commonFilterMatchers } from '../shared/search-filter-bar/filter-utils';

@Component({
  selector: 'app-users',
  imports: [UsersList, UserDetail, MaterialModule, SearchFilterBar],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  private usersFacade = inject(UsersFacade);

  private allUsers = toSignal(this.usersFacade.allUsers$, { initialValue: [] as User[] });
  selectedUser = toSignal(this.usersFacade.selectedUser$, { initialValue: null });
  loaded = toSignal(this.usersFacade.loaded$, { initialValue: false });
  error = toSignal(this.usersFacade.error$, { initialValue: null });

  // Search/Filter state
  searchFilterState = signal<SearchFilterState>({ searchTerm: '', filters: {} });

  // Filter configuration
  filterConfigs: FilterConfig[] = [
    {
      field: 'role',
      label: 'Role',
      options: [
        { label: 'Guest', value: 'guest' },
        { label: 'User', value: 'user' },
        { label: 'Manager', value: 'manager' },
        { label: 'Admin', value: 'admin' },
      ],
    },
    {
      field: 'isActive',
      label: 'Active',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
  ];

  // Filtered users
  users = computed(() => {
    const all = this.allUsers();
    const state = this.searchFilterState();
    return filterEntities(
      all,
      state,
      ['name', 'email'],
      {
        role: commonFilterMatchers.exactMatch<User>('role'),
        isActive: commonFilterMatchers.boolean<User>('isActive'),
      }
    );
  });

  onSearchFilterChange(state: SearchFilterState) {
    this.searchFilterState.set(state);
  }

  constructor() {
    this.usersFacade.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.reset();
  }

  reset() {
    this.loadUsers();
    this.usersFacade.resetSelectedUser();
  }

  selectUser(user: User) {
    this.usersFacade.selectUser(user.id as string);
    // Load the full user with password when selected
    this.usersFacade.loadUser(user.id as string);
  }

  loadUsers() {
    this.usersFacade.loadUsers();
  }

  saveUser(user: User) {
    this.usersFacade.saveUser(user);
  }

  deleteUser(user: User) {
    this.usersFacade.deleteUser(user);
  }

  cancel() {
    this.usersFacade.resetSelectedUser();
  }
}
