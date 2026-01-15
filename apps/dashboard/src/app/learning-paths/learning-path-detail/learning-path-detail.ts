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

  // Ingestion state
  isIngesting = signal(false);
  ingestionMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  ingestionResult = signal<{ sourcesProcessed: number; itemsIngested: number } | null>(null);

  // Synthesis state
  isSynthesizing = signal(false);
  synthesisMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  synthesisResult = signal<{ rawContentProcessed: number; knowledgeUnitsGenerated: number } | null>(null);

  // Pipeline tabs
  activeTab = signal<'generate' | 'sources' | 'ingest' | 'synthesize'>('generate');

  // Source suggestion state
  isSuggestingSources = signal(false);
  sourcesSuggestionMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  suggestedSources = signal<Array<{
    name: string;
    url: string;
    type: string;
    description: string;
    reputation: string;
  }>>([]);
  addedSourceUrls = signal<Set<string>>(new Set());
  isAddingSource = signal<string | null>(null); // URL of source currently being added
  isAddingAllSources = signal(false);

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

    // Reset ingestion state
    this.isIngesting.set(false);
    this.ingestionMessage.set(null);
    this.ingestionResult.set(null);

    // Reset synthesis state
    this.isSynthesizing.set(false);
    this.synthesisMessage.set(null);
    this.synthesisResult.set(null);

    // Reset source suggestion state
    this.isSuggestingSources.set(false);
    this.sourcesSuggestionMessage.set(null);
    this.suggestedSources.set([]);
    this.addedSourceUrls.set(new Set());
    this.isAddingSource.set(null);
    this.isAddingAllSources.set(false);

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

  onSubmit(event: Event) {
    // Prevent default form submission (page refresh) - required for Signal Forms
    event.preventDefault();

    // Check if form is valid
    if (!this.isFormValid()) {
      return;
    }

    // Get form values from the entity signal (Signal Forms sync bidirectionally)
    const formValue = this.entity();

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

  // Check if we can trigger ingestion
  canIngest = computed(() => {
    return !!this._learningPath()?.id && !this.isIngesting();
  });

  // Check if we can trigger synthesis
  canSynthesize = computed(() => {
    return !!this._learningPath()?.id && !this.isSynthesizing();
  });

  triggerIngestion() {
    const pathId = this._learningPath()?.id;
    if (!pathId) return;

    this.isIngesting.set(true);
    this.ingestionMessage.set(null);
    this.ingestionResult.set(null);

    this.learningMapService.triggerIngestion(pathId).subscribe({
      next: (result) => {
        this.isIngesting.set(false);
        this.ingestionResult.set({
          sourcesProcessed: result.sourcesProcessed,
          itemsIngested: result.itemsIngested,
        });
        this.ingestionMessage.set({
          type: 'success',
          text: result.message,
        });
      },
      error: (err) => {
        this.isIngesting.set(false);
        const errorMessage = err.error?.message || err.message || 'Failed to ingest content';
        this.ingestionMessage.set({
          type: 'error',
          text: errorMessage,
        });
      },
    });
  }

  triggerSynthesis() {
    const pathId = this._learningPath()?.id;
    if (!pathId) return;

    this.isSynthesizing.set(true);
    this.synthesisMessage.set(null);
    this.synthesisResult.set(null);

    this.learningMapService.triggerSynthesis(pathId).subscribe({
      next: (result) => {
        this.isSynthesizing.set(false);
        this.synthesisResult.set({
          rawContentProcessed: result.rawContentProcessed,
          knowledgeUnitsGenerated: result.knowledgeUnitsGenerated,
        });
        this.synthesisMessage.set({
          type: 'success',
          text: result.message,
        });
      },
      error: (err) => {
        this.isSynthesizing.set(false);
        const errorMessage = err.error?.message || err.message || 'Failed to synthesize content';
        this.synthesisMessage.set({
          type: 'error',
          text: errorMessage,
        });
      },
    });
  }

  // Check if we can suggest sources
  canSuggestSources = computed(() => {
    return !!this._learningPath()?.id && !this.isSuggestingSources();
  });

  suggestSources() {
    const pathId = this._learningPath()?.id;
    if (!pathId) return;

    this.isSuggestingSources.set(true);
    this.sourcesSuggestionMessage.set(null);
    this.suggestedSources.set([]);

    this.learningMapService.suggestSources(pathId).subscribe({
      next: (result) => {
        this.isSuggestingSources.set(false);
        this.suggestedSources.set(result.sources);
        this.sourcesSuggestionMessage.set({
          type: 'success',
          text: result.message,
        });
      },
      error: (err) => {
        this.isSuggestingSources.set(false);
        const errorMessage = err.error?.message || err.message || 'Failed to suggest sources';
        this.sourcesSuggestionMessage.set({
          type: 'error',
          text: errorMessage,
        });
      },
    });
  }

  addSource(source: { name: string; url: string; type: string }) {
    const pathId = this._learningPath()?.id;
    if (!pathId) return;

    this.isAddingSource.set(source.url);

    this.learningMapService.addSource(pathId, source).subscribe({
      next: () => {
        this.isAddingSource.set(null);
        // Mark this source as added
        const newSet = new Set(this.addedSourceUrls());
        newSet.add(source.url);
        this.addedSourceUrls.set(newSet);
      },
      error: (err) => {
        this.isAddingSource.set(null);
        const errorMessage = err.error?.message || err.message || 'Failed to add source';
        this.sourcesSuggestionMessage.set({
          type: 'error',
          text: errorMessage,
        });
      },
    });
  }

  isSourceAdded(url: string): boolean {
    return this.addedSourceUrls().has(url);
  }

  getUnadddedSourcesCount(): number {
    const added = this.addedSourceUrls();
    return this.suggestedSources().filter(s => !added.has(s.url)).length;
  }

  addAllSources() {
    const pathId = this._learningPath()?.id;
    if (!pathId) return;

    const unadded = this.suggestedSources().filter(s => !this.addedSourceUrls().has(s.url));
    if (unadded.length === 0) return;

    this.isAddingAllSources.set(true);

    // Add sources sequentially to avoid overwhelming the API
    let completed = 0;
    const addNext = () => {
      if (completed >= unadded.length) {
        this.isAddingAllSources.set(false);
        return;
      }

      const source = unadded[completed];
      this.learningMapService.addSource(pathId, {
        name: source.name,
        url: source.url,
        type: source.type,
      }).subscribe({
        next: () => {
          const newSet = new Set(this.addedSourceUrls());
          newSet.add(source.url);
          this.addedSourceUrls.set(newSet);
          completed++;
          addNext();
        },
        error: (err) => {
          // Continue with next source even if one fails
          completed++;
          addNext();
        },
      });
    };

    addNext();
  }
}
