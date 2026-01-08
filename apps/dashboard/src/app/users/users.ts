import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { User } from '@kasita/common-models';
import { UsersFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';
import { Observable } from 'rxjs';
import { UserDetail } from './user-detail/user-detail';
import { UsersList } from './users-list/users-list';

@Component({
  selector: 'app-users',
  imports: [UsersList, UserDetail, AsyncPipe, MaterialModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  private usersFacade = inject(UsersFacade);

  users$: Observable<User[]> =
    this.usersFacade.allUsers$;
  selectedUser$: Observable<User | null> =
    this.usersFacade.selectedUser$;
  loaded$ = this.usersFacade.loaded$;
  error$ = this.usersFacade.error$;
  mutations$ = this.usersFacade.mutations$;

  constructor() {
    this.mutations$.subscribe(() => this.reset());
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
