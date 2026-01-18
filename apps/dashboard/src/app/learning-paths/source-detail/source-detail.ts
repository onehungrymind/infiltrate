import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { initializeEntity, sourceFields, toSchema } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';

// Source type for the pipeline (includes enabled from link)
export interface PipelineSource {
  id: string;
  name: string;
  url: string;
  type: string;
  enabled: boolean;
}

@Component({
  selector: 'app-source-detail',
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './source-detail.html',
  styleUrl: './source-detail.scss',
})
export class SourceDetail {
  private _source = signal<PipelineSource | null>(null);
  private _pathId = signal<string | null>(null);
  originalTitle = signal('');

  metaInfo = signal(sourceFields);
  entity = signal<Partial<PipelineSource>>(initializeEntity(sourceFields));
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() set pathId(value: string | null) {
    this._pathId.set(value);
  }

  @Input() set source(value: PipelineSource | null) {
    this._source.set(value);

    if (value && value.id) {
      this.originalTitle.set(value.name || 'Source');
      this.entity.set({
        name: value.name || '',
        url: value.url || '',
        type: value.type || 'rss',
      });
    } else {
      this.originalTitle.set('New Source');
      this.entity.set(initializeEntity(sourceFields));
    }
  }

  get source(): PipelineSource | null {
    return this._source();
  }

  @Output() saved = new EventEmitter<{ source: Partial<PipelineSource>; pathId: string }>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.isFormValid()) {
      return;
    }

    const formValue = this.entity();
    const currentSource = this.source;
    const pathId = this._pathId();

    const source: Partial<PipelineSource> = {
      ...formValue,
      ...(currentSource?.id ? { id: currentSource.id } : {}),
    };

    this.saved.emit({ source, pathId: pathId || '' });
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
