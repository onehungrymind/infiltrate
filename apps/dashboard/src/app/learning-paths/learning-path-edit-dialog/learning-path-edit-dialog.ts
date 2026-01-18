import { CommonModule } from '@angular/common';
import { Component, computed, Inject, inject, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LearningPath } from '@kasita/common-models';
import { AuthService, initializeEntity, learningPathFields, toSchema } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';

export interface LearningPathEditDialogData {
  learningPath: LearningPath | null;
}

@Component({
  selector: 'app-learning-path-edit-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './learning-path-edit-dialog.html',
  styleUrl: './learning-path-edit-dialog.scss',
})
export class LearningPathEditDialog {
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<LearningPathEditDialog>);

  learningPath: LearningPath | null;
  isEditMode: boolean;
  dialogTitle: string;

  // Field definitions for the form
  metaInfo = signal(learningPathFields);

  // Entity signal
  entity = signal<Partial<LearningPath>>(initializeEntity(learningPathFields));

  // Create the dynamic form
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  constructor(@Inject(MAT_DIALOG_DATA) public data: LearningPathEditDialogData) {
    this.learningPath = data.learningPath;
    this.isEditMode = !!this.learningPath?.id;
    this.dialogTitle = this.isEditMode ? 'Edit Learning Path' : 'New Learning Path';

    if (this.learningPath && this.learningPath.id) {
      // Edit mode: fill form with existing data
      this.entity.set({
        name: this.learningPath.name || '',
        domain: this.learningPath.domain || '',
        targetSkill: this.learningPath.targetSkill || '',
        status: this.learningPath.status || 'not-started',
        visibility: this.learningPath.visibility || 'private',
      });
    } else {
      // Create mode: empty form
      this.entity.set(initializeEntity(learningPathFields));
    }
  }

  // Check if form is valid
  isFormValid = computed(() => {
    const formInstance = this.dynamicForm;
    for (const fieldDef of this.metaInfo()) {
      const field = (formInstance as any)[fieldDef.name];
      if (field && typeof field.errors === 'function') {
        const errors = field.errors();
        if (Array.isArray(errors) && errors.length > 0) {
          return false;
        }
      }
    }
    return true;
  });

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.isFormValid()) {
      return;
    }

    const formValue = this.entity();
    const currentUser = this.authService.getCurrentUser();
    const creatorId = currentUser?.id || '';

    const entity: LearningPath = {
      ...formValue,
      ...(this.learningPath?.id ? {
        id: this.learningPath.id,
        creatorId: this.learningPath.creatorId || creatorId,
        createdAt: this.learningPath.createdAt,
        updatedAt: this.learningPath.updatedAt,
      } : {
        creatorId,
      }),
      visibility: formValue.visibility || 'private',
    } as LearningPath;

    this.dialogRef.close(entity);
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
