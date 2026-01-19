import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Session,
  SessionTemplate,
  CreateSessionDto,
  UpdateSessionDto,
  GenerateSessionDto,
} from '@kasita/common-models';
import { API_URL } from '../../config/api-url.token';

export interface PaginatedSessions {
  sessions: Session[];
  total: number;
  page: number;
  limit: number;
}

export interface SessionQueryParams {
  page?: number;
  limit?: number;
  domain?: string;
  difficulty?: string;
  visibility?: string;
  search?: string;
  tags?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GymnasiumService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private getUrl() {
    return `${this.apiUrl}/gymnasium`;
  }

  // === Sessions ===

  findAllSessions(params?: SessionQueryParams) {
    return this.http.get<PaginatedSessions>(`${this.getUrl()}/sessions`, { params: params as any });
  }

  findPublicSessions(limit = 10) {
    return this.http.get<Session[]>(`${this.getUrl()}/sessions/public`, { params: { limit } });
  }

  findSessionById(id: string) {
    return this.http.get<Session>(`${this.getUrl()}/sessions/${id}`);
  }

  findSessionBySlug(slug: string) {
    return this.http.get<Session>(`${this.getUrl()}/sessions/by-slug/${slug}`);
  }

  renderSessionBySlug(slug: string, templateId?: string) {
    const url = `${this.getUrl()}/sessions/by-slug/${slug}/render`;
    if (templateId) {
      return this.http.get(url, {
        params: { template: templateId },
        responseType: 'text',
      });
    }
    return this.http.get(url, { responseType: 'text' });
  }

  getSessionRaw(id: string) {
    return this.http.get<Session>(`${this.getUrl()}/sessions/${id}/raw`);
  }

  renderSession(id: string, templateId?: string) {
    const url = `${this.getUrl()}/sessions/${id}/render`;
    if (templateId) {
      return this.http.get(url, {
        params: { template: templateId },
        responseType: 'text',
      });
    }
    return this.http.get(url, { responseType: 'text' });
  }

  createSession(dto: CreateSessionDto) {
    return this.http.post<Session>(`${this.getUrl()}/sessions`, dto);
  }

  updateSession(id: string, dto: UpdateSessionDto) {
    return this.http.patch<Session>(`${this.getUrl()}/sessions/${id}`, dto);
  }

  deleteSession(id: string) {
    return this.http.delete<{ success: boolean }>(`${this.getUrl()}/sessions/${id}`);
  }

  publishSession(id: string) {
    return this.http.post<Session>(`${this.getUrl()}/sessions/${id}/publish`, {});
  }

  unpublishSession(id: string) {
    return this.http.post<Session>(`${this.getUrl()}/sessions/${id}/unpublish`, {});
  }

  // === Templates ===

  findAllTemplates() {
    return this.http.get<SessionTemplate[]>(`${this.getUrl()}/templates`);
  }

  getDefaultTemplate() {
    return this.http.get<SessionTemplate>(`${this.getUrl()}/templates/default`);
  }

  findTemplateById(id: string) {
    return this.http.get<SessionTemplate>(`${this.getUrl()}/templates/${id}`);
  }

  // === AI Generation ===

  generateSession(dto: GenerateSessionDto) {
    return this.http.post<Session>(`${this.getUrl()}/sessions/generate`, dto);
  }

  generateSessionPreview(dto: GenerateSessionDto) {
    return this.http.post<any>(`${this.getUrl()}/sessions/generate/preview`, dto);
  }

  // === Seed (Dev) ===

  seedSampleSession() {
    return this.http.post<Session>(`${this.getUrl()}/seed`, {});
  }
}
