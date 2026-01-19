import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { LearningPath } from '@kasita/common-models';
import { AuthService, initializeEntity, learningPathFields, toSchema } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';

@Component({
  selector: 'app-learning-path-detail',
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './learning-path-detail.html',
  styleUrl: './learning-path-detail.scss',
})
export class LearningPathDetail {
  private authService = inject(AuthService);
  private _learningPath = signal<LearningPath | null>(null);
  originalTitle = signal('');

  // Field definitions for the form
  metaInfo = signal(learningPathFields);

  // Entity signal - will be used to create the form
  // Initialize with all fields from metaInfo so form can create fields
  entity = signal<Partial<LearningPath>>(initializeEntity(learningPathFields));

  // Create the dynamic form using Signal Forms
  // Note: form() must be called outside computed() because it uses inject() internally
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() set learningPath(value: LearningPath | null) {
    this._learningPath.set(value);

    if (value && value.id) {
      // Update mode: fill form with existing entity data
      this.originalTitle.set(value.name || 'Learning Path');
      this.entity.set({
        name: value.name || '',
        domain: value.domain || '',
        targetSkill: value.targetSkill || '',
        status: value.status || 'not-started',
        visibility: value.visibility || 'private',
      });
    } else {
      // Create mode: show empty form
      this.originalTitle.set('New Learning Path');
      this.entity.set(initializeEntity(learningPathFields));
    }
  }

  get learningPath(): LearningPath | null {
    return this._learningPath();
  }

  @Output() saved = new EventEmitter<LearningPath>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit(event: Event) {
    // Prevent default form submission (page refresh) - required for Signal Forms
    event.preventDefault();

    // Check if form is valid
    if (!this.isFormValid()) {
      return;
    }

    // Ensure user is authenticated before creating
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      console.error('Cannot create learning path: user not authenticated');
      return;
    }

    // Get form values from the entity signal (Signal Forms sync bidirectionally)
    const formValue = this.entity();

    const currentPath = this.learningPath;
    const creatorId = currentUser.id;

    // Create or update based on whether item has an id
    const entity: LearningPath = {
      ...formValue,
      // If updating (has id), preserve id and other metadata
      ...(currentPath?.id ? {
        id: currentPath.id,
        creatorId: currentPath.creatorId || creatorId,
        createdAt: currentPath.createdAt,
        updatedAt: currentPath.updatedAt,
      } : {
        // If creating (no id), set creatorId
        creatorId,
      }),
      // Ensure visibility has a default
      visibility: formValue.visibility || 'private',
    } as LearningPath;

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
