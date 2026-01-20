import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Concept, KnowledgeUnit, LearningPath, SubConcept } from '@kasita/common-models';
import { LearningMapService } from '@kasita/core-data';
import {
  BuildJobsFacade,
  ConceptsFacade,
  KnowledgeUnitFacade,
  LearningPathsFacade,
  SubConceptsFacade,
} from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

import { PipelineColumn } from '../../shared/pipeline-column/pipeline-column';
import { PipelineProgressIndicator, PipelineStage } from '../../shared/pipeline-progress-indicator/pipeline-progress-indicator';
import { KnowledgeUnitDetail } from './knowledge-unit-detail/knowledge-unit-detail';
import { LearningPathDetail } from './learning-path-detail/learning-path-detail';
import { LearningPathsList } from './learning-paths-list/learning-paths-list';
import { ConceptDetail } from './concept-detail/concept-detail';
import { SubConceptDetail } from './sub-concept-detail/sub-concept-detail';
import { BuildProgress } from './build-progress/build-progress';

@Component({
  selector: 'app-learning-paths',
  imports: [
    LearningPathsList,
    LearningPathDetail,
    ConceptDetail,
    SubConceptDetail,
    KnowledgeUnitDetail,
    MaterialModule,
    PipelineColumn,
    PipelineProgressIndicator,
    BuildProgress,
  ],
  templateUrl: './learning-paths.html',
  styleUrl: './learning-paths.scss',
})
export class LearningPaths implements OnInit, OnDestroy {
  private learningPathsFacade = inject(LearningPathsFacade);
  private conceptsFacade = inject(ConceptsFacade);
  private subConceptsFacade = inject(SubConceptsFacade);
  private knowledgeUnitFacade = inject(KnowledgeUnitFacade);
  private learningMapService = inject(LearningMapService);
  private buildJobsFacade = inject(BuildJobsFacade);

  // Learning Paths
  learningPaths = toSignal(this.learningPathsFacade.allLearningPaths$, { initialValue: [] as LearningPath[] });
  selectedLearningPath = toSignal(this.learningPathsFacade.selectedLearningPath$, { initialValue: null });
  learningPathsLoaded = toSignal(this.learningPathsFacade.loaded$, { initialValue: false });
  learningPathsError = toSignal(this.learningPathsFacade.error$, { initialValue: null });

  // Concepts - filtered by selected path
  allConcepts = toSignal(this.conceptsFacade.allConcepts$, { initialValue: [] as Concept[] });
  concepts = computed(() => {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return [];
    return this.allConcepts().filter(p => p.pathId === pathId);
  });

  // Selected Concept for sub-concepts
  selectedConcept = signal<Concept | null>(null);

  // SubConcepts - filtered by selected concept
  allSubConcepts = toSignal(this.subConceptsFacade.allSubConcepts$, { initialValue: [] as SubConcept[] });
  subConcepts = computed(() => {
    const conceptId = this.selectedConcept()?.id;
    if (!conceptId) return [];
    return this.allSubConcepts().filter(sc => sc.conceptId === conceptId);
  });

  // Selected SubConcept for structured KUs
  selectedSubConcept = signal<SubConcept | null>(null);

  // Knowledge Units - only show when a sub-concept is selected (Assembly Flow)
  allKnowledgeUnits = toSignal(this.knowledgeUnitFacade.allKnowledgeUnits$, { initialValue: [] as KnowledgeUnit[] });
  structuredKnowledgeUnits = computed(() => {
    const subConceptId = this.selectedSubConcept()?.id;
    // In the Assembly Flow, KUs are generated from sub-concepts
    // Only show KUs when a sub-concept is selected
    if (!subConceptId) return [];
    const all = this.allKnowledgeUnits();
    return all.filter(k => k.subConceptId === subConceptId);
  });

  // Writable signals for pipeline columns
  learningPathsSignal = signal<LearningPath[]>([]);
  conceptsSignal = signal<Concept[]>([]);
  subConceptsSignal = signal<SubConcept[]>([]);
  structuredKnowledgeUnitsSignal = signal<KnowledgeUnit[]>([]);

  // Loading states
  loadingConcepts = signal(false);
  loadingSubConcepts = signal(false);
  loadingKnowledgeUnits = signal(false);

  // Action states (generating, decomposing, etc.)
  generatingConcepts = signal(false);
  decomposing = signal(false);
  generatingKU = signal(false);

  // BullMQ build job state
  activeJob = toSignal(this.buildJobsFacade.activeJob$);
  isRunning = toSignal(this.buildJobsFacade.isRunning$, { initialValue: false });
  buildProgress = toSignal(this.buildJobsFacade.currentProgress$, { initialValue: 0 });
  latestEvent = toSignal(this.buildJobsFacade.latestEvent$);

  // Computed progress message from SSE events
  currentProgress = computed(() => {
    const event = this.latestEvent();
    if (event?.message) return event.message;
    const job = this.activeJob();
    return job?.currentOperation || '';
  });

  // Legacy: For PipelineProgressIndicator (will migrate later)
  currentStage = signal<string>('');
  completedStages = signal<string[]>([]);
  errorStage = signal<string | null>(null);

  // Pipeline stages definition (Build Learning Path)
  pipelineStages: PipelineStage[] = [
    { id: 'concepts', label: 'Concepts', icon: 'lightbulb' },
    { id: 'sub-concepts', label: 'Sub-concepts', icon: 'account_tree' },
    { id: 'knowledge-units', label: 'KUs', icon: 'psychology' },
  ];

  // Enabled states for actions
  canGenerateConcepts = signal(true);
  canDecompose = signal(true);
  canGenerateKU = signal(true);
  canRunPipeline = signal(true);
  alwaysTrue = signal(true);
  alwaysFalse = signal(false);

  // Inline editing state - Learning Paths
  isEditingPath = signal(false);
  editingPath = signal<LearningPath | null>(null);

  // Inline editing state - Concepts
  isEditingConcept = signal(false);
  editingConcept = signal<Concept | null>(null);

  // Inline editing state - Sub-concepts
  isEditingSubConcept = signal(false);
  editingSubConcept = signal<SubConcept | null>(null);

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
      this.conceptsSignal.set(this.concepts());
    });

    effect(() => {
      this.subConceptsSignal.set(this.subConcepts());
    });

    effect(() => {
      this.structuredKnowledgeUnitsSignal.set(this.structuredKnowledgeUnits());
    });

    // Load data when path is selected
    effect(() => {
      const pathId = this.selectedLearningPath()?.id;
      if (pathId) {
        this.loadPathData(pathId);
      }
    });

    // Update enabled states
    effect(() => {
      const hasPath = !!this.selectedLearningPath()?.id;
      const hasConcept = !!this.selectedConcept()?.id;
      const hasSubConcept = !!this.selectedSubConcept()?.id;
      this.canGenerateConcepts.set(hasPath && !this.generatingConcepts());
      this.canDecompose.set(hasConcept && !this.decomposing());
      this.canGenerateKU.set(hasSubConcept && !this.generatingKU());
      this.canRunPipeline.set(hasPath && !this.isRunning());
    });

    // Load sub-concepts when concept is selected
    effect(() => {
      const conceptId = this.selectedConcept()?.id;
      if (conceptId) {
        this.subConceptsFacade.loadSubConceptsByConcept(conceptId);
      }
    });

    // Load knowledge units when sub-concept is selected
    effect(() => {
      const subConceptId = this.selectedSubConcept()?.id;
      if (subConceptId) {
        this.knowledgeUnitFacade.loadKnowledgeUnitsBySubConcept(subConceptId);
      }
    });

    // Load active build job when path is selected
    effect(() => {
      const pathId = this.selectedLearningPath()?.id;
      if (pathId) {
        this.buildJobsFacade.loadActiveJob(pathId);
      }
    });

    // Reload data when build completes
    effect(() => {
      const event = this.latestEvent();
      if (event?.type === 'job-completed') {
        this.onBuildComplete();
      }
    });

    // Real-time UI updates: Handle entity data from job progress events
    effect(() => {
      const event = this.latestEvent();
      if (!event || event.type !== 'step-completed' || !event.entities) return;

      // Concepts generated - add to store and select first one
      if (event.stepType === 'generate-concepts' && event.entities.concepts?.length) {
        this.conceptsFacade.addConceptsToStore(event.entities.concepts);
        // Select the first concept to show sub-concepts column
        const firstConcept = event.entities.concepts[0];
        if (firstConcept) {
          this.selectConcept(firstConcept);
        }
      }

      // Sub-concepts generated - add to store and select parent concept
      if (event.stepType === 'decompose-concept' && event.entities.subConcepts?.length) {
        this.subConceptsFacade.addSubConceptsToStore(event.entities.subConcepts);
        // Select the parent concept if specified
        if (event.entities.selectedConceptId) {
          const concept = this.allConcepts().find(c => c.id === event.entities!.selectedConceptId);
          if (concept) {
            this.selectConcept(concept);
            // Select the first sub-concept to show KUs column
            const firstSubConcept = event.entities.subConcepts[0];
            if (firstSubConcept) {
              this.selectSubConcept(firstSubConcept);
            }
          }
        }
      }

      // Knowledge units generated - add to store and select parent concept/sub-concept
      if (event.stepType === 'generate-ku' && event.entities.knowledgeUnits?.length) {
        this.knowledgeUnitFacade.addKnowledgeUnitsToStore(event.entities.knowledgeUnits);
        // Select the parent concept and sub-concept if specified
        if (event.entities.selectedConceptId) {
          const concept = this.allConcepts().find(c => c.id === event.entities!.selectedConceptId);
          if (concept) {
            this.selectConcept(concept);
          }
        }
        if (event.entities.selectedSubConceptId) {
          const subConcept = this.allSubConcepts().find(sc => sc.id === event.entities!.selectedSubConceptId);
          if (subConcept) {
            this.selectSubConcept(subConcept);
          }
        }
      }
    });

    // Update legacy progress indicator from SSE events
    effect(() => {
      const event = this.latestEvent();
      if (!event) return;

      if (event.stepType) {
        this.currentStage.set(event.stepType);
      }

      if (event.type === 'step-completed' && event.stepType) {
        this.completedStages.update(stages => {
          if (!stages.includes(event.stepType!)) {
            return [...stages, event.stepType!];
          }
          return stages;
        });
      }

      if (event.type === 'step-failed' && event.stepType) {
        this.errorStage.set(event.stepType);
      }

      if (event.type === 'job-completed' || event.type === 'job-failed') {
        // Reset stages after job completes
        this.currentStage.set('');
        this.completedStages.set([]);
        this.errorStage.set(null);
      }
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
    // Load concepts
    this.loadingConcepts.set(true);
    this.conceptsFacade.loadConceptsByPath(pathId);
    setTimeout(() => this.loadingConcepts.set(false), 500);

    // Load knowledge units (structured type)
    this.loadingKnowledgeUnits.set(true);
    this.knowledgeUnitFacade.loadKnowledgeUnitsByPath(pathId);
    setTimeout(() => this.loadingKnowledgeUnits.set(false), 500);

    // Clear selections when path changes
    this.selectedConcept.set(null);
    this.selectedSubConcept.set(null);
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
  // Concept Editing
  // ==================
  editConcept(concept: Concept) {
    this.closeAllEditors();
    this.editingConcept.set(concept);
    this.isEditingConcept.set(true);
  }

  createNewConcept() {
    this.closeAllEditors();
    this.editingConcept.set(null);
    this.isEditingConcept.set(true);
  }

  saveConcept(concept: Concept) {
    this.conceptsFacade.saveConcept(concept);
    this.closeConceptEditor();
  }

  closeConceptEditor() {
    this.isEditingConcept.set(false);
    this.editingConcept.set(null);
  }

  // ===================
  // Sub-concept Editing
  // ===================
  editSubConcept(subConcept: SubConcept) {
    this.closeAllEditors();
    this.editingSubConcept.set(subConcept);
    this.isEditingSubConcept.set(true);
  }

  createNewSubConcept() {
    this.closeAllEditors();
    this.editingSubConcept.set(null);
    this.isEditingSubConcept.set(true);
  }

  saveSubConcept(subConcept: SubConcept) {
    this.subConceptsFacade.saveSubConcept(subConcept);
    this.closeSubConceptEditor();
  }

  closeSubConceptEditor() {
    this.isEditingSubConcept.set(false);
    this.editingSubConcept.set(null);
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
    this.closeConceptEditor();
    this.closeSubConceptEditor();
    this.closeKnowledgeUnitEditor();
  }

  // =================
  // Concept Selection (for Assembly Flow)
  // =================
  selectConcept(concept: Concept) {
    this.selectedConcept.set(concept);
    this.selectedSubConcept.set(null);
  }

  clearSelectedConcept() {
    this.selectedConcept.set(null);
    this.selectedSubConcept.set(null);
  }

  // =================
  // SubConcept Selection
  // =================
  selectSubConcept(subConcept: SubConcept) {
    this.selectedSubConcept.set(subConcept);
    this.closeKnowledgeUnitEditor();
  }

  clearSelectedSubConcept() {
    this.selectedSubConcept.set(null);
  }

  // =================
  // AI Generation: Decompose Concept
  // =================
  decomposeConcept() {
    const conceptId = this.selectedConcept()?.id;
    if (!conceptId) return;

    this.decomposing.set(true);
    this.learningMapService.decomposeConcept(conceptId).subscribe({
      next: (result) => {
        this.decomposing.set(false);
        // Add the returned sub-concepts directly to the store instead of reloading
        if (result.subConcepts && result.subConcepts.length > 0) {
          this.subConceptsFacade.addSubConceptsToStore(result.subConcepts, result.message);
        }
      },
      error: () => {
        this.decomposing.set(false);
      },
    });
  }

  // =================
  // AI Generation: Generate Structured KU
  // =================
  generateStructuredKU() {
    const subConceptId = this.selectedSubConcept()?.id;
    if (!subConceptId) return;

    this.generatingKU.set(true);
    this.learningMapService.generateStructuredKU(subConceptId).subscribe({
      next: (result) => {
        this.generatingKU.set(false);
        // Add the returned KUs directly to the store instead of reloading
        if (result.knowledgeUnits && result.knowledgeUnits.length > 0) {
          this.knowledgeUnitFacade.addKnowledgeUnitsToStore(result.knowledgeUnits);
        }
      },
      error: () => {
        this.generatingKU.set(false);
      },
    });
  }

  // Pipeline actions
  generateConcepts() {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return;

    this.generatingConcepts.set(true);
    this.learningMapService.generateConcepts(pathId).subscribe({
      next: () => {
        this.generatingConcepts.set(false);
        this.conceptsFacade.loadConceptsByPath(pathId);
      },
      error: () => {
        this.generatingConcepts.set(false);
      },
    });
  }

  runFullPipeline() {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return;

    // Start BullMQ build job (runs in backend, survives browser refresh)
    this.buildJobsFacade.createBuildJob(pathId);
  }

  // Called when build completes (from BuildProgress component or SSE event)
  onBuildComplete() {
    const pathId = this.selectedLearningPath()?.id;
    if (pathId) {
      this.loadPathData(pathId);
    }
  }

  ngOnDestroy(): void {
    this.buildJobsFacade.unsubscribeFromJobEvents();
  }
}
