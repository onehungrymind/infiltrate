import {
  Component,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphData, GraphNode } from '../graph.types';
import cytoscape, { Core, NodeSingular } from 'cytoscape';
// @ts-expect-error - cytoscape-fcose doesn't have type definitions
import fcose from 'cytoscape-fcose';

// Register the fcose extension
cytoscape.use(fcose);

@Component({
  selector: 'app-graph-cytoscape',
  imports: [CommonModule],
  templateUrl: './cytoscape.html',
  styleUrl: './cytoscape.scss',
  standalone: true,
})
export class GraphCytoscape
  implements AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild('graphContainer', { static: false })
  containerRef!: ElementRef<HTMLDivElement>;

  @Input() graphData: GraphData | null = null;
  @Output() nodeSelected = new EventEmitter<GraphNode>();

  private cdr = inject(ChangeDetectorRef);
  private cy: Core | null = null;
  private selectedNodeId: string | null = null;

  readonly nodeColors: Record<string, string> = {
    core: '#3b82f6',
    prerequisite: '#8b5cf6',
    subtopic: '#06b6d4',
    skill: '#10b981',
    tool: '#f59e0b',
  };

  ngAfterViewInit(): void {
    if (this.graphData) {
      this.initGraph();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graphData'] && this.graphData && this.containerRef) {
      this.initGraph();
    }
  }

  ngOnDestroy(): void {
    if (this.cy) {
      this.cy.destroy();
      this.cy = null;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.cy) {
      this.cy.resize();
    }
  }

  initGraph(): void {
    if (!this.containerRef || !this.graphData) return;

    // Destroy existing instance
    if (this.cy) {
      this.cy.destroy();
    }

    // Convert graph data to Cytoscape format
    const elements = [
      ...this.graphData.nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          description: node.description,
          difficulty: node.difficulty,
          estimatedHours: node.estimatedHours,
          originalData: node,
        },
      })),
      ...this.graphData.edges.map((edge) => ({
        data: {
          source: edge.source,
          target: edge.target,
        },
      })),
    ];

    // Initialize Cytoscape
    this.cy = cytoscape({
      container: this.containerRef.nativeElement,
      elements,
      minZoom: 0.1,
      maxZoom: 3,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele: NodeSingular) =>
              this.nodeColors[ele.data('type')] || '#666',
            label: 'data(label)',
            'font-size': '10px',
            'font-family': 'system-ui',
            color: '#1a1a2e',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-halign': 'center',
            width: () => {
              // Uniform small size for all nodes - prioritize readability over size variation
              // All nodes are 25px for consistent, readable display
              return 25;
            },
            height: () => {
              // Uniform small size for all nodes - prioritize readability over size variation
              // All nodes are 25px for consistent, readable display
              return 25;
            },
            shape: 'ellipse',
            'border-width': 0,
            'border-color': '#1a1a2e',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': 'rgba(102, 102, 102, 0.3)',
            'target-arrow-color': 'rgba(102, 102, 102, 0.3)',
            'curve-style': 'bezier',
            opacity: 0.5,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': '#1a1a2e',
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#3b82f6',
            'target-arrow-color': '#3b82f6',
            width: 3,
            opacity: 1,
          },
        },
      ],
      layout: {
        name: 'fcose',
        // Node repulsion (non-nested) - higher = more spacing
        nodeRepulsion: 8000,
        // Ideal edge length - higher = more spacing between connected nodes
        idealEdgeLength: 300,
        // Edge elasticity - how much edges can stretch
        edgeElasticity: 0.5,
        // Nesting factor - for compound graphs
        nestingFactor: 0.1,
        // Gravity - pulls nodes toward center (lower = more spread)
        gravity: 0.25,
        // Number of iterations
        numIter: 2500,
        // Initial temperature for force-directed simulation
        initialEnergyOnIncremental: 0.5,
        // Component spacing - spacing between disconnected components
        componentSpacing: 150,
        // Whether to fit the viewport to the graph
        fit: true,
        // Padding around the graph
        padding: 80,
        // Whether to use random initial positions - MUST be true for proper layout
        randomize: true,
        // Whether to animate
        animate: true,
        // Animation duration
        animationDuration: 1000,
        // Animation easing
        animationEasing: 'ease-out-cubic',
        // Quality setting for layout
        quality: 'default',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any, // fcose layout options may not match base type exactly
    });

    // Fit the graph to viewport after layout completes
    this.cy.one('layoutstop', () => {
      if (this.cy) {
        // Fit with generous padding to ensure all nodes are visible and readable
        this.cy.fit(undefined, 80); // 80px padding on all sides for better visibility
      }
    });

    // Handle node click
    this.cy.on('tap', 'node', (event) => {
      const node = event.target;
      const nodeData = node.data('originalData') as GraphNode;
      this.selectedNodeId = node.id();
      
      // Clear previous selection
      this.cy?.$('node:selected').unselect();
      
      // Select current node
      node.select();
      
      // Highlight connected edges
      node.connectedEdges().select();
      
      // Dim other nodes and edges
      this.updateVisualization();
      
      this.nodeSelected.emit(nodeData);
      this.cdr.detectChanges();
    });

    // Handle background click to deselect
    this.cy.on('tap', (event) => {
      if (event.target === this.cy && this.cy) {
        this.cy.$('node:selected').unselect();
        this.cy.$('edge:selected').unselect();
        this.selectedNodeId = null;
        this.updateVisualization();
      }
    });

    // Enable node dragging
    this.cy.on('pan', () => {
      // Keep nodes draggable
    });

    // Make nodes draggable
    this.cy.nodes().on('grab', () => {
      this.cy?.nodes().ungrabify();
      this.cy?.nodes().grabify();
    });
  }

  private updateVisualization(): void {
    if (!this.cy) return;

    const allNodes = this.cy.nodes();
    const allEdges = this.cy.edges();

    if (this.selectedNodeId) {
      const selectedNode = this.cy.$id(this.selectedNodeId);
      const connectedEdges = selectedNode.connectedEdges();
      const connectedNodes = selectedNode.neighborhood('node');

      // Dim non-connected nodes
      allNodes
        .not(selectedNode)
        .not(connectedNodes)
        .style('opacity', 0.3);

      // Show connected nodes at full opacity
      connectedNodes.style('opacity', 1);

      // Dim non-connected edges
      allEdges.not(connectedEdges).style('opacity', 0.3);

      // Show connected edges at full opacity
      connectedEdges.style('opacity', 1);
    } else {
      // Show all nodes and edges at full opacity
      allNodes.style('opacity', 1);
      allEdges.style('opacity', 0.5);
    }
  }

  loadGraph(data: GraphData): void {
    this.graphData = data;
    if (this.containerRef) {
      this.initGraph();
    }
  }
}
