import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  SubConcept,
  CreateSubConceptDto,
  UpdateSubConceptDto,
} from '@kasita/common-models';
import { API_URL } from '../../config/api-url.token';

@Injectable({
  providedIn: 'root',
})
export class SubConceptsService {
  model = 'sub-concepts';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<SubConcept[]>(this.getUrl());
  }

  find(id: string) {
    return this.http.get<SubConcept>(this.getUrlWithId(id));
  }

  findByConcept(conceptId: string) {
    return this.http.get<SubConcept[]>(`${this.getUrl()}/concept/${conceptId}`);
  }

  create(subConcept: SubConcept) {
    const createDto: CreateSubConceptDto = {
      conceptId: subConcept.conceptId,
      name: subConcept.name,
      description: subConcept.description,
      order: subConcept.order,
    };
    return this.http.post<SubConcept>(this.getUrl(), createDto);
  }

  update(subConcept: SubConcept) {
    const updateDto: UpdateSubConceptDto = {
      name: subConcept.name,
      description: subConcept.description,
      order: subConcept.order,
    };
    return this.http.patch<SubConcept>(this.getUrlWithId(subConcept.id), updateDto);
  }

  delete(subConcept: SubConcept) {
    return this.http.delete(this.getUrlWithId(subConcept.id));
  }

  // Decoration methods
  addDecoration(subConceptId: string, knowledgeUnitId: string) {
    return this.http.post(
      `${this.getUrlWithId(subConceptId)}/decorations/${knowledgeUnitId}`,
      {}
    );
  }

  removeDecoration(subConceptId: string, knowledgeUnitId: string) {
    return this.http.delete(
      `${this.getUrlWithId(subConceptId)}/decorations/${knowledgeUnitId}`
    );
  }

  getDecorations(subConceptId: string) {
    return this.http.get<any[]>(
      `${this.getUrlWithId(subConceptId)}/decorations`
    );
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string | undefined | null) {
    return `${this.getUrl()}/${id}`;
  }
}
