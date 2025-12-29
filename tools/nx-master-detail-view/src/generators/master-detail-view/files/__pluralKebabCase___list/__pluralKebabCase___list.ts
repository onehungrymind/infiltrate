import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { <%= singularClassName %> } from '@articool/api-interfaces';
import {
  MaterialModule,
  ConfirmationDialogComponent,
} from '@articool/material';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-<%= pluralKebabCase %>-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './<%= pluralKebabCase %>-list.html',
  styleUrl: './<%= pluralKebabCase %>-list.scss',
})
export class <%= pluralClassName %>List {
  private dialog = inject(MatDialog);

  @Input() <%= pluralPropertyName %>: <%= singularClassName %>[] = [];
  @Input() readonly = false;
  @Output() selected = new EventEmitter();
  @Output() deleted = new EventEmitter();

  onDelete(<%= singularPropertyName %>: <%= singularClassName %>) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete <%= singularClassName %>',
        message: `"${<%= singularPropertyName %>.title || <%= singularPropertyName %>.name || 'Item'}"`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleted.emit(<%= singularPropertyName %>);
      }
    });
  }
}
