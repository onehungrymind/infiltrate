import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { KnowledgeUnit } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';
import { form } from '@angular/forms/signals';
import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';
import { knowledgeUnitFields, toSchema, arrayToString, stringToArray, commaStringToArray, initializeEntity } from '@kasita/core-data';

@Component({
  selector: 'app-knowledge-unit-detail',
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './knowledge-unit-detail.html',
  styleUrl: './knowledge-unit-detail.scss',
})
export class KnowledgeUnitDetail {
  private _knowledgeUnit = signal<KnowledgeUnit | null>(null);
  originalTitle = signal('');
  
  metaInfo = signal(knowledgeUnitFields);
  entity = signal<Partial<KnowledgeUnit>>(initializeEntity(knowledgeUnitFields));
  
  // Create the form directly (not in computed) since form() uses inject() internally
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() set knowledgeUnit(value: KnowledgeUnit | null) {
    this._knowledgeUnit.set(value);
    if (value && value.id) {
      // Update mode: fill form with existing entity data
      this.originalTitle.set(value.concept || 'Knowledge Unit');
      this.entity.set({
        concept: value.concept || '',
        question: value.question || '',
        answer: value.answer || '',
        elaboration: value.elaboration || '',
        examples: arrayToString(value.examples) as any,
        analogies: arrayToString(value.analogies) as any,
        commonMistakes: arrayToString(value.commonMistakes) as any,
        tags: arrayToString(value.tags) as any,
        difficulty: value.difficulty || 'beginner',
        cognitiveLevel: value.cognitiveLevel || 'remember',
        estimatedTimeSeconds: value.estimatedTimeSeconds || 120,
      });
    } else {
      // Create mode: show empty form
      this.originalTitle.set('New Knowledge Unit');
      const empty = initializeEntity(knowledgeUnitFields);
      // Convert array fields to empty strings for form display
      empty['examples'] = '' as any;
      empty['analogies'] = '' as any;
      empty['commonMistakes'] = '' as any;
      empty['tags'] = '' as any;
      this.entity.set(empty);
    }
  }

  get knowledgeUnit(): KnowledgeUnit | null {
    return this._knowledgeUnit();
  }

  @Output() saved = new EventEmitter<KnowledgeUnit>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit(event: Event) {
    // Prevent default form submission (page refresh) - required for Signal Forms
    event.preventDefault();

    // Check if form is valid
    if (!this.isFormValid()) {
      return;
    }

    // Get form values from the entity signal (Signal Forms sync bidirectionally)
    const formValue = this.entity();

    // Convert string arrays back to arrays
    const processedValues: any = { ...formValue };
    if (typeof processedValues.examples === 'string') {
      processedValues.examples = stringToArray(processedValues.examples);
    }
    if (typeof processedValues.analogies === 'string') {
      processedValues.analogies = stringToArray(processedValues.analogies);
    }
    if (typeof processedValues.commonMistakes === 'string') {
      processedValues.commonMistakes = stringToArray(processedValues.commonMistakes);
    }
    if (typeof processedValues.tags === 'string') {
      processedValues.tags = commaStringToArray(processedValues.tags);
    }

    const currentUnit = this.knowledgeUnit;
    // Create or update based on whether item has an id
    const entity: KnowledgeUnit = {
      ...processedValues,
      // If updating (has id), preserve id and pathId
      ...(currentUnit?.id ? {
        id: currentUnit.id,
        pathId: currentUnit.pathId || '',
      } : {
        // If creating (no id), preserve pathId if it exists
        pathId: currentUnit?.pathId || '',
      }),
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
