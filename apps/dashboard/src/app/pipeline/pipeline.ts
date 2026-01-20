import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KnowledgeUnit, LearningPath, RawContent } from '@kasita/common-models';
import { LearningMapService } from '@kasita/core-data';
import {
  KnowledgeUnitFacade,
  LearningPathsFacade,
  RawContentFacade,
} from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

import { PipelineColumn } from '../shared/pipeline-column/pipeline-column';
import { PipelineProgressIndicator, PipelineStage } from '../shared/pipeline-progress-indicator/pipeline-progress-indicator';
import { LearningPathDetail } from '../learning-paths/learning-path-detail/learning-path-detail';
import { LearningPathsList } from '../learning-paths/learning-paths-list/learning-paths-list';
import { SourceDetail, PipelineSource } from '../learning-paths/source-detail/source-detail';
import { RawContentDetail } from '../learning-paths/raw-content-detail/raw-content-detail';
import { KnowledgeUnitDetail } from '../learning-paths/knowledge-unit-detail/knowledge-unit-detail';

@Component({
  selector: 'app-pipeline',
  imports: [
    MaterialModule,
    PipelineColumn,
    PipelineProgressIndicator,
    LearningPathDetail,
    LearningPathsList,
    SourceDetail,
    RawContentDetail,
    KnowledgeUnitDetail,
  ],
  templateUrl: './pipeline.html',
  styleUrl: './pipeline.scss',
})
export class Pipeline implements OnInit {
  private learningPathsFacade = inject(LearningPathsFacade);
  private rawContentFacade = inject(RawContentFacade);
  private knowledgeUnitFacade = inject(KnowledgeUnitFacade);
  private learningMapService = inject(LearningMapService);

  // Learning Paths
  learningPaths = toSignal(this.learningPathsFacade.allLearningPaths$, { initialValue: [] as LearningPath[] });
  selectedLearningPath = toSignal(this.learningPathsFacade.selectedLearningPath$, { initialValue: null });
  learningPathsLoaded = toSignal(this.learningPathsFacade.loaded$, { initialValue: false });

  // Sources for selected path
  sources = signal<PipelineSource[]>([]);

  // Raw Content - filtered by selected path (discovered only)
  allRawContent = toSignal(this.rawContentFacade.allRawContent$, { initialValue: [] as RawContent[] });
  rawContent = computed(() => {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return [];
    return this.allRawContent().filter(r => r.pathId === pathId);
  });

  // Knowledge Units - filtered by selected path (discovered type only)
  allKnowledgeUnits = toSignal(this.knowledgeUnitFacade.allKnowledgeUnits$, { initialValue: [] as KnowledgeUnit[] });
  discoveredKnowledgeUnits = computed(() => {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return [];
    return this.allKnowledgeUnits().filter(k => k.pathId === pathId && (!k.type || k.type === 'discovered'));
  });

  // Writable signals for pipeline columns
  learningPathsSignal = signal<LearningPath[]>([]);
  sourcesSignal = signal<PipelineSource[]>([]);
  rawContentSignal = signal<RawContent[]>([]);
  knowledgeUnitsSignal = signal<KnowledgeUnit[]>([]);

  // Loading states
  loadingSources = signal(false);
  loadingRawContent = signal(false);
  loadingKnowledgeUnits = signal(false);

  // Action states
  suggestingSources = signal(false);
  ingesting = signal(false);
  synthesizing = signal(false);

  // Pipeline stages definition for Discovery Flow
  pipelineStages: PipelineStage[] = [
    { id: 'sources', label: 'Sources', icon: 'link' },
    { id: 'ingest', label: 'Ingest', icon: 'download' },
    { id: 'synthesize', label: 'Synthesize', icon: 'auto_awesome' },
  ];

  // Full pipeline run state
  isRunning = computed(() => this.suggestingSources() || this.ingesting() || this.synthesizing());
  currentStage = signal<string | null>(null);
  completedStages = signal<string[]>([]);
  errorStage = signal<string | null>(null);
  canRunPipeline = computed(() => !!this.selectedLearningPath()?.id && !this.isRunning());

  // Enabled states for actions
  canSuggestSources = signal(true);
  canIngest = signal(true);
  canSynthesize = signal(true);
  alwaysTrue = signal(true);
  alwaysFalse = signal(false);

  // Inline editing state - Learning Paths
  isEditingPath = signal(false);
  editingPath = signal<LearningPath | null>(null);

  // Inline editing state - Sources
  isEditingSource = signal(false);
  editingSource = signal<PipelineSource | null>(null);

  // Inline editing state - Raw Content
  isEditingRawContent = signal(false);
  editingRawContent = signal<RawContent | null>(null);

  // Inline editing state - Knowledge Units
  isEditingKnowledgeUnit = signal(false);
  editingKnowledgeUnit = signal<KnowledgeUnit | null>(null);

  constructor() {
    // Reload learning paths after mutations
    this.learningPathsFacade.mutations$.subscribe(() => {
      this.learningPathsFacade.loadLearningPaths();
    });

    // Sync computed values to writable signals for pipeline columns
    effect(() => {
      this.learningPathsSignal.set(this.learningPaths());
    });

    effect(() => {
      this.sourcesSignal.set(this.sources());
    });

    effect(() => {
      this.rawContentSignal.set(this.rawContent());
    });

    effect(() => {
      this.knowledgeUnitsSignal.set(this.discoveredKnowledgeUnits());
    });

    // Load data when path is selected
    effect(() => {
      const pathId = this.selectedLearningPath()?.id;
      if (pathId) {
        this.loadPathData(pathId);
      } else {
        this.clearPathData();
      }
    });

    // Update enabled states
    effect(() => {
      const hasPath = !!this.selectedLearningPath()?.id;
      this.canSuggestSources.set(hasPath && !this.suggestingSources());
      this.canIngest.set(hasPath && !this.ingesting());
      this.canSynthesize.set(hasPath && !this.synthesizing());
    });
  }

  ngOnInit(): void {
    this.learningPathsFacade.loadLearningPaths();
  }

  loadPathData(pathId: string) {
    // Load sources
    this.loadingSources.set(true);
    this.learningMapService.getSourcesForPath(pathId).subscribe({
      next: (sources) => {
        this.sources.set(sources);
        this.loadingSources.set(false);
      },
      error: () => {
        this.sources.set([]);
        this.loadingSources.set(false);
      },
    });

    // Load raw content
    this.loadingRawContent.set(true);
    this.rawContentFacade.loadRawContentByPath(pathId);
    setTimeout(() => this.loadingRawContent.set(false), 500);

    // Load knowledge units
    this.loadingKnowledgeUnits.set(true);
    this.knowledgeUnitFacade.loadKnowledgeUnitsByPath(pathId);
    setTimeout(() => this.loadingKnowledgeUnits.set(false), 500);
  }

  clearPathData() {
    this.sources.set([]);
  }

  selectLearningPath(learningPath: LearningPath) {
    this.learningPathsFacade.selectLearningPath(learningPath.id as string);
  }

  // =====================
  // Learning Path Editing
  // =====================
  editLearningPath(learningPath: LearningPath) {
    this.closeAllEditors();
    this.editingPath.set(learningPath);
    this.isEditingPath.set(true);
  }

  createNewLearningPath() {
    this.closeAllEditors();
    this.editingPath.set(null);
    this.isEditingPath.set(true);
  }

  saveLearningPath(learningPath: LearningPath) {
    this.learningPathsFacade.saveLearningPath(learningPath);
    this.closePathEditor();
  }

  closePathEditor() {
    this.isEditingPath.set(false);
    this.editingPath.set(null);
  }

  deleteLearningPath(learningPath: LearningPath) {
    this.learningPathsFacade.deleteLearningPath(learningPath);
  }

  // ===============
  // Source Editing
  // ===============
  editSource(source: PipelineSource) {
    this.closeAllEditors();
    this.editingSource.set(source);
    this.isEditingSource.set(true);
  }

  createNewSource() {
    this.closeAllEditors();
    this.editingSource.set(null);
    this.isEditingSource.set(true);
  }

  saveSource(data: { source: Partial<PipelineSource>; pathId: string }) {
    const { source, pathId } = data;
    if (!source.id) {
      this.learningMapService.addSource(pathId, {
        name: source.name || '',
        url: source.url || '',
        type: source.type || 'rss',
      }).subscribe({
        next: () => {
          this.loadPathData(pathId);
        },
      });
    }
    this.closeSourceEditor();
  }

  closeSourceEditor() {
    this.isEditingSource.set(false);
    this.editingSource.set(null);
  }

  // ===================
  // Raw Content Editing
  // ===================
  editRawContent(rawContent: RawContent) {
    this.closeAllEditors();
    this.editingRawContent.set(rawContent);
    this.isEditingRawContent.set(true);
  }

  closeRawContentEditor() {
    this.isEditingRawContent.set(false);
    this.editingRawContent.set(null);
  }

  // ======================
  // Knowledge Unit Editing
  // ======================
  editKnowledgeUnit(knowledgeUnit: KnowledgeUnit) {
    this.closeAllEditors();
    this.editingKnowledgeUnit.set(knowledgeUnit);
    this.isEditingKnowledgeUnit.set(true);
  }

  closeKnowledgeUnitEditor() {
    this.isEditingKnowledgeUnit.set(false);
    this.editingKnowledgeUnit.set(null);
  }

  closeAllEditors() {
    this.closePathEditor();
    this.closeSourceEditor();
    this.closeRawContentEditor();
    this.closeKnowledgeUnitEditor();
  }

  // Pipeline actions
  suggestSources() {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return;

    this.suggestingSources.set(true);
    this.learningMapService.suggestSources(pathId).subscribe({
      next: (result) => {
        let added = 0;
        const total = result.sources.length;
        if (total === 0) {
          this.suggestingSources.set(false);
          return;
        }

        result.sources.forEach((source) => {
          this.learningMapService.addSource(pathId, {
            name: source.name,
            url: source.url,
            type: source.type,
          }).subscribe({
            next: () => {
              added++;
              if (added >= total) {
                this.suggestingSources.set(false);
                this.loadPathData(pathId);
              }
            },
            error: () => {
              added++;
              if (added >= total) {
                this.suggestingSources.set(false);
                this.loadPathData(pathId);
              }
            },
          });
        });
      },
      error: () => {
        this.suggestingSources.set(false);
      },
    });
  }

  triggerIngestion() {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return;

    this.ingesting.set(true);
    this.learningMapService.triggerIngestion(pathId).subscribe({
      next: () => {
        this.ingesting.set(false);
        this.rawContentFacade.loadRawContentByPath(pathId);
      },
      error: () => {
        this.ingesting.set(false);
      },
    });
  }

  triggerSynthesis() {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return;

    this.synthesizing.set(true);
    this.learningMapService.triggerSynthesis(pathId).subscribe({
      next: () => {
        this.synthesizing.set(false);
        this.knowledgeUnitFacade.loadKnowledgeUnitsByPath(pathId);
      },
      error: () => {
        this.synthesizing.set(false);
      },
    });
  }

  // Run full discovery pipeline
  runFullPipeline() {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return;

    this.completedStages.set([]);
    this.errorStage.set(null);

    // Stage 1: Suggest Sources
    this.currentStage.set('sources');
    this.suggestingSources.set(true);

    this.learningMapService.suggestSources(pathId).subscribe({
      next: (result) => {
        const sources = result.sources || [];
        let added = 0;
        const total = sources.length;

        if (total === 0) {
          this.suggestingSources.set(false);
          this.completedStages.update(stages => [...stages, 'sources']);
          this.runIngestionStage(pathId);
          return;
        }

        sources.forEach((source) => {
          this.learningMapService.addSource(pathId, {
            name: source.name,
            url: source.url,
            type: source.type,
          }).subscribe({
            next: () => {
              added++;
              if (added >= total) {
                this.suggestingSources.set(false);
                this.loadPathData(pathId);
                this.completedStages.update(stages => [...stages, 'sources']);
                this.runIngestionStage(pathId);
              }
            },
            error: () => {
              added++;
              if (added >= total) {
                this.suggestingSources.set(false);
                this.loadPathData(pathId);
                this.completedStages.update(stages => [...stages, 'sources']);
                this.runIngestionStage(pathId);
              }
            },
          });
        });
      },
      error: () => {
        this.suggestingSources.set(false);
        this.errorStage.set('sources');
        this.currentStage.set(null);
      },
    });
  }

  private runIngestionStage(pathId: string) {
    this.currentStage.set('ingest');
    this.ingesting.set(true);

    this.learningMapService.triggerIngestion(pathId).subscribe({
      next: () => {
        this.ingesting.set(false);
        this.rawContentFacade.loadRawContentByPath(pathId);
        this.completedStages.update(stages => [...stages, 'ingest']);
        this.runSynthesisStage(pathId);
      },
      error: () => {
        this.ingesting.set(false);
        this.errorStage.set('ingest');
        this.currentStage.set(null);
      },
    });
  }

  private runSynthesisStage(pathId: string) {
    this.currentStage.set('synthesize');
    this.synthesizing.set(true);

    this.learningMapService.triggerSynthesis(pathId).subscribe({
      next: () => {
        this.synthesizing.set(false);
        this.knowledgeUnitFacade.loadKnowledgeUnitsByPath(pathId);
        this.completedStages.update(stages => [...stages, 'synthesize']);
        this.currentStage.set(null);
      },
      error: () => {
        this.synthesizing.set(false);
        this.errorStage.set('synthesize');
        this.currentStage.set(null);
      },
    });
  }
}
