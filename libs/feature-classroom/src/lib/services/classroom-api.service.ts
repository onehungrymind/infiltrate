import { Injectable, inject, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Re-use the API_URL token from core-data
const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:3333/api',
});

// Types matching backend entities
export interface ClassroomSection {
  id: string;
  order: number;
  type: 'prose' | 'code' | 'diagram' | 'callout' | 'example';
  content?: string;
  code?: CodeBlock;
  diagram?: DiagramBlock;
  callout?: CalloutBlock;
}

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  highlightLines?: number[];
  caption?: string;
}

export interface DiagramBlock {
  type: 'mermaid' | 'ascii';
  source: string;
  caption?: string;
}

export interface CalloutBlock {
  type: 'tip' | 'warning' | 'info' | 'example' | 'analogy';
  title?: string;
  content: string;
}

export interface ClassroomContent {
  id: string;
  subConceptId: string;
  conceptId: string;
  learningPathId: string;
  title: string;
  summary: string;
  sections: ClassroomSection[];
  estimatedReadTime: number;
  wordCount: number;
  version: number;
  status: 'pending' | 'generating' | 'ready' | 'error';
  generatedAt: string | null;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  classroomContentId: string;
  subConceptId: string;
  conceptId: string;
  learningPathId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  scrollPosition: number;
  lastReadAt: string | null;
  completedAt: string | null;
  totalReadTime: number;
  sessionCount: number;
}

export interface ReadingPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'sepia';
  fontSize: 'small' | 'medium' | 'large';
  lineSpacing: 'compact' | 'normal' | 'relaxed';
  fontFamily: 'sans' | 'serif' | 'mono';
}

export interface MicroQuizQuestion {
  id: string;
  order: number;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  question: string;
  options?: string[];
}

export interface MicroQuiz {
  id: string;
  subConceptId: string;
  passingScore: number;
  status: string;
  questions: MicroQuizQuestion[];
}

export interface QuizAnswer {
  questionId: string;
  answer: string | number;
}

export interface QuizResult {
  questionId: string;
  correct: boolean;
  userAnswer: string | number;
  correctAnswer: string | number;
  explanation: string;
}

export interface QuizSubmissionResponse {
  score: number;
  passed: boolean;
  results: QuizResult[];
}

export interface ConceptProgress {
  conceptId: string;
  overallProgress: number;
  subConcepts: Array<{
    subConceptId: string;
    progress: {
      status: string;
      scrollPosition: number;
      totalReadTime: number;
    };
  }>;
}

export interface ClassroomStatus {
  status: 'pending' | 'generating' | 'ready' | 'partial';
  progress: { completed: number; total: number };
  concepts: Array<{
    conceptId: string;
    status: string;
    subConcepts: Array<{ subConceptId: string; status: string }>;
  }>;
}

@Injectable({ providedIn: 'root' })
export class ClassroomApiService {
  private readonly http = inject(HttpClient);
  private readonly baseApiUrl = inject(API_URL);
  private readonly apiUrl = `${this.baseApiUrl}/classroom`;

  // ==================== CLASSROOM CONTENT ====================

  getContentBySubConcept(subConceptId: string): Observable<ClassroomContent | null> {
    return this.http.get<ClassroomContent | null>(
      `${this.apiUrl}/sub-concept/${subConceptId}`
    );
  }

  getContentByConcept(conceptId: string): Observable<ClassroomContent[]> {
    return this.http.get<ClassroomContent[]>(
      `${this.apiUrl}/concept/${conceptId}`
    );
  }

  getClassroomStatus(learningPathId: string): Observable<ClassroomStatus> {
    return this.http.get<ClassroomStatus>(
      `${this.apiUrl}/status/${learningPathId}`
    );
  }

  regenerateContent(
    type: 'sub-concept' | 'concept' | 'learning-path',
    id: string,
    options?: {
      name?: string;
      learningPathId?: string;
      conceptId?: string;
      conceptName?: string;
    }
  ): Observable<{ message: string; jobId: string }> {
    return this.http.post<{ message: string; jobId: string }>(
      `${this.apiUrl}/regenerate`,
      { type, id, ...options }
    );
  }

  // ==================== READING PROGRESS ====================

  getConceptProgress(conceptId: string): Observable<ConceptProgress> {
    return this.http.get<ConceptProgress>(
      `${this.apiUrl}/progress/concept/${conceptId}`
    );
  }

  getProgress(classroomContentId: string): Observable<ReadingProgress> {
    return this.http.get<ReadingProgress>(
      `${this.apiUrl}/progress/${classroomContentId}`
    );
  }

  updateProgress(
    classroomContentId: string,
    data: { scrollPosition?: number; readTime?: number }
  ): Observable<ReadingProgress> {
    return this.http.patch<ReadingProgress>(
      `${this.apiUrl}/progress/${classroomContentId}`,
      data
    );
  }

  markComplete(classroomContentId: string): Observable<ReadingProgress> {
    return this.http.post<ReadingProgress>(
      `${this.apiUrl}/progress/${classroomContentId}/complete`,
      {}
    );
  }

  // ==================== READING PREFERENCES ====================

  getPreferences(): Observable<ReadingPreferences> {
    return this.http.get<ReadingPreferences>(`${this.apiUrl}/preferences`);
  }

  updatePreferences(
    preferences: Partial<ReadingPreferences>
  ): Observable<ReadingPreferences> {
    return this.http.patch<ReadingPreferences>(
      `${this.apiUrl}/preferences`,
      preferences
    );
  }

  // ==================== MICRO QUIZ ====================

  getMicroQuiz(subConceptId: string): Observable<MicroQuiz | null> {
    return this.http.get<MicroQuiz | null>(
      `${this.apiUrl}/quiz/micro/${subConceptId}`
    );
  }

  submitMicroQuiz(
    microQuizId: string,
    answers: QuizAnswer[]
  ): Observable<QuizSubmissionResponse> {
    return this.http.post<QuizSubmissionResponse>(
      `${this.apiUrl}/quiz/micro/${microQuizId}/submit`,
      { answers }
    );
  }

  getQuizAttempts(microQuizId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/quiz/micro/${microQuizId}/attempts`
    );
  }
}
