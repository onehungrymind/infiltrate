import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, computed, inject } from '@angular/core';
import { UserProgress } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';
import { form } from '@angular/forms/signals';
import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';
import { userProgressFields, toSchema, AuthService, initializeEntity } from '@kasita/core-data';

@Component({
  selector: 'app-user-progress-detail',
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './user-progress-detail.html',
  styleUrl: './user-progress-detail.scss',
})
export class UserProgressDetail {
  private authService = inject(AuthService);
  private _userProgress = signal<UserProgress | null>(null);
  originalTitle = signal('');
  
  metaInfo = signal(userProgressFields);
  entity = signal<Partial<UserProgress>>(initializeEntity(userProgressFields));
  
  // Create the form directly (not in computed) since form() uses inject() internally
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() set userProgress(value: UserProgress | null) {
    this._userProgress.set(value);
    if (value && value.id) {
      // Update mode: fill form with existing entity data
      this.originalTitle.set(`Progress: ${value.masteryLevel || 'User Progress'}`);
      this.entity.set({
        masteryLevel: value.masteryLevel || 'learning',
        confidence: value.confidence || 0,
        easinessFactor: value.easinessFactor || 2.5,
        interval: value.interval || 1,
        repetitions: value.repetitions || 0,
        attempts: value.attempts || 0,
      });
    } else {
      // Create mode: show empty form
      this.originalTitle.set('New User Progress');
      this.entity.set(initializeEntity(userProgressFields));
    }
  }

  get userProgress(): UserProgress | null {
    return this._userProgress();
  }

  @Output() saved = new EventEmitter<UserProgress>();
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
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.id || '';
    const currentProgress = this.userProgress;

    // Create or update based on whether item has an id
    const entity: UserProgress = {
      ...formValue,
      // If updating (has id), preserve id and metadata
      ...(currentProgress?.id ? {
        id: currentProgress.id,
        userId: currentProgress.userId || userId,
        unitId: currentProgress.unitId || '',
      } : {
        // If creating (no id), set userId and preserve unitId if it exists
        userId,
        unitId: currentProgress?.unitId || '',
      }),
    } as UserProgress;

    this.saved.emit(entity);
  }

  onCancel() {
    this.cancelled.emit();
  }

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
