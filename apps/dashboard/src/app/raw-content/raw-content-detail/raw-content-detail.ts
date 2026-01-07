import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { RawContent } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';
import { form } from '@angular/forms/signals';
import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';
import { rawContentFields, toSchema, initializeEntity } from '@kasita/core-data';

@Component({
  selector: 'app-raw-content-detail',
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './raw-content-detail.html',
  styleUrl: './raw-content-detail.scss',
})
export class RawContentDetail {
  private _rawContent = signal<RawContent | null>(null);
  originalTitle = signal('');
  
  metaInfo = signal(rawContentFields);
  entity = signal<Partial<RawContent>>(initializeEntity(rawContentFields));
  
  // Create the form directly (not in computed) since form() uses inject() internally
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() set rawContent(value: RawContent | null) {
    this._rawContent.set(value);
    if (value && value.id) {
      // Update mode: fill form with existing entity data
      this.originalTitle.set(value.title || 'Raw Content');
      this.entity.set({
        title: value.title || '',
        content: value.content || '',
        author: value.author || '',
        sourceUrl: value.sourceUrl || '',
      });
    } else {
      // Create mode: show empty form
      this.originalTitle.set('New Raw Content');
      this.entity.set(initializeEntity(rawContentFields));
    }
  }

  get rawContent(): RawContent | null {
    return this._rawContent();
  }

  @Output() saved = new EventEmitter<RawContent>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit() {
    // Get form values from the entity signal
    const formValue = this.entity();
    
    // Check if form is valid
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
      const currentContent = this.rawContent;
      // Create or update based on whether item has an id
      const entity: RawContent = {
        ...formValue,
        // If updating (has id), preserve id and metadata
        ...(currentContent?.id ? { 
          id: currentContent.id,
          pathId: currentContent.pathId || '',
          sourceType: currentContent.sourceType || 'article',
        } : {
          // If creating (no id), use defaults
          pathId: currentContent?.pathId || '',
          sourceType: currentContent?.sourceType || 'article',
        }),
      } as RawContent;
      
      this.saved.emit(entity);
    }
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
