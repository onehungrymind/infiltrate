import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject,Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent,MaterialModule } from '@kasita/material';

import { SourceListItem } from '../source-configs';

@Component({
  selector: 'app-sources-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './source-configs-list.html',
  styleUrl: './source-configs-list.scss',
})
export class SourcesList {
  private dialog = inject(MatDialog);

  @Input() sources: SourceListItem[] = [];
  @Input() selectedSource: SourceListItem | null = null;
  @Input() readonly = false;
  @Input() showEnabled = false;
  @Output() selected = new EventEmitter<SourceListItem>();
  @Output() deleted = new EventEmitter<SourceListItem>();
  @Output() toggleEnabled = new EventEmitter<SourceListItem>();

  isSelected(source: SourceListItem): boolean {
    return this.selectedSource?.id === source.id;
  }

  onToggleEnabled(source: SourceListItem, event: Event) {
    event.stopPropagation();
    this.toggleEnabled.emit(source);
  }

  onDelete(source: SourceListItem) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Source',
        message: `Are you sure you want to delete "${source.name || 'this source'}"? This will remove it from all learning paths. This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleted.emit(source);
      }
    });
  }
}
