import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { KnowledgeGraph, KnowledgeGraphService } from '@kasita/core-data';

import { GraphCanvas } from './canvas/canvas.component';
import { GraphCytoscape } from './cytoscape/cytoscape.component';
import { GraphD3 } from './d3/d3.component';
import {
  GraphData,
  GraphImplementation,
  GraphNode,
} from './graph.types';
import { GraphThree } from './three/three.component';

@Component({
  selector: 'lib-graph',
  imports: [
    CommonModule,
    GraphCanvas,
    GraphD3,
    GraphCytoscape,
    GraphThree,
  ],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.scss',
  standalone: true,
})
export class Graph implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private graphService = inject(KnowledgeGraphService);

  topic = 'React Server Components';
  isLoading = false;
  error: string | null = null;
  selectedNode: GraphNode | null = null;
  nodeCount = 0;
  edgeCount = 0;
  totalHours = 0;

  // Track the selected implementation
  selectedImplementation = signal<GraphImplementation>('canvas');

  // Available implementations
  readonly implementations: { value: GraphImplementation; label: string }[] = [
    { value: 'canvas', label: 'Canvas 2D' },
    { value: 'd3', label: 'D3.js' },
    { value: 'cytoscape', label: 'Cytoscape.js' },
    { value: 'three', label: 'Three.js' },
  ];

  // Graph data - in the future this could come from an API
  private readonly SAMPLE_GRAPH: GraphData = {
    topic: 'React Server Components',
    nodes: [
      {
        id: 'react-basics',
        label: 'React Basics',
        type: 'prerequisite',
        description: 'Core React: components, props, state',
        difficulty: 'beginner',
        estimatedHours: 12,
      },
      {
        id: 'react-18',
        label: 'React 18',
        type: 'prerequisite',
        description: 'Concurrent features, Suspense',
        difficulty: 'intermediate',
        estimatedHours: 8,
      },
      {
        id: 'javascript',
        label: 'JavaScript',
        type: 'prerequisite',
        description: 'ES6+, async/await',
        difficulty: 'beginner',
        estimatedHours: 10,
      },
      {
        id: 'server-components',
        label: 'Server Components',
        type: 'core',
        description: 'Server-side component rendering',
        difficulty: 'intermediate',
        estimatedHours: 10,
      },
      {
        id: 'client-components',
        label: 'Client Components',
        type: 'core',
        description: 'Interactive client components',
        difficulty: 'intermediate',
        estimatedHours: 8,
      },
      {
        id: 'streaming',
        label: 'Streaming',
        type: 'core',
        description: 'Progressive HTML rendering',
        difficulty: 'advanced',
        estimatedHours: 12,
      },
      {
        id: 'data-fetching',
        label: 'Data Fetching',
        type: 'core',
        description: 'Async server data loading',
        difficulty: 'intermediate',
        estimatedHours: 10,
      },
      {
        id: 'boundaries',
        label: 'Boundaries',
        type: 'subtopic',
        description: 'Client/server component split',
        difficulty: 'intermediate',
        estimatedHours: 6,
      },
      {
        id: 'serialization',
        label: 'Serialization',
        type: 'subtopic',
        description: 'Props serialization rules',
        difficulty: 'intermediate',
        estimatedHours: 5,
      },
      {
        id: 'suspense',
        label: 'Suspense',
        type: 'subtopic',
        description: 'Loading and error states',
        difficulty: 'intermediate',
        estimatedHours: 8,
      },
      {
        id: 'composition',
        label: 'Composition',
        type: 'skill',
        description: 'Mixing server and client',
        difficulty: 'advanced',
        estimatedHours: 10,
      },
      {
        id: 'optimization',
        label: 'Optimization',
        type: 'skill',
        description: 'Performance tuning',
        difficulty: 'advanced',
        estimatedHours: 12,
      },
      {
        id: 'nextjs',
        label: 'Next.js',
        type: 'tool',
        description: 'RSC framework',
        difficulty: 'intermediate',
        estimatedHours: 15,
      },
    ],
    edges: [
      { source: 'react-basics', target: 'server-components' },
      { source: 'react-basics', target: 'client-components' },
      { source: 'react-18', target: 'streaming' },
      { source: 'javascript', target: 'server-components' },
      { source: 'server-components', target: 'boundaries' },
      { source: 'client-components', target: 'boundaries' },
      { source: 'server-components', target: 'serialization' },
      { source: 'streaming', target: 'suspense' },
      { source: 'server-components', target: 'data-fetching' },
      { source: 'boundaries', target: 'composition' },
      { source: 'suspense', target: 'optimization' },
      { source: 'server-components', target: 'nextjs' },
      { source: 'client-components', target: 'nextjs' },
    ],
  };

  graphData = signal<GraphData | null>(null);

  readonly nodeColors: Record<string, string> = {
    core: '#3b82f6',
    prerequisite: '#8b5cf6',
    subtopic: '#06b6d4',
    skill: '#10b981',
    tool: '#f59e0b',
  };

  readonly legendItems = [
    { type: 'core', label: 'Core', color: '#3b82f6' },
    { type: 'prerequisite', label: 'Prerequisite', color: '#8b5cf6' },
    { type: 'subtopic', label: 'Subtopic', color: '#06b6d4' },
    { type: 'skill', label: 'Skill', color: '#10b981' },
    { type: 'tool', label: 'Tool', color: '#f59e0b' },
  ];

  constructor() {
    // Initialize graph data - don't call detectChanges here
    // It will be loaded after view init
  }

  ngOnInit(): void {
    // Load initial graph data after component initialization
    this.loadGraph(this.SAMPLE_GRAPH);
  }

  loadGraph(data: GraphData): void {
    this.topic = data.topic;
    this.nodeCount = data.nodes.length;
    this.edgeCount = data.edges.length;
    this.totalHours = data.nodes.reduce((sum, n) => sum + n.estimatedHours, 0);
    this.graphData.set(data);
    // Don't call detectChanges here - let Angular handle it naturally
  }

  onImplementationChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedImplementation.set(target.value as GraphImplementation);
  }

  onNodeSelected(node: GraphNode): void {
    this.selectedNode = node;
    this.cdr.detectChanges();
  }

  closePanel(): void {
    this.selectedNode = null;
  }

  addToPath(nodeId: string): void {
    const node = this.graphData()?.nodes.find((n) => n.id === nodeId);
    if (node) {
      alert(`Adding "${node.label}" to your learning path!`);
    }
  }

  getBadgeClass(difficulty: string): string {
    return `badge-${difficulty}`;
  }

  onTopicChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.topic = target.value;
  }

  generateGraph(): void {
    const topic = this.topic.trim();
    if (!topic) {
      this.error = 'Please enter a topic';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.graphService.generate(topic).subscribe({
      next: (data: KnowledgeGraph) => {
        // Convert KnowledgeGraph to GraphData format
        const graphData: GraphData = {
          topic: data.topic,
          nodes: data.nodes.map((node) => ({
            id: node.id,
            label: node.label,
            type: node.type,
            description: node.description,
            difficulty: node.difficulty,
            estimatedHours: node.estimatedHours,
          })),
          edges: data.edges.map((edge) => ({
            source: edge.source,
            target: edge.target,
          })),
        };
        this.loadGraph(graphData);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || err.message || 'Failed to generate graph';
        this.isLoading = false;
        console.error('Error generating graph:', err);
      },
    });
  }
}
