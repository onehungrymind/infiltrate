import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { LearningPath } from '@kasita/common-models';
import { LearningPathsFacade } from '@kasita/core-state';
import { Observable } from 'rxjs';
import { LearningPathDetail } from './learning-path-detail/learning-path-detail';
import { LearningPathsList } from './learning-paths-list/learning-paths-list';

@Component({
  selector: 'app-learning-paths',
  imports: [LearningPathsList, LearningPathDetail, AsyncPipe],
  templateUrl: './learning-paths.html',
  styleUrl: './learning-paths.scss',
})
export class LearningPaths implements OnInit {
  private learningPathsFacade = inject(LearningPathsFacade);

  learningPaths$: Observable<LearningPath[]> =
    this.learningPathsFacade.allLearningPaths$;
  selectedLearningPath$: Observable<LearningPath | null> =
    this.learningPathsFacade.selectedLearningPath$;
  mutations$ = this.learningPathsFacade.mutations$;

  constructor() {
    this.mutations$.subscribe(() => this.reset());
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
