import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject,Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserProgress } from '@kasita/common-models';
import { ConfirmationDialogComponent,MaterialModule } from '@kasita/material';

@Component({
  selector: 'app-user-progress-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './user-progress-list.html',
  styleUrl: './user-progress-list.scss',
})
export class UserProgressList {
  private dialog = inject(MatDialog);

  @Input() userProgress: UserProgress[] = [];
  @Input() selectedUserProgress: UserProgress | null = null;
  @Input() readonly = false;
  @Output() selected = new EventEmitter();
  @Output() deleted = new EventEmitter();
  
  isSelected(userProgress: UserProgress): boolean {
    return this.selectedUserProgress?.id === userProgress.id;
  }

  onDelete(userProgress: UserProgress) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete User Progress',
        message: `Are you sure you want to delete progress for unit ${userProgress.unitId}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleted.emit(userProgress);
      }
    });
  }
}
