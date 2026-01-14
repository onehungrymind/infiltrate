import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Epic {
  name: string;
  progress: number;
  status: 'partial' | 'mostly-complete' | 'early-stage' | 'complete';
  color: string;
}

interface ComponentStatus {
  name: string;
  status: 'complete' | 'not-started' | 'placeholder';
}

interface CriticalPathItem {
  name: string;
  status: 'complete' | 'not-started';
  blocking: string;
}

@Component({
  selector: 'app-completion-assessment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './completion-assessment.html',
  styleUrl: './completion-assessment.scss',
})
export class CompletionAssessment {
  lastUpdated = signal('January 14, 2026');
  overallCompletion = signal(62);

  epics = signal<Epic[]>([
    { name: 'Epic 1: Learning Objective & Map Generation', progress: 60, status: 'mostly-complete', color: '#3b82f6' },
    { name: 'Epic 2: Content Sourcing & Ingestion', progress: 70, status: 'mostly-complete', color: '#3b82f6' },
    { name: 'Epic 3: Content Synthesis & Knowledge Units', progress: 65, status: 'mostly-complete', color: '#3b82f6' },
    { name: 'Epic 4: Adaptive Content Presentation', progress: 50, status: 'partial', color: '#f59e0b' },
    { name: 'Epic 5: Feedback Loops', progress: 15, status: 'early-stage', color: '#ef4444' },
    { name: 'Epic 6: Progress Tracking & Validation', progress: 50, status: 'partial', color: '#f59e0b' },
    { name: 'Epic 7: Input/Output Optionality', progress: 60, status: 'mostly-complete', color: '#3b82f6' },
  ]);

  criticalPathItems = signal<CriticalPathItem[]>([
    { name: 'SM-2 spaced repetition algorithm', status: 'complete', blocking: 'Progress tracking' },
    { name: 'Principle entity', status: 'complete', blocking: 'Learning map structure' },
    { name: 'AI learning map generation', status: 'complete', blocking: 'Core user flow' },
    { name: 'Quiz Runner', status: 'complete', blocking: 'Learning variety' },
    { name: 'Challenge submission system', status: 'not-started', blocking: 'Feedback loop' },
    { name: 'Flashcard-API integration', status: 'complete', blocking: 'Progress tracking' },
  ]);

  apiComponents = signal<ComponentStatus[]>([
    { name: 'User CRUD', status: 'complete' },
    { name: 'Learning Path CRUD', status: 'complete' },
    { name: 'Knowledge Unit CRUD', status: 'complete' },
    { name: 'Source Config CRUD', status: 'complete' },
    { name: 'Raw Content CRUD', status: 'complete' },
    { name: 'User Progress CRUD', status: 'complete' },
    { name: 'JWT Authentication', status: 'complete' },
    { name: 'Ingestion endpoints', status: 'complete' },
    { name: 'Knowledge Graph generation', status: 'complete' },
    { name: 'SM-2 algorithm', status: 'complete' },
    { name: 'Principle CRUD', status: 'complete' },
    { name: 'Submission CRUD', status: 'not-started' },
    { name: 'Feedback CRUD', status: 'not-started' },
    { name: 'AI map generation', status: 'complete' },
  ]);

  dashboardComponents = signal<ComponentStatus[]>([
    { name: 'User management', status: 'complete' },
    { name: 'Learning paths CRUD', status: 'complete' },
    { name: 'Principles CRUD', status: 'complete' },
    { name: 'Knowledge units CRUD', status: 'complete' },
    { name: 'Source configs CRUD', status: 'complete' },
    { name: 'Raw content CRUD', status: 'complete' },
    { name: 'User progress CRUD', status: 'complete' },
    { name: 'React Flow learning map', status: 'complete' },
    { name: 'Home dashboard', status: 'complete' },
    { name: 'Login/auth', status: 'complete' },
    { name: 'Completion Assessment', status: 'complete' },
    { name: 'Approval workflow UI', status: 'not-started' },
    { name: 'Ingestion trigger button', status: 'not-started' },
    { name: 'Synthesis trigger button', status: 'not-started' },
    { name: 'Learning path wizard', status: 'not-started' },
    { name: 'AI principle generation button', status: 'complete' },
  ]);

  patchbayComponents = signal<ComponentStatus[]>([
    { name: 'RSS adapter', status: 'complete' },
    { name: 'Article adapter', status: 'complete' },
    { name: 'PDF adapter', status: 'complete' },
    { name: 'JavaScript Weekly adapter', status: 'complete' },
    { name: 'API integration', status: 'complete' },
    { name: 'YouTube adapter', status: 'not-started' },
    { name: 'Podcast adapter', status: 'not-started' },
    { name: 'Newsletter (IMAP) adapter', status: 'placeholder' },
  ]);

  synthesizerComponents = signal<ComponentStatus[]>([
    { name: 'Embeddings processor', status: 'complete' },
    { name: 'Clustering processor', status: 'complete' },
    { name: 'Knowledge unit generator', status: 'complete' },
    { name: 'API integration', status: 'complete' },
    { name: 'Pipeline orchestrator', status: 'complete' },
  ]);

  learningApps = signal<ComponentStatus[]>([
    { name: 'Infiltrate (Flashcards)', status: 'complete' },
    { name: 'Study Flashcards (Dashboard)', status: 'complete' },
    { name: 'Study Quiz (Dashboard)', status: 'complete' },
    { name: 'Challenge Arena', status: 'placeholder' },
  ]);

  // Computed stats
  completedCriticalItems = computed(() =>
    this.criticalPathItems().filter(item => item.status === 'complete').length
  );

  totalCriticalItems = computed(() => this.criticalPathItems().length);

  apiCompletionRate = computed(() => {
    const items = this.apiComponents();
    const complete = items.filter(i => i.status === 'complete').length;
    return Math.round((complete / items.length) * 100);
  });

  dashboardCompletionRate = computed(() => {
    const items = this.dashboardComponents();
    const complete = items.filter(i => i.status === 'complete').length;
    return Math.round((complete / items.length) * 100);
  });

  patchbayCompletionRate = computed(() => {
    const items = this.patchbayComponents();
    const complete = items.filter(i => i.status === 'complete').length;
    return Math.round((complete / items.length) * 100);
  });

  synthesizerCompletionRate = computed(() => {
    const items = this.synthesizerComponents();
    const complete = items.filter(i => i.status === 'complete').length;
    return Math.round((complete / items.length) * 100);
  });

  learningAppsCompletionRate = computed(() => {
    const items = this.learningApps();
    const complete = items.filter(i => i.status === 'complete').length;
    return Math.round((complete / items.length) * 100);
  });

  getStatusClass(status: 'complete' | 'not-started' | 'placeholder'): string {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-700';
      case 'not-started':
        return 'bg-red-100 text-red-700';
      case 'placeholder':
        return 'bg-yellow-100 text-yellow-700';
    }
  }

  getStatusIcon(status: 'complete' | 'not-started' | 'placeholder'): string {
    switch (status) {
      case 'complete':
        return '✓';
      case 'not-started':
        return '○';
      case 'placeholder':
        return '◐';
    }
  }

  getEpicStatusClass(status: Epic['status']): string {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-700';
      case 'mostly-complete':
        return 'bg-blue-100 text-blue-700';
      case 'partial':
        return 'bg-yellow-100 text-yellow-700';
      case 'early-stage':
        return 'bg-red-100 text-red-700';
    }
  }

  getEpicStatusLabel(status: Epic['status']): string {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'mostly-complete':
        return 'Mostly Complete';
      case 'partial':
        return 'Partial';
      case 'early-stage':
        return 'Early Stage';
    }
  }
}
