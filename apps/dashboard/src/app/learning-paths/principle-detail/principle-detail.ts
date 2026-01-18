import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { Principle } from '@kasita/common-models';
import { initializeEntity, principleFields, toSchema } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';

// Form entity type with string fields for textarea inputs
interface PrincipleFormEntity {
  name?: string;
  description?: string;
  estimatedHours?: number;
  difficulty?: string;
  prerequisites?: string; // Stored as newline-separated string in form
  order?: number;
  status?: string;
}

@Component({
  selector: 'app-principle-detail',
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './principle-detail.html',
  styleUrl: './principle-detail.scss',
})
export class PrincipleDetail {
  private _principle = signal<Principle | null>(null);
  private _pathId = signal<string | null>(null);
  originalTitle = signal('');

  metaInfo = signal(principleFields);
  entity = signal<PrincipleFormEntity>(initializeEntity(principleFields) as PrincipleFormEntity);
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() set pathId(value: string | null) {
    this._pathId.set(value);
  }

  @Input() set principle(value: Principle | null) {
    this._principle.set(value);

    if (value && value.id) {
      this.originalTitle.set(value.name || 'Principle');
      this.entity.set({
        name: value.name || '',
        description: value.description || '',
        estimatedHours: value.estimatedHours || 1,
        difficulty: value.difficulty || 'foundational',
        prerequisites: value.prerequisites?.join('\n') || '',
        order: value.order || 0,
        status: value.status || 'pending',
      });
    } else {
      this.originalTitle.set('New Principle');
      this.entity.set(initializeEntity(principleFields) as PrincipleFormEntity);
    }
  }

  get principle(): Principle | null {
    return this._principle();
  }

  @Output() saved = new EventEmitter<Principle>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.isFormValid()) {
      return;
    }

    const formValue = this.entity();
    const currentPrinciple = this.principle;
    const pathId = this._pathId();

    // Parse prerequisites from textarea (one per line)
    const prerequisites = typeof formValue.prerequisites === 'string'
      ? formValue.prerequisites.split('\n').map((s: string) => s.trim()).filter((s: string) => s)
      : [];

    const entity: Principle = {
      name: formValue.name || '',
      description: formValue.description || '',
      estimatedHours: formValue.estimatedHours || 1,
      difficulty: (formValue.difficulty || 'foundational') as Principle['difficulty'],
      prerequisites,
      order: formValue.order || 0,
      status: (formValue.status || 'pending') as Principle['status'],
      pathId: currentPrinciple?.pathId || pathId || '',
      ...(currentPrinciple?.id ? {
        id: currentPrinciple.id,
        createdAt: currentPrinciple.createdAt,
        updatedAt: currentPrinciple.updatedAt,
      } : {}),
    } as Principle;

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
