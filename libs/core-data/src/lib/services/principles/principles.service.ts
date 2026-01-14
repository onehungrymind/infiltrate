import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Principle,
  CreatePrincipleDto,
  UpdatePrincipleDto,
} from '@kasita/common-models';
import {
  extractDtoProperties,
  getDtoKeys,
  ENTITY_DTO_KEYS,
} from '../../utils/dto.utils';
import { API_URL } from '../../config/api-url.token';

/**
 * Converts a Principle to CreatePrincipleDto by excluding auto-generated fields
 */
function toCreatePrincipleDto(
  principle: Principle,
): CreatePrincipleDto {
  const createDtoKeys = getDtoKeys<CreatePrincipleDto>(
    ENTITY_DTO_KEYS.PRINCIPLES,
  );
  return extractDtoProperties<CreatePrincipleDto>(
    principle,
    createDtoKeys,
  ) as CreatePrincipleDto;
}

/**
 * Converts a Principle to UpdatePrincipleDto by excluding auto-generated fields
 */
function toUpdatePrincipleDto(
  principle: Principle,
): UpdatePrincipleDto {
  const updateDtoKeys = getDtoKeys<UpdatePrincipleDto>(
    ENTITY_DTO_KEYS.PRINCIPLES,
  );
  return extractDtoProperties<UpdatePrincipleDto>(
    principle,
    updateDtoKeys,
  );
}

@Injectable({
  providedIn: 'root',
})
export class PrinciplesService {
  model = 'principles';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<Principle[]>(this.getUrl());
  }

  find(id: string) {
    return this.http.get<Principle>(this.getUrlWithId(id));
  }

  findByPath(pathId: string) {
    return this.http.get<Principle[]>(`${this.getUrl()}/path/${pathId}`);
  }

  create(principle: Principle) {
    const createDto = toCreatePrincipleDto(principle);
    return this.http.post(this.getUrl(), createDto);
  }

  update(principle: Principle) {
    const updateDto = toUpdatePrincipleDto(principle);
    return this.http.patch(this.getUrlWithId(principle.id), updateDto);
  }

  delete(principle: Principle) {
    return this.http.delete(this.getUrlWithId(principle.id));
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string | undefined | null) {
    return `${this.getUrl()}/${id}`;
  }
}
