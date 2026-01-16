import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LearningMapNode,
  LearningPathMap,
  NodeStatus,
} from '@kasita/common-models';
import { AuthService, LearningMapService } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

import { convertToReactFlowFormat, ReactFlowNode } from './react-flow-utils';
import { ReactFlowWrapperComponent } from './react-flow-wrapper.component';

@Component({
  selector: 'lib-learning-map',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, ReactFlowWrapperComponent],
  templateUrl: './learning-map.component.html',
  styleUrl: './learning-map.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'scale(0.85) translateY(-20px)',
        }),
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({
            opacity: 1,
            transform: 'scale(1) translateY(0)',
          })
        )
      ]),
      transition(':leave', [
        animate('200ms ease-in',
          style({
            opacity: 0,
            transform: 'scale(0.9) translateY(-10px)',
          })
        )
      ])
    ])
  ],
})
export class LearningMapComponent implements OnInit, OnDestroy {

  private learningMapService = inject(LearningMapService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // State
  loading = signal(false);
  error = signal<string | null>(null);
  learningPath = signal<LearningPathMap | null>(null);
  selectedNode = signal<LearningMapNode | null>(null);
  clickPosition = signal<{ x: number; y: number } | null>(null);

  // Learning path selector state
  availablePaths = signal<Array<{
    id: string;
    name: string;
    domain: string;
    principleCount: number;
  }>>([]);
  selectedPathId = signal<string | null>(null);
  viewMode = signal<'principles' | 'mock'>('principles');

  // Computed values
  nodes = computed(() => this.learningPath()?.nodes || []);
  edges = computed(() => this.learningPath()?.edges || []);
  progress = computed(() => this.learningPath()?.metadata.progress || 0);
  hasAvailablePaths = computed(() => this.availablePaths().length > 0);

  // React Flow data
  reactFlowNodes = computed(() => {
    const path = this.learningPath();
    if (!path) return [];
    const { nodes } = convertToReactFlowFormat(path);
    return nodes;
  });

  reactFlowEdges = computed(() => {
    const path = this.learningPath();
    if (!path) return [];
    const { edges } = convertToReactFlowFormat(path);
    return edges;
  });

  // View controls - minimap is controlled by React Flow wrapper

  ngOnInit(): void {
    this.loadAvailablePaths();
  }

  ngOnDestroy(): void {
    // Cleanup handled by React Flow wrapper
    return;
  }

  /**
   * Load available learning paths that have principles
   */
  loadAvailablePaths(): void {
    this.loading.set(true);
    this.learningMapService.getLearningPathsForMap().subscribe({
      next: (paths) => {
        this.availablePaths.set(paths);
        if (paths.length > 0) {
          // Auto-select the first path
          this.selectPath(paths[0].id);
        } else {
          // No paths with principles, fall back to mock data
          this.viewMode.set('mock');
          this.loadMockData();
          this.loading.set(false);
        }
      },
      error: () => {
        // Fall back to mock data on error
        this.viewMode.set('mock');
        this.loadMockData();
        this.loading.set(false);
      },
    });
  }

  /**
   * Select a learning path and load its principle map
   */
  selectPath(pathId: string): void {
    this.selectedPathId.set(pathId);
    this.viewMode.set('principles');
    this.loadPrincipleMap(pathId);
  }

  /**
   * Load the principle map for a learning path
   */
  loadPrincipleMap(pathId: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.selectedNode.set(null);

    this.learningMapService.getPrincipleMap(pathId).subscribe({
      next: (map) => {
        if (map) {
          this.learningPath.set(map);
        } else {
          this.error.set('No principles found for this learning path');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load principle map');
        this.loading.set(false);
      },
    });
  }

  /**
   * Switch to mock data view
   */
  showMockData(): void {
    this.viewMode.set('mock');
    this.selectedPathId.set(null);
    this.loadMockData();
  }

  // React Flow event handlers
  onReactFlowNodeClick(node: ReactFlowNode, event?: MouseEvent): void {
    const learningNode = this.nodes().find((n) => n.id === node.id);
    if (learningNode) {
      // Store click position for panel positioning
      if (event) {
        this.clickPosition.set({ x: event.clientX, y: event.clientY });
      } else {
        // Fallback: use node position converted to screen coordinates
        // This is approximate since we'd need viewport transform
        this.clickPosition.set({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      }
      this.onNodeClick(learningNode);
    }
  }

  onReactFlowNodeDoubleClick(node: ReactFlowNode): void {
    const learningNode = this.nodes().find((n) => n.id === node.id);
    if (learningNode) {
      this.navigateToNode(learningNode);
    }
  }

  onPaneClick(): void {
    this.selectedNode.set(null);
    this.clickPosition.set(null);
  }

  onNodeClick(node: LearningMapNode): void {
    this.selectedNode.set(node);
    // Position will be set by onReactFlowNodeClick if available
  }

  navigateToNode(node: LearningMapNode): void {
    switch (node.type) {
      case 'exercise':
        if ('notebookId' in node.data && node.data.notebookId) {
          this.router.navigate(['/notebook']);
        }
        break;
      case 'module':
        this.router.navigate(['/content'], { queryParams: { moduleId: node.id } });
        break;
      case 'checkpoint':
        this.router.navigate(['/challenges'], { queryParams: { checkpointId: node.id } });
        break;
      case 'principle':
        // Navigate to knowledge units filtered by this principle
        this.router.navigate(['/knowledge-units'], { queryParams: { principleId: node.id } });
        break;
    }
  }

  getNodeDescription(): string {
    const node = this.selectedNode();
    if (!node) return '';

    const data = node.data as unknown as Record<string, unknown>;

    if (node.type === 'outcome' || node.type === 'module' || node.type === 'principle') {
      return (data['description'] as string) || '';
    }
    return node.label;
  }

  /**
   * Get additional info for the selected node (for principles, show difficulty and knowledge unit count)
   */
  getNodeMetadata(): { label: string; value: string }[] {
    const node = this.selectedNode();
    if (!node) return [];

    const data = node.data as unknown as Record<string, unknown>;
    const metadata: { label: string; value: string }[] = [];

    if (node.type === 'principle') {
      if (data['difficulty']) {
        metadata.push({ label: 'Difficulty', value: data['difficulty'] as string });
      }
      if (data['estimatedHours']) {
        metadata.push({ label: 'Estimated Time', value: `${data['estimatedHours']}h` });
      }
      if (data['knowledgeUnitCount'] !== undefined) {
        metadata.push({ label: 'Knowledge Units', value: `${data['knowledgeUnitCount']}` });
      }
    }

    return metadata;
  }

  getPanelPosition(): { left: number; top: number } {
    const clickPos = this.clickPosition();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const panelWidth = 340; // Panel width from CSS
    const panelHeight = 300; // Estimated panel height
    const offset = 20; // Offset from click position

    if (clickPos) {
      // Position panel offset from click, ensuring it stays within viewport
      let left = clickPos.x + offset;
      let top = clickPos.y + offset;

      // Adjust if panel would go off-screen
      if (left + panelWidth > viewportWidth) {
        left = clickPos.x - panelWidth - offset; // Show to the left instead
      }
      if (top + panelHeight > viewportHeight) {
        top = clickPos.y - panelHeight - offset; // Show above instead
      }

      // Ensure minimum margins
      left = Math.max(20, Math.min(left, viewportWidth - panelWidth - 20));
      top = Math.max(20, Math.min(top, viewportHeight - panelHeight - 20));

      return { left, top };
    }

    // Fallback: center if no click position
    return {
      left: (viewportWidth - panelWidth) / 2,
      top: (viewportHeight - panelHeight) / 2,
    };
  }

  updateNodeStatus(nodeId: string, status: NodeStatus): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.learningMapService.updateNodeStatus(nodeId, status).subscribe({
      next: () => {
        // Reload the current view
        const pathId = this.selectedPathId();
        if (pathId && this.viewMode() === 'principles') {
          this.loadPrincipleMap(pathId);
        } else {
          this.loadMockData();
        }
      },
      error: (err: unknown) => {
        const error = err as { error?: { message?: string } };
        this.error.set(error.error?.message || 'Failed to update node status');
      },
    });
  }

  // Mock data for demo
  private loadMockData(): void {
    const mockPath: LearningPathMap = {
      id: 'ml-engineer-path',
      outcomeId: 'ml-engineer-transition',
      nodes: [
        {
          id: 'outcome-1',
          type: 'outcome',
          label: 'Production ML Engineering',
          status: 'in-progress',
          position: { x: 400, y: 50 },
          data: {
            title: 'Production ML Engineering Capability',
            description: 'Deploy and maintain production ML systems',
            measurableMetrics: [
              'Deploy 3 production ML systems',
              'Pass system design interviews',
              'Contribute to ML platform',
            ],
            completionCriteria: [
              'All systems in production',
              'Performance metrics met',
              'Code reviews passed',
            ],
            estimatedTime: 200,
          },
        },
        {
          id: 'module-1',
          type: 'module',
          label: 'ML Fundamentals',
          status: 'completed',
          position: { x: 200, y: 200 },
          data: {
            title: 'ML Fundamentals',
            description: 'Core machine learning concepts and engineering practices',
            contentType: 'book-chapter',
            duration: 40,
            prerequisites: [],
            progress: 100,
          },
        },
        {
          id: 'exercise-1',
          type: 'exercise',
          label: 'Build Linear Regression',
          status: 'completed',
          position: { x: 100, y: 300 },
          data: {
            title: 'Build Simple Linear Regression',
            difficulty: 'beginner',
            type: 'coding-exercise',
            attempts: 1,
            bestScore: 100,
          },
        },
        {
          id: 'checkpoint-1',
          type: 'checkpoint',
          label: 'ML Fundamentals Quiz',
          status: 'passed',
          position: { x: 300, y: 300 },
          data: {
            title: 'ML Fundamentals Quiz',
            requiredScore: 80,
            userScore: 92,
            assessmentType: 'quiz',
            passed: true,
          },
        },
        {
          id: 'module-2',
          type: 'module',
          label: 'LLM Deep Dive',
          status: 'in-progress',
          position: { x: 600, y: 200 },
          data: {
            title: 'LLM Deep Dive',
            description: 'Large Language Models and their applications',
            contentType: 'book-chapter',
            duration: 30,
            prerequisites: ['module-1'],
            progress: 60,
          },
        },
        {
          id: 'exercise-2',
          type: 'exercise',
          label: 'Pandas Exercises',
          status: 'in-progress',
          position: { x: 500, y: 350 },
          data: {
            title: 'Marimo Pandas Exercises',
            difficulty: 'beginner',
            type: 'coding-exercise',
            attempts: 0,
            notebookId: 'pandas_exercises',
          },
        },
        {
          id: 'module-3',
          type: 'module',
          label: 'Pandas & Data Processing',
          status: 'available',
          position: { x: 400, y: 200 },
          data: {
            title: 'Pandas & Data Processing',
            description: 'Data manipulation and analysis with Pandas',
            contentType: 'interactive-tutorial',
            duration: 20,
            prerequisites: ['module-1'],
            progress: 0,
          },
        },
        {
          id: 'module-4',
          type: 'module',
          label: 'MLOps & Deployment',
          status: 'locked',
          position: { x: 800, y: 200 },
          data: {
            title: 'MLOps & Deployment',
            description: 'CI/CD, monitoring, and production deployment',
            contentType: 'article',
            duration: 50,
            prerequisites: ['module-1', 'module-2'],
            progress: 0,
          },
        },
        {
          id: 'demo-1',
          type: 'demonstration',
          label: 'Kasita Platform',
          status: 'available',
          position: { x: 400, y: 400 },
          data: {
            title: 'Kasita Platform',
            requirements: [
              'Content processing pipeline',
              'Knowledge graph implementation',
              'Progress tracking system',
            ],
            submitted: false,
            validated: false,
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'outcome-1', target: 'module-1', type: 'prerequisite' },
        { id: 'e2', source: 'outcome-1', target: 'module-2', type: 'prerequisite' },
        { id: 'e3', source: 'outcome-1', target: 'module-3', type: 'prerequisite' },
        { id: 'e4', source: 'outcome-1', target: 'module-4', type: 'prerequisite' },
        { id: 'e5', source: 'module-1', target: 'exercise-1', type: 'recommended' },
        { id: 'e6', source: 'module-1', target: 'checkpoint-1', type: 'prerequisite' },
        { id: 'e7', source: 'module-3', target: 'exercise-2', type: 'recommended' },
        { id: 'e8', source: 'module-1', target: 'module-2', type: 'dependency' },
        { id: 'e9', source: 'module-1', target: 'module-3', type: 'dependency' },
        { id: 'e10', source: 'module-2', target: 'module-4', type: 'prerequisite' },
        { id: 'e11', source: 'module-1', target: 'module-4', type: 'prerequisite' },
        { id: 'e12', source: 'module-4', target: 'demo-1', type: 'prerequisite' },
      ],
      metadata: {
        totalNodes: 9,
        completedNodes: 3,
        estimatedTime: 200,
        progress: 33,
      },
    };

    this.learningPath.set(mockPath);
  }
}
