import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Submission } from '@kasita/common-models';
import { MaterialModule, ConfirmationDialogComponent } from '@kasita/material';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-submissions-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './submissions-list.html',
  styleUrl: './submissions-list.scss',
})
export class SubmissionsList {
  private dialog = inject(MatDialog);

  @Input() submissions: Submission[] = [];
  @Input() selectedSubmission: Submission | null = null;
  @Input() readonly = false;
  @Output() selected = new EventEmitter();
  @Output() deleted = new EventEmitter();

  isSelected(submission: Submission): boolean {
    return this.selectedSubmission?.id === submission.id;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'draft':
        return '#6b7280';
      case 'submitted':
        return '#3b82f6';
      case 'under_review':
        return '#f59e0b';
      case 'approved':
        return '#22c55e';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }

  getContentTypeIcon(contentType: string): string {
    switch (contentType) {
      case 'text':
        return 'text';
      case 'url':
        return 'url';
      case 'file':
        return 'file';
      // Legacy types
      case 'code':
        return 'text';
      case 'written':
        return 'text';
      case 'project':
        return 'file';
      default:
        return 'text';
    }
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ');
  }

  onDelete(submission: Submission) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Submission',
        message: `Are you sure you want to delete "${submission.title || 'this submission'}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleted.emit(submission);
      }
    });
  }
}
