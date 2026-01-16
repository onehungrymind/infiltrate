import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import cytoscape, { Core, NodeSingular } from 'cytoscape';
// @ts-expect-error - cytoscape-fcose doesn't have type definitions
import fcose from 'cytoscape-fcose';

import { GraphData, GraphNode } from '../graph.types';

// Register the fcose extension
cytoscape.use(fcose);

@Component({
  selector: 'lib-graph-cytoscape',
  imports: [CommonModule],
  templateUrl: './cytoscape.component.html',
  styleUrl: './cytoscape.component.scss',
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
            width: () => 25,
            height: () => 25,
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
        nodeRepulsion: 8000,
        idealEdgeLength: 300,
        edgeElasticity: 0.5,
        nestingFactor: 0.1,
        gravity: 0.25,
        numIter: 2500,
        initialEnergyOnIncremental: 0.5,
        componentSpacing: 150,
        fit: true,
        padding: 80,
        randomize: true,
        animate: true,
        animationDuration: 1000,
        animationEasing: 'ease-out-cubic',
        quality: 'default',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });

    // Fit the graph to viewport after layout completes
    this.cy.one('layoutstop', () => {
      if (this.cy) {
        this.cy.fit(undefined, 80);
      }
    });

    // Handle node click
    this.cy.on('tap', 'node', (event) => {
      const node = event.target;
      const nodeData = node.data('originalData') as GraphNode;
      this.selectedNodeId = node.id();

      this.cy?.$('node:selected').unselect();
      node.select();
      node.connectedEdges().select();
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

    this.cy.on('pan', () => {
      // Keep nodes draggable
    });

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

      allNodes
        .not(selectedNode)
        .not(connectedNodes)
        .style('opacity', 0.3);

      connectedNodes.style('opacity', 1);
      allEdges.not(connectedEdges).style('opacity', 0.3);
      connectedEdges.style('opacity', 1);
    } else {
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
