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
  @Input() selectedRawContent: RawContent | null = null;
  @Input() readonly = false;
  @Output() selected = new EventEmitter();
  @Output() deleted = new EventEmitter();
  
  isSelected(rawContent: RawContent): boolean {
    return this.selectedRawContent?.id === rawContent.id;
  }

  onDelete(rawContent: RawContent) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Raw Content',
        message: `Are you sure you want to delete "${rawContent.title || 'this raw content'}"? This action cannot be undone.`,
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
