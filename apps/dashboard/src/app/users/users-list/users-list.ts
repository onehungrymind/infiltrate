import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject,Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { User } from '@kasita/common-models';
import { ConfirmationDialogComponent,MaterialModule } from '@kasita/material';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList {
  private dialog = inject(MatDialog);

  @Input() users: User[] = [];
  @Input() selectedUser: User | null = null;
  @Input() readonly = false;
  @Output() selected = new EventEmitter();
  @Output() deleted = new EventEmitter();
  
  isSelected(user: User): boolean {
    return this.selectedUser?.id === user.id;
  }

  onDelete(user: User) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete "${user.name || user.email || 'this user'}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleted.emit(user);
      }
    });
  }
}
