import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LearningPath } from '@kasita/common-models';
import { LearningPathsFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';
import { LearningPathDetail } from './learning-path-detail/learning-path-detail';
import { LearningPathsList } from './learning-paths-list/learning-paths-list';

@Component({
  selector: 'app-learning-paths',
  imports: [LearningPathsList, LearningPathDetail, MaterialModule],
  templateUrl: './learning-paths.html',
  styleUrl: './learning-paths.scss',
})
export class LearningPaths implements OnInit {
  private learningPathsFacade = inject(LearningPathsFacade);

  learningPaths = toSignal(this.learningPathsFacade.allLearningPaths$, { initialValue: [] as LearningPath[] });
  selectedLearningPath = toSignal(this.learningPathsFacade.selectedLearningPath$, { initialValue: null });
  loaded = toSignal(this.learningPathsFacade.loaded$, { initialValue: false });
  error = toSignal(this.learningPathsFacade.error$, { initialValue: null });

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
