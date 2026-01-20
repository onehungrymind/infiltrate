import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  BuildJob,
  CreateBuildJobDto,
  JobProgressEvent,
  JobProgressResponse,
} from '@kasita/common-models';
import { Observable } from 'rxjs';

import { API_URL } from '../../config/api-url.token';
import { WebSocketService } from '../websocket/websocket.service';

@Injectable({
  providedIn: 'root',
})
export class JobsService {
  private model = 'jobs';
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private wsService = inject(WebSocketService);

  /**
   * Create a new build job for a learning path
   */
  createBuildJob(dto: CreateBuildJobDto): Observable<BuildJob> {
    return this.http.post<BuildJob>(`${this.getUrl()}/build`, dto);
  }

  /**
   * Get all build jobs (most recent first)
   */
  all(): Observable<BuildJob[]> {
    return this.http.get<BuildJob[]>(this.getUrl());
  }

  /**
   * Get a single build job by ID
   */
  find(id: string): Observable<BuildJob> {
    return this.http.get<BuildJob>(this.getUrlWithId(id));
  }

  /**
   * Get progress for a build job (includes steps)
   */
  getProgress(id: string): Observable<JobProgressResponse> {
    return this.http.get<JobProgressResponse>(`${this.getUrlWithId(id)}/progress`);
  }

  /**
   * Get all build jobs for a learning path
   */
  findByPath(pathId: string): Observable<BuildJob[]> {
    return this.http.get<BuildJob[]>(`${this.getUrl()}/path/${pathId}`);
  }

  /**
   * Get the active (pending or running) job for a learning path
   */
  getActiveJob(pathId: string): Observable<BuildJob | null> {
    return this.http.get<BuildJob | null>(`${this.getUrl()}/path/${pathId}/active`);
  }

  /**
   * Cancel a build job
   */
  cancel(id: string): Observable<BuildJob> {
    return this.http.delete<BuildJob>(this.getUrlWithId(id));
  }

  /**
   * Subscribe to real-time progress events for a build job via WebSocket
   */
  subscribeToJobEvents(jobId: string): Observable<JobProgressEvent> {
    return this.wsService.subscribeToJob(jobId);
  }

  private getUrl(): string {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string): string {
    return `${this.getUrl()}/${id}`;
  }
}
