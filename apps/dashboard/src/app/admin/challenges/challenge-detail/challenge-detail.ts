import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  Component,
  computed,
  input,
OnChanges,
  output,
  signal, } from '@angular/core';
import { form } from '@angular/forms/signals';
import { Challenge, KnowledgeUnit, RubricCriterion } from '@kasita/common-models';
import { challengeFields, initializeEntity,toSchema } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

import { DynamicForm } from '../../../shared/dynamic-form/dynamic-form';

@Component({
  selector: 'app-challenge-detail',
  imports: [CommonModule, MaterialModule, DynamicForm, TitleCasePipe],
  templateUrl: './challenge-detail.html',
  styleUrl: './challenge-detail.scss',
})
export class ChallengeDetail implements OnChanges {
  challenge = input<Challenge | null>(null);
  units = input<KnowledgeUnit[]>([]);

  saved = output<Challenge>();
  cancelled = output<void>();

  originalTitle = signal('');
  selectedUnitId = signal<string>('');

  // Rubric criteria management
  rubricCriteria = signal<RubricCriterion[]>([]);
  newCriterionName = signal('');
  newCriterionDescription = signal('');
  newCriterionMaxPoints = signal(10);

  // Field definitions for the form
  metaInfo = signal(challengeFields);

  // Entity signal - will be used to create the form
  entity = signal<Partial<Challenge>>(initializeEntity(challengeFields));

  // Create the dynamic form using Signal Forms
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  // Computed to track when challenge changes
  private previousChallengeId = signal<string | null>(null);

  constructor() {
    // Watch for challenge changes
  }

  ngOnChanges() {
    const value = this.challenge();
    const prevId = this.previousChallengeId();

    if (value?.id !== prevId) {
      this.previousChallengeId.set(value?.id || null);

      if (value && value.id) {
        // Update mode: fill form with existing entity data
        this.originalTitle.set(value.title || 'Challenge');
        this.selectedUnitId.set(value.unitId || '');
        this.rubricCriteria.set(value.rubricCriteria || []);
        this.entity.set({
          title: value.title || '',
          description: value.description || '',
          difficulty: value.difficulty || 'beginner',
          estimatedMinutes: value.estimatedMinutes || 30,
          successCriteria: (value.successCriteria || []).join('\n') as any,
          contentTypes: (value.contentTypes || []).join(', ') as any,
          isActive: value.isActive ?? true,
        });
      } else {
        // Create mode: show empty form
        this.originalTitle.set('New Challenge');
        this.selectedUnitId.set('');
        this.rubricCriteria.set([]);
        this.entity.set(initializeEntity(challengeFields));
      }
    }
  }

  onUnitChange(unitId: string) {
    this.selectedUnitId.set(unitId);
  }

  addRubricCriterion() {
    const name = this.newCriterionName().trim();
    const description = this.newCriterionDescription().trim();
    const maxPoints = this.newCriterionMaxPoints();

    if (name && maxPoints > 0) {
      this.rubricCriteria.update(criteria => [
        ...criteria,
        { name, description, maxPoints }
      ]);
      // Reset form
      this.newCriterionName.set('');
      this.newCriterionDescription.set('');
      this.newCriterionMaxPoints.set(10);
    }
  }

  removeRubricCriterion(index: number) {
    this.rubricCriteria.update(criteria =>
      criteria.filter((_, i) => i !== index)
    );
  }

  totalRubricPoints = computed(() =>
    this.rubricCriteria().reduce((sum, c) => sum + c.maxPoints, 0)
  );

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.isFormValid()) {
      return;
    }

    const formValue = this.entity();
    const currentChallenge = this.challenge();
    const unitId = this.selectedUnitId();

    // Parse array fields - stored as string in form, convert to array
    const successCriteriaRaw = formValue.successCriteria as unknown;
    const successCriteria = typeof successCriteriaRaw === 'string'
      ? successCriteriaRaw.split('\n').map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(successCriteriaRaw) ? successCriteriaRaw : [];

    const contentTypesRaw = formValue.contentTypes as unknown;
    const contentTypes = typeof contentTypesRaw === 'string'
      ? contentTypesRaw.split(',').map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(contentTypesRaw) ? contentTypesRaw : [];

    const entity: Challenge = {
      ...formValue,
      unitId,
      successCriteria,
      contentTypes,
      rubricCriteria: this.rubricCriteria(),
      ...(currentChallenge?.id
        ? {
            id: currentChallenge.id,
            createdAt: currentChallenge.createdAt,
            updatedAt: currentChallenge.updatedAt,
          }
        : {}),
    } as Challenge;

    this.saved.emit(entity);
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
    // Also require a unit to be selected
    return this.selectedUnitId().length > 0;
  });

  getDifficultyColor(difficulty: string): string {
    const colors: Record<string, string> = {
      beginner: '#22c55e',
      intermediate: '#eab308',
      advanced: '#f97316',
      expert: '#ef4444',
    };
    return colors[difficulty] || '#6b7280';
  }
}
