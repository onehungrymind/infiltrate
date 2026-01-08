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
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele: NodeSingular) =>
              this.nodeColors[ele.data('type')] || '#666',
            label: 'data(label)',
            'font-size': '12px',
            'font-family': 'system-ui',
            color: '#1a1a2e',
            'text-valign': 'bottom',
            'text-margin-y': 10,
            width: (ele: NodeSingular) => {
              const node = this.graphData?.nodes.find(
                (n) => n.id === ele.data('id')
              );
              return (8 + (node?.estimatedHours || 0) / 2) * 2;
            },
            height: (ele: NodeSingular) => {
              const node = this.graphData?.nodes.find(
                (n) => n.id === ele.data('id')
              );
              return (8 + (node?.estimatedHours || 0) / 2) * 2;
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
        name: 'cose',
        idealEdgeLength: 150,
        nodeRepulsion: 2000,
        gravity: 0.1,
        numIter: 1000,
      },
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
