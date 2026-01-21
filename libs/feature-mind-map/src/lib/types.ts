/**
 * Types for the Mind Map component
 */

export interface MindMapNode {
  id: string;
  name: string;
  category: string;
  status: 'completed' | 'current' | 'available' | 'locked';
  x: number;
  y: number;
  z: number;
  size?: number;
  isRoot?: boolean;
  color?: string; // Hex color for custom coloring
}

export interface MindMapConnection {
  from: string;
  to: string;
}

export interface MindMapProps {
  pathName?: string;
  nodes?: MindMapNode[];
  connections?: MindMapConnection[];
}
