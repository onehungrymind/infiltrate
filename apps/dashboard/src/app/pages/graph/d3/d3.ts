import {
  Component,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphData, GraphNode } from '../graph.types';
import * as d3 from 'd3';

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  radius: number;
  originalData: GraphNode;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: D3Node | string;
  target: D3Node | string;
}

@Component({
  selector: 'app-graph-d3',
  imports: [CommonModule],
  templateUrl: './d3.html',
  styleUrl: './d3.scss',
  standalone: true,
})
export class GraphD3
  implements AfterViewInit, OnDestroy, OnInit, OnChanges
{
  @ViewChild('graphContainer', { static: false })
  containerRef!: ElementRef<HTMLDivElement>;

  @Input() graphData: GraphData | null = null;
  @Output() nodeSelected = new EventEmitter<GraphNode>();

  private cdr = inject(ChangeDetectorRef);
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private simulation: d3.Simulation<D3Node, D3Link> | null = null;
  private nodes: D3Node[] = [];
  private links: D3Link[] = [];
  private selectedNodeId: string | null = null;
  private width = 0;
  private height = 0;

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

  ngOnInit(): void {
    // Component initialization
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graphData'] && this.graphData && this.containerRef) {
      if (this.simulation) {
        this.simulation.stop();
      }
      this.initGraph();
    }
  }

  ngOnDestroy(): void {
    if (this.simulation) {
      this.simulation.stop();
    }
    if (this.svg) {
      this.svg.remove();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.containerRef && this.graphData) {
      this.initGraph();
    }
  }

  initGraph(): void {
    if (!this.containerRef || !this.graphData) return;

    const container = this.containerRef.nativeElement;
    const containerRect = container.getBoundingClientRect();
    this.width = containerRect.width || 800;
    this.height = containerRect.height || 600;

    // Clear existing SVG
    if (this.svg) {
      this.svg.remove();
    }

    // Create SVG
    this.svg = d3
      .select(container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('background', 'transparent');

    // Convert graph data to D3 format
    this.nodes = this.graphData.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      type: n.type,
      description: n.description,
      difficulty: n.difficulty,
      estimatedHours: n.estimatedHours,
      radius: 8 + n.estimatedHours / 2,
      originalData: n,
    }));

    // Create links with node references
    const nodeMap = new Map(this.nodes.map((n) => [n.id, n]));
    this.links = this.graphData.edges.map((e) => ({
      source: nodeMap.get(e.source)!,
      target: nodeMap.get(e.target)!,
    }));

    // Create force simulation
    this.simulation = d3
      .forceSimulation(this.nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(this.links)
          .id((d) => d.id)
          .distance(120) // Reduced from 150 for tighter layout
      )
      .force('charge', d3.forceManyBody().strength(-1500)) // Reduced from -2000 for less repulsion
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force(
        'collision',
        d3.forceCollide<D3Node>().radius((d) => d.radius + 10) // Increased padding for better spacing
      );

    // Create links (lines)
    const link = this.svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.links)
      .enter()
      .append('line')
      .attr('stroke', 'rgba(102, 102, 102, 0.3)')
      .attr('stroke-width', 2);

    // Create nodes (circles)
    const node = this.svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.nodes)
      .enter()
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => this.nodeColors[d.type] || '#666')
      .attr('stroke', '#1a1a2e')
      .attr('stroke-width', 0)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, D3Node>()
        .on('start', (event, d) => {
          if (!event.active && this.simulation) this.simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active && this.simulation) this.simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any)
      .on('click', (event, d) => {
        event.stopPropagation();
        this.selectedNodeId = d.id;
        this.nodeSelected.emit(d.originalData);
        this.updateVisualization();
        this.cdr.detectChanges();
      });

    // Create labels
    const labels = this.svg
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(this.nodes)
      .enter()
      .append('text')
      .text((d) => d.label)
      .attr('font-size', '12px')
      .attr('font-family', 'system-ui')
      .attr('fill', '#1a1a2e')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + 15)
      .style('pointer-events', 'none');

    // Update positions on simulation tick with boundary constraints
    this.simulation.on('tick', () => {
      // Constrain nodes to stay within viewport bounds
      const padding = 50; // Padding from edges
      this.nodes.forEach((d) => {
        // Clamp x position
        if (d.x !== undefined) {
          d.x = Math.max(padding + d.radius, Math.min(this.width - padding - d.radius, d.x));
        }
        // Clamp y position
        if (d.y !== undefined) {
          d.y = Math.max(padding + d.radius, Math.min(this.height - padding - d.radius, d.y));
        }
      });

      link
        .attr('x1', (d) => (d.source as D3Node).x!)
        .attr('y1', (d) => (d.source as D3Node).y!)
        .attr('x2', (d) => (d.target as D3Node).x!)
        .attr('y2', (d) => (d.target as D3Node).y!);

      node
        .attr('cx', (d) => d.x!)
        .attr('cy', (d) => d.y!);

      labels.attr('x', (d) => d.x!).attr('y', (d) => d.y!);
    });

    // Handle background click to deselect
    this.svg
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'transparent')
      .style('pointer-events', 'all')
      .lower()
      .on('click', () => {
        this.selectedNodeId = null;
        this.updateVisualization();
      });

    this.updateVisualization();
  }

  private updateVisualization(): void {
    if (!this.svg) return;

    // Update link styles
    this.svg
      .selectAll<SVGLineElement, D3Link>('line')
      .attr('stroke', (d) => {
        if (
          this.selectedNodeId &&
          ((d.source as D3Node).id === this.selectedNodeId ||
            (d.target as D3Node).id === this.selectedNodeId)
        ) {
          return '#3b82f6';
        }
        return 'rgba(102, 102, 102, 0.3)';
      })
      .attr('stroke-width', (d) => {
        if (
          this.selectedNodeId &&
          ((d.source as D3Node).id === this.selectedNodeId ||
            (d.target as D3Node).id === this.selectedNodeId)
        ) {
          return 3;
        }
        return 2;
      });

    // Update node styles
    this.svg
      .selectAll<SVGCircleElement, D3Node>('circle')
      .attr('opacity', (d) => {
        if (this.selectedNodeId && d.id !== this.selectedNodeId) {
          return 0.3;
        }
        return 1;
      })
      .attr('stroke-width', (d) => {
        if (d.id === this.selectedNodeId) {
          return 3;
        }
        return 0;
      });

    // Update label styles
    this.svg
      .selectAll<SVGTextElement, D3Node>('text')
      .attr('opacity', (d) => {
        if (this.selectedNodeId && d.id !== this.selectedNodeId) {
          return 0.3;
        }
        return 1;
      });
  }

  loadGraph(data: GraphData): void {
    this.graphData = data;
    if (this.containerRef) {
      this.initGraph();
    }
  }
}
