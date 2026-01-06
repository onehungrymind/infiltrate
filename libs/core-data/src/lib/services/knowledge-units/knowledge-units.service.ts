import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  KnowledgeUnit,
  CreateKnowledgeUnitDto,
  UpdateKnowledgeUnitDto,
} from '@kasita/common-models';
import {
  extractDtoProperties,
  getDtoKeys,
  ENTITY_DTO_KEYS,
} from '../../utils/dto.utils';
import { API_URL } from '../../config/api-url.token';

/**
 * Converts a KnowledgeUnit to CreateKnowledgeUnitDto by excluding auto-generated fields
 */
function toCreateKnowledgeUnitDto(
  knowledgeUnit: KnowledgeUnit,
): CreateKnowledgeUnitDto {
  const createDtoKeys = getDtoKeys<CreateKnowledgeUnitDto>(
    ENTITY_DTO_KEYS.KNOWLEDGE_UNITS,
  );
  return extractDtoProperties<CreateKnowledgeUnitDto>(
    knowledgeUnit,
    createDtoKeys,
  ) as CreateKnowledgeUnitDto;
}

/**
 * Converts a KnowledgeUnit to UpdateKnowledgeUnitDto by excluding auto-generated fields
 */
function toUpdateKnowledgeUnitDto(
  knowledgeUnit: KnowledgeUnit,
): UpdateKnowledgeUnitDto {
  const updateDtoKeys = getDtoKeys<UpdateKnowledgeUnitDto>(
    ENTITY_DTO_KEYS.KNOWLEDGE_UNITS,
  );
  return extractDtoProperties<UpdateKnowledgeUnitDto>(
    knowledgeUnit,
    updateDtoKeys,
  );
}

@Injectable({
  providedIn: 'root',
})
export class KnowledgeUnitsService {
  model = 'knowledge-units';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<KnowledgeUnit[]>(this.getUrl());
  }

  find(id: string) {
    return this.http.get<KnowledgeUnit>(this.getUrlWithId(id));
  }

  create(knowledgeUnit: KnowledgeUnit) {
    const createDto = toCreateKnowledgeUnitDto(knowledgeUnit);
    return this.http.post(this.getUrl(), createDto);
  }

  update(knowledgeUnit: KnowledgeUnit) {
    const updateDto = toUpdateKnowledgeUnitDto(knowledgeUnit);
    return this.http.patch(this.getUrlWithId(knowledgeUnit.id), updateDto);
  }

  delete(knowledgeUnit: KnowledgeUnit) {
    return this.http.delete(this.getUrlWithId(knowledgeUnit.id));
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string | undefined | null) {
    return `${this.getUrl()}/${id}`;
  }
}
