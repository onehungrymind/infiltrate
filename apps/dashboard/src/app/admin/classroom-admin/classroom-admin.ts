import { Component, computed, effect, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { LearningPath } from '@kasita/common-models';
import {
  ClassroomAdminFacade,
  LearningPathsFacade,
} from '@kasita/core-state';
import { ClassroomContent, ClassroomOverview, PathStatus, JobsResponse } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';
import { PipelineColumn } from '../../shared/pipeline-column/pipeline-column';

@Component({
  selector: 'app-classroom-admin',
  imports: [CommonModule, FormsModule, MaterialModule, PipelineColumn],
  templateUrl: './classroom-admin.html',
  styleUrl: './classroom-admin.scss',
})
export class ClassroomAdmin implements OnInit {
  private classroomFacade = inject(ClassroomAdminFacade);
  private learningPathsFacade = inject(LearningPathsFacade);

  // Data from facades
  overview = toSignal(this.classroomFacade.overview$, { initialValue: null as ClassroomOverview | null });
  pathStatus = toSignal(this.classroomFacade.pathStatus$, { initialValue: null as PathStatus | null });
  allContent = toSignal(this.classroomFacade.allContent$, { initialValue: [] as ClassroomContent[] });
  errors = toSignal(this.classroomFacade.errors$, { initialValue: [] as ClassroomContent[] });
  jobs = toSignal(this.classroomFacade.jobs$, { initialValue: null as JobsResponse | null });
  pagination = toSignal(this.classroomFacade.pagination$);
  loading = toSignal(this.classroomFacade.loading$, { initialValue: false });
  error = toSignal(this.classroomFacade.error$);
  selectedContent = toSignal(this.classroomFacade.selectedContent$);

  learningPaths = toSignal(this.learningPathsFacade.allLearningPaths$, { initialValue: [] as LearningPath[] });

  // UI State
  selectedPath = signal<LearningPath | null>(null);
  selectedStatus = signal<string | null>(null);
  currentPage = signal(1);
  isEditingContent = signal(false);
  editingContent = signal<ClassroomContent | null>(null);

  // Signals for pipeline columns
  learningPathsSignal: WritableSignal<LearningPath[]> = signal([]);
  contentSignal: WritableSignal<ClassroomContent[]> = signal([]);
  alwaysFalse: WritableSignal<boolean> = signal(false);
  alwaysTrue: WritableSignal<boolean> = signal(true);
  generatingContent: WritableSignal<boolean> = signal(false);

  // Computed values
  hasActiveJobs = computed(() => {
    const j = this.jobs();
    return (j?.active?.length ?? 0) > 0 || (j?.waiting?.length ?? 0) > 0;
  });

  canGenerateContent = computed(() => {
    return !!this.selectedPath() && !this.loading();
  });

  selectedPathName = computed(() => {
    return this.selectedPath()?.name || null;
  });

  // Stats for header
  statsText = computed(() => {
    const o = this.overview();
    if (!o) return '';
    return `${o.byStatus.ready} ready · ${o.byStatus.generating} generating · ${o.byStatus.error} errors`;
  });

  constructor() {
    // Sync learning paths to signal for pipeline column
    effect(() => {
      this.learningPathsSignal.set(this.learningPaths());
    });

    // Sync content to signal for pipeline column
    effect(() => {
      this.contentSignal.set(this.allContent());
    });

    // Sync loading state
    effect(() => {
      this.generatingContent.set(this.loading());
    });

    // Load content when path is selected
    effect(() => {
      const path = this.selectedPath();
      const status = this.selectedStatus();
      const page = this.currentPage();

      this.classroomFacade.loadContentList({
        learningPathId: path?.id || undefined,
        status: status || undefined,
        page,
        limit: 50,
      });

      if (path) {
        this.classroomFacade.loadPathStatus(path.id);
      }
    });

    // Subscribe to generate success to reload data
    this.classroomFacade.generateSuccess$.subscribe(() => {
      this.classroomFacade.loadOverview();
      this.classroomFacade.loadJobs();
    });

    // Subscribe to content update success to close editor
    this.classroomFacade.contentUpdateSuccess$.subscribe(() => {
      this.closeContentEditor();
      this.classroomFacade.loadContentList({
        learningPathId: this.selectedPath()?.id || undefined,
        status: this.selectedStatus() || undefined,
        page: this.currentPage(),
        limit: 50,
      });
    });
  }

  ngOnInit(): void {
    this.learningPathsFacade.loadLearningPaths();
    this.classroomFacade.loadOverview();
    this.classroomFacade.loadJobs();
    this.classroomFacade.loadErrors();
    this.classroomFacade.loadContentList({ page: 1, limit: 50 });
  }

  // Path selection
  selectPath(path: LearningPath) {
    this.selectedPath.set(path);
    this.currentPage.set(1);
  }

  // Generation actions
  generateForPath(force = false) {
    const path = this.selectedPath();
    if (path) {
      this.classroomFacade.generateForPath(path.id, force);
    }
  }

  // Content actions
  selectContent(content: ClassroomContent) {
    this.editingContent.set(content);
    this.isEditingContent.set(true);
  }

  approveContent(content: ClassroomContent) {
    this.classroomFacade.approveContent(content.id);
  }

  regenerateContent(content: ClassroomContent) {
    this.classroomFacade.regenerateContent(content.id);
  }

  saveContent(updates: { title?: string; summary?: string; sections?: any[] }) {
    const content = this.editingContent();
    if (content) {
      this.classroomFacade.updateContent(content.id, updates);
    }
  }

  closeContentEditor() {
    this.isEditingContent.set(false);
    this.editingContent.set(null);
  }

  // Job actions
  cancelJob(jobId: string) {
    if (confirm('Are you sure you want to cancel this job?')) {
      this.classroomFacade.cancelJob(jobId);
    }
  }

  refreshJobs() {
    this.classroomFacade.loadJobs();
  }

  // Utility
  getStatusClass(status: string): string {
    switch (status) {
      case 'ready': return 'status-ready';
      case 'generating': return 'status-generating';
      case 'pending': return 'status-pending';
      case 'error': return 'status-error';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ready': return 'check_circle';
      case 'generating': return 'sync';
      case 'pending': return 'hourglass_empty';
      case 'error': return 'error';
      default: return 'help';
    }
  }

  trackByContentId(index: number, content: ClassroomContent): string {
    return content.id;
  }

  trackByPathId(index: number, path: LearningPath): string {
    return path.id;
  }
}
