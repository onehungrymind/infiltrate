import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UserProgress } from '@kasita/common-models';
import { UserProgressFacade } from '@kasita/core-state';
import { Observable } from 'rxjs';
import { UserProgressDetail } from './user-progress-detail/user-progress-detail';
import { UserProgressList } from './user-progress-list/user-progress-list';

@Component({
  selector: 'app-user-progress',
  imports: [UserProgressList, UserProgressDetail, AsyncPipe],
  templateUrl: './user-progress.html',
  styleUrl: './user-progress.scss',
})
export class UserProgress implements OnInit {
  private userProgressFacade = inject(UserProgressFacade);

  userProgress$: Observable<UserProgress[]> =
    this.userProgressFacade.allUserProgress$;
  selectedUserProgress$: Observable<UserProgress | null> =
    this.userProgressFacade.selectedUserProgress$;
  mutations$ = this.userProgressFacade.mutations$;

  constructor() {
    this.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.reset();
  }

  reset() {
    this.loadUserProgress();
    this.userProgressFacade.resetSelectedUserProgress();
  }

  selectUserProgress(userProgress: UserProgress) {
    this.userProgressFacade.selectUserProgress(userProgress.id as string);
  }

  loadUserProgress() {
    this.userProgressFacade.loadUserProgress();
  }

  saveUserProgress(userProgress: UserProgress) {
    this.userProgressFacade.saveUserProgress(userProgress);
  }

  deleteUserProgress(userProgress: UserProgress) {
    this.userProgressFacade.deleteUserProgress(userProgress);
  }

  cancel() {
    this.userProgressFacade.resetSelectedUserProgress();
  }
}
