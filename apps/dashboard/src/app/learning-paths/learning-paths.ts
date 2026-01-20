import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KnowledgeUnit, LearningPath, Principle, SubConcept } from '@kasita/common-models';
import { LearningMapService } from '@kasita/core-data';
import {
  KnowledgeUnitFacade,
  LearningPathsFacade,
  PrincipleFacade,
  SubConceptsFacade,
} from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

import { PipelineColumn } from '../shared/pipeline-column/pipeline-column';
import { PipelineProgressIndicator, PipelineStage } from '../shared/pipeline-progress-indicator/pipeline-progress-indicator';
import { KnowledgeUnitDetail } from './knowledge-unit-detail/knowledge-unit-detail';
import { LearningPathDetail } from './learning-path-detail/learning-path-detail';
import { LearningPathsList } from './learning-paths-list/learning-paths-list';
import { PrincipleDetail } from './principle-detail/principle-detail';
import { SubConceptDetail } from './sub-concept-detail/sub-concept-detail';
import { PipelineOrchestratorService } from './services/pipeline-orchestrator.service';

@Component({
  selector: 'app-learning-paths',
  imports: [
    LearningPathsList,
    LearningPathDetail,
    PrincipleDetail,
    SubConceptDetail,
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
  private subConceptsFacade = inject(SubConceptsFacade);
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

  // Selected Principle for sub-concepts
  selectedPrinciple = signal<Principle | null>(null);

  // SubConcepts - filtered by selected principle
  allSubConcepts = toSignal(this.subConceptsFacade.allSubConcepts$, { initialValue: [] as SubConcept[] });
  subConcepts = computed(() => {
    const principleId = this.selectedPrinciple()?.id;
    if (!principleId) return [];
    return this.allSubConcepts().filter(sc => sc.principleId === principleId);
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
  principlesSignal = signal<Principle[]>([]);
  subConceptsSignal = signal<SubConcept[]>([]);
  structuredKnowledgeUnitsSignal = signal<KnowledgeUnit[]>([]);

  // Loading states
  loadingPrinciples = signal(false);
  loadingSubConcepts = signal(false);
  loadingKnowledgeUnits = signal(false);

  // Action states (generating, decomposing, etc.)
  generatingPrinciples = signal(false);
  decomposing = signal(false);
  generatingKU = signal(false);

  // Pipeline orchestrator state
  isRunning = this.pipelineOrchestrator.isRunning;
  currentStage = this.pipelineOrchestrator.currentStage;
  completedStages = this.pipelineOrchestrator.completedStages;
  errorStage = this.pipelineOrchestrator.errorStage;

  // Pipeline stages definition (Assembly Flow)
  pipelineStages: PipelineStage[] = [
    { id: 'principles', label: 'Principles', icon: 'lightbulb' },
    { id: 'decompose', label: 'Decompose', icon: 'account_tree' },
    { id: 'generate', label: 'Generate KUs', icon: 'auto_awesome' },
  ];

  // Enabled states for actions
  canGeneratePrinciples = signal(true);
  canDecompose = signal(true);
  canGenerateKU = signal(true);
  canRunPipeline = signal(true);
  alwaysTrue = signal(true);
  alwaysFalse = signal(false);

  // Inline editing state - Learning Paths
  isEditingPath = signal(false);
  editingPath = signal<LearningPath | null>(null);

  // Inline editing state - Principles
  isEditingPrinciple = signal(false);
  editingPrinciple = signal<Principle | null>(null);

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
      this.principlesSignal.set(this.principles());
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
      const hasPrinciple = !!this.selectedPrinciple()?.id;
      const hasSubConcept = !!this.selectedSubConcept()?.id;
      this.canGeneratePrinciples.set(hasPath && !this.generatingPrinciples());
      this.canDecompose.set(hasPrinciple && !this.decomposing());
      this.canGenerateKU.set(hasSubConcept && !this.generatingKU());
      this.canRunPipeline.set(hasPath && !this.isRunning());
    });

    // Load sub-concepts when principle is selected
    effect(() => {
      const principleId = this.selectedPrinciple()?.id;
      if (principleId) {
        this.subConceptsFacade.loadSubConceptsByPrinciple(principleId);
      }
    });

    // Load knowledge units when sub-concept is selected
    effect(() => {
      const subConceptId = this.selectedSubConcept()?.id;
      if (subConceptId) {
        this.knowledgeUnitFacade.loadKnowledgeUnitsBySubConcept(subConceptId);
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
    // Load principles
    this.loadingPrinciples.set(true);
    this.principleFacade.loadPrinciplesByPath(pathId);
    setTimeout(() => this.loadingPrinciples.set(false), 500);

    // Load knowledge units (structured type)
    this.loadingKnowledgeUnits.set(true);
    this.knowledgeUnitFacade.loadKnowledgeUnitsByPath(pathId);
    setTimeout(() => this.loadingKnowledgeUnits.set(false), 500);

    // Clear selections when path changes
    this.selectedPrinciple.set(null);
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
    this.closePrincipleEditor();
    this.closeSubConceptEditor();
    this.closeKnowledgeUnitEditor();
  }

  // =================
  // Principle Selection (for Assembly Flow)
  // =================
  selectPrinciple(principle: Principle) {
    this.selectedPrinciple.set(principle);
    this.selectedSubConcept.set(null);
  }

  clearSelectedPrinciple() {
    this.selectedPrinciple.set(null);
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
  // AI Generation: Decompose Principle
  // =================
  decomposePrinciple() {
    const principleId = this.selectedPrinciple()?.id;
    if (!principleId) return;

    this.decomposing.set(true);
    this.learningMapService.decomposePrinciple(principleId).subscribe({
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

  runFullPipeline() {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return;

    // For the Assembly Flow, we run: Generate Principles → Decompose → Generate KUs
    // This is a simplified orchestration for the content pipeline
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
