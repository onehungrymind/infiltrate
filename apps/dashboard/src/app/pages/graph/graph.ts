import {
  Component,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface GraphNode {
  id: string;
  label: string;
  type: 'core' | 'prerequisite' | 'subtopic' | 'skill' | 'tool';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius?: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphLink {
  source: GraphNode;
  target: GraphNode;
}

interface GraphData {
  topic: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

@Component({
  selector: 'app-graph',
  imports: [CommonModule],
  templateUrl: './graph.html',
  styleUrl: './graph.scss',
})
export class Graph implements AfterViewInit, OnDestroy {
  @ViewChild('graphCanvas', { static: false })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private cdr = inject(ChangeDetectorRef);

  topic = 'React Server Components';
  isLoading = false; // Start as false - will set to true only if needed
  selectedNode: GraphNode | null = null;
  nodeCount = 0;
  edgeCount = 0;
  totalHours = 0;

  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private nodes: GraphNode[] = [];
  private links: GraphLink[] = [];
  private draggingNode: GraphNode | null = null;
  private animationFrameId?: number;
  private isDestroyed = false;

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

  ngAfterViewInit(): void {
    this.initCanvas();
    // Load graph immediately after canvas is initialized
    // Use setTimeout to ensure we're in the Angular zone and change detection runs
    setTimeout(() => {
      this.loadGraph(this.SAMPLE_GRAPH);
      this.cdr.detectChanges(); // Force change detection to run immediately
    }, 0);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resize();
    // Redraw after resize
    if (this.nodes.length > 0) {
      this.draw();
    }
  }

  initCanvas(): void {
    if (!this.canvasRef) return;

    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d') || undefined;

    if (!this.ctx) {
      console.error('Could not get 2D context');
      return;
    }

    // Wait for layout to be complete before sizing
    // Use multiple strategies to ensure accurate measurement
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Double RAF to ensure layout is complete
        this.resize();
        // Set up mouse events after canvas is properly sized
        this.setupMouseEvents();
      });
    });
  }

  private setupMouseEvents(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (!this.canvas) return;
      
      const rect = this.canvas.getBoundingClientRect();
      // Calculate mouse position relative to canvas - these should match canvas coordinates exactly
      // since canvas.width/height match rect.width/height
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const node = this.getNodeAt(x, y);
      if (node) {
        this.draggingNode = node;
        this.showNodeDetails(node);
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.draggingNode && this.canvas) {
        const rect = this.canvas.getBoundingClientRect();
        // Calculate mouse position relative to canvas - these match canvas coordinates exactly
        this.draggingNode.x = e.clientX - rect.left;
        this.draggingNode.y = e.clientY - rect.top;
        this.draggingNode.vx = 0;
        this.draggingNode.vy = 0;
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.draggingNode = null;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.draggingNode = null;
    });
  }

  resize(): void {
    if (!this.canvas) return;

    // Get the actual container size (parent wrapper)
    const container = this.canvas.parentElement;
    if (!container) {
      console.warn('Canvas parent container not found');
      return;
    }

    // Measure the actual rendered size of the container
    const containerRect = container.getBoundingClientRect();
    const measuredWidth = Math.floor(containerRect.width);
    const measuredHeight = Math.floor(containerRect.height);
    
    // Use measured dimensions, but provide fallback if invalid
    if (measuredWidth > 0 && measuredHeight > 0) {
      this.width = measuredWidth;
      this.height = measuredHeight;
    } else {
      // Fallback to container's computed style if getBoundingClientRect returns 0
      const computedStyle = window.getComputedStyle(container);
      this.width = Math.max(measuredWidth, parseInt(computedStyle.width) || 800);
      this.height = Math.max(measuredHeight, parseInt(computedStyle.height) || 600);
    }
    
    // Set canvas internal resolution to match display size exactly
    // This ensures mouse coordinates match canvas coordinates
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  loadGraph(data: GraphData): void {
    this.topic = data.topic;
    this.nodeCount = data.nodes.length;
    this.edgeCount = data.edges.length;
    this.totalHours = data.nodes.reduce((sum, n) => sum + n.estimatedHours, 0);

    // Initialize nodes with physics - start centered
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    this.nodes = data.nodes.map((n) => ({
      ...n,
      x: centerX + (Math.random() - 0.5) * 150,
      y: centerY + (Math.random() - 0.5) * 150,
      vx: 0,
      vy: 0,
      radius: 8 + n.estimatedHours / 2,
    }));

    // Initialize links
    this.links = data.edges
      .map((e) => ({
        source: this.nodes.find((n) => n.id === e.source)!,
        target: this.nodes.find((n) => n.id === e.target)!,
      }))
      .filter((l) => l.source && l.target);

    // Start animation
    this.animate();
  }

  private simulate(): void {
    const alpha = 0.3;
    const centerForce = 0.02; // Increased to better center the graph
    const linkDistance = 150;
    const repulsion = 2000;

    // Center force - center the entire graph on the canvas
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    this.nodes.forEach((n) => {
      n.vx! += (centerX - n.x!) * centerForce;
      n.vy! += (centerY - n.y!) * centerForce;
    });

    // Link force
    this.links.forEach((l) => {
      const dx = l.target.x! - l.source.x!;
      const dy = l.target.y! - l.source.y!;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - linkDistance) * 0.1;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      l.source.vx! += fx;
      l.source.vy! += fy;
      l.target.vx! -= fx;
      l.target.vy! -= fy;
    });

    // Repulsion between nodes
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dx = this.nodes[j].x! - this.nodes[i].x!;
        const dy = this.nodes[j].y! - this.nodes[i].y!;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        this.nodes[i].vx! -= fx;
        this.nodes[i].vy! -= fy;
        this.nodes[j].vx! += fx;
        this.nodes[j].vy! += fy;
      }
    }

    // Apply velocity
    this.nodes.forEach((n) => {
      if (n !== this.draggingNode) {
        n.x! += n.vx! * alpha;
        n.y! += n.vy! * alpha;
        n.vx! *= 0.9;
        n.vy! *= 0.9;
      }
    });
  }

  private draw(): void {
    if (!this.ctx || !this.canvas) return;

    // Clear the entire canvas using its actual dimensions
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw links
    this.links.forEach((l) => {
      const isSelected =
        this.selectedNode &&
        (l.source === this.selectedNode || l.target === this.selectedNode);
      this.ctx!.strokeStyle = isSelected
        ? '#3b82f6'
        : 'rgba(102, 102, 102, 0.3)';
      this.ctx!.lineWidth = isSelected ? 3 : 2;

      this.ctx!.beginPath();
      this.ctx!.moveTo(l.source.x!, l.source.y!);
      this.ctx!.lineTo(l.target.x!, l.target.y!);
      this.ctx!.stroke();
    });

    // Draw nodes
    this.nodes.forEach((n) => {
      const opacity = this.selectedNode && this.selectedNode !== n ? 0.3 : 1;

      this.ctx!.fillStyle = this.nodeColors[n.type] || '#666';
      this.ctx!.globalAlpha = opacity;
      this.ctx!.beginPath();
      this.ctx!.arc(n.x!, n.y!, n.radius!, 0, Math.PI * 2);
      this.ctx!.fill();

      if (n === this.selectedNode) {
        this.ctx!.strokeStyle = '#1a1a2e';
        this.ctx!.lineWidth = 3;
        this.ctx!.stroke();
      }

      this.ctx!.globalAlpha = 1;
    });

    // Draw labels
    this.ctx.font = '12px system-ui';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.nodes.forEach((n) => {
      const opacity = this.selectedNode && this.selectedNode !== n ? 0.3 : 1;
      this.ctx!.globalAlpha = opacity;
      this.ctx!.fillStyle = '#1a1a2e';
      this.ctx!.fillText(n.label, n.x!, n.y! + n.radius! + 5);
      this.ctx!.globalAlpha = 1;
    });
  }

  private animate(): void {
    if (this.isDestroyed) return;

    this.simulate();
    this.draw();
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private getNodeAt(x: number, y: number): GraphNode | undefined {
    return this.nodes.find((n) => {
      const dx = n.x! - x;
      const dy = n.y! - y;
      return Math.sqrt(dx * dx + dy * dy) < n.radius!;
    });
  }

  showNodeDetails(node: GraphNode): void {
    this.selectedNode = node;
    this.cdr.detectChanges(); // Force change detection to update the view
  }

  closePanel(): void {
    this.selectedNode = null;
  }

  addToPath(nodeId: string): void {
    const node = this.nodes.find((n) => n.id === nodeId);
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
    // For now, reload the sample graph
    // In the future, this could call an API to generate a new graph
    this.loadGraph(this.SAMPLE_GRAPH);
  }
}
