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
