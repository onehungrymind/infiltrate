import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { API_URL } from '../config/api-url.token';
import {
  LearningPathMap,
  LearningMapProgress,
  NodeProgress,
  NodeDetails,
  Principle,
  SubConcept,
  KnowledgeUnit,
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

  /**
   * Get principle-based learning map for a learning path
   */
  getPrincipleMap(pathId: string): Observable<LearningPathMap | null> {
    return this.http.get<LearningPathMap>(
      `${this.apiUrl}/learning-map/principles/${pathId}`
    ).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Get all learning paths with principle counts for the selector
   */
  getLearningPathsForMap(): Observable<Array<{
    id: string;
    name: string;
    domain: string;
    principleCount: number;
  }>> {
    return this.http.get<Array<{
      id: string;
      name: string;
      domain: string;
      principleCount: number;
    }>>(`${this.apiUrl}/learning-map/learning-paths`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Generate principles for a learning path using AI
   * @param pathId - The learning path ID
   * @param force - If true, delete existing principles before generating
   */
  generatePrinciples(pathId: string, force = true): Observable<{
    principles: Principle[];
    message: string;
  }> {
    return this.http.post<{
      principles: Principle[];
      message: string;
    }>(`${this.apiUrl}/learning-map/generate/${pathId}`, { force });
  }

  /**
   * Trigger content ingestion for a learning path
   * Runs the Patchbay service to ingest content from configured sources
   * @param pathId - The learning path ID
   */
  triggerIngestion(pathId: string): Observable<{
    status: 'completed' | 'failed';
    message: string;
    sourcesProcessed: number;
    itemsIngested: number;
  }> {
    return this.http.post<{
      status: 'completed' | 'failed';
      message: string;
      sourcesProcessed: number;
      itemsIngested: number;
    }>(`${this.apiUrl}/learning-map/ingest/${pathId}`, {});
  }

  /**
   * Trigger content synthesis for a learning path
   * Runs the Synthesizer service to generate knowledge units from raw content
   * @param pathId - The learning path ID
   */
  triggerSynthesis(pathId: string): Observable<{
    status: 'completed' | 'failed';
    message: string;
    rawContentProcessed: number;
    knowledgeUnitsGenerated: number;
  }> {
    return this.http.post<{
      status: 'completed' | 'failed';
      message: string;
      rawContentProcessed: number;
      knowledgeUnitsGenerated: number;
    }>(`${this.apiUrl}/learning-map/synthesize/${pathId}`, {});
  }

  /**
   * Get AI-suggested content sources for a learning path
   * @param pathId - The learning path ID
   */
  suggestSources(pathId: string): Observable<{
    sources: Array<{
      name: string;
      url: string;
      type: string;
      description: string;
      reputation: string;
    }>;
    message: string;
  }> {
    return this.http.post<{
      sources: Array<{
        name: string;
        url: string;
        type: string;
        description: string;
        reputation: string;
      }>;
      message: string;
    }>(`${this.apiUrl}/learning-map/suggest-sources/${pathId}`, {});
  }

  /**
   * Add a suggested source to a learning path
   * @param pathId - The learning path ID
   * @param source - The source to add
   */
  addSource(pathId: string, source: { name: string; url: string; type: string }): Observable<{
    id: string;
    name: string;
    url: string;
    type: string;
    enabled: boolean;
    created: boolean;
  }> {
    return this.http.post<{
      id: string;
      name: string;
      url: string;
      type: string;
      enabled: boolean;
      created: boolean;
    }>(`${this.apiUrl}/learning-map/add-source/${pathId}`, source);
  }

  /**
   * Get sources for a specific learning path (new many-to-many model)
   * @param pathId - The learning path ID
   */
  getSourcesForPath(pathId: string): Observable<Array<{
    id: string;
    url: string;
    type: string;
    name: string;
    enabled: boolean;
    linkId: string;
  }>> {
    return this.http.get<Array<{
      id: string;
      url: string;
      type: string;
      name: string;
      enabled: boolean;
      linkId: string;
    }>>(`${this.apiUrl}/sources/path/${pathId}`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Get all sources with their linked learning paths
   */
  getAllSources(): Observable<Array<{
    id: string;
    url: string;
    type: string;
    name: string;
    linkedPaths: Array<{ id: string; name: string; enabled: boolean }>;
  }>> {
    return this.http.get<Array<{
      id: string;
      url: string;
      type: string;
      name: string;
      linkedPaths: Array<{ id: string; name: string; enabled: boolean }>;
    }>>(`${this.apiUrl}/sources`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Update source link enabled status
   */
  updateSourceLink(sourceId: string, pathId: string, enabled: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/sources/${sourceId}/link/${pathId}`,
      { enabled }
    );
  }

  /**
   * Get a single source by ID
   */
  getSource(id: string): Observable<{
    id: string;
    url: string;
    type: string;
    name: string;
  } | null> {
    return this.http.get<{
      id: string;
      url: string;
      type: string;
      name: string;
    }>(`${this.apiUrl}/sources/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Create a new source (or return existing if URL matches)
   */
  createSource(source: { url: string; type: string; name: string }): Observable<{
    id: string;
    url: string;
    type: string;
    name: string;
    created: boolean;
  }> {
    return this.http.post<{
      id: string;
      url: string;
      type: string;
      name: string;
      created: boolean;
    }>(`${this.apiUrl}/sources`, source);
  }

  /**
   * Update an existing source
   */
  updateSource(id: string, updates: { name?: string; type?: string }): Observable<{
    id: string;
    url: string;
    type: string;
    name: string;
  }> {
    return this.http.patch<{
      id: string;
      url: string;
      type: string;
      name: string;
    }>(`${this.apiUrl}/sources/${id}`, updates);
  }

  /**
   * Delete a source (cascades to all path links)
   */
  deleteSource(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.apiUrl}/sources/${id}`);
  }

  /**
   * Link a source to a learning path
   */
  linkSourceToPath(sourceId: string, pathId: string, enabled = true): Observable<{
    id: string;
    sourceId: string;
    pathId: string;
    enabled: boolean;
  }> {
    return this.http.post<{
      id: string;
      sourceId: string;
      pathId: string;
      enabled: boolean;
    }>(`${this.apiUrl}/sources/${sourceId}/link/${pathId}`, { enabled });
  }

  /**
   * Unlink a source from a learning path
   */
  unlinkSourceFromPath(sourceId: string, pathId: string): Observable<{ unlinked: boolean }> {
    return this.http.delete<{ unlinked: boolean }>(
      `${this.apiUrl}/sources/${sourceId}/link/${pathId}`
    );
  }

  /**
   * Get all learning paths linked to a source
   */
  getLinkedPaths(sourceId: string): Observable<Array<{
    id: string;
    name: string;
    enabled: boolean;
    linkId: string;
  }>> {
    return this.http.get<Array<{
      id: string;
      name: string;
      enabled: boolean;
      linkId: string;
    }>>(`${this.apiUrl}/sources/${sourceId}/paths`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Create a source and link it to a path in one operation
   */
  createAndLinkSource(
    source: { url: string; type: string; name: string },
    pathId: string,
    enabled = true
  ): Observable<{
    id: string;
    url: string;
    type: string;
    name: string;
    enabled: boolean;
    created: boolean;
  }> {
    return this.createSource(source).pipe(
      switchMap(created =>
        this.linkSourceToPath(created.id, pathId, enabled).pipe(
          map(() => ({ ...created, enabled })),
          catchError(() => of({ ...created, enabled })) // Link might already exist
        )
      )
    );
  }

  /**
   * Decompose a principle into sub-concepts using AI
   * @param principleId - The principle ID to decompose
   */
  decomposePrinciple(principleId: string): Observable<{
    subConcepts: SubConcept[];
    message: string;
  }> {
    return this.http.post<{
      subConcepts: SubConcept[];
      message: string;
    }>(`${this.apiUrl}/learning-map/principles/${principleId}/decompose`, {});
  }

  /**
   * Generate a structured knowledge unit for a sub-concept using AI
   * @param subConceptId - The sub-concept ID
   */
  generateStructuredKU(subConceptId: string): Observable<{
    knowledgeUnit: KnowledgeUnit;
    message: string;
  }> {
    return this.http.post<{
      knowledgeUnit: KnowledgeUnit;
      message: string;
    }>(`${this.apiUrl}/learning-map/sub-concepts/${subConceptId}/generate-ku`, {});
  }
}
