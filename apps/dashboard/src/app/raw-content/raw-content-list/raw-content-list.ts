import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RawContent } from '@kasita/common-models';
import { MaterialModule, ConfirmationDialogComponent } from '@kasita/material';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-raw-content-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './raw-content-list.html',
  styleUrl: './raw-content-list.scss',
})
export class RawContentList {
  private dialog = inject(MatDialog);

  @Input() rawContent: RawContent[] = [];
  @Input() readonly = false;
  @Output() selected = new EventEmitter();
  @Output() deleted = new EventEmitter();

  onDelete(rawContent: RawContent) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete RawContent',
        message: `"${rawContent.title || 'Item'}"`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleted.emit(rawContent);
      }
    });
  }
}
