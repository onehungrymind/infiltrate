import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_URL } from '../config/api-url.token';
import {
  LearningPathMap,
  LearningMapProgress,
  NodeProgress,
  NodeDetails,
} from '@kasita/common-models';

@Injectable({
  providedIn: 'root',
})
export class LearningMapService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  /**
   * Get learning path map structure
   */
  getLearningPath(userId: string, outcomeId: string): Observable<LearningPathMap | null> {
    return this.http.get<LearningPathMap>(
      `${this.apiUrl}/learning-map/path/${outcomeId}?userId=${userId}`
    ).pipe(
      catchError(() => {
        // Return empty observable on error - component will load mock data
        return of(null);
      })
    );
  }

  /**
   * Get user progress for a learning path
   */
  getUserProgress(userId: string, pathId: string): Observable<LearningMapProgress> {
    return this.http.get<LearningMapProgress>(
      `${this.apiUrl}/learning-map/progress/${pathId}?userId=${userId}`
    ).pipe(
      catchError(() => of(null as any))
    );
  }

  /**
   * Get detailed information about a specific node
   */
  getNodeDetails(nodeId: string): Observable<NodeDetails> {
    return this.http.get<NodeDetails>(`${this.apiUrl}/learning-map/nodes/${nodeId}`).pipe(
      catchError(() => of(null as any))
    );
  }

  /**
   * Update node status (mark complete, start, etc.)
   */
  updateNodeStatus(
    nodeId: string,
    status: string,
    metrics?: Record<string, any>
  ): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/learning-map/nodes/${nodeId}/status`, {
      status,
      metrics,
    });
  }

  /**
   * Unlock a node (when prerequisites are met)
   */
  unlockNode(nodeId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/learning-map/nodes/${nodeId}/unlock`, {});
  }

  /**
   * Record node completion with metrics
   */
  recordNodeCompletion(
    nodeId: string,
    metrics: Record<string, any>
  ): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/learning-map/nodes/${nodeId}/complete`, {
      metrics,
    });
  }

  /**
   * Get estimated time to completion for an outcome
   */
  getEstimatedTimeToCompletion(outcomeId: string): Observable<{ hours: number; days: number }> {
    return this.http.get<{ hours: number; days: number }>(
      `${this.apiUrl}/learning-map/outcomes/${outcomeId}/time-estimate`
    ).pipe(
      catchError(() => of({ hours: 0, days: 0 }))
    );
  }
}
