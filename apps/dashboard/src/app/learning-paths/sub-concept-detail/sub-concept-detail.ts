import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { SubConcept } from '@kasita/common-models';
import { initializeEntity, subConceptFields, toSchema } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';

// Form entity type
interface SubConceptFormEntity {
  name?: string;
  description?: string;
  order?: number;
}

@Component({
  selector: 'app-sub-concept-detail',
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './sub-concept-detail.html',
  styleUrl: './sub-concept-detail.scss',
})
export class SubConceptDetail {
  private _subConcept = signal<SubConcept | null>(null);
  private _conceptId = signal<string | null>(null);
  originalTitle = signal('');

  metaInfo = signal(subConceptFields);
  entity = signal<SubConceptFormEntity>(initializeEntity(subConceptFields) as SubConceptFormEntity);
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() set conceptId(value: string | null) {
    this._conceptId.set(value);
  }

  @Input() set subConcept(value: SubConcept | null) {
    this._subConcept.set(value);

    if (value && value.id) {
      this.originalTitle.set(value.name || 'Sub-concept');
      this.entity.set({
        name: value.name || '',
        description: value.description || '',
        order: value.order || 0,
      });
    } else {
      this.originalTitle.set('New Sub-concept');
      this.entity.set(initializeEntity(subConceptFields) as SubConceptFormEntity);
    }
  }

  get subConcept(): SubConcept | null {
    return this._subConcept();
  }

  @Output() saved = new EventEmitter<SubConcept>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.isFormValid()) {
      return;
    }

    const formValue = this.entity();
    const currentSubConcept = this.subConcept;
    const conceptId = this._conceptId();

    const entity: SubConcept = {
      name: formValue.name || '',
      description: formValue.description || '',
      order: formValue.order || 0,
      conceptId: currentSubConcept?.conceptId || conceptId || '',
      ...(currentSubConcept?.id ? {
        id: currentSubConcept.id,
        createdAt: currentSubConcept.createdAt,
        updatedAt: currentSubConcept.updatedAt,
      } : {}),
    } as SubConcept;

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
