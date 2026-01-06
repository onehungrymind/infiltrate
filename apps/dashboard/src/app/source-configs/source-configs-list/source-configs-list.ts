import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { SourceConfig } from '@kasita/common-models';
import { MaterialModule, ConfirmationDialogComponent } from '@kasita/material';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-source-configs-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './source-configs-list.html',
  styleUrl: './source-configs-list.scss',
})
export class SourceConfigsList {
  private dialog = inject(MatDialog);

  @Input() sourceConfigs: SourceConfig[] = [];
  @Input() readonly = false;
  @Output() selected = new EventEmitter();
  @Output() deleted = new EventEmitter();

  onDelete(sourceConfig: SourceConfig) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete SourceConfig',
        message: `"${sourceConfig.name || 'Item'}"`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleted.emit(sourceConfig);
      }
    });
  }
}
