import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';

interface Graph {
  [key: string]: string[];
}

interface Position {
  x: number;
  y: number;
}

interface CodeLine {
  num: number;
  content: string;
}

interface Step {
  type: string;
  description: string;
  queue: [string, number][];
  ranks: { [key: string]: number };
  current: string | null;
  visitedNodes: Set<string>;
  activeEdges: [string, string][];
  lines: number[];
}

@Component({
  selector: 'lib-bfs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bfs.component.html',
  styleUrl: './bfs.component.scss',
})
export class BfsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('graphSvg', { static: false }) graphSvg!: ElementRef<SVGElement>;
  @ViewChild('codeDisplay', { static: false })
  codeDisplay!: ElementRef<HTMLDivElement>;

  // Graph structure
  private readonly graph: Graph = {
    s: ['a', 'b'],
    a: ['c', 'd'],
    b: ['d', 'e'],
    c: ['f'],
    d: ['f'],
    e: [],
    f: [],
  };

  // Node positions for visualization
  private readonly positions: { [key: string]: Position } = {
    s: { x: 300, y: 60 },
    a: { x: 180, y: 180 },
    b: { x: 420, y: 180 },
    c: { x: 80, y: 300 },
    d: { x: 300, y: 300 },
    e: { x: 520, y: 300 },
    f: { x: 190, y: 420 },
  };

  // Code lines with syntax highlighting
  readonly codeLines: CodeLine[] = [
    {
      num: 1,
      content:
        '<span class="keyword">const</span> <span class="function">assignRanks</span> = (<span class="variable">graph</span>, <span class="variable">startNode</span> = <span class="string">\'s\'</span>) => {',
    },
    {
      num: 2,
      content:
        '  <span class="comment">// Initialize empty object to store ranks</span>',
    },
    {
      num: 3,
      content:
        '  <span class="keyword">const</span> <span class="variable">ranks</span> = {};',
    },
    {
      num: 4,
      content:
        '  <span class="comment">// Initialize BFS queue with starting node</span>',
    },
    {
      num: 5,
      content:
        '  <span class="keyword">const</span> <span class="variable">queue</span> = [[<span class="variable">startNode</span>, <span class="number">0</span>]];',
    },
    {
      num: 6,
      content:
        '  <span class="comment">// Set starting node\'s rank to 0</span>',
    },
    {
      num: 7,
      content:
        '  <span class="variable">ranks</span>[<span class="variable">startNode</span>] = <span class="number">0</span>;',
    },
    { num: 8, content: '' },
    {
      num: 9,
      content:
        '  <span class="comment">// Continue while there are nodes to process</span>',
    },
    {
      num: 10,
      content:
        '  <span class="keyword">while</span> (<span class="variable">queue</span>.<span class="property">length</span> > <span class="number">0</span>) {',
    },
    {
      num: 11,
      content: '    <span class="comment">// Dequeue first node (FIFO)</span>',
    },
    {
      num: 12,
      content:
        '    <span class="keyword">const</span> [<span class="variable">node</span>, <span class="variable">rank</span>] = <span class="variable">queue</span>.<span class="function">shift</span>()!;',
    },
    {
      num: 13,
      content:
        '    <span class="comment">// Get children of current node</span>',
    },
    {
      num: 14,
      content:
        '    <span class="keyword">const</span> <span class="variable">children</span> = <span class="variable">graph</span>[<span class="variable">node</span>] || [];',
    },
    { num: 15, content: '' },
    {
      num: 16,
      content: '    <span class="comment">// Process each child</span>',
    },
    {
      num: 17,
      content:
        '    <span class="keyword">for</span> (<span class="keyword">const</span> <span class="variable">child</span> <span class="keyword">of</span> <span class="variable">children</span>) {',
    },
    {
      num: 18,
      content:
        '      <span class="comment">// Check if child hasn\'t been visited</span>',
    },
    {
      num: 19,
      content:
        '      <span class="keyword">if</span> (!(<span class="variable">child</span> <span class="keyword">in</span> <span class="variable">ranks</span>)) {',
    },
    {
      num: 20,
      content:
        '        <span class="comment">// Assign rank one level deeper</span>',
    },
    {
      num: 21,
      content:
        '        <span class="variable">ranks</span>[<span class="variable">child</span>] = <span class="variable">rank</span> + <span class="number">1</span>;',
    },
    {
      num: 22,
      content:
        '        <span class="comment">// Add to queue for processing</span>',
    },
    {
      num: 23,
      content:
        '        <span class="variable">queue</span>.<span class="function">push</span>([<span class="variable">child</span>, <span class="variable">rank</span> + <span class="number">1</span>]);',
    },
    { num: 24, content: '      }' },
    { num: 25, content: '    }' },
    { num: 26, content: '  }' },
    { num: 27, content: '' },
    {
      num: 28,
      content: '  <span class="comment">// Return complete mapping</span>',
    },
    {
      num: 29,
      content:
        '  <span class="keyword">return</span> <span class="variable">ranks</span>;',
    },
    { num: 30, content: '};' },
  ];

  steps = signal<Step[]>([]);
  currentStep = signal(0);
  isPlaying = signal(false);
  speed = signal(1500);
  private playInterval: number | null = null;

  currentStepData = computed(() => {
    const step = this.steps()[this.currentStep()];
    return step || null;
  });

  queueDisplay = computed(() => {
    const step = this.currentStepData();
    if (!step) return [];
    return step.queue;
  });

  ranksDisplay = computed(() => {
    const step = this.currentStepData();
    if (!step) return {};
    return step.ranks;
  });

  ranksEntries = computed(() => {
    const ranks = this.ranksDisplay();
    return Object.entries(ranks);
  });

  hasRanks = computed(() => {
    return this.ranksEntries().length > 0;
  });

  stepDescription = computed(() => {
    const step = this.currentStepData();
    return step?.description || 'Click START to begin visualization';
  });

  highlightedLines = computed(() => {
    const step = this.currentStepData();
    return step?.lines || [];
  });

  canGoNext = computed(() => {
    return this.currentStep() < this.steps().length - 1;
  });

  canGoPrev = computed(() => {
    return this.currentStep() > 0;
  });

  speedDisplay = computed(() => {
    return (this.speed() / 1000).toFixed(1) + 's';
  });

  ngOnInit(): void {
    this.generateSteps();
  }

  ngAfterViewInit(): void {
    // For lazy-loaded child routes, we need to wait for the view to be fully initialized
    // Use setTimeout to ensure ViewChild is available
    setTimeout(() => {
      this.drawGraph();
      this.updateVisualization();
    }, 0);
  }

  ngOnDestroy(): void {
    this.pause();
  }

  generateSteps(): void {
    const ranks: { [key: string]: number } = {};
    const queue: [string, number][] = [['s', 0]];
    ranks['s'] = 0;

    const steps: Step[] = [
      {
        type: 'init',
        description: 'Initialize: Create empty ranks object',
        queue: [],
        ranks: {},
        current: null,
        visitedNodes: new Set(),
        activeEdges: [],
        lines: [3],
      },
      {
        type: 'init',
        description: 'Initialize: Create queue with starting node',
        queue: [['s', 0]],
        ranks: {},
        current: null,
        visitedNodes: new Set(),
        activeEdges: [],
        lines: [5],
      },
      {
        type: 'init',
        description: 'Initialize: Set starting node rank to 0',
        queue: [['s', 0]],
        ranks: { s: 0 },
        current: null,
        visitedNodes: new Set(['s']),
        activeEdges: [],
        lines: [7],
      },
    ];

    const workingQueue = [...queue];
    const workingRanks = { ...ranks };

    while (workingQueue.length > 0) {
      steps.push({
        type: 'check-while',
        description: `Check while condition: queue has ${workingQueue.length} item(s)`,
        queue: [...workingQueue],
        ranks: { ...workingRanks },
        current: null,
        visitedNodes: new Set(Object.keys(workingRanks)),
        activeEdges: [],
        lines: [10],
      });

      const [node, rank] = workingQueue.shift()!;

      steps.push({
        type: 'dequeue',
        description: `Dequeue: Extract node "${node}" with rank ${rank}`,
        queue: [...workingQueue],
        ranks: { ...workingRanks },
        current: node,
        visitedNodes: new Set(Object.keys(workingRanks)),
        activeEdges: [],
        lines: [12],
      });

      const children = this.graph[node] || [];

      steps.push({
        type: 'get-children',
        description: `Get children of "${node}": [${
          children.join(', ') || 'none'
        }]`,
        queue: [...workingQueue],
        ranks: { ...workingRanks },
        current: node,
        visitedNodes: new Set(Object.keys(workingRanks)),
        activeEdges: children.map((c) => [node, c]),
        lines: [14],
      });

      for (const child of children) {
        steps.push({
          type: 'for-loop',
          description: `Loop iteration: Check child "${child}"`,
          queue: [...workingQueue],
          ranks: { ...workingRanks },
          current: node,
          visitedNodes: new Set(Object.keys(workingRanks)),
          activeEdges: [[node, child]],
          lines: [17],
        });

        const alreadyVisited = child in workingRanks;
        steps.push({
          type: 'check-if',
          description: alreadyVisited
            ? `Child "${child}" already visited - skip`
            : `Child "${child}" not visited - process it`,
          queue: [...workingQueue],
          ranks: { ...workingRanks },
          current: node,
          visitedNodes: new Set(Object.keys(workingRanks)),
          activeEdges: [[node, child]],
          lines: [19],
        });

        if (!alreadyVisited) {
          workingRanks[child] = rank + 1;
          steps.push({
            type: 'assign-rank',
            description: `Assign rank ${rank + 1} to "${child}"`,
            queue: [...workingQueue],
            ranks: { ...workingRanks },
            current: node,
            visitedNodes: new Set(Object.keys(workingRanks)),
            activeEdges: [[node, child]],
            lines: [21],
          });

          workingQueue.push([child, rank + 1]);
          steps.push({
            type: 'enqueue',
            description: `Add "${child}" to queue with rank ${rank + 1}`,
            queue: [...workingQueue],
            ranks: { ...workingRanks },
            current: node,
            visitedNodes: new Set(Object.keys(workingRanks)),
            activeEdges: [[node, child]],
            lines: [23],
          });
        }
      }
    }

    steps.push({
      type: 'check-while',
      description: 'Check while condition: queue is empty',
      queue: [],
      ranks: { ...workingRanks },
      current: null,
      visitedNodes: new Set(Object.keys(workingRanks)),
      activeEdges: [],
      lines: [10],
    });

    steps.push({
      type: 'complete',
      description: 'Complete! Return final ranks object',
      queue: [],
      ranks: { ...workingRanks },
      current: null,
      visitedNodes: new Set(Object.keys(workingRanks)),
      activeEdges: [],
      lines: [29],
    });

    this.steps.set(steps);
  }

  drawGraph(): void {
    // Try ViewChild first, fallback to querySelector if not available
    let svg: SVGElement | null = null;

    if (this.graphSvg?.nativeElement) {
      svg = this.graphSvg.nativeElement;
    } else {
      // Fallback: try to find by ID (for lazy-loaded routes)
      const element = document.getElementById('graph');
      svg = element ? (element as unknown as SVGElement) : null;
    }

    if (!svg) {
      return;
    }

    // Set SVG viewBox and dimensions for proper rendering
    if (!svg.hasAttribute('viewBox')) {
      svg.setAttribute('viewBox', '0 0 600 500');
    }
    if (!svg.hasAttribute('width')) {
      svg.setAttribute('width', '100%');
    }
    if (!svg.hasAttribute('height')) {
      svg.setAttribute('height', '500');
    }

    // Clear and initialize SVG
    svg.innerHTML = `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <polygon points="0 0, 10 3, 0 6" fill="#333" />
        </marker>
      </defs>
    `;

    // Draw edges
    for (const [from, children] of Object.entries(this.graph)) {
      children.forEach((to) => {
        const x1 = this.positions[from].x;
        const y1 = this.positions[from].y;
        const x2 = this.positions[to].x;
        const y2 = this.positions[to].y;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const offsetX = (dx / len) * 30;
        const offsetY = (dy / len) * 30;

        const line = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        line.setAttribute('class', 'edge');
        line.setAttribute(
          'd',
          `M ${x1 + offsetX} ${y1 + offsetY} L ${x2 - offsetX} ${y2 - offsetY}`
        );
        line.setAttribute('data-from', from);
        line.setAttribute('data-to', to);
        line.setAttribute('stroke', '#333');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('fill', 'none');
        line.setAttribute('stroke-dasharray', '5,5');
        line.setAttribute('marker-end', 'url(#arrowhead)');
        svg.appendChild(line);
      });
    }

    // Draw nodes
    for (const [node, pos] of Object.entries(this.positions)) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'node unvisited');
      g.setAttribute('data-node', node);

      const circle = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
      );
      circle.setAttribute('cx', pos.x.toString());
      circle.setAttribute('cy', pos.y.toString());
      circle.setAttribute('r', '25');
      // Apply glow effect using CSS filter
      (circle as unknown as { style: { filter: string } }).style.filter =
        'drop-shadow(0 0 10px rgba(0, 255, 135, 0.3))';
      g.appendChild(circle);

      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      text.setAttribute('x', pos.x.toString());
      text.setAttribute('y', (pos.y + 5).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#ffffff');
      text.setAttribute('font-size', '16px');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'system-ui, sans-serif');
      text.style.textTransform = 'uppercase';
      text.textContent = node;
      g.appendChild(text);

      svg.appendChild(g);
    }
  }

  updateVisualization(): void {
    // Try ViewChild first, fallback to querySelector if not available
    let svg: SVGElement | null = null;

    if (this.graphSvg?.nativeElement) {
      svg = this.graphSvg.nativeElement;
    } else {
      const element = document.getElementById('graph');
      svg = element ? (element as unknown as SVGElement) : null;
    }

    if (!svg) {
      return;
    }

    const step = this.currentStepData();
    if (!step) return;

    // Update nodes
    const nodes = svg.querySelectorAll('.node');
    nodes.forEach((nodeEl) => {
      const nodeName = nodeEl.getAttribute('data-node');
      if (!nodeName) return;

      nodeEl.classList.remove('unvisited', 'current', 'visited', 'in-queue');

      // Update circle fill, glow effect and text color based on state
      const circleElement = nodeEl.querySelector('circle');
      const textElement = nodeEl.querySelector('text');

      if (circleElement) {
        const circleWithStyle = circleElement as unknown as {
          style: { filter: string };
        };
        if (nodeName === step.current) {
          nodeEl.classList.add('current');
          // Green fill for current node
          circleElement.setAttribute('fill', '#00ff87');
          circleElement.setAttribute('stroke', '#00ff87');
          circleElement.setAttribute('stroke-width', '3');
          // Stronger glow for current node
          circleWithStyle.style.filter =
            'drop-shadow(0 0 20px rgba(0, 255, 135, 0.8))';
          if (textElement) {
            // White text on green background
            textElement.setAttribute('fill', '#ffffff');
          }
        } else {
          // Standard glow for other nodes
          circleWithStyle.style.filter =
            'drop-shadow(0 0 10px rgba(0, 255, 135, 0.3))';
          if (textElement) {
            textElement.setAttribute('fill', '#ffffff');
          }
          if (step.visitedNodes.has(nodeName)) {
            nodeEl.classList.add('visited');
            circleElement.setAttribute('fill', '#2a2a2a');
            circleElement.setAttribute('stroke', '#00ff87');
            circleElement.setAttribute('stroke-width', '2');
          } else if (step.queue.some(([n]) => n === nodeName)) {
            nodeEl.classList.add('in-queue');
            circleElement.setAttribute('fill', '#1a3a2a');
            circleElement.setAttribute('stroke', '#00ff87');
            circleElement.setAttribute('stroke-width', '2');
            circleElement.setAttribute('stroke-dasharray', '4');
          } else {
            nodeEl.classList.add('unvisited');
            circleElement.setAttribute('fill', '#1a1a1a');
            circleElement.setAttribute('stroke', '#444');
            circleElement.setAttribute('stroke-width', '2');
            circleElement.removeAttribute('stroke-dasharray');
          }
        }
      }

      // Update rank badge - create a green circle with white text
      const existingBadgeGroup = nodeEl.querySelector('.rank-badge-group');
      if (existingBadgeGroup) existingBadgeGroup.remove();

      // Remove old standalone badge if it exists
      const existingBadge = nodeEl.querySelector('.rank-badge');
      if (existingBadge && !existingBadgeGroup) existingBadge.remove();

      if (nodeName in step.ranks) {
        // Create a group for the badge circle and text
        const badgeGroup = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'g'
        );
        badgeGroup.setAttribute('class', 'rank-badge-group');

        // Create green circle background for the badge
        const badgeCircle = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'circle'
        );
        badgeCircle.setAttribute(
          'cx',
          (this.positions[nodeName].x + 18).toString()
        );
        badgeCircle.setAttribute(
          'cy',
          (this.positions[nodeName].y - 18).toString()
        );
        badgeCircle.setAttribute('r', '12');
        badgeCircle.setAttribute('fill', '#00ff87');
        badgeCircle.setAttribute('stroke', '#00ff87');
        badgeCircle.setAttribute('stroke-width', '2');
        badgeGroup.appendChild(badgeCircle);

        // Create white text for the rank number
        const badgeText = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text'
        );
        badgeText.setAttribute('class', 'rank-badge');
        badgeText.setAttribute(
          'x',
          (this.positions[nodeName].x + 18).toString()
        );
        badgeText.setAttribute(
          'y',
          (this.positions[nodeName].y - 15).toString()
        );
        badgeText.setAttribute('text-anchor', 'middle');
        badgeText.setAttribute('fill', '#ffffff');
        badgeText.setAttribute('font-size', '11px');
        badgeText.setAttribute('font-weight', '700');
        badgeText.setAttribute('font-family', 'Courier New, monospace');
        badgeText.textContent = step.ranks[nodeName].toString();
        badgeGroup.appendChild(badgeText);

        nodeEl.appendChild(badgeGroup);
      }
    });

    // Update edges
    const edges = svg.querySelectorAll('.edge');
    edges.forEach((edge) => {
      // Ensure edge has all required attributes
      if (!edge.hasAttribute('stroke')) {
        edge.setAttribute('stroke', '#333');
      }
      if (!edge.hasAttribute('stroke-width')) {
        edge.setAttribute('stroke-width', '2');
      }
      if (!edge.hasAttribute('fill')) {
        edge.setAttribute('fill', 'none');
      }
      if (
        !edge.hasAttribute('stroke-dasharray') ||
        edge.getAttribute('stroke-dasharray') === 'none'
      ) {
        edge.setAttribute('stroke-dasharray', '5,5');
      }

      edge.classList.remove('active');
      if (step.activeEdges) {
        const from = edge.getAttribute('data-from');
        const to = edge.getAttribute('data-to');
        if (step.activeEdges.some(([f, t]) => f === from && t === to)) {
          edge.classList.add('active');
          // Update active edge styling
          edge.setAttribute('stroke', '#00ff87');
          edge.setAttribute('stroke-width', '3');
          edge.setAttribute('stroke-dasharray', '5,5');
        } else {
          // Reset to default styling
          edge.setAttribute('stroke', '#333');
          edge.setAttribute('stroke-width', '2');
        }
      }
    });

    // Scroll highlighted code line into view
    if (step.lines.length > 0 && this.codeDisplay?.nativeElement) {
      const lineNum = step.lines[0];
      const lineEl = this.codeDisplay.nativeElement.querySelector(
        `.code-line[data-line="${lineNum}"]`
      );
      if (lineEl) {
        lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  start(): void {
    if (this.playInterval !== null) return;

    this.isPlaying.set(true);

    this.playInterval = window.setInterval(() => {
      if (this.currentStep() < this.steps().length - 1) {
        this.currentStep.update((step) => step + 1);
        this.updateVisualization();
      } else {
        this.pause();
      }
    }, this.speed());
  }

  pause(): void {
    this.isPlaying.set(false);
    if (this.playInterval !== null) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
  }

  reset(): void {
    this.pause();
    this.currentStep.set(0);
    this.updateVisualization();
  }

  next(): void {
    if (this.currentStep() < this.steps().length - 1) {
      this.currentStep.update((step) => step + 1);
      this.updateVisualization();
    }
  }

  prev(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update((step) => step - 1);
      this.updateVisualization();
    }
  }

  onSpeedChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.speed.set(parseInt(target.value));

    if (this.isPlaying()) {
      this.pause();
      this.start();
    }
  }

  isLineHighlighted(lineNum: number): boolean {
    return this.highlightedLines().includes(lineNum);
  }
}
