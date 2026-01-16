/**
 * React Flow Utilities
 * 
 * Conversion utilities for transforming LearningMapNode/Edge to React Flow format
 */

import {
  EdgeType,
  LearningMapEdge,
  LearningMapNode,
  LearningPathMap,
  NodeType,
} from '@kasita/common-models';

export interface ReactFlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: NodeType;
    status: string;
    [key: string]: any;
  };
  style?: Record<string, any>;
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  markerEnd?: {
    type: string;
    color?: string;
  };
}

/**
 * Convert LearningMapNode to React Flow Node
 */
export function convertToReactFlowNode(node: LearningMapNode, position?: { x: number; y: number }): ReactFlowNode {
  const nodeData = node.data as any;
  
  return {
    id: node.id,
    type: `custom-${node.type}`, // Custom node type
    position: position || node.position || { x: 0, y: 0 },
    data: {
      label: node.label,
      nodeType: node.type,
      status: node.status,
      ...nodeData, // Include all original data
    },
    // Style is handled by custom node components, not here
  };
}

/**
 * Convert LearningMapEdge to React Flow Edge
 */
export function convertToReactFlowEdge(edge: LearningMapEdge): ReactFlowEdge {
  const edgeStyle = getEdgeStyle(edge.type);
  
  // Use default handle positions - React Flow will connect to handles at these positions
  // 'bottom' for source (outgoing) and 'top' for target (incoming) is the standard flow direction
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: 'bottom', // Connect from bottom of source node
    targetHandle: 'top', // Connect to top of target node
    type: getEdgeType(edge.type),
    animated: false, // No animation as per requirements
    style: edgeStyle.style,
    markerEnd: edgeStyle.markerEnd,
  };
}

/**
 * Convert entire LearningPathMap to React Flow format
 * Uses improved spacing: 150px horizontal, 100px vertical minimum
 */
export function convertToReactFlowFormat(path: LearningPathMap): {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
} {
  // Improved layout with proper spacing
  // Calculate grid dimensions for better distribution
  const nodeCount = path.nodes.length;
  const cols = Math.ceil(Math.sqrt(nodeCount * 1.5)); // Slightly wider grid
  const horizontalSpacing = 250; // 200px min width + 50px gap = 250px total
  const verticalSpacing = 120;  // 60px min height + 60px gap = 120px total
  
  const nodes = path.nodes.map((node, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const position = {
      x: col * horizontalSpacing + 100,
      y: row * verticalSpacing + 100,
    };
    
    return convertToReactFlowNode(node, position);
  });

  const edges = path.edges.map(convertToReactFlowEdge);

  return { nodes, edges };
}

/**
 * Get React Flow edge type based on LearningMap edge type
 * All edges use smoothstep for consistent appearance
 */
function getEdgeType(edgeType: EdgeType): string {
  // All edges use smoothstep as per requirements
  return 'smoothstep';
}

// Node styling is now handled entirely by custom node components in react-flow-custom-nodes.ts

/**
 * Get edge style based on edge type
 * All edges use consistent gray styling as per requirements
 */
function getEdgeStyle(edgeType: EdgeType): {
  style: Record<string, any>;
  markerEnd?: { type: string; color?: string };
} {
  // Standardized edge styling - all gray, 2px, smoothstep
  return {
    style: {
      strokeWidth: 2,
      stroke: '#94a3b8',  // Medium gray
      strokeDasharray: '0', // Solid lines
    },
    markerEnd: { 
      type: 'arrowclosed', 
      color: '#94a3b8' 
    },
  };
}
