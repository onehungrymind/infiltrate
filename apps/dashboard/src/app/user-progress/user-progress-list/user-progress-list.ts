import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { UserProgress } from '@kasita/common-models';
import { MaterialModule, ConfirmationDialogComponent } from '@kasita/material';
import { MatDialog } from '@angular/material/dialog';

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
  @Input() readonly = false;
  @Output() selected = new EventEmitter();
  @Output() deleted = new EventEmitter();

  onDelete(userProgress: UserProgress) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete UserProgress',
        message: `Progress for unit ${userProgress.unitId}`,
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
