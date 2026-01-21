/**
 * Linear Dashboard Page Component
 *
 * This component handles data fetching and transforms learning path data
 * into the format expected by the LinearDashboardComponent visualization.
 */

import { Component, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Concept, LearningPath, SubConcept } from '@kasita/common-models';
import { ConceptsFacade, LearningPathsFacade, SubConceptsFacade } from '@kasita/core-state';
import { LinearDashboardComponent, Section, Principle } from '@kasita/feature-linear-dashboard';
import { Subject, combineLatest } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-linear-dashboard-page',
  standalone: true,
  imports: [CommonModule, LinearDashboardComponent],
  template: `
    @if (!selectedPath() && !loading()) {
      <div class="select-path-container">
        <h2>Select a Learning Path</h2>
        <div class="path-list">
          @for (path of learningPaths(); track path.id) {
            <button class="path-button" (click)="selectPath(path.id)">
              <span class="path-name">{{ path.name }}</span>
              <span class="path-domain">{{ path.domain }}</span>
            </button>
          }
        </div>
      </div>
    } @else {
      <lib-linear-dashboard
        [pathName]="pathName()"
        [pathDescription]="pathDescription()"
        [sections]="sections()"
        [loading]="loading()"
      />
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .select-path-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px;
      min-height: 100vh;
      background-color: #131F24;
      color: #ffffff;
    }
    .select-path-container h2 {
      margin-bottom: 24px;
      font-size: 24px;
      font-weight: 700;
    }
    .path-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      max-width: 480px;
    }
    .path-button {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 16px 20px;
      background-color: #1a2a32;
      border: 2px solid #2a3a42;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .path-button:hover {
      border-color: #1cb0f6;
      transform: translateY(-2px);
    }
    .path-name {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
    }
    .path-domain {
      font-size: 13px;
      color: #acacac;
      margin-top: 4px;
    }
  `],
})
export class LinearDashboardPage implements OnInit, OnDestroy {
  private learningPathsFacade = inject(LearningPathsFacade);
  private conceptsFacade = inject(ConceptsFacade);
  private subConceptsFacade = inject(SubConceptsFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  loading = signal(true);
  learningPaths = signal<LearningPath[]>([]);
  selectedPath = signal<LearningPath | null>(null);
  sections = signal<Section[]>([]);

  pathName = computed(() => this.selectedPath()?.name || 'Learning Path');
  pathDescription = computed(() => {
    const path = this.selectedPath();
    return path?.targetSkill || path?.domain || 'Your learning journey';
  });

  ngOnInit(): void {
    // Load all learning paths
    this.learningPathsFacade.loadLearningPaths();

    // Subscribe to learning paths
    this.learningPathsFacade.allLearningPaths$
      .pipe(takeUntil(this.destroy$))
      .subscribe(paths => {
        this.learningPaths.set(paths);

        // Check for pathId from route query params
        const pathIdFromRoute = this.route.snapshot.queryParams['pathId'];

        if (pathIdFromRoute && paths.length > 0) {
          this.selectPath(pathIdFromRoute);
        } else if (paths.length > 0 && !this.selectedPath()) {
          this.loading.set(false);
        } else {
          this.loading.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectPath(pathId: string): void {
    const path = this.learningPaths().find(p => p.id === pathId);
    if (!path) return;

    this.selectedPath.set(path);
    this.loading.set(true);

    // Update URL with query param
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pathId },
      queryParamsHandling: 'merge',
    });

    // Load concepts for this path
    this.conceptsFacade.loadConceptsByPath(pathId);

    // Wait for concepts to load, then load sub-concepts
    this.conceptsFacade.selectConceptsByPath(pathId)
      .pipe(
        takeUntil(this.destroy$),
        filter(concepts => concepts.length > 0)
      )
      .subscribe(concepts => {
        // Load sub-concepts for each concept
        concepts.forEach(concept => {
          this.subConceptsFacade.loadSubConceptsByConcept(concept.id);
        });

        // Transform data when sub-concepts are loaded
        this.transformAndSetSections(path, concepts);
      });
  }

  private transformAndSetSections(path: LearningPath, concepts: Concept[]): void {
    // Subscribe to sub-concepts and transform data
    this.subConceptsFacade.allSubConcepts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(allSubConcepts => {
        const sections = this.transformToSections(concepts, allSubConcepts);
        this.sections.set(sections);
        this.loading.set(false);
      });
  }

  private transformToSections(concepts: Concept[], allSubConcepts: SubConcept[]): Section[] {
    // Sort concepts by order
    const sortedConcepts = [...concepts].sort((a, b) => a.order - b.order);

    return sortedConcepts.map((concept, index) => {
      // Get sub-concepts for this concept
      const subConcepts = allSubConcepts
        .filter(sc => sc.conceptId === concept.id)
        .sort((a, b) => a.order - b.order);

      // Map concept status to section status
      const sectionStatus = this.mapConceptStatus(concept.status, index, sortedConcepts);

      // Transform sub-concepts to principles
      const principles: Principle[] = subConcepts.map((sc, scIndex) => ({
        id: sc.id,
        name: sc.name,
        status: this.mapSubConceptStatus(sectionStatus, scIndex, subConcepts.length),
        xp: 50, // Default XP per sub-concept
        units: 1, // Each sub-concept = 1 unit for now
        currentUnit: undefined,
        isCapstone: false,
      }));

      // Calculate progress
      const completedPrinciples = principles.filter(p => p.status === 'completed').length;
      const progress = principles.length > 0
        ? Math.round((completedPrinciples / principles.length) * 100)
        : 0;

      // Calculate XP
      const xpPerPrinciple = 50;
      const xpTotal = principles.length * xpPerPrinciple;
      const xpEarned = completedPrinciples * xpPerPrinciple;

      return {
        id: concept.id,
        title: concept.name,
        description: concept.description || '',
        status: sectionStatus,
        progress,
        xpEarned,
        xpTotal,
        principles,
      };
    });
  }

  private mapConceptStatus(
    conceptStatus: string,
    index: number,
    allConcepts: Concept[]
  ): 'completed' | 'current' | 'available' | 'locked' {
    switch (conceptStatus) {
      case 'mastered':
        return 'completed';
      case 'in_progress':
        return 'current';
      case 'pending':
        // First pending concept after completed ones is "available"
        const previousConcept = index > 0 ? allConcepts[index - 1] : null;
        if (!previousConcept || previousConcept.status === 'mastered') {
          return 'available';
        }
        return 'locked';
      default:
        return 'available'; // Default to available for demo purposes
    }
  }

  private mapSubConceptStatus(
    sectionStatus: string,
    index: number,
    totalSubConcepts: number
  ): 'completed' | 'current' | 'available' | 'locked' {
    if (sectionStatus === 'completed') {
      return 'completed';
    }
    if (sectionStatus === 'locked') {
      return 'locked';
    }
    if (sectionStatus === 'current') {
      // First sub-concept is current, rest are available
      if (index === 0) return 'current';
      return 'available';
    }
    // Section is available - all sub-concepts are available
    return 'available';
  }
}
