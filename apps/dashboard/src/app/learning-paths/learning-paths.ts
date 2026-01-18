import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KnowledgeUnit, LearningPath, Principle, RawContent } from '@kasita/common-models';
import { LearningMapService } from '@kasita/core-data';
import {
  KnowledgeUnitFacade,
  LearningPathsFacade,
  PrincipleFacade,
  RawContentFacade,
} from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

import { PipelineColumn } from '../shared/pipeline-column/pipeline-column';
import { PipelineProgressIndicator, PipelineStage } from '../shared/pipeline-progress-indicator/pipeline-progress-indicator';
import { KnowledgeUnitDetail } from './knowledge-unit-detail/knowledge-unit-detail';
import { LearningPathDetail } from './learning-path-detail/learning-path-detail';
import { LearningPathsList } from './learning-paths-list/learning-paths-list';
import { PrincipleDetail } from './principle-detail/principle-detail';
import { RawContentDetail } from './raw-content-detail/raw-content-detail';
import { PipelineOrchestratorService } from './services/pipeline-orchestrator.service';
import { SourceDetail, PipelineSource } from './source-detail/source-detail';

@Component({
  selector: 'app-learning-paths',
  imports: [
    LearningPathsList,
    LearningPathDetail,
    PrincipleDetail,
    SourceDetail,
    RawContentDetail,
    KnowledgeUnitDetail,
    MaterialModule,
    PipelineColumn,
    PipelineProgressIndicator,
  ],
  templateUrl: './learning-paths.html',
  styleUrl: './learning-paths.scss',
})
export class LearningPaths implements OnInit {
  private learningPathsFacade = inject(LearningPathsFacade);
  private principleFacade = inject(PrincipleFacade);
  private rawContentFacade = inject(RawContentFacade);
  private knowledgeUnitFacade = inject(KnowledgeUnitFacade);
  private learningMapService = inject(LearningMapService);
  private pipelineOrchestrator = inject(PipelineOrchestratorService);

  // Learning Paths
  learningPaths = toSignal(this.learningPathsFacade.allLearningPaths$, { initialValue: [] as LearningPath[] });
  selectedLearningPath = toSignal(this.learningPathsFacade.selectedLearningPath$, { initialValue: null });
  learningPathsLoaded = toSignal(this.learningPathsFacade.loaded$, { initialValue: false });
  learningPathsError = toSignal(this.learningPathsFacade.error$, { initialValue: null });

  // Principles - filtered by selected path
  allPrinciples = toSignal(this.principleFacade.allPrinciples$, { initialValue: [] as Principle[] });
  principles = computed(() => {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return [];
    return this.allPrinciples().filter(p => p.pathId === pathId);
  });

  // Sources for selected path
  sources = signal<PipelineSource[]>([]);

  // Raw Content - filtered by selected path
  allRawContent = toSignal(this.rawContentFacade.allRawContent$, { initialValue: [] as RawContent[] });
  rawContent = computed(() => {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return [];
    return this.allRawContent().filter(r => r.pathId === pathId);
  });

  // Knowledge Units - filtered by selected path
  allKnowledgeUnits = toSignal(this.knowledgeUnitFacade.allKnowledgeUnits$, { initialValue: [] as KnowledgeUnit[] });
  knowledgeUnits = computed(() => {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return [];
    return this.allKnowledgeUnits().filter(k => k.pathId === pathId);
  });

  // Writable signals for pipeline columns
  learningPathsSignal = signal<LearningPath[]>([]);
  principlesSignal = signal<Principle[]>([]);
  sourcesSignal = signal<PipelineSource[]>([]);
  rawContentSignal = signal<RawContent[]>([]);
  knowledgeUnitsSignal = signal<KnowledgeUnit[]>([]);

  // Loading states
  loadingPrinciples = signal(false);
  loadingSources = signal(false);
  loadingRawContent = signal(false);
  loadingKnowledgeUnits = signal(false);

  // Action states (generating, suggesting, etc.)
  generatingPrinciples = signal(false);
  suggestingSources = signal(false);
  ingesting = signal(false);
  synthesizing = signal(false);

  // Pipeline orchestrator state
  isRunning = this.pipelineOrchestrator.isRunning;
  currentStage = this.pipelineOrchestrator.currentStage;
  completedStages = this.pipelineOrchestrator.completedStages;
  errorStage = this.pipelineOrchestrator.errorStage;

  // Pipeline stages definition
  pipelineStages: PipelineStage[] = [
    { id: 'principles', label: 'Principles', icon: 'lightbulb' },
    { id: 'sources', label: 'Sources', icon: 'link' },
    { id: 'ingest', label: 'Ingest', icon: 'download' },
    { id: 'synthesize', label: 'Synthesize', icon: 'auto_awesome' },
  ];

  // Enabled states for actions
  canGeneratePrinciples = signal(true);
  canSuggestSources = signal(true);
  canIngest = signal(true);
  canSynthesize = signal(true);
  canRunPipeline = signal(true);
  alwaysTrue = signal(true);
  alwaysFalse = signal(false);

  // Inline editing state - Learning Paths
  isEditingPath = signal(false);
  editingPath = signal<LearningPath | null>(null);

  // Inline editing state - Principles
  isEditingPrinciple = signal(false);
  editingPrinciple = signal<Principle | null>(null);

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
    this.learningPathsFacade.mutations$.subscribe(() => this.reset());

    // Sync computed values to writable signals for pipeline columns
    effect(() => {
      this.learningPathsSignal.set(this.learningPaths());
    });

    effect(() => {
      this.principlesSignal.set(this.principles());
    });

    effect(() => {
      this.sourcesSignal.set(this.sources());
    });

    effect(() => {
      this.rawContentSignal.set(this.rawContent());
    });

    effect(() => {
      this.knowledgeUnitsSignal.set(this.knowledgeUnits());
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
      this.canGeneratePrinciples.set(hasPath && !this.generatingPrinciples());
      this.canSuggestSources.set(hasPath && !this.suggestingSources());
      this.canIngest.set(hasPath && !this.ingesting());
      this.canSynthesize.set(hasPath && !this.synthesizing());
      this.canRunPipeline.set(hasPath && !this.isRunning());
    });
  }

  ngOnInit(): void {
    this.reset();
  }

  reset() {
    this.loadLearningPaths();
    this.learningPathsFacade.resetSelectedLearningPath();
  }

  loadLearningPaths() {
    this.learningPathsFacade.loadLearningPaths();
  }

  loadPathData(pathId: string) {
    // Load principles
    this.loadingPrinciples.set(true);
    this.principleFacade.loadPrinciplesByPath(pathId);
    setTimeout(() => this.loadingPrinciples.set(false), 500);

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

  // ==================
  // Principle Editing
  // ==================
  editPrinciple(principle: Principle) {
    this.closeAllEditors();
    this.editingPrinciple.set(principle);
    this.isEditingPrinciple.set(true);
  }

  createNewPrinciple() {
    this.closeAllEditors();
    this.editingPrinciple.set(null);
    this.isEditingPrinciple.set(true);
  }

  savePrinciple(principle: Principle) {
    this.principleFacade.savePrinciple(principle);
    this.closePrincipleEditor();
  }

  closePrincipleEditor() {
    this.isEditingPrinciple.set(false);
    this.editingPrinciple.set(null);
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
    if (source.id) {
      // Update existing - would need an update API endpoint
      // For now, just reload
      this.loadPathData(pathId);
    } else {
      // Create new source
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

  createNewRawContent() {
    this.closeAllEditors();
    this.editingRawContent.set(null);
    this.isEditingRawContent.set(true);
  }

  saveRawContent(rawContent: RawContent) {
    this.rawContentFacade.saveRawContent(rawContent);
    this.closeRawContentEditor();
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

  createNewKnowledgeUnit() {
    this.closeAllEditors();
    this.editingKnowledgeUnit.set(null);
    this.isEditingKnowledgeUnit.set(true);
  }

  saveKnowledgeUnit(knowledgeUnit: KnowledgeUnit) {
    this.knowledgeUnitFacade.saveKnowledgeUnit(knowledgeUnit);
    this.closeKnowledgeUnitEditor();
  }

  closeKnowledgeUnitEditor() {
    this.isEditingKnowledgeUnit.set(false);
    this.editingKnowledgeUnit.set(null);
  }

  // =================
  // Helper Methods
  // =================
  closeAllEditors() {
    this.closePathEditor();
    this.closePrincipleEditor();
    this.closeSourceEditor();
    this.closeRawContentEditor();
    this.closeKnowledgeUnitEditor();
  }

  // Pipeline actions
  generatePrinciples() {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return;

    this.generatingPrinciples.set(true);
    this.learningMapService.generatePrinciples(pathId).subscribe({
      next: () => {
        this.generatingPrinciples.set(false);
        this.principleFacade.loadPrinciplesByPath(pathId);
      },
      error: () => {
        this.generatingPrinciples.set(false);
      },
    });
  }

  suggestSources() {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return;

    this.suggestingSources.set(true);
    this.learningMapService.suggestSources(pathId).subscribe({
      next: (result) => {
        // Add all suggested sources
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

  runFullPipeline() {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return;

    this.pipelineOrchestrator.runFullPipeline(pathId).subscribe({
      next: (result) => {
        // Reload data after each stage completes
        if (result.success) {
          this.loadPathData(pathId);
        }
      },
      complete: () => {
        // Final reload when pipeline completes
        this.loadPathData(pathId);
      },
    });
  }
}
