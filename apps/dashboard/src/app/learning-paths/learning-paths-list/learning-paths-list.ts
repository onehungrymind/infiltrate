import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject,Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LearningPath } from '@kasita/common-models';
import { ConfirmationDialogComponent,MaterialModule } from '@kasita/material';

@Component({
  selector: 'app-learning-paths-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './learning-paths-list.html',
  styleUrl: './learning-paths-list.scss',
})
export class LearningPathsList {
  private dialog = inject(MatDialog);

  @Input() learningPaths: LearningPath[] = [];
  @Input() selectedLearningPath: LearningPath | null = null;
  @Input() readonly = false;
  @Output() selected = new EventEmitter();
  @Output() deleted = new EventEmitter();
  
  isSelected(learningPath: LearningPath): boolean {
    return this.selectedLearningPath?.id === learningPath.id;
  }

  onDelete(learningPath: LearningPath) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Learning Path',
        message: `Are you sure you want to delete "${learningPath.name || 'this learning path'}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleted.emit(learningPath);
      }
    });
  }
}
