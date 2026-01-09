import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_URL } from '../config/api-url.token';

export interface NotebookTemplate {
  notebookId: string;
  templateCode: string;
  description: string;
}

export interface NotebookProgress {
  id: string;
  userId: string;
  notebookId: string;
  completedExercises: number[];
  completionRate: number;
  notebookCode?: string;
  validationResults?: string;
  lastSubmittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmitNotebookRequest {
  notebookId: string;
  notebookCode: string;
  userId: string;
  completedExercises: number[];
  validationResults?: any[];
}

export interface SubmitNotebookResponse {
  validationResults: any;
  completedExercises: number[];
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotebooksService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  getTemplate(notebookId: string): Observable<NotebookTemplate> {
    return this.http.get<NotebookTemplate>(`${this.apiUrl}/notebooks/template/${notebookId}`);
  }

  submitNotebook(request: SubmitNotebookRequest): Observable<SubmitNotebookResponse> {
    return this.http.post<SubmitNotebookResponse>(`${this.apiUrl}/notebooks/submit`, request);
  }

  getUserProgress(userId: string): Observable<NotebookProgress[]> {
    return this.http.get<NotebookProgress[]>(`${this.apiUrl}/notebooks/user/${userId}/progress`);
  }

  getNotebookProgress(userId: string, notebookId: string): Observable<NotebookProgress | null> {
    return this.http.get<NotebookProgress>(`${this.apiUrl}/notebooks/user/${userId}/progress/${notebookId}`).pipe(
      catchError((error: HttpErrorResponse) => {
        // 404 is expected when user hasn't created progress yet - return null instead of error
        if (error.status === 404) {
          return of(null);
        }
        // Re-throw other errors
        throw error;
      })
    );
  }
}
