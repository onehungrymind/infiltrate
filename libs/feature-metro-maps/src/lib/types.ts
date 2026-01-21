/**
 * Types for the Metro Maps component
 */

export interface MetroStation {
  id: string;
  name: string;
  description?: string;
  status: 'completed' | 'current' | 'available' | 'locked';
  knowledgeUnits?: number;
  estimatedMinutes?: number;
  isTransfer?: boolean;
  isCapstone?: boolean;
}

export interface MetroBranch {
  id: string;
  name: string;
  color: string;
  stations: MetroStation[];
}

export interface MetroCityData {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  stations: number;
  branches: number;
  status: 'locked' | 'in-progress' | 'completed';
  progress: number;
  // Actual data for rendering the map dynamically
  branchData?: MetroBranch[];
}

export interface MetroMapsProps {
  pathName?: string;
  cities?: MetroCityData[];
}
