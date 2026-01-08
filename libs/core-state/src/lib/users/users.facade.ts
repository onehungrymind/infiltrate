import { Injectable, inject } from '@angular/core';
import { User } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { UsersActions } from './users.actions';

import {
  selectAllUsers,
  selectUsersLoaded,
  selectUsersError,
  selectSelectedUser,
} from './users.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectUsersLoaded);
  error$ = this.store.select(selectUsersError);
  allUsers$ = this.store.select(selectAllUsers);
  selectedUser$ = this.store.select(selectSelectedUser);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === UsersActions.createUser.type ||
        action.type === UsersActions.updateUser.type ||
        action.type === UsersActions.deleteUser.type,
    ),
  );

  resetSelectedUser() {
    this.dispatch(UsersActions.resetSelectedUser());
  }

  selectUser(selectedId: string) {
    this.dispatch(UsersActions.selectUser({ selectedId }));
  }

  loadUsers() {
    this.dispatch(UsersActions.loadUsers());
  }

  loadUser(userId: string) {
    this.dispatch(UsersActions.loadUser({ userId }));
  }

  saveUser(user: User) {
    if (user.id) {
      this.updateUser(user);
    } else {
      this.createUser(user);
    }
  }

  createUser(user: User) {
    this.dispatch(UsersActions.createUser({ user }));
  }

  updateUser(user: User) {
    this.dispatch(UsersActions.updateUser({ user }));
  }

  deleteUser(user: User) {
    this.dispatch(UsersActions.deleteUser({ user }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
