/**
 * Mind Map Page Component
 *
 * This component handles data fetching and transforms learning path data
 * into the 3D node/connection format expected by the MindMapComponent.
 */

import { Component, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Concept, LearningPath, SubConcept } from '@kasita/common-models';
import { ConceptsFacade, LearningPathsFacade, SubConceptsFacade } from '@kasita/core-state';
import { MindMapComponent, MindMapNode, MindMapConnection } from '@kasita/feature-mind-map';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

// Color palette for concepts (assigned by index)
const COLOR_PALETTE = [
  '#4ade80', // green
  '#3b82f6', // blue
  '#f97316', // orange
  '#a855f7', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
];

@Component({
  selector: 'app-mind-map-page',
  standalone: true,
  imports: [CommonModule, MindMapComponent],
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
      <lib-mind-map
        [pathName]="pathName()"
        [nodes]="nodes()"
        [connections]="connections()"
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
      background-color: #0a1628;
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
      background-color: #1e3a5f;
      border: 2px solid #2d4a6f;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .path-button:hover {
      border-color: #3b82f6;
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
export class MindMapPage implements OnInit, OnDestroy {
  private learningPathsFacade = inject(LearningPathsFacade);
  private conceptsFacade = inject(ConceptsFacade);
  private subConceptsFacade = inject(SubConceptsFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  loading = signal(true);
  learningPaths = signal<LearningPath[]>([]);
  selectedPath = signal<LearningPath | null>(null);
  nodes = signal<MindMapNode[]>([]);
  connections = signal<MindMapConnection[]>([]);

  pathName = computed(() => this.selectedPath()?.name || 'Knowledge Map');

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
        this.transformAndSetData(path, concepts);
      });
  }

  private transformAndSetData(path: LearningPath, concepts: Concept[]): void {
    // Subscribe to sub-concepts and transform data
    this.subConceptsFacade.allSubConcepts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(allSubConcepts => {
        const { nodes, connections } = this.transformToMindMap(path, concepts, allSubConcepts);
        this.nodes.set(nodes);
        this.connections.set(connections);
        this.loading.set(false);
      });
  }

  private transformToMindMap(
    path: LearningPath,
    concepts: Concept[],
    allSubConcepts: SubConcept[]
  ): { nodes: MindMapNode[]; connections: MindMapConnection[] } {
    const nodes: MindMapNode[] = [];
    const connections: MindMapConnection[] = [];

    // Sort concepts by order
    const sortedConcepts = [...concepts].sort((a, b) => a.order - b.order);

    // Create root node (learning path)
    const rootNode: MindMapNode = {
      id: 'root',
      name: path.name,
      category: 'core',
      status: 'completed',
      x: 0,
      y: 0,
      z: 0,
      size: 1.5,
      isRoot: true,
    };
    nodes.push(rootNode);

    // Calculate positions for concepts in a sphere around the root
    const conceptRadius = 5;
    sortedConcepts.forEach((concept, index) => {
      // Distribute concepts evenly around the root in a spherical pattern
      const theta = (index / sortedConcepts.length) * Math.PI * 2;
      const phi = Math.PI / 3 + (index % 2) * Math.PI / 3; // Alternate between two elevation angles

      const x = conceptRadius * Math.sin(phi) * Math.cos(theta);
      const y = conceptRadius * Math.cos(phi) - 2; // Offset downward
      const z = conceptRadius * Math.sin(phi) * Math.sin(theta);

      // Map concept status to mind map status
      const status = this.mapConceptStatus(concept.status, index, sortedConcepts);

      const conceptNode: MindMapNode = {
        id: concept.id,
        name: concept.name,
        category: concept.name, // Use actual concept name as category
        status,
        x,
        y,
        z,
        size: 0.8,
        color: COLOR_PALETTE[index % COLOR_PALETTE.length],
      };
      nodes.push(conceptNode);

      // Connect root to concept
      connections.push({ from: 'root', to: concept.id });

      // Get sub-concepts for this concept
      const subConcepts = allSubConcepts
        .filter(sc => sc.conceptId === concept.id)
        .sort((a, b) => a.order - b.order);

      // Calculate positions for sub-concepts around the concept
      const subRadius = 2;
      subConcepts.forEach((subConcept, scIndex) => {
        // Distribute sub-concepts in a small sphere around the concept
        const scTheta = (scIndex / Math.max(subConcepts.length, 1)) * Math.PI * 2;
        const scPhi = Math.PI / 2;

        const scX = x + subRadius * Math.sin(scPhi) * Math.cos(scTheta);
        const scY = y + subRadius * Math.cos(scPhi) + 1;
        const scZ = z + subRadius * Math.sin(scPhi) * Math.sin(scTheta);

        const scStatus = this.mapSubConceptStatus(status, scIndex, subConcepts.length);

        const subConceptNode: MindMapNode = {
          id: subConcept.id,
          name: subConcept.name,
          category: concept.name, // Same category as parent concept
          status: scStatus,
          x: scX,
          y: scY,
          z: scZ,
          size: 0.4,
          color: COLOR_PALETTE[index % COLOR_PALETTE.length], // Same color as parent
        };
        nodes.push(subConceptNode);

        // Connect concept to sub-concept
        connections.push({ from: concept.id, to: subConcept.id });
      });
    });

    return { nodes, connections };
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
  ): 'completed' | 'current' | 'available' | 'locked' {
    if (parentStatus === 'completed') {
      return 'completed';
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
