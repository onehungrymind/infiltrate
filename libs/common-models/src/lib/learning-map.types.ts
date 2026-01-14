/**
 * Learning Map Types
 * 
 * Types for the interactive learning map visualization component
 */

export type NodeType =
  | 'outcome'
  | 'module'
  | 'exercise'
  | 'checkpoint'
  | 'knowledge-transfer'
  | 'demonstration'
  | 'principle';

export type NodeStatus =
  | 'not-started'
  | 'locked'
  | 'available'
  | 'in-progress'
  | 'completed'
  | 'mastered'
  | 'passed'
  | 'failed'
  | 'submitted'
  | 'validated';

export type EdgeType = 
  | 'prerequisite' 
  | 'recommended' 
  | 'dependency' 
  | 'alternative';

export type ContentType = 
  | 'video' 
  | 'article' 
  | 'book-chapter' 
  | 'interactive-tutorial' 
  | 'documentation';

export type ExerciseType = 
  | 'coding-exercise' 
  | 'problem-set' 
  | 'project-task';

export type AssessmentType = 
  | 'quiz' 
  | 'practical-demonstration' 
  | 'code-review' 
  | 'peer-evaluation';

export type DeliverableType = 
  | 'blog-post' 
  | 'tutorial' 
  | 'presentation' 
  | 'mentoring-session' 
  | 'documentation';

export type DemonstrationType = 
  | 'portfolio-project' 
  | 'live-demo' 
  | 'production-deployment' 
  | 'performance-test';

// Base node interface
export interface LearningMapNode {
  id: string;
  type: NodeType;
  label: string;
  status: NodeStatus;
  position?: { x: number; y: number };
  data: NodeData;
}

// Node data unions
export type NodeData =
  | OutcomeNodeData
  | ModuleNodeData
  | ExerciseNodeData
  | CheckpointNodeData
  | KnowledgeTransferNodeData
  | DemonstrationNodeData
  | PrincipleNodeData;

export interface OutcomeNodeData {
  title: string;
  description: string;
  measurableMetrics: string[];
  completionCriteria: string[];
  estimatedTime?: number; // hours
  achievedAt?: Date;
}

export interface ModuleNodeData {
  title: string;
  description: string;
  contentType: ContentType;
  duration?: number; // hours
  prerequisites: string[]; // node IDs
  progress: number; // 0-100
  completedAt?: Date;
}

export interface ExerciseNodeData {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: ExerciseType;
  attempts: number;
  bestScore?: number;
  validatedAt?: Date;
  notebookId?: string; // Link to Marimo notebook
}

export interface CheckpointNodeData {
  title: string;
  requiredScore: number;
  userScore?: number;
  assessmentType: AssessmentType;
  passed: boolean;
  passedAt?: Date;
}

export interface KnowledgeTransferNodeData {
  title: string;
  deliverableType: DeliverableType;
  submitted: boolean;
  reviewed: boolean;
  quality?: number; // 0-100
  submittedAt?: Date;
}

export interface DemonstrationNodeData {
  title: string;
  requirements: string[];
  submitted: boolean;
  validated: boolean;
  performanceMetrics?: Record<string, number>;
  validatedAt?: Date;
}

export interface PrincipleNodeData {
  title: string;
  description: string;
  difficulty: 'foundational' | 'intermediate' | 'advanced';
  estimatedHours: number;
  prerequisites: string[]; // principle IDs
  order: number;
  knowledgeUnitCount?: number;
  masteredAt?: Date;
}

// Edge interface
export interface LearningMapEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  animated?: boolean;
  style?: Record<string, any>;
}

// Learning Path structure
export interface LearningPathMap {
  id: string;
  outcomeId: string;
  nodes: LearningMapNode[];
  edges: LearningMapEdge[];
  metadata: {
    totalNodes: number;
    completedNodes: number;
    estimatedTime: number;
    progress: number; // 0-100
  };
}

// Progress tracking
export interface NodeProgress {
  nodeId: string;
  status: NodeStatus;
  startedAt?: Date;
  completedAt?: Date;
  timeSpent?: number; // minutes
  attempts?: number;
  score?: number;
  notes?: string;
}

export interface LearningMapProgress {
  userId: string;
  pathId: string;
  nodeProgress: Record<string, NodeProgress>;
  lastUpdated: Date;
}

// Node details for tooltips/details view
export interface NodeDetails {
  node: LearningMapNode;
  progress?: NodeProgress;
  prerequisites?: LearningMapNode[];
  unlocks?: LearningMapNode[];
  relatedContent?: {
    type: string;
    title: string;
    url?: string;
  }[];
}
