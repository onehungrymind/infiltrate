import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { KnowledgeUnit } from '@kasita/common-models';
import { initializeEntity, knowledgeUnitFields, toSchema } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

import { DynamicForm } from '../../../shared/dynamic-form/dynamic-form';

// Form entity type with string fields for textarea inputs
interface KnowledgeUnitFormEntity {
  concept?: string;
  question?: string;
  answer?: string;
  elaboration?: string;
  examples?: string; // Stored as newline-separated string in form
  analogies?: string; // Stored as newline-separated string in form
  commonMistakes?: string; // Stored as newline-separated string in form
  tags?: string; // Stored as comma-separated string in form
  difficulty?: string;
  cognitiveLevel?: string;
  estimatedTimeSeconds?: number;
}

@Component({
  selector: 'app-knowledge-unit-detail',
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './knowledge-unit-detail.html',
  styleUrl: './knowledge-unit-detail.scss',
})
export class KnowledgeUnitDetail {
  private _knowledgeUnit = signal<KnowledgeUnit | null>(null);
  private _pathId = signal<string | null>(null);
  originalTitle = signal('');

  metaInfo = signal(knowledgeUnitFields);
  entity = signal<KnowledgeUnitFormEntity>(initializeEntity(knowledgeUnitFields) as KnowledgeUnitFormEntity);
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() set pathId(value: string | null) {
    this._pathId.set(value);
  }

  @Input() set knowledgeUnit(value: KnowledgeUnit | null) {
    this._knowledgeUnit.set(value);

    if (value && value.id) {
      this.originalTitle.set(value.concept || 'Knowledge Unit');
      this.entity.set({
        concept: value.concept || '',
        question: value.question || '',
        answer: value.answer || '',
        elaboration: value.elaboration || '',
        examples: value.examples?.join('\n') || '',
        analogies: value.analogies?.join('\n') || '',
        commonMistakes: value.commonMistakes?.join('\n') || '',
        tags: value.tags?.join(', ') || '',
        difficulty: value.difficulty || 'beginner',
        cognitiveLevel: value.cognitiveLevel || 'understand',
        estimatedTimeSeconds: value.estimatedTimeSeconds || 120,
      });
    } else {
      this.originalTitle.set('New Knowledge Unit');
      this.entity.set(initializeEntity(knowledgeUnitFields) as KnowledgeUnitFormEntity);
    }
  }

  get knowledgeUnit(): KnowledgeUnit | null {
    return this._knowledgeUnit();
  }

  @Output() saved = new EventEmitter<KnowledgeUnit>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.isFormValid()) {
      return;
    }

    const formValue = this.entity();
    const currentUnit = this.knowledgeUnit;
    const pathId = this._pathId();

    // Parse array fields from textarea (one per line)
    const parseLines = (val: string | undefined): string[] => {
      if (typeof val === 'string') {
        return val.split('\n').map(s => s.trim()).filter(s => s);
      }
      return [];
    };

    // Parse tags from comma-separated string
    const parseTags = (val: string | undefined): string[] => {
      if (typeof val === 'string') {
        return val.split(',').map(s => s.trim()).filter(s => s);
      }
      return [];
    };

    const entity: KnowledgeUnit = {
      concept: formValue.concept || '',
      question: formValue.question || '',
      answer: formValue.answer || '',
      elaboration: formValue.elaboration || '',
      examples: parseLines(formValue.examples),
      analogies: parseLines(formValue.analogies),
      commonMistakes: parseLines(formValue.commonMistakes),
      tags: parseTags(formValue.tags),
      difficulty: (formValue.difficulty || 'beginner') as KnowledgeUnit['difficulty'],
      cognitiveLevel: (formValue.cognitiveLevel || 'understand') as KnowledgeUnit['cognitiveLevel'],
      estimatedTimeSeconds: formValue.estimatedTimeSeconds || 120,
      pathId: currentUnit?.pathId || pathId || '',
      sourceIds: currentUnit?.sourceIds || [],
      status: currentUnit?.status || 'pending',
      ...(currentUnit?.id ? {
        id: currentUnit.id,
        createdAt: currentUnit.createdAt,
        updatedAt: currentUnit.updatedAt,
      } : {}),
    } as KnowledgeUnit;

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
