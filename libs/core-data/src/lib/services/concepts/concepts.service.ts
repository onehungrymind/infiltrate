import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Concept,
  CreateConceptDto,
  UpdateConceptDto,
} from '@kasita/common-models';
import {
  extractDtoProperties,
  getDtoKeys,
  ENTITY_DTO_KEYS,
} from '../../utils/dto.utils';
import { API_URL } from '../../config/api-url.token';

/**
 * Converts a Concept to CreateConceptDto by excluding auto-generated fields
 */
function toCreateConceptDto(
  concept: Concept,
): CreateConceptDto {
  const createDtoKeys = getDtoKeys<CreateConceptDto>(
    ENTITY_DTO_KEYS.CONCEPTS,
  );
  return extractDtoProperties<CreateConceptDto>(
    concept,
    createDtoKeys,
  ) as CreateConceptDto;
}

/**
 * Converts a Concept to UpdateConceptDto by excluding auto-generated fields
 */
function toUpdateConceptDto(
  concept: Concept,
): UpdateConceptDto {
  const updateDtoKeys = getDtoKeys<UpdateConceptDto>(
    ENTITY_DTO_KEYS.CONCEPTS,
  );
  return extractDtoProperties<UpdateConceptDto>(
    concept,
    updateDtoKeys,
  );
}

@Injectable({
  providedIn: 'root',
})
export class ConceptsService {
  model = 'concepts';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<Concept[]>(this.getUrl());
  }

  find(id: string) {
    return this.http.get<Concept>(this.getUrlWithId(id));
  }

  findByPath(pathId: string) {
    return this.http.get<Concept[]>(`${this.getUrl()}/path/${pathId}`);
  }

  create(concept: Concept) {
    const createDto = toCreateConceptDto(concept);
    return this.http.post(this.getUrl(), createDto);
  }

  update(concept: Concept) {
    const updateDto = toUpdateConceptDto(concept);
    return this.http.patch(this.getUrlWithId(concept.id), updateDto);
  }

  delete(concept: Concept) {
    return this.http.delete(this.getUrlWithId(concept.id));
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string | undefined | null) {
    return `${this.getUrl()}/${id}`;
  }
}
