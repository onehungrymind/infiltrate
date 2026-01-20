import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

interface AreaStatus {
  name: string;
  progress: number;
  status: 'strong' | 'partial' | 'critical-gap';
  color: string;
}

interface CriticalGap {
  name: string;
  progress: number;
  problem: string;
  currentState: string[];
  missingItems: string[];
}

interface ComponentStatus {
  name: string;
  status: 'complete' | 'not-started' | 'missing';
}

interface PriorityItem {
  priority: 'P0' | 'P1' | 'P2';
  name: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'complete';
}

@Component({
  selector: 'lib-completion-assessment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './completion-assessment.component.html',
  styleUrl: './completion-assessment.component.scss',
})
export class CompletionAssessment {
  lastUpdated = signal('January 19, 2026');
  overallCompletion = signal(55);

  // Executive summary
  whatWeHave = signal([
    'Full CRUD for all entities (Learning Paths, Principles, KUs, Challenges, Projects, etc.)',
    'AI-powered content generation (principles, sources, feedback, gymnasium sessions)',
    'Content pipeline (ingest → synthesize → knowledge units)',
    'Study tools (flashcards, quizzes with SM-2)',
    'Multiple visualizations (React Flow, Skill Tree, Metro Maps, Mind Map, etc.)',
    'Mentor feedback system',
  ]);

  whatsMissing = signal([
    'Knowledge Architecture: No semantic link between KUs and Principles',
    'Curriculum Structure: No way to sequence content or define prerequisites',
    'Learner Experience: No guided learning UI - only admin CRUD screens',
    'Progress Rollup: SM-2 tracks items, not curriculum completion',
    'Mastery Model: No way to prove competency or gate progress',
    'Quality Control: No KU approval workflow',
  ]);

  // Area status
  areaStatus = signal<AreaStatus[]>([
    { name: 'Content Components', progress: 85, status: 'strong', color: '#22c55e' },
    { name: 'Admin/Authoring Tools', progress: 90, status: 'strong', color: '#22c55e' },
    { name: 'AI Integration', progress: 85, status: 'strong', color: '#22c55e' },
    { name: 'Knowledge Architecture', progress: 15, status: 'critical-gap', color: '#ef4444' },
    { name: 'Curriculum Design', progress: 10, status: 'critical-gap', color: '#ef4444' },
    { name: 'Learner Experience', progress: 20, status: 'critical-gap', color: '#ef4444' },
    { name: 'Progress & Mastery', progress: 30, status: 'partial', color: '#f59e0b' },
    { name: 'Content Quality Control', progress: 25, status: 'partial', color: '#f59e0b' },
  ]);

  // Critical gaps
  criticalGaps = signal<CriticalGap[]>([
    {
      name: 'Knowledge Architecture',
      progress: 15,
      problem: 'KUs and Principles exist in parallel, not hierarchically. No semantic link.',
      currentState: ['KU entity with CRUD', 'Principle entity with CRUD', 'Both linked to Learning Path'],
      missingItems: ['KU → Principle mapping', 'Principle → KU requirements', 'Coverage visibility'],
    },
    {
      name: 'Curriculum Design & Sequencing',
      progress: 10,
      problem: 'Visualizations are read-only displays. No way to author curriculum with sequencing.',
      currentState: ['Multiple visualization components', 'Learning Path entity', 'Principle ordering'],
      missingItems: ['Prerequisite relationships', 'Module grouping', 'Sequencing rules', 'Curriculum builder UI'],
    },
    {
      name: 'Learner Experience',
      progress: 20,
      problem: 'Dashboard is admin-focused. No dedicated learner interface.',
      currentState: ['Study Flashcards page', 'Study Quiz page', 'Gymnasium sessions', 'Basic home stats'],
      missingItems: ['My Learning dashboard', 'Guided learning flow', 'Curriculum progress view', 'Next up recommendations'],
    },
    {
      name: 'Progress & Mastery Model',
      progress: 30,
      problem: 'SM-2 tracks item recall. No rollup to principle/curriculum mastery.',
      currentState: ['UserProgress entity with SM-2', 'Item-level tracking', 'Basic stats'],
      missingItems: ['Principle mastery calculation', 'Module completion', 'Curriculum progress %', 'Mastery thresholds'],
    },
    {
      name: 'Content Quality Control',
      progress: 25,
      problem: 'KUs are AI-generated with no review gate.',
      currentState: ['KU status field exists', 'KU CRUD with editing'],
      missingItems: ['KU approval workflow UI', 'Review queue', 'Reject/revise flow', 'Coverage report'],
    },
    {
      name: 'Schedule & Deadline Integration',
      progress: 5,
      problem: 'No way to assign dates to curriculum items.',
      currentState: ['Calendar component exists', 'targetDate field on Learning Path'],
      missingItems: ['Module/principle deadlines', 'Schedule view', 'Deadline warnings', 'Pace tracking'],
    },
    {
      name: 'Assessment & Competency',
      progress: 20,
      problem: 'No way to prove mastery. Challenges not tied to principles.',
      currentState: ['Challenge/Project entities', 'Submission system', 'AI/mentor feedback', 'Grading'],
      missingItems: ['Challenge → Principle mapping', 'Mastery gates', 'Competency portfolio', 'Certificates'],
    },
  ]);

  // Functional components
  functionalComponents = signal<ComponentStatus[]>([
    { name: 'Entity CRUD (all)', status: 'complete' },
    { name: 'JWT Authentication', status: 'complete' },
    { name: 'Content Ingestion Pipeline', status: 'complete' },
    { name: 'Knowledge Unit Synthesis', status: 'complete' },
    { name: 'AI Principle Generation', status: 'complete' },
    { name: 'AI Source Suggestions', status: 'complete' },
    { name: 'AI Feedback Generation', status: 'complete' },
    { name: 'AI Session Generation', status: 'complete' },
    { name: 'SM-2 Algorithm', status: 'complete' },
    { name: 'Study Flashcards', status: 'complete' },
    { name: 'Study Quiz', status: 'complete' },
    { name: 'Submission System', status: 'complete' },
    { name: 'Mentor Dashboard', status: 'complete' },
    { name: 'Visualizations (6 types)', status: 'complete' },
    { name: 'User Enrollments', status: 'complete' },
    { name: 'Pipeline Orchestrator', status: 'complete' },
  ]);

  // Missing integration layer
  missingIntegration = signal<ComponentStatus[]>([
    { name: 'KU → Principle Mapping', status: 'missing' },
    { name: 'Curriculum Builder', status: 'missing' },
    { name: 'Prerequisite System', status: 'missing' },
    { name: 'Learner Dashboard', status: 'missing' },
    { name: 'Progress Rollup', status: 'missing' },
    { name: 'Mastery Gates', status: 'missing' },
    { name: 'KU Approval Workflow', status: 'missing' },
    { name: 'Schedule Integration', status: 'missing' },
    { name: 'Competency Proof', status: 'missing' },
  ]);

  // Priority roadmap
  priorityRoadmap = signal<PriorityItem[]>([
    { priority: 'P0', name: 'KU → Principle Mapping', description: 'Add relationship and basic mapping UI', status: 'not-started' },
    { priority: 'P0', name: 'Learner Dashboard (MVP)', description: 'Show enrolled paths and principles with KUs', status: 'not-started' },
    { priority: 'P0', name: 'Basic Progress Rollup', description: 'Calculate principle mastery from KU progress', status: 'not-started' },
    { priority: 'P1', name: 'Curriculum Sequencing', description: 'Prerequisites field and ordering UI', status: 'not-started' },
    { priority: 'P1', name: 'KU Approval Workflow', description: 'Review queue with approve/reject', status: 'not-started' },
    { priority: 'P1', name: 'Challenge → Principle Mapping', description: 'Link challenges to principles they assess', status: 'not-started' },
    { priority: 'P2', name: 'Schedule Integration', description: 'Deadlines and pace tracking', status: 'not-started' },
    { priority: 'P2', name: 'Portfolio & Certificates', description: 'Export work and generate credentials', status: 'not-started' },
    { priority: 'P2', name: 'Cohort Management', description: 'Group enrollments and class progress', status: 'not-started' },
  ]);

  // Computed stats
  strongAreas = computed(() =>
    this.areaStatus().filter(a => a.status === 'strong').length
  );

  criticalGapCount = computed(() =>
    this.areaStatus().filter(a => a.status === 'critical-gap').length
  );

  functionalCount = computed(() =>
    this.functionalComponents().filter(c => c.status === 'complete').length
  );

  missingCount = computed(() =>
    this.missingIntegration().filter(c => c.status === 'missing').length
  );

  p0Items = computed(() =>
    this.priorityRoadmap().filter(p => p.priority === 'P0')
  );

  p1Items = computed(() =>
    this.priorityRoadmap().filter(p => p.priority === 'P1')
  );

  p2Items = computed(() =>
    this.priorityRoadmap().filter(p => p.priority === 'P2')
  );

  getAreaStatusClass(status: AreaStatus['status']): string {
    switch (status) {
      case 'strong':
        return 'bg-green-100 text-green-700';
      case 'partial':
        return 'bg-yellow-100 text-yellow-700';
      case 'critical-gap':
        return 'bg-red-100 text-red-700';
    }
  }

  getAreaStatusLabel(status: AreaStatus['status']): string {
    switch (status) {
      case 'strong':
        return 'Strong';
      case 'partial':
        return 'Partial';
      case 'critical-gap':
        return 'Critical Gap';
    }
  }

  getStatusClass(status: ComponentStatus['status']): string {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-700';
      case 'not-started':
        return 'bg-gray-100 text-gray-700';
      case 'missing':
        return 'bg-red-100 text-red-700';
    }
  }

  getStatusIcon(status: ComponentStatus['status']): string {
    switch (status) {
      case 'complete':
        return '✓';
      case 'not-started':
        return '○';
      case 'missing':
        return '✗';
    }
  }

  getPriorityClass(priority: PriorityItem['priority']): string {
    switch (priority) {
      case 'P0':
        return 'bg-red-100 text-red-700';
      case 'P1':
        return 'bg-yellow-100 text-yellow-700';
      case 'P2':
        return 'bg-blue-100 text-blue-700';
    }
  }
}
