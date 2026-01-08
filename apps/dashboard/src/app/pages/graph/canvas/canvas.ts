import {
  Component,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
  ChangeDetectorRef,
  inject,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphData, GraphNode } from '../graph.types';

@Component({
  selector: 'app-graph-canvas',
  imports: [CommonModule],
  templateUrl: './canvas.html',
  styleUrl: './canvas.scss',
  standalone: true,
})
export class GraphCanvas
  implements AfterViewInit, OnDestroy, OnInit, OnChanges
{
  @ViewChild('graphCanvas', { static: false })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() graphData: GraphData | null = null;
  @Output() nodeSelected = new EventEmitter<GraphNode>();

  private cdr = inject(ChangeDetectorRef);

  selectedNode: GraphNode | null = null;

  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private nodes: GraphNode[] = [];
  private links: Array<{ source: GraphNode; target: GraphNode }> = [];
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

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  ngOnInit(): void {
    if (this.graphData) {
      // Wait for canvas to be initialized
      setTimeout(() => {
        this.loadGraph(this.graphData!);
        this.cdr.detectChanges();
      }, 0);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graphData'] && this.graphData && this.canvas) {
      this.loadGraph(this.graphData);
    }
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

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.resize();
        this.setupMouseEvents();
        // Load graph if data is already available
        if (this.graphData) {
          this.loadGraph(this.graphData);
        }
      });
    });
  }

  private setupMouseEvents(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (!this.canvas) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const node = this.getNodeAt(x, y);
      if (node) {
        this.draggingNode = node;
        this.selectedNode = node;
        this.nodeSelected.emit(node);
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.draggingNode && this.canvas) {
        const rect = this.canvas.getBoundingClientRect();
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

    const container = this.canvas.parentElement;
    if (!container) {
      console.warn('Canvas parent container not found');
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const measuredWidth = Math.floor(containerRect.width);
    const measuredHeight = Math.floor(containerRect.height);

    if (measuredWidth > 0 && measuredHeight > 0) {
      this.width = measuredWidth;
      this.height = measuredHeight;
    } else {
      const computedStyle = window.getComputedStyle(container);
      this.width = Math.max(measuredWidth, parseInt(computedStyle.width) || 800);
      this.height = Math.max(
        measuredHeight,
        parseInt(computedStyle.height) || 600
      );
    }

    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  loadGraph(data: GraphData): void {
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

    this.links = data.edges
      .map((e) => ({
        source: this.nodes.find((n) => n.id === e.source)!,
        target: this.nodes.find((n) => n.id === e.target)!,
      }))
      .filter((l) => l.source && l.target);

    this.animate();
  }

  private simulate(): void {
    const alpha = 0.3;
    const centerForce = 0.02;
    const linkDistance = 150;
    const repulsion = 2000;

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    this.nodes.forEach((n) => {
      n.vx! += (centerX - n.x!) * centerForce;
      n.vy! += (centerY - n.y!) * centerForce;
    });

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

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
}
