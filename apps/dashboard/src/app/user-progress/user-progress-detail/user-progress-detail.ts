import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserProgress } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';

@Component({
  selector: 'app-user-progress-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './user-progress-detail.html',
  styleUrl: './user-progress-detail.scss',
})
export class UserProgressDetail {
  currentUserProgress!: UserProgress;
  originalTitle = '';
  @Input() set userProgress(value: UserProgress | null) {
    if (value) this.originalTitle = `Progress: ${value.masteryLevel || 'Item'}`;
    this.currentUserProgress = Object.assign({}, value);
  }
  @Output() saved = new EventEmitter();
  @Output() cancelled = new EventEmitter();
}
