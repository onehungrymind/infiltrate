import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Principle } from '@kasita/common-models';
import { MaterialModule, ConfirmationDialogComponent } from '@kasita/material';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-principles-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './principles-list.html',
  styleUrl: './principles-list.scss',
})
export class PrinciplesList {
  private dialog = inject(MatDialog);

  @Input() principles: Principle[] = [];
  @Input() selectedPrinciple: Principle | null = null;
  @Input() readonly = false;
  @Output() selected = new EventEmitter();
  @Output() deleted = new EventEmitter();

  isSelected(principle: Principle): boolean {
    return this.selectedPrinciple?.id === principle.id;
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'foundational': return '#22c55e';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  }

  onDelete(principle: Principle) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Principle',
        message: `Are you sure you want to delete "${principle.name || 'this principle'}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleted.emit(principle);
      }
    });
  }
}
