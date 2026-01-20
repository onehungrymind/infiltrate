import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { Concept } from '@kasita/common-models';
import { initializeEntity, conceptFields, toSchema } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';

// Form entity type with string fields for textarea inputs
interface ConceptFormEntity {
  name?: string;
  description?: string;
  estimatedHours?: number;
  difficulty?: string;
  prerequisites?: string; // Stored as newline-separated string in form
  order?: number;
  status?: string;
}

@Component({
  selector: 'app-concept-detail',
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './concept-detail.html',
  styleUrl: './concept-detail.scss',
})
export class ConceptDetail {
  private _concept = signal<Concept | null>(null);
  private _pathId = signal<string | null>(null);
  originalTitle = signal('');

  metaInfo = signal(conceptFields);
  entity = signal<ConceptFormEntity>(initializeEntity(conceptFields) as ConceptFormEntity);
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() set pathId(value: string | null) {
    this._pathId.set(value);
  }

  @Input() set concept(value: Concept | null) {
    this._concept.set(value);

    if (value && value.id) {
      this.originalTitle.set(value.name || 'Concept');
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
      this.originalTitle.set('New Concept');
      this.entity.set(initializeEntity(conceptFields) as ConceptFormEntity);
    }
  }

  get concept(): Concept | null {
    return this._concept();
  }

  @Output() saved = new EventEmitter<Concept>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.isFormValid()) {
      return;
    }

    const formValue = this.entity();
    const currentConcept = this.concept;
    const pathId = this._pathId();

    // Parse prerequisites from textarea (one per line)
    const prerequisites = typeof formValue.prerequisites === 'string'
      ? formValue.prerequisites.split('\n').map((s: string) => s.trim()).filter((s: string) => s)
      : [];

    const entity: Concept = {
      name: formValue.name || '',
      description: formValue.description || '',
      estimatedHours: formValue.estimatedHours || 1,
      difficulty: (formValue.difficulty || 'foundational') as Concept['difficulty'],
      prerequisites,
      order: formValue.order || 0,
      status: (formValue.status || 'pending') as Concept['status'],
      pathId: currentConcept?.pathId || pathId || '',
      ...(currentConcept?.id ? {
        id: currentConcept.id,
        createdAt: currentConcept.createdAt,
        updatedAt: currentConcept.updatedAt,
      } : {}),
    } as Concept;

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
