import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../../config/api-url.token';

export interface ClassroomOverview {
  total: number;
  byStatus: {
    ready: number;
    generating: number;
    pending: number;
    error: number;
  };
  learningPathsCount: number;
  conceptsCount: number;
  completionRate: number;
}

export interface ClassroomContent {
  id: string;
  subConceptId: string;
  conceptId: string;
  learningPathId: string;
  title: string;
  summary: string;
  sections: any[];
  status: 'pending' | 'generating' | 'ready' | 'error';
  errorMessage?: string;
  generatedAt?: Date;
  regeneratedAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PathStatus {
  learningPathId: string;
  status: 'ready' | 'partial' | 'pending';
  progress: { ready: number; total: number };
  concepts: {
    conceptId: string;
    status: string;
    progress: { ready: number; total: number };
    subConcepts: {
      subConceptId: string;
      title: string;
      status: string;
      errorMessage?: string;
      generatedAt?: Date;
      version: number;
    }[];
  }[];
}

export interface ContentListResponse {
  items: ClassroomContent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ContentListQuery {
  page?: number;
  limit?: number;
  status?: string;
  learningPathId?: string;
  conceptId?: string;
}

export interface JobInfo {
  id: string;
  data: any;
  timestamp: number;
  progress?: number;
  finishedOn?: number;
  failedReason?: string;
}

export interface JobsResponse {
  waiting: JobInfo[];
  active: JobInfo[];
  completed: JobInfo[];
  failed: JobInfo[];
}

export interface GenerateResponse {
  message: string;
  jobId: string;
  learningPathId?: string;
  subConceptId?: string;
  conceptId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClassroomAdminService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private get baseUrl() {
    return `${this.apiUrl}/admin/classroom`;
  }

  // ==================== STATUS & REPORTING ====================

  getOverview() {
    return this.http.get<ClassroomOverview>(`${this.baseUrl}/overview`);
  }

  getPathStatus(learningPathId: string) {
    return this.http.get<PathStatus>(`${this.baseUrl}/paths/${learningPathId}/status`);
  }

  getContentList(query: ContentListQuery = {}) {
    const params: any = {};
    if (query.page) params.page = query.page.toString();
    if (query.limit) params.limit = query.limit.toString();
    if (query.status) params.status = query.status;
    if (query.learningPathId) params.learningPathId = query.learningPathId;
    if (query.conceptId) params.conceptId = query.conceptId;

    return this.http.get<ContentListResponse>(`${this.baseUrl}/content`, { params });
  }

  getContent(contentId: string) {
    return this.http.get<ClassroomContent>(`${this.baseUrl}/content/${contentId}`);
  }

  getErrors() {
    return this.http.get<ClassroomContent[]>(`${this.baseUrl}/errors`);
  }

  // ==================== GENERATION MANAGEMENT ====================

  generateForPath(learningPathId: string, force = false) {
    return this.http.post<GenerateResponse>(
      `${this.baseUrl}/paths/${learningPathId}/generate`,
      { force }
    );
  }

  generateForConcept(conceptId: string) {
    return this.http.post<GenerateResponse>(
      `${this.baseUrl}/concepts/${conceptId}/generate`,
      {}
    );
  }

  generateForSubConcept(subConceptId: string, options: { conceptName?: string; conceptId?: string; learningPathId?: string } = {}) {
    return this.http.post<GenerateResponse>(
      `${this.baseUrl}/sub-concepts/${subConceptId}/generate`,
      options
    );
  }

  clearPathContent(learningPathId: string) {
    return this.http.delete<{ message: string; learningPathId: string; deletedCount: number }>(
      `${this.baseUrl}/paths/${learningPathId}/content`
    );
  }

  // ==================== CONTENT EDITING ====================

  updateContent(contentId: string, updates: { title?: string; summary?: string; sections?: any[] }) {
    return this.http.patch<ClassroomContent>(`${this.baseUrl}/content/${contentId}`, updates);
  }

  approveContent(contentId: string) {
    return this.http.post<ClassroomContent>(`${this.baseUrl}/content/${contentId}/approve`, {});
  }

  regenerateContent(contentId: string) {
    return this.http.post<GenerateResponse>(`${this.baseUrl}/content/${contentId}/regenerate`, {});
  }

  // ==================== JOB MANAGEMENT ====================

  getJobs() {
    return this.http.get<JobsResponse>(`${this.baseUrl}/jobs`);
  }

  getJob(jobId: string) {
    return this.http.get<JobInfo>(`${this.baseUrl}/jobs/${jobId}`);
  }

  cancelJob(jobId: string) {
    return this.http.delete<{ message: string; jobId: string }>(`${this.baseUrl}/jobs/${jobId}`);
  }
}
