import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { Principle } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';
import { form } from '@angular/forms/signals';
import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';
import { principleFields, toSchema, initializeEntity } from '@kasita/core-data';

@Component({
  selector: 'app-principle-detail',
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './principle-detail.html',
  styleUrl: './principle-detail.scss',
})
export class PrincipleDetail {
  private _principle = signal<Principle | null>(null);
  originalTitle = signal('');

  // Field definitions for the form
  metaInfo = signal(principleFields);

  // Entity signal - will be used to create the form
  // Initialize with all fields from metaInfo so form can create fields
  entity = signal<Partial<Principle>>(initializeEntity(principleFields));

  // Create the dynamic form using Signal Forms
  // Note: form() must be called outside computed() because it uses inject() internally
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() set principle(value: Principle | null) {
    this._principle.set(value);
    if (value && value.id) {
      // Update mode: fill form with existing entity data
      this.originalTitle.set(value.name || 'Principle');
      this.entity.set({
        name: value.name || '',
        description: value.description || '',
        estimatedHours: value.estimatedHours || 1,
        difficulty: value.difficulty || 'foundational',
        prerequisites: value.prerequisites || [],
        order: value.order || 0,
        status: value.status || 'pending',
      });
    } else {
      // Create mode: show empty form
      this.originalTitle.set('New Principle');
      this.entity.set(initializeEntity(principleFields));
    }
  }

  get principle(): Principle | null {
    return this._principle();
  }

  @Output() saved = new EventEmitter<Principle>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit() {
    // Get form values from the entity signal
    const formValue = this.entity();

    // Check if form is valid by checking if any field has errors
    const form = this.dynamicForm;
    let hasErrors = false;
    for (const fieldDef of this.metaInfo()) {
      const field = (form as any)[fieldDef.name];
      if (field && typeof field.errors === 'function') {
        const errors = field.errors();
        if (Array.isArray(errors) && errors.length > 0) {
          hasErrors = true;
          break;
        }
      }
    }

    if (!hasErrors) {
      const currentPrinciple = this.principle;

      // Create or update based on whether item has an id
      const entity: Principle = {
        ...formValue,
        // If updating (has id), preserve id and other metadata
        ...(currentPrinciple?.id ? {
          id: currentPrinciple.id,
          pathId: currentPrinciple.pathId,
          createdAt: currentPrinciple.createdAt,
          updatedAt: currentPrinciple.updatedAt,
        } : {
          // If creating (no id), set a default pathId (user should select this)
          pathId: formValue.pathId || '',
        }),
      } as Principle;

      this.saved.emit(entity);
    }
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
