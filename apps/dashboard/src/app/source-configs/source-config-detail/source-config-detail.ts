import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@kasita/material';
import { form } from '@angular/forms/signals';
import { DynamicForm } from '../../shared/dynamic-form/dynamic-form';
import { sourceFields, toSchema, initializeEntity, LearningMapService } from '@kasita/core-data';
import { LearningPathsFacade } from '@kasita/core-state';
import { SourceListItem, LinkedPath } from '../source-configs';

@Component({
  selector: 'app-source-detail',
  imports: [CommonModule, MaterialModule, DynamicForm, FormsModule],
  templateUrl: './source-config-detail.html',
  styleUrl: './source-config-detail.scss',
})
export class SourceDetail {
  private learningMapService = inject(LearningMapService);
  private learningPathsFacade = inject(LearningPathsFacade);

  private _source = signal<SourceListItem | null>(null);
  originalTitle = signal('');

  metaInfo = signal(sourceFields);
  entity = signal<Partial<SourceListItem>>(initializeEntity(sourceFields));

  // All available learning paths
  allLearningPaths = toSignal(this.learningPathsFacade.allLearningPaths$, { initialValue: [] });

  // Currently linked paths (from source)
  linkedPaths = signal<LinkedPath[]>([]);

  // Selected path to add
  selectedPathToAdd = '';

  // Loading state for link operations
  linkLoading = signal(false);

  // Create the form directly (not in computed) since form() uses inject() internally
  dynamicForm = form(this.entity, toSchema(this.metaInfo()));

  @Input() isEditing = false;

  @Input() set source(value: SourceListItem | null) {
    this._source.set(value);
    if (value && value.id) {
      // Update mode: fill form with existing entity data
      this.originalTitle.set(value.name || 'Source');
      this.entity.set({
        name: value.name || '',
        url: value.url || '',
        type: value.type || 'rss',
      });
      this.linkedPaths.set(value.linkedPaths || []);
    } else {
      // Create mode: show empty form
      this.originalTitle.set('New Source');
      this.entity.set(initializeEntity(sourceFields));
      this.linkedPaths.set([]);
    }
    this.selectedPathToAdd = '';
  }

  get source(): SourceListItem | null {
    return this._source();
  }

  // Paths that can be added (not already linked)
  availablePaths = computed(() => {
    const all = this.allLearningPaths();
    const linked = this.linkedPaths();
    const linkedIds = new Set(linked.map(p => p.id));
    return all.filter(p => !linkedIds.has(p.id));
  });

  @Output() saved = new EventEmitter<Partial<SourceListItem>>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() pathLinked = new EventEmitter<{ sourceId: string; pathId: string }>();
  @Output() pathUnlinked = new EventEmitter<{ sourceId: string; pathId: string }>();

  onAddPath() {
    if (!this.selectedPathToAdd || !this.source?.id) return;

    this.linkLoading.set(true);
    this.learningMapService.linkSourceToPath(this.source.id, this.selectedPathToAdd).subscribe({
      next: () => {
        // Find the path name and add to local state
        const path = this.allLearningPaths().find(p => p.id === this.selectedPathToAdd);
        if (path) {
          this.linkedPaths.update(paths => [...paths, { id: path.id, name: path.name, enabled: true }]);
        }
        this.selectedPathToAdd = '';
        this.linkLoading.set(false);
        this.pathLinked.emit({ sourceId: this.source!.id, pathId: this.selectedPathToAdd });
      },
      error: (err) => {
        console.error('Failed to link path:', err);
        this.linkLoading.set(false);
      }
    });
  }

  onRemovePath(pathId: string) {
    if (!this.source?.id) return;

    this.linkLoading.set(true);
    this.learningMapService.unlinkSourceFromPath(this.source.id, pathId).subscribe({
      next: () => {
        this.linkedPaths.update(paths => paths.filter(p => p.id !== pathId));
        this.linkLoading.set(false);
        this.pathUnlinked.emit({ sourceId: this.source!.id, pathId });
      },
      error: (err) => {
        console.error('Failed to unlink path:', err);
        this.linkLoading.set(false);
      }
    });
  }

  onSubmit(event: Event) {
    // Prevent default form submission (page refresh) - required for Signal Forms
    event.preventDefault();

    // Check if form is valid
    if (!this.isFormValid()) {
      return;
    }

    // Get form values from the entity signal (Signal Forms sync bidirectionally)
    const formValue = this.entity();

    // Emit the source data without pathId (it's handled via linking now)
    const entity: Partial<SourceListItem> = {
      name: formValue.name,
      url: formValue.url,
      type: formValue.type,
    };

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
    return true;
  });
}
