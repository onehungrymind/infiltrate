/**
 * React Flow Wrapper Component
 *
 * This component wraps React Flow (@xyflow/react) for use in Angular.
 * It handles the React/Angular bridge using react-dom/client.
 */

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

// React Flow types (will be available after npm install)
type Node = any;
type Edge = any;
type ReactFlowInstance = any;

@Component({
  selector: 'lib-react-flow-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: '<div #reactContainer class="react-flow-container"></div>',
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .react-flow-container {
      width: 100%;
      height: 100%;
      min-height: 600px;
      position: relative;
    }
  `],
})
export class ReactFlowWrapperComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('reactContainer', { static: false }) reactContainer!: ElementRef<HTMLDivElement>;

  @Input() nodes: Node[] = [];
  @Input() edges: Edge[] = [];
  @Input() nodeTypes: Record<string, any> = {};
  @Input() edgeTypes: Record<string, any> = {};
  @Input() showControls = true;
  @Input() showBackground = true;
  @Input() showMinimap = true;
  @Input() fitView = true;
  @Input() minZoom = 0.1;
  @Input() maxZoom = 2;

  @Output() nodeClick = new EventEmitter<{ node: Node; event: MouseEvent }>();
  @Output() nodeDoubleClick = new EventEmitter<Node>();
  @Output() edgeClick = new EventEmitter<Edge>();
  @Output() paneClick = new EventEmitter<void>();

  private reactRoot: any = null;
  private reactFlowInstance: ReactFlowInstance | null = null;

  ngAfterViewInit(): void {
    this.initializeReactFlow();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.reactRoot && (changes['nodes'] || changes['edges'])) {
      this.updateReactFlow();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private async initializeReactFlow(): Promise<void> {
    try {
      // Dynamically import React and React Flow
      const { createRoot } = await import('react-dom/client');
      const React = await import('react');
      const ReactFlow = await import('@xyflow/react');

      if (!this.reactContainer?.nativeElement) {
        console.error('React container not found');
        return;
      }

      // Ensure container has explicit dimensions
      const container = this.reactContainer.nativeElement;
      if (!container.offsetWidth || !container.offsetHeight) {
        // Wait for container to be sized
        setTimeout(() => this.initializeReactFlow(), 100);
        return;
      }

      // Create React root
      this.reactRoot = createRoot(container);

      // Load custom node components if not provided
      let finalNodeTypes = this.nodeTypes;
      if (Object.keys(finalNodeTypes).length === 0) {
        const { createCustomNodeComponents } = await import('./react-flow-custom-nodes');
        finalNodeTypes = await createCustomNodeComponents();
      }

      // Build children array for React Flow
      const children: any[] = [];
      if (this.showControls) {
        children.push(React.createElement(ReactFlow.Controls));
      }
      if (this.showBackground) {
        children.push(React.createElement(ReactFlow.Background, {
          variant: 'lines' as any,  // Grid lines instead of dots
          gap: 20,  // Spacing between grid lines
          lineWidth: 1,  // Thickness of grid lines
          color: '#e2e8f0',  // Subtle gray grid lines
        }));
      }
      if (this.showMinimap) {
        children.push(React.createElement(ReactFlow.MiniMap, {
          nodeColor: (node: Node) => {
            const status = node.data?.status || 'not-started';
            const colors: Record<string, string> = {
              'completed': '#10b981',
              'in-progress': '#3b82f6',
              'locked': '#9ca3af',
              'not-started': '#e5e7eb',
            };
            return colors[status] || '#e5e7eb';
          },
          maskColor: 'rgba(0, 0, 0, 0.1)',
          pannable: true,
          zoomable: true,
        }));
      }

      // Create React Flow component with controls
      const reactFlowComponent = React.createElement(ReactFlow.ReactFlow, {
        nodes: this.nodes,
        edges: this.edges,
        nodeTypes: finalNodeTypes,
        edgeTypes: this.edgeTypes,
        fitView: this.fitView,
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        onNodesChange: this.handleNodesChange.bind(this),
        onEdgesChange: this.handleEdgesChange.bind(this),
        onNodeClick: (event: any, node: Node) => {
          // Pass both node and the original mouse event
          this.nodeClick.emit({ node, event: event.nativeEvent || event });
        },
        onNodeDoubleClick: (event: any, node: Node) => {
          this.nodeDoubleClick.emit(node);
        },
        onEdgeClick: (event: any, edge: Edge) => {
          this.edgeClick.emit(edge);
        },
        onPaneClick: () => {
          this.paneClick.emit();
        },
        onInit: (instance: ReactFlowInstance) => {
          this.reactFlowInstance = instance;
        },
      } as any,
        ...children
      );

      const flowComponent = React.createElement(
        ReactFlow.ReactFlowProvider,
        { children: reactFlowComponent } as any
      );

      // Render React component
      this.reactRoot.render(flowComponent);
    } catch (error) {
      console.error('Failed to initialize React Flow:', error);
    }
  }

  private updateReactFlow(): void {
    if (!this.reactRoot) return;

    // Re-render with updated nodes/edges
    this.initializeReactFlow();
  }

  private handleNodesChange(changes: any[]): void {
    // Handle node changes if needed
  }

  private handleEdgesChange(changes: any[]): void {
    // Handle edge changes if needed
  }

  private cleanup(): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    this.reactFlowInstance = null;
  }

  // Public method to get React Flow instance
  getInstance(): ReactFlowInstance | null {
    return this.reactFlowInstance;
  }
}
