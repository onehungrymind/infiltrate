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
  lastUpdated = signal('January 15, 2026');
  overallCompletion = signal(85);

  epics = signal<Epic[]>([
    { name: 'Epic 1: Learning Objective & Map Generation', progress: 70, status: 'mostly-complete', color: '#3b82f6' },
    { name: 'Epic 2: Content Sourcing & Ingestion', progress: 90, status: 'complete', color: '#22c55e' },
    { name: 'Epic 3: Content Synthesis & Knowledge Units', progress: 80, status: 'mostly-complete', color: '#3b82f6' },
    { name: 'Epic 4: Adaptive Content Presentation', progress: 75, status: 'mostly-complete', color: '#3b82f6' },
    { name: 'Epic 5: Feedback Loops', progress: 85, status: 'mostly-complete', color: '#3b82f6' },
    { name: 'Epic 6: Progress Tracking & Validation', progress: 60, status: 'partial', color: '#f59e0b' },
    { name: 'Epic 7: Input/Output Optionality', progress: 75, status: 'mostly-complete', color: '#3b82f6' },
  ]);

  criticalPathItems = signal<CriticalPathItem[]>([
    { name: 'SM-2 spaced repetition algorithm', status: 'complete', blocking: 'Progress tracking' },
    { name: 'Principle entity & CRUD', status: 'complete', blocking: 'Learning map structure' },
    { name: 'AI principle generation', status: 'complete', blocking: 'Core user flow' },
    { name: 'Quiz with SM-2 integration', status: 'complete', blocking: 'Learning variety' },
    { name: 'Challenge & Project entities', status: 'complete', blocking: 'Feedback loop' },
    { name: 'Submission system (text/URL/file)', status: 'complete', blocking: 'Feedback loop' },
    { name: 'AI feedback generation', status: 'complete', blocking: 'Feedback loop' },
    { name: 'Mentor feedback system', status: 'complete', blocking: 'Human review flow' },
    { name: 'React Flow learning map', status: 'complete', blocking: 'Visualization' },
    { name: 'Content ingestion pipeline', status: 'complete', blocking: 'Content acquisition' },
    { name: 'Knowledge unit synthesis', status: 'complete', blocking: 'Content processing' },
  ]);

  apiComponents = signal<ComponentStatus[]>([
    // Core CRUD
    { name: 'User CRUD + JWT Auth', status: 'complete' },
    { name: 'Learning Path CRUD', status: 'complete' },
    { name: 'Knowledge Unit CRUD', status: 'complete' },
    { name: 'Principle CRUD', status: 'complete' },
    { name: 'Challenge CRUD', status: 'complete' },
    { name: 'Project CRUD', status: 'complete' },
    { name: 'Submission CRUD', status: 'complete' },
    { name: 'Feedback CRUD', status: 'complete' },
    { name: 'User Progress CRUD', status: 'complete' },
    { name: 'Raw Content CRUD', status: 'complete' },
    // Source management
    { name: 'Sources (many-to-many)', status: 'complete' },
    { name: 'Source Path Links', status: 'complete' },
    // Learning map
    { name: 'Learning map endpoints', status: 'complete' },
    { name: 'Node status tracking (partial)', status: 'placeholder' },
    // AI features
    { name: 'AI principle generation', status: 'complete' },
    { name: 'AI source suggestions', status: 'complete' },
    { name: 'AI feedback generation', status: 'complete' },
    // Ingestion & synthesis
    { name: 'Ingestion trigger endpoint', status: 'complete' },
    { name: 'Synthesis trigger endpoint', status: 'complete' },
    { name: 'Knowledge graph generation', status: 'complete' },
    // Submissions
    { name: 'File upload (Multer)', status: 'complete' },
    { name: 'URL metadata extraction', status: 'complete' },
    { name: 'Submit for review flow', status: 'complete' },
    // Mentor system
    { name: 'Mentor assignment', status: 'complete' },
    { name: 'Mentor submissions query', status: 'complete' },
    { name: 'Mentor feedback submission', status: 'complete' },
    // SM-2
    { name: 'SM-2 record attempt', status: 'complete' },
    { name: 'SM-2 due for review', status: 'complete' },
    { name: 'SM-2 study stats', status: 'complete' },
  ]);

  dashboardComponents = signal<ComponentStatus[]>([
    // Auth & navigation
    { name: 'Login/auth flow', status: 'complete' },
    { name: 'Sidebar navigation', status: 'complete' },
    { name: 'Home dashboard', status: 'complete' },
    // Core CRUD pages
    { name: 'Users management', status: 'complete' },
    { name: 'Learning Paths CRUD', status: 'complete' },
    { name: 'Knowledge Units CRUD', status: 'complete' },
    { name: 'Principles CRUD', status: 'complete' },
    { name: 'Challenges CRUD', status: 'complete' },
    { name: 'Projects CRUD', status: 'complete' },
    { name: 'Submissions CRUD', status: 'complete' },
    { name: 'Raw Content CRUD', status: 'complete' },
    { name: 'Sources CRUD', status: 'complete' },
    { name: 'User Progress CRUD', status: 'complete' },
    // Filters
    { name: 'Learning Path filter (Principles)', status: 'complete' },
    { name: 'Learning Path filter (Knowledge Units)', status: 'complete' },
    { name: 'Search/filter bar component', status: 'complete' },
    // Learning map & visualization
    { name: 'React Flow learning map', status: 'complete' },
    { name: 'Knowledge graph visualization', status: 'complete' },
    { name: 'Cytoscape graph view', status: 'complete' },
    // Study features
    { name: 'Study Flashcards (SM-2)', status: 'complete' },
    { name: 'Study Quiz (SM-2)', status: 'complete' },
    // AI features
    { name: 'AI principle generation UI', status: 'complete' },
    { name: 'AI source suggestions UI', status: 'complete' },
    { name: 'AI feedback request UI', status: 'complete' },
    // Pipeline triggers
    { name: 'Ingestion trigger button', status: 'complete' },
    { name: 'Synthesis trigger button', status: 'complete' },
    // Submission features
    { name: 'Content type selector', status: 'complete' },
    { name: 'File upload dropzone', status: 'complete' },
    { name: 'URL metadata fetcher', status: 'complete' },
    { name: 'Challenge/Project selector', status: 'complete' },
    { name: 'Feedback display', status: 'complete' },
    { name: 'Grade badge display', status: 'complete' },
    // Mentor system
    { name: 'Mentor Dashboard', status: 'complete' },
    { name: 'Mentor assignment selector', status: 'complete' },
    { name: 'Mentor review form', status: 'complete' },
    // Other
    { name: 'Completion Assessment', status: 'complete' },
    { name: 'Marimo notebook viewer', status: 'complete' },
    // Not started
    { name: 'Learning path wizard (multi-step)', status: 'not-started' },
    { name: 'KU approval workflow UI', status: 'not-started' },
    { name: 'Home nav actions (partial TODOs)', status: 'placeholder' },
  ]);

  patchbayComponents = signal<ComponentStatus[]>([
    { name: 'RSS/Atom adapter', status: 'complete' },
    { name: 'Article adapter (Trafilatura)', status: 'complete' },
    { name: 'PDF adapter (PyPDF2)', status: 'complete' },
    { name: 'JavaScript Weekly adapter', status: 'complete' },
    { name: 'API integration', status: 'complete' },
    { name: 'Adapter pattern architecture', status: 'complete' },
    { name: 'YouTube adapter', status: 'not-started' },
    { name: 'Podcast adapter', status: 'not-started' },
    { name: 'Newsletter (IMAP) adapter', status: 'not-started' },
  ]);

  synthesizerComponents = signal<ComponentStatus[]>([
    { name: 'Embeddings processor', status: 'complete' },
    { name: 'Clustering processor', status: 'complete' },
    { name: 'Knowledge unit generator', status: 'complete' },
    { name: 'API integration', status: 'complete' },
    { name: 'Pipeline orchestrator', status: 'complete' },
    { name: 'Claude AI integration', status: 'complete' },
  ]);

  learningApps = signal<ComponentStatus[]>([
    { name: 'Infiltrate (Gamified Flashcards)', status: 'complete' },
    { name: 'Study Flashcards (SM-2)', status: 'complete' },
    { name: 'Study Quiz (SM-2)', status: 'complete' },
    { name: 'Challenge Arena', status: 'not-started' },
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
