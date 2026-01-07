import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { SourceConfig } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';
import { form } from '@angular/forms/signals';
import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';
import { sourceConfigFields, toSchema, initializeEntity } from '@kasita/core-data';

@Component({
  selector: 'app-source-config-detail',
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './source-config-detail.html',
  styleUrl: './source-config-detail.scss',
})
export class SourceConfigDetail {
  private _sourceConfig = signal<SourceConfig | null>(null);
  originalTitle = signal('');
  
  metaInfo = signal(sourceConfigFields);
  entity = signal<Partial<SourceConfig>>(initializeEntity(sourceConfigFields));
  
  // Create the form directly (not in computed) since form() uses inject() internally
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() set sourceConfig(value: SourceConfig | null) {
    this._sourceConfig.set(value);
    if (value && value.id) {
      // Update mode: fill form with existing entity data
      this.originalTitle.set(value.name || 'Source Config');
      this.entity.set({
        name: value.name || '',
        url: value.url || '',
        type: value.type || 'rss',
        enabled: value.enabled ?? true,
      });
    } else {
      // Create mode: show empty form
      this.originalTitle.set('New Source Config');
      this.entity.set(initializeEntity(sourceConfigFields));
    }
  }

  get sourceConfig(): SourceConfig | null {
    return this._sourceConfig();
  }

  @Output() saved = new EventEmitter<SourceConfig>();
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
      const currentConfig = this.sourceConfig;
      // Create or update based on whether item has an id
      const entity: SourceConfig = {
        ...formValue,
        // If updating (has id), preserve id and pathId
        ...(currentConfig?.id ? { 
          id: currentConfig.id,
          pathId: currentConfig.pathId || '',
        } : {
          // If creating (no id), preserve pathId if it exists
          pathId: currentConfig?.pathId || '',
        }),
      } as SourceConfig;
      
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
