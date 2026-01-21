/**
 * Metro Maps Page Component
 *
 * This component handles data fetching and transforms learning path data
 * into the format expected by the MetroMapsComponent visualization.
 * It maps concepts to three difficulty tiers (Basicburgh, Intermetropolis, Advancedonia).
 */

import { Component, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Concept, LearningPath, SubConcept } from '@kasita/common-models';
import { ConceptsFacade, LearningPathsFacade, SubConceptsFacade } from '@kasita/core-state';
import { MetroMapsComponent, MetroCityData, MetroBranch, MetroStation } from '@kasita/feature-metro-maps';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-metro-maps-page',
  standalone: true,
  imports: [CommonModule, MetroMapsComponent],
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
      <lib-metro-maps
        [pathName]="pathName()"
        [cities]="cities()"
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
      background-color: #0A0A0A;
      color: #E5E5E5;
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
      background-color: #1A1A1A;
      border: 2px solid #3A3A3A;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .path-button:hover {
      border-color: #E63946;
      transform: translateY(-2px);
    }
    .path-name {
      font-size: 16px;
      font-weight: 600;
      color: #E5E5E5;
    }
    .path-domain {
      font-size: 13px;
      color: #6A6A6A;
      margin-top: 4px;
    }
  `],
})
export class MetroMapsPage implements OnInit, OnDestroy {
  private learningPathsFacade = inject(LearningPathsFacade);
  private conceptsFacade = inject(ConceptsFacade);
  private subConceptsFacade = inject(SubConceptsFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  loading = signal(true);
  learningPaths = signal<LearningPath[]>([]);
  selectedPath = signal<LearningPath | null>(null);
  cities = signal<MetroCityData[]>([]);

  pathName = computed(() => {
    const path = this.selectedPath();
    return path ? `${path.name} Transit System` : 'Transit System';
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

    // Load ALL sub-concepts (avoids exhaustMap issue with per-concept loading)
    this.subConceptsFacade.loadSubConcepts();

    // Wait for concepts to load
    this.conceptsFacade.selectConceptsByPath(pathId)
      .pipe(
        takeUntil(this.destroy$),
        filter(concepts => concepts.length > 0)
      )
      .subscribe(concepts => {
        // Transform data - sub-concepts are already loading
        this.transformAndSetData(concepts);
      });
  }

  private transformAndSetData(concepts: Concept[]): void {
    // Subscribe to sub-concepts - render immediately and update as more load
    this.subConceptsFacade.allSubConcepts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(allSubConcepts => {
        const cities = this.transformToCities(concepts, allSubConcepts);
        this.cities.set(cities);
        this.loading.set(false);
      });
  }

  private transformToCities(concepts: Concept[], allSubConcepts: SubConcept[]): MetroCityData[] {
    // Sort concepts by order
    const sortedConcepts = [...concepts].sort((a, b) => a.order - b.order);
    const totalConcepts = sortedConcepts.length;

    // Split concepts into three tiers
    const tierSize = Math.ceil(totalConcepts / 3);
    const fundamentalsConcepts = sortedConcepts.slice(0, tierSize);
    const intermediateConcepts = sortedConcepts.slice(tierSize, tierSize * 2);
    const advancedConcepts = sortedConcepts.slice(tierSize * 2);

    // Calculate progress for each tier
    const calculateTierProgress = (tierConcepts: Concept[]) => {
      if (tierConcepts.length === 0) return { progress: 0, status: 'locked' as const };

      const masteredCount = tierConcepts.filter(c => c.status === 'mastered').length;
      const inProgressCount = tierConcepts.filter(c => c.status === 'in_progress').length;
      const progress = Math.round((masteredCount / tierConcepts.length) * 100);

      let status: 'locked' | 'in-progress' | 'completed' = 'locked';
      if (masteredCount === tierConcepts.length) {
        status = 'completed';
      } else if (masteredCount > 0 || inProgressCount > 0) {
        status = 'in-progress';
      } else if (tierConcepts.some(c => c.status === 'pending')) {
        // Check if previous tier is complete or in-progress
        status = 'in-progress';
      }

      return { progress, status };
    };

    // Calculate sub-concept counts for each tier
    const countSubConcepts = (tierConcepts: Concept[]) => {
      return allSubConcepts.filter(sc =>
        tierConcepts.some(c => c.id === sc.conceptId)
      ).length;
    };

    // Generate branch color based on index
    const generateBranchColor = (baseColor: string, index: number, total: number): string => {
      // Create variations of the base color
      const colors = [baseColor];
      // Add lighter/darker variations
      if (total > 1) {
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);
        // Lighter variation
        const lighter = `#${Math.min(255, r + 40).toString(16).padStart(2, '0')}${Math.min(255, g + 40).toString(16).padStart(2, '0')}${Math.min(255, b + 40).toString(16).padStart(2, '0')}`;
        // Darker variation
        const darker = `#${Math.max(0, r - 30).toString(16).padStart(2, '0')}${Math.max(0, g - 30).toString(16).padStart(2, '0')}${Math.max(0, b - 30).toString(16).padStart(2, '0')}`;
        colors.push(lighter, darker);
      }
      return colors[index % colors.length];
    };

    // Transform concepts to stations - concepts ARE the stations, sub-concepts are the units
    const transformToBranchData = (tierConcepts: Concept[], tierColor: string): MetroBranch[] => {
      // Create a single branch containing all concepts as stations
      const stations: MetroStation[] = tierConcepts.map((concept, idx) => {
        // Count sub-concepts for this concept (these are the "units")
        const subConceptCount = allSubConcepts.filter(sc => sc.conceptId === concept.id).length;

        // For now, leave all stations as available (unlocked)
        const stationStatus: MetroStation['status'] = concept.status === 'mastered' ? 'completed' : 'available';

        return {
          id: concept.id,
          name: concept.name,
          description: concept.description || undefined,
          status: stationStatus,
          knowledgeUnits: subConceptCount, // Sub-concepts are the units
          estimatedMinutes: Math.round(concept.estimatedHours * 60) || 45,
          isTransfer: false,
          isCapstone: idx === tierConcepts.length - 1,
        };
      });

      // Return as a single branch for this tier
      return [{
        id: `tier-branch`,
        name: 'Main Line',
        color: tierColor,
        stations,
      }];
    };

    const fundamentalsStats = calculateTierProgress(fundamentalsConcepts);
    const intermediateStats = calculateTierProgress(intermediateConcepts);
    const advancedStats = calculateTierProgress(advancedConcepts);

    // Unlock logic: all tiers unlocked for now
    const fundamentalsStatus = 'in-progress';
    const intermediateStatus = 'in-progress';
    const advancedStatus = 'in-progress';

    return [
      {
        id: 'basicburgh',
        name: 'Basicburgh',
        subtitle: 'Fundamentals',
        color: '#E63946',
        stations: countSubConcepts(fundamentalsConcepts) || fundamentalsConcepts.length,
        branches: fundamentalsConcepts.length,
        status: fundamentalsStatus,
        progress: fundamentalsStats.progress,
        branchData: transformToBranchData(fundamentalsConcepts, '#E63946'),
      },
      {
        id: 'intermetropolis',
        name: 'Intermetropolis',
        subtitle: 'Intermediate',
        color: '#4361EE',
        stations: countSubConcepts(intermediateConcepts) || intermediateConcepts.length,
        branches: intermediateConcepts.length,
        status: intermediateStatus,
        progress: intermediateStats.progress,
        branchData: transformToBranchData(intermediateConcepts, '#4361EE'),
      },
      {
        id: 'advancedonia',
        name: 'Advancedonia',
        subtitle: 'Advanced',
        color: '#9D4EDD',
        stations: countSubConcepts(advancedConcepts) || advancedConcepts.length,
        branches: advancedConcepts.length,
        status: advancedStatus,
        progress: advancedStats.progress,
        branchData: transformToBranchData(advancedConcepts, '#9D4EDD'),
      },
    ];
  }
}
