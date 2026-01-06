import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LearningPath } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';

@Component({
  selector: 'app-learning-path-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './learning-path-detail.html',
  styleUrl: './learning-path-detail.scss',
})
export class LearningPathDetail {
  currentLearningPath!: LearningPath;
  originalTitle = '';
  @Input() set learningPath(value: LearningPath | null) {
    if (value) this.originalTitle = `${value.title || value.name || 'Item'}`;
    this.currentLearningPath = Object.assign({}, value);
  }
  @Output() saved = new EventEmitter();
  @Output() cancelled = new EventEmitter();
}
