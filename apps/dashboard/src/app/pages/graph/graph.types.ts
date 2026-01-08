export interface GraphNode {
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

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphLink {
  source: GraphNode;
  target: GraphNode;
}

export interface GraphData {
  topic: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type GraphImplementation = 'canvas' | 'd3' | 'cytoscape' | 'three';
