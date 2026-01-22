export interface BuildPathJobData {
  buildJobId: string;
  pathId: string;
  pathName: string;
}

export interface DecomposeConceptJobData {
  buildJobId: string;
  stepId: string;
  conceptId: string;
  conceptName: string;
}

export interface GenerateKUJobData {
  buildJobId: string;
  stepId: string;
  subConceptId: string;
  subConceptName: string;
  conceptId: string;  // Parent concept for UI selection
}

export interface JobProgressEvent {
  buildJobId: string;
  type: 'step-started' | 'step-completed' | 'step-failed' | 'job-completed' | 'job-failed';
  stepId?: string;
  stepType?: string;
  message: string;
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
  error?: string;
  timestamp: Date;
  // Entity data for real-time UI updates
  entities?: {
    concepts?: any[];
    subConcepts?: any[];
    knowledgeUnits?: any[];
    selectedConceptId?: string;
    selectedSubConceptId?: string;
  };
}

// Classroom generation job data types
export interface GenerateClassroomForPathJobData {
  learningPathId: string;
  learningPathName: string;
}

export interface GenerateClassroomContentJobData {
  learningPathId: string;
  conceptId: string;
  conceptName: string;
  subConceptId: string;
  subConceptName: string;
}

export interface ClassroomProgressEvent {
  learningPathId: string;
  type: 'started' | 'subconcept-generating' | 'subconcept-ready' | 'subconcept-failed' | 'concept-ready' | 'path-ready' | 'failed';
  conceptId?: string;
  subConceptId?: string;
  message: string;
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
  error?: string;
  timestamp: Date;
}
