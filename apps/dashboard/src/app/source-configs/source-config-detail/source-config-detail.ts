import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { MaterialModule } from '@kasita/material';
import { form } from '@angular/forms/signals';
import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';
import { sourceFields, toSchema, initializeEntity } from '@kasita/core-data';
import { SourceListItem } from '../source-configs';

@Component({
  selector: 'app-source-detail',
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './source-config-detail.html',
  styleUrl: './source-config-detail.scss',
})
export class SourceDetail {
  private _source = signal<SourceListItem | null>(null);
  originalTitle = signal('');

  metaInfo = signal(sourceFields);
  entity = signal<Partial<SourceListItem>>(initializeEntity(sourceFields));

  // Create the form directly (not in computed) since form() uses inject() internally
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() isEditing = false;

  @Input() set source(value: SourceListItem | null) {
    this._source.set(value);
    if (value && value.id) {
      // Update mode: fill form with existing entity data
      this.originalTitle.set(value.name || 'Source');
      this.entity.set({
        name: value.name || '',
        url: value.url || '',
        type: value.type || 'rss',
      });
    } else {
      // Create mode: show empty form
      this.originalTitle.set('New Source');
      this.entity.set(initializeEntity(sourceFields));
    }
  }

  get source(): SourceListItem | null {
    return this._source();
  }

  @Output() saved = new EventEmitter<Partial<SourceListItem>>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit() {
    // Get form values from the entity signal
    const formValue = this.entity();

    // Check if form is valid
    const formObj = this.dynamicForm;
    let hasErrors = false;
    for (const fieldDef of this.metaInfo()) {
      const field = (formObj as any)[fieldDef.name];
      if (field && typeof field.errors === 'function') {
        const errors = field.errors();
        if (Array.isArray(errors) && errors.length > 0) {
          hasErrors = true;
          break;
        }
      }
    }

    if (!hasErrors) {
      // Emit the source data without pathId (it's handled via linking now)
      const entity: Partial<SourceListItem> = {
        name: formValue.name,
        url: formValue.url,
        type: formValue.type,
      };

      this.saved.emit(entity);
    }
  }

  onCancel() {
    this.cancelled.emit();
  }

  isFormValid = computed(() => {
    const formObj = this.dynamicForm;
    for (const fieldDef of this.metaInfo()) {
      const field = (formObj as any)[fieldDef.name];
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
