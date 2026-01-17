import { CommonModule } from '@angular/common';
import { Component, computed, effect, EventEmitter, Input, Output, signal } from '@angular/core';
import { Field,form } from '@angular/forms/signals';
import { User } from '@kasita/common-models';
import { initializeEntity, toSchema, userFields } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

import { UserEnrollments } from '../user-enrollments/user-enrollments';

@Component({
  selector: 'app-user-detail',
  imports: [CommonModule, MaterialModule, Field, UserEnrollments],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetail {
  private _user = signal<User | null>(null);
  originalTitle = signal('');
  
  // Field definitions for the form
  metaInfo = signal(userFields);
  
  // Filtered fields (excluding role and isActive which are rendered separately)
  filteredFields = computed(() => {
    return this.metaInfo().filter(f => f.name !== 'role' && f.name !== 'isActive');
  });

  // Role options for the select
  roleOptions = computed(() => {
    const roleField = this.metaInfo().find(f => f.name === 'role');
    return roleField?.options || [];
  });
  
  // Entity signal - will be used to create the form
  // Initialize with all fields from metaInfo so form can create fields
  // Note: password is included here for form handling but not part of User entity
  entity = signal<Partial<User & { password?: string }>>(initializeEntity(userFields));
  
  // Create the dynamic form using Signal Forms
  // Note: form() must be called outside computed() because it uses inject() internally
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  // Effect to watch for user changes and update form
  constructor() {
    effect(() => {
      const user = this._user();
      if (user && user.id) {
        // Update mode: fill form with existing entity data
        // Include password (hashed value) so field is always populated
        this.originalTitle.set(user.name || user.email || 'User');
        this.entity.set({
          email: user.email || '',
          name: user.name || '',
          password: user.password || '', // Pre-fill with hashed password
          isActive: user.isActive ?? true,
          role: user.role || 'user', // Default to 'user' if no role set
        });
      } else if (!user) {
        // Create mode: show empty form with defaults
        this.originalTitle.set('New User');
        const initialEntity = initializeEntity(userFields);
        // Set default role to 'user' for new users
        initialEntity['role'] = 'user';
        this.entity.set(initialEntity);
      }
    });
  }

  // Helper methods for template
  getField(fieldName: string): any {
    try {
      const form = this.dynamicForm;
      if (!form) return null;
      return (form as any)[fieldName] || null;
    } catch (error) {
      console.error('Error getting field', fieldName, error);
      return null;
    }
  }

  hasErrors(field: any): boolean {
    if (!field || typeof field.errors !== 'function') {
      return false;
    }
    try {
      const errors = field.errors();
      return Array.isArray(errors) && errors.length > 0;
    } catch {
      return false;
    }
  }

  getErrorMessages(field: any): string[] {
    if (!field || typeof field.errors !== 'function') {
      return [];
    }
    try {
      const errors = field.errors();
      if (!Array.isArray(errors)) {
        return [];
      }
      return errors.map((error: any) => {
        switch (error.name) {
          case 'required':
            return 'This field is required';
          case 'minlength':
            return `Minimum length is ${error.minLength}`;
          case 'maxlength':
            return `Maximum length is ${error.maxLength}`;
          case 'min':
            return `Minimum value is ${error.min}`;
          case 'max':
            return `Maximum value is ${error.max}`;
          case 'email':
            return 'Please enter a valid email address';
          case 'pattern':
            return 'Please enter a valid format';
          default:
            return error.message || 'Invalid value';
        }
      });
    } catch {
      return [];
    }
  }

  @Input() set user(value: User | null) {
    // Just set the signal - the effect will handle updating the form
    this._user.set(value);
  }

  get user(): User | null {
    return this._user();
  }

  @Output() saved = new EventEmitter<User>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit(event: Event) {
    // Prevent default form submission (page refresh) - required for Signal Forms
    event.preventDefault();

    // Check if form is valid
    if (!this.isFormValid()) {
      return;
    }

    // Get form values from the entity signal (Signal Forms sync bidirectionally)
    const formValue = this.entity();
    const currentUser = this.user;

    // Create or update based on whether item has an id
    const entity: User = {
      ...formValue,
      // If updating (has id), preserve id and other metadata
      ...(currentUser?.id ? {
        id: currentUser.id,
        createdAt: currentUser.createdAt,
        updatedAt: currentUser.updatedAt,
      } : {
        // If creating (no id), set defaults
      }),
    } as User;

    // Password is always included - backend will detect if it changed
    if ((formValue as any).password) {
      (entity as any).password = (formValue as any).password;
    }

    this.saved.emit(entity);
  }

  onCancel() {
    this.cancelled.emit();
  }

  // Check if form is valid
  isFormValid = computed(() => {
    const form = this.dynamicForm;
    for (const fieldDef of this.metaInfo()) {
      const field = (form as any)[fieldDef.name];
      if (field && typeof field.errors === 'function') {
        const errors = field.errors();
        if (Array.isArray(errors) && errors.length > 0) {
          return false;
        }
      }
    }
    return true;
  });
}
