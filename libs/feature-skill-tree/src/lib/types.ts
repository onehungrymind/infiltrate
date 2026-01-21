/**
 * Types for the Skill Tree component
 */

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  x: number;
  y: number;
  category: string;
  tier: number;
  cost: number;
  status: 'unlocked' | 'available' | 'locked' | 'current';
  parent?: string;
  children: string[];
}

export interface SkillTreeProps {
  pathName?: string;
  skills?: Record<string, SkillNode>;
}
