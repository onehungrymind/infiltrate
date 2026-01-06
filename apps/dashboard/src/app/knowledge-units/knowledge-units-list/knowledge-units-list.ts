import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { KnowledgeUnit } from '@kasita/common-models';
import { MaterialModule, ConfirmationDialogComponent } from '@kasita/material';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-knowledge-units-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './knowledge-units-list.html',
  styleUrl: './knowledge-units-list.scss',
})
export class KnowledgeUnitsList {
  private dialog = inject(MatDialog);

  @Input() knowledgeUnits: KnowledgeUnit[] = [];
  @Input() readonly = false;
  @Output() selected = new EventEmitter();
  @Output() deleted = new EventEmitter();

  onDelete(knowledgeUnit: KnowledgeUnit) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete KnowledgeUnit',
        message: `"${knowledgeUnit.concept || 'Item'}"`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleted.emit(knowledgeUnit);
      }
    });
  }
}
