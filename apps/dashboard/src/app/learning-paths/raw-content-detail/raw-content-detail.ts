import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { RawContent } from '@kasita/common-models';
import { initializeEntity, rawContentFields, toSchema } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';

@Component({
  selector: 'app-raw-content-detail',
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './raw-content-detail.html',
  styleUrl: './raw-content-detail.scss',
})
export class RawContentDetail {
  private _rawContent = signal<RawContent | null>(null);
  private _pathId = signal<string | null>(null);
  originalTitle = signal('');

  metaInfo = signal(rawContentFields);
  entity = signal<Partial<RawContent>>(initializeEntity(rawContentFields));
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() set pathId(value: string | null) {
    this._pathId.set(value);
  }

  @Input() set rawContent(value: RawContent | null) {
    this._rawContent.set(value);

    if (value && value.id) {
      this.originalTitle.set(value.title || 'Raw Content');
      this.entity.set({
        title: value.title || '',
        content: value.content || '',
        author: value.author || '',
        sourceUrl: value.sourceUrl || '',
      });
    } else {
      this.originalTitle.set('New Raw Content');
      this.entity.set(initializeEntity(rawContentFields));
    }
  }

  get rawContent(): RawContent | null {
    return this._rawContent();
  }

  @Output() saved = new EventEmitter<RawContent>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.isFormValid()) {
      return;
    }

    const formValue = this.entity();
    const currentContent = this.rawContent;
    const pathId = this._pathId();

    const entity: RawContent = {
      ...formValue,
      pathId: currentContent?.pathId || pathId || '',
      sourceType: currentContent?.sourceType || 'article',
      metadata: currentContent?.metadata || {},
      ...(currentContent?.id ? {
        id: currentContent.id,
        createdAt: currentContent.createdAt,
        updatedAt: currentContent.updatedAt,
      } : {}),
    } as RawContent;

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
