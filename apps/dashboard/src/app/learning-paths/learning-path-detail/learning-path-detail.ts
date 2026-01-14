import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, computed, inject } from '@angular/core';
import { LearningPath, Principle } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';
import { form } from '@angular/forms/signals';
import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';
import { learningPathFields, toSchema, AuthService, initializeEntity, LearningMapService } from '@kasita/core-data';

@Component({
  selector: 'app-learning-path-detail',
  imports: [CommonModule, MaterialModule, DynamicForm],
  templateUrl: './learning-path-detail.html',
  styleUrl: './learning-path-detail.scss',
})
export class LearningPathDetail {
  private authService = inject(AuthService);
  private learningMapService = inject(LearningMapService);
  private _learningPath = signal<LearningPath | null>(null);
  originalTitle = signal('');

  // AI generation state
  isGenerating = signal(false);
  generationMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  generatedPrinciples = signal<Principle[]>([]);
  
  // Field definitions for the form
  metaInfo = signal(learningPathFields);
  
  // Entity signal - will be used to create the form
  // Initialize with all fields from metaInfo so form can create fields
  entity = signal<Partial<LearningPath>>(initializeEntity(learningPathFields));
  
  // Create the dynamic form using Signal Forms
  // Note: form() must be called outside computed() because it uses inject() internally
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() set learningPath(value: LearningPath | null) {
    this._learningPath.set(value);

    // Reset AI generation state when learning path changes
    this.isGenerating.set(false);
    this.generationMessage.set(null);
    this.generatedPrinciples.set([]);

    if (value && value.id) {
      // Update mode: fill form with existing entity data
      this.originalTitle.set(value.name || 'Learning Path');
      this.entity.set({
        name: value.name || '',
        domain: value.domain || '',
        targetSkill: value.targetSkill || '',
        status: value.status || 'not-started',
      });
    } else {
      // Create mode: show empty form
      this.originalTitle.set('New Learning Path');
      this.entity.set(initializeEntity(learningPathFields));
    }
  }

  get learningPath(): LearningPath | null {
    return this._learningPath();
  }

  @Output() saved = new EventEmitter<LearningPath>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit() {
    // Get form values from the entity signal
    const formValue = this.entity();
    
    // Check if form is valid by checking if any field has errors
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
      const currentPath = this.learningPath;
      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.id || '';
      
      // Create or update based on whether item has an id
      const entity: LearningPath = {
        ...formValue,
        // If updating (has id), preserve id and other metadata
        ...(currentPath?.id ? { 
          id: currentPath.id,
          userId: currentPath.userId || userId,
          createdAt: currentPath.createdAt,
          updatedAt: currentPath.updatedAt,
        } : {
          // If creating (no id), set userId
          userId,
        }),
      } as LearningPath;
      
      this.saved.emit(entity);
    }
  }

  onCancel() {
    this.cancelled.emit();
  }

  // Check if form is valid
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

  // Check if we can generate principles (must have ID and not already generating)
  canGenerate = computed(() => {
    return !!this._learningPath()?.id && !this.isGenerating();
  });

  generatePrinciples() {
    const pathId = this._learningPath()?.id;
    if (!pathId) return;

    this.isGenerating.set(true);
    this.generationMessage.set(null);
    this.generatedPrinciples.set([]);

    this.learningMapService.generatePrinciples(pathId).subscribe({
      next: (result) => {
        this.isGenerating.set(false);
        this.generatedPrinciples.set(result.principles);
        this.generationMessage.set({
          type: 'success',
          text: result.message,
        });
      },
      error: (err) => {
        this.isGenerating.set(false);
        const errorMessage = err.error?.message || err.message || 'Failed to generate principles';
        this.generationMessage.set({
          type: 'error',
          text: errorMessage,
        });
      },
    });
  }
}
