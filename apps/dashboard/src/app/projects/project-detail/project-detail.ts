import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  Component,
  computed,
  input,
OnChanges,
  output,
  signal, } from '@angular/core';
import { form } from '@angular/forms/signals';
import { LearningPath, Principle,Project } from '@kasita/common-models';
import { initializeEntity,projectFields, toSchema } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';

@Component({
  selector: 'app-project-detail',
  imports: [CommonModule, MaterialModule, DynamicForm, TitleCasePipe],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
})
export class ProjectDetail implements OnChanges {
  project = input<Project | null>(null);
  paths = input<LearningPath[]>([]);
  principles = input<Principle[]>([]);

  saved = output<Project>();
  cancelled = output<void>();

  originalTitle = signal('');
  selectedPathId = signal<string>('');

  // Field definitions for the form
  metaInfo = signal(projectFields);

  // Entity signal - will be used to create the form
  entity = signal<Partial<Project>>(initializeEntity(projectFields));

  // Create the dynamic form using Signal Forms
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  // Computed to track when project changes
  private previousProjectId = signal<string | null>(null);

  ngOnChanges() {
    const value = this.project();
    const prevId = this.previousProjectId();

    if (value?.id !== prevId) {
      this.previousProjectId.set(value?.id || null);

      if (value && value.id) {
        // Update mode: fill form with existing entity data
        this.originalTitle.set(value.name || 'Project');
        this.selectedPathId.set(value.pathId || '');
        this.entity.set({
          name: value.name || '',
          description: value.description || '',
          objectives: (value.objectives || []).join('\n') as any,
          requirements: (value.requirements || []).join('\n') as any,
          estimatedHours: value.estimatedHours || 8,
          difficulty: value.difficulty || 'beginner',
          isActive: value.isActive ?? true,
        });
      } else {
        // Create mode: show empty form
        this.originalTitle.set('New Project');
        this.selectedPathId.set('');
        this.entity.set(initializeEntity(projectFields));
      }
    }
  }

  onPathChange(pathId: string) {
    this.selectedPathId.set(pathId);
  }

  // Get principles for the selected path
  pathPrinciples = computed(() => {
    const pathId = this.selectedPathId();
    if (!pathId) return [];
    return this.principles().filter(p => p.pathId === pathId);
  });

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.isFormValid()) {
      return;
    }

    const formValue = this.entity();
    const currentProject = this.project();
    const pathId = this.selectedPathId();

    // Parse array fields - stored as string in form, convert to array
    const objectivesRaw = formValue.objectives as unknown;
    const objectives = typeof objectivesRaw === 'string'
      ? objectivesRaw.split('\n').map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(objectivesRaw) ? objectivesRaw : [];

    const requirementsRaw = formValue.requirements as unknown;
    const requirements = typeof requirementsRaw === 'string'
      ? requirementsRaw.split('\n').map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(requirementsRaw) ? requirementsRaw : [];

    const entity: Project = {
      ...formValue,
      pathId,
      objectives,
      requirements,
      ...(currentProject?.id
        ? {
            id: currentProject.id,
            createdAt: currentProject.createdAt,
            updatedAt: currentProject.updatedAt,
          }
        : {}),
    } as Project;

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
    // Also require a path to be selected
    return this.selectedPathId().length > 0;
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
