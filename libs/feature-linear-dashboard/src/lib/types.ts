/**
 * Types for the Linear Dashboard component
 */

export interface Principle {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'available' | 'locked';
  xp: number;
  units: number;
  currentUnit?: number;
  isCapstone?: boolean;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'available' | 'locked';
  progress: number;
  xpEarned: number;
  xpTotal: number;
  principles: Principle[];
}

export interface LinearDashboardProps {
  pathName?: string;
  pathDescription?: string;
  sections?: Section[];
}
