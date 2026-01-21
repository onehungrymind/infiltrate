/**
 * Skill Tree Page Component
 *
 * This component handles data fetching and transforms learning path data
 * into the format expected by the SkillTreeComponent visualization.
 * It maps concepts and sub-concepts to a tree structure with calculated positions.
 */

import { Component, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Concept, LearningPath, SubConcept } from '@kasita/common-models';
import { ConceptsFacade, LearningPathsFacade, SubConceptsFacade } from '@kasita/core-state';
import { SkillTreeComponent, SkillNode } from '@kasita/feature-skill-tree';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

// Category assignments based on concept difficulty
const CATEGORIES = ['foundations', 'intermediate', 'advanced'];

// Generic icon mappings for different categories
const ICONS_BY_CATEGORY = {
  foundations: ['book', 'lightbulb', 'concept', 'lesson', 'target', 'star', 'puzzle', 'module'],
  intermediate: ['layers', 'code', 'brain', 'checkpoint', 'compass', 'rocket', 'module', 'concept'],
  advanced: ['trophy', 'star', 'rocket', 'brain', 'target', 'compass', 'layers', 'checkpoint'],
};

@Component({
  selector: 'app-skill-tree-page',
  standalone: true,
  imports: [CommonModule, SkillTreeComponent],
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
      <lib-skill-tree
        [pathName]="pathName()"
        [skills]="skills()"
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
      background: radial-gradient(ellipse at center, #0f2847 0%, #0a1628 70%);
      color: #e2e8f0;
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
      background-color: #0f2847;
      border: 2px solid #2a3444;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .path-button:hover {
      border-color: #4ade80;
      transform: translateY(-2px);
    }
    .path-name {
      font-size: 16px;
      font-weight: 600;
      color: #e2e8f0;
    }
    .path-domain {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 4px;
    }
  `],
})
export class SkillTreePage implements OnInit, OnDestroy {
  private learningPathsFacade = inject(LearningPathsFacade);
  private conceptsFacade = inject(ConceptsFacade);
  private subConceptsFacade = inject(SubConceptsFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  loading = signal(true);
  learningPaths = signal<LearningPath[]>([]);
  selectedPath = signal<LearningPath | null>(null);
  skills = signal<Record<string, SkillNode>>({});

  pathName = computed(() => {
    const path = this.selectedPath();
    return path ? `${path.name} Skill Tree` : 'Skill Tree';
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

    // Wait for concepts to load
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

        // Transform data
        this.transformAndSetData(path, concepts);
      });
  }

  private transformAndSetData(path: LearningPath, concepts: Concept[]): void {
    // Subscribe to sub-concepts
    this.subConceptsFacade.allSubConcepts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(allSubConcepts => {
        const skills = this.transformToSkillTree(path, concepts, allSubConcepts);
        this.skills.set(skills);
        this.loading.set(false);
      });
  }

  private transformToSkillTree(
    path: LearningPath,
    concepts: Concept[],
    allSubConcepts: SubConcept[]
  ): Record<string, SkillNode> {
    const skills: Record<string, SkillNode> = {};

    // Sort concepts by order
    const sortedConcepts = [...concepts].sort((a, b) => a.order - b.order);

    // Group concepts by category (cycling assignment)
    const conceptsByCategory: Record<string, Concept[]> = {
      foundations: [],
      intermediate: [],
      advanced: [],
    };

    sortedConcepts.forEach((concept, idx) => {
      const category = CATEGORIES[idx % CATEGORIES.length];
      conceptsByCategory[category].push(concept);
    });

    // Center position
    const centerX = 500;
    const centerY = 480;

    // Create root node (learning path)
    const firstConcepts = [
      conceptsByCategory['foundations'][0],
      conceptsByCategory['intermediate'][0],
      conceptsByCategory['advanced'][0],
    ].filter(Boolean);

    skills['center'] = {
      id: 'center',
      name: path.name,
      description: path.targetSkill || `Your journey into ${path.domain} begins here.`,
      icon: 'compass',
      x: centerX,
      y: centerY,
      category: 'foundations',
      tier: 0,
      cost: 0,
      status: 'unlocked',
      children: firstConcepts.map(c => c.id),
    };

    // Branch configurations - each category has its own direction
    const branchConfig = {
      // Foundations: goes straight up
      foundations: { startX: centerX, startY: centerY - 100, dx: 0, dy: -90 },
      // Intermediate: goes up and to the right
      intermediate: { startX: centerX + 180, startY: centerY - 80, dx: 30, dy: -90 },
      // Advanced: goes up and to the left
      advanced: { startX: centerX - 180, startY: centerY - 80, dx: -30, dy: -90 },
    };

    // Process each category branch
    Object.entries(conceptsByCategory).forEach(([category, categoryConcepts]) => {
      const config = branchConfig[category as keyof typeof branchConfig];
      const icons = ICONS_BY_CATEGORY[category as keyof typeof ICONS_BY_CATEGORY];

      categoryConcepts.forEach((concept, idxInCategory) => {
        const conceptIndex = sortedConcepts.indexOf(concept);

        // Position along the branch
        const x = config.startX + idxInCategory * config.dx;
        const y = config.startY + idxInCategory * config.dy;

        // Determine parent
        const parentId = idxInCategory === 0 ? 'center' : categoryConcepts[idxInCategory - 1].id;

        // Map concept status
        const status = this.mapConceptStatus(concept.status, conceptIndex, sortedConcepts);

        // Get sub-concepts for this concept
        const subConcepts = allSubConcepts
          .filter(sc => sc.conceptId === concept.id)
          .sort((a, b) => a.order - b.order);

        skills[concept.id] = {
          id: concept.id,
          name: concept.name,
          description: concept.description || `Master ${concept.name} to progress.`,
          icon: icons[idxInCategory % icons.length],
          x,
          y,
          category,
          tier: idxInCategory + 1,
          cost: 1,
          status,
          parent: parentId,
          children: subConcepts.slice(0, 2).map(sc => sc.id),
        };

        // Add sub-concepts branching off to the sides
        subConcepts.slice(0, 2).forEach((subConcept, scIndex) => {
          // Position sub-concepts to the side of their parent
          let scX: number, scY: number;

          if (category === 'core') {
            // Core: sub-concepts go left and right
            scX = x + (scIndex === 0 ? -70 : 70);
            scY = y - 30;
          } else if (category === 'networking') {
            // Networking: sub-concepts branch further right
            scX = x + 60 + scIndex * 50;
            scY = y - 20 - scIndex * 30;
          } else {
            // Storage: sub-concepts branch further left
            scX = x - 60 - scIndex * 50;
            scY = y - 20 - scIndex * 30;
          }

          const scStatus = this.mapSubConceptStatus(status, scIndex, subConcepts.length);

          skills[subConcept.id] = {
            id: subConcept.id,
            name: subConcept.name,
            description: subConcept.name,
            icon: icons[(idxInCategory + scIndex + 1) % icons.length],
            x: scX,
            y: scY,
            category,
            tier: idxInCategory + 2,
            cost: 1,
            status: scStatus,
            parent: concept.id,
            children: [],
          };
        });
      });
    });

    return skills;
  }

  private mapConceptStatus(
    conceptStatus: string,
    index: number,
    allConcepts: Concept[]
  ): 'unlocked' | 'available' | 'locked' | 'current' {
    switch (conceptStatus) {
      case 'mastered':
        return 'unlocked';
      case 'in_progress':
        return 'current';
      case 'pending':
        const previousConcept = index > 0 ? allConcepts[index - 1] : null;
        if (!previousConcept || previousConcept.status === 'mastered') {
          return 'available';
        }
        return 'locked';
      default:
        return 'available';
    }
  }

  private mapSubConceptStatus(
    parentStatus: string,
    index: number,
    totalSubConcepts: number
  ): 'unlocked' | 'available' | 'locked' | 'current' {
    if (parentStatus === 'unlocked') {
      return 'unlocked';
    }
    if (parentStatus === 'locked') {
      return 'locked';
    }
    if (parentStatus === 'current') {
      if (index === 0) return 'current';
      return 'available';
    }
    return 'available';
  }
}
