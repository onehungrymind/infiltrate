import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../config/api-url.token';

export interface GraphNode {
  id: string;
  label: string;
  type: 'prerequisite' | 'core' | 'subtopic' | 'skill' | 'tool';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  level?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship?: 'prerequisite' | 'leads-to' | 'related-to';
}

export interface KnowledgeGraph {
  id?: string;
  topic: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphSearchHistory {
  id: string;
  userId: string;
  topic: string;
  graphData: KnowledgeGraph;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class KnowledgeGraphService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private model = 'knowledge-graph';

  generate(topic: string): Observable<KnowledgeGraph> {
    return this.http.post<KnowledgeGraph>(`${this.apiUrl}/${this.model}/generate`, { topic });
  }

  getHistory(userId = 'anonymous'): Observable<GraphSearchHistory[]> {
    return this.http.get<GraphSearchHistory[]>(`${this.apiUrl}/${this.model}/history`, {
      params: { userId },
    });
  }

  getById(id: string): Observable<KnowledgeGraph> {
    return this.http.get<KnowledgeGraph>(`${this.apiUrl}/${this.model}/${id}`);
  }
}
