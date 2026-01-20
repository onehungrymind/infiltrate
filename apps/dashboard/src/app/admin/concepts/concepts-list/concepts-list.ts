import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Concept } from '@kasita/common-models';
import { ConfirmationDialogComponent, MaterialModule } from '@kasita/material';

@Component({
  selector: 'app-concepts-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './concepts-list.html',
  styleUrl: './concepts-list.scss',
})
export class ConceptsList {
  private dialog = inject(MatDialog);

  @Input() concepts: Concept[] = [];
  @Input() selectedConcept: Concept | null = null;
  @Input() readonly = false;
  @Output() selected = new EventEmitter();
  @Output() deleted = new EventEmitter();

  isSelected(concept: Concept): boolean {
    return this.selectedConcept?.id === concept.id;
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'foundational': return '#22c55e';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  }

  onDelete(concept: Concept) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Concept',
        message: `Are you sure you want to delete "${concept.name || 'this concept'}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleted.emit(concept);
      }
    });
  }
}
