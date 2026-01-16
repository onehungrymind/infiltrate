import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  KnowledgeUnit,
  LearningPath,
  MasteryLevel,
  UserProgress
} from '@kasita/common-models';
import { LearningMapService } from '@kasita/core-data';
import {
  KnowledgeUnitFacade,
  LearningPathsFacade,
  UserProgressFacade
} from '@kasita/core-state';
import { combineLatest } from 'rxjs';

interface SourceInfo {
  id: string;
  name: string;
  type: string;
  url: string;
}

interface PhaseStatus {
  status: 'Complete' | 'In Progress' | 'Active' | 'Locked';
  unlocked: boolean;
  progress?: number;
  unlockThreshold?: number;
  unitsRemaining?: number;
  aiRecommendation?: string;
}

interface ConsumeStats {
  totalUnits: number;
  masteredUnits: number;
  dueToday: number;
}

interface DueUnit {
  id: string;
  concept: string;
  question: string;
  masteryLevel: MasteryLevel;
  nextReview: string;
  priority: 'high' | 'normal' | 'low';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private learningPathsFacade = inject(LearningPathsFacade);
  private knowledgeUnitsFacade = inject(KnowledgeUnitFacade);
  private userProgressFacade = inject(UserProgressFacade);
  private learningMapService = inject(LearningMapService);
  private router = inject(Router);

  // Observables
  learningPaths$ = this.learningPathsFacade.allLearningPaths$;
  knowledgeUnits$ = this.knowledgeUnitsFacade.allKnowledgeUnits$;
  userProgress$ = this.userProgressFacade.allUserProgress$;

  // Current path - use first learning path or null
  currentPath = signal<LearningPath | null>(null);
  overallProgress = signal(0);

  // Phase statuses
  outcomePhase = signal<PhaseStatus>({
    status: 'Complete',
    unlocked: true
  });

  inputPhase = signal<PhaseStatus>({
    status: 'In Progress',
    unlocked: true,
    aiRecommendation: "Based on your goal, I've identified sources that will give you comprehensive coverage."
  });

  consumePhase = signal<PhaseStatus>({
    status: 'Active',
    unlocked: true
  });

  demonstratePhase = signal<PhaseStatus>({
    status: 'Locked',
    unlocked: false,
    progress: 0,
    unlockThreshold: 80,
    unitsRemaining: 0
  });

  outputPhase = signal<PhaseStatus>({
    status: 'Locked',
    unlocked: false
  });

  transferPhase = signal<PhaseStatus>({
    status: 'Locked',
    unlocked: false
  });

  // Computed data
  sources = signal<SourceInfo[]>([]);
  ingestedCount = signal(0);
  canSynthesize = signal(false);
  consumeStats = signal<ConsumeStats>({
    totalUnits: 0,
    masteredUnits: 0,
    dueToday: 0
  });
  dueUnits = signal<DueUnit[]>([]);

  ngOnInit(): void {
    // Load all data
    this.learningPathsFacade.loadLearningPaths();
    this.knowledgeUnitsFacade.loadKnowledgeUnits();
    this.userProgressFacade.loadUserProgress();

    // Set current path (first learning path) and load its sources
    this.learningPaths$.subscribe(paths => {
      if (paths && paths.length > 0) {
        this.currentPath.set(paths[0]);
        this.calculateOverallProgress(paths[0]);
        this.loadSourcesForPath(paths[0].id);
      }
    });

    // Calculate consume stats
    combineLatest([this.knowledgeUnits$, this.userProgress$]).subscribe(
      ([units, progress]) => {
        const path = this.currentPath();
        if (path) {
          const pathUnits = units.filter((u: KnowledgeUnit) => u.pathId === path.id);
          const pathProgress = progress.filter((p: UserProgress) => 
            pathUnits.some((u: KnowledgeUnit) => u.id === p.unitId)
          );
          
          const totalUnits = pathUnits.length;
          const masteredUnits = pathProgress.filter((p: UserProgress) => p.masteryLevel === 'mastered').length;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueToday = pathProgress.filter((p: UserProgress) => {
            const nextReview = new Date(p.nextReviewDate);
            nextReview.setHours(0, 0, 0, 0);
            return nextReview <= today;
          }).length;

          this.consumeStats.set({
            totalUnits,
            masteredUnits,
            dueToday
          });

          // Calculate due units
          const dueUnitsList: DueUnit[] = pathProgress
            .filter((p: UserProgress) => {
              const nextReview = new Date(p.nextReviewDate);
              nextReview.setHours(0, 0, 0, 0);
              return nextReview <= today;
            })
            .slice(0, 5)
            .map((p: UserProgress) => {
              const unit = pathUnits.find((u: KnowledgeUnit) => u.id === p.unitId);
              if (!unit) return null;
              
              const nextReview = new Date(p.nextReviewDate);
              const isToday = nextReview.toDateString() === today.toDateString();
              
              return {
                id: unit.id,
                concept: unit.concept,
                question: unit.question,
                masteryLevel: p.masteryLevel,
                nextReview: isToday ? 'Today' : nextReview.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                priority: isToday ? 'high' : 'normal'
              };
            })
            .filter((u): u is DueUnit => u !== null);

          this.dueUnits.set(dueUnitsList);

          // Update demonstrate phase progress
          const progressPercent = totalUnits > 0 ? Math.round((masteredUnits / totalUnits) * 100) : 0;
          const unitsRemaining = Math.ceil((80 - progressPercent) / 100 * totalUnits);
          this.demonstratePhase.update(phase => ({
            ...phase,
            progress: progressPercent,
            unitsRemaining: Math.max(0, unitsRemaining)
          }));
        }
      }
    );
  }

  private calculateOverallProgress(path: LearningPath): void {
    // Simple calculation based on status
    let progress = 0;
    if (path.status === 'completed') {
      progress = 100;
    } else if (path.status === 'in-progress') {
      progress = 50;
    } else {
      progress = 0;
    }
    this.overallProgress.set(progress);
  }

  private loadSourcesForPath(pathId: string): void {
    this.learningMapService.getSourcesForPath(pathId).subscribe(sources => {
      this.sources.set(sources.map(s => ({ id: s.id, name: s.name, type: s.type, url: s.url })));
      this.ingestedCount.set(sources.length);
      this.canSynthesize.set(sources.length > 0);
    });
  }

  // Hero actions
  continueLearning(): void {
    this.router.navigate(['/knowledge-units']);
  }

  viewAllPaths(): void {
    this.router.navigate(['/learning-paths']);
  }

  // Outcome phase
  refineOutcome(): void {
    const path = this.currentPath();
    if (path) {
      this.router.navigate(['/learning-paths']);
    }
  }

  // Input phase
  viewSource(): void {
    this.router.navigate(['/source-configs']);
  }

  addSource(): void {
    this.router.navigate(['/source-configs']);
  }

  synthesize(): void {
    // TODO: Trigger synthesis process
    console.log('Start synthesis');
  }

  // Consume phase
  studyUnit(): void {
    this.router.navigate(['/knowledge-units']);
  }

  viewAllUnits(): void {
    this.router.navigate(['/knowledge-units']);
  }

  // Demonstrate phase
  startExercise(): void {
    // TODO: Navigate to exercise
    console.log('Start exercise');
  }

  // Output phase
  startProject(): void {
    // TODO: Navigate to project
    console.log('Start project');
  }

  // Transfer phase
  startTransferActivity(): void {
    // TODO: Navigate to transfer activity
    console.log('Start transfer activity');
  }

  // CTA
  startStudying(): void {
    this.router.navigate(['/knowledge-units']);
  }

  // Helper methods
  getSourceIconColor(type: string): string {
    switch (type) {
      case 'rss':
        return 'text-orange-500';
      case 'article':
        return 'text-green-500';
      case 'pdf':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }

  getPhaseStatusClass(status: string): string {
    switch (status) {
      case 'Complete':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'Locked':
        return 'bg-gray-100 text-gray-600 ring-gray-600/20';
      default:
        return 'bg-gray-100 text-gray-600 ring-gray-600/20';
    }
  }

  getUnitStatusClass(masteryLevel: string): string {
    switch (masteryLevel) {
      case 'mastered':
        return 'bg-green-100 text-green-700';
      case 'reviewing':
        return 'bg-emerald-100 text-emerald-700';
      case 'learning':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }
}
