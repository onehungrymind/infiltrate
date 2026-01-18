import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  RawContent,
  CreateRawContentDto,
  UpdateRawContentDto,
} from '@kasita/common-models';
import {
  extractDtoProperties,
  getDtoKeys,
  ENTITY_DTO_KEYS,
} from '../../utils/dto.utils';
import { API_URL } from '../../config/api-url.token';

/**
 * Converts a RawContent to CreateRawContentDto by excluding auto-generated fields
 */
function toCreateRawContentDto(rawContent: RawContent): CreateRawContentDto {
  const createDtoKeys = getDtoKeys<CreateRawContentDto>(
    ENTITY_DTO_KEYS.RAW_CONTENT,
  );
  return extractDtoProperties<CreateRawContentDto>(
    rawContent,
    createDtoKeys,
  ) as CreateRawContentDto;
}

/**
 * Converts a RawContent to UpdateRawContentDto by excluding auto-generated fields
 */
function toUpdateRawContentDto(rawContent: RawContent): UpdateRawContentDto {
  const updateDtoKeys = getDtoKeys<UpdateRawContentDto>(
    ENTITY_DTO_KEYS.RAW_CONTENT,
  );
  return extractDtoProperties<UpdateRawContentDto>(rawContent, updateDtoKeys);
}

@Injectable({
  providedIn: 'root',
})
export class RawContentService {
  model = 'raw-content';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<RawContent[]>(this.getUrl());
  }

  find(id: string) {
    return this.http.get<RawContent>(this.getUrlWithId(id));
  }

  findByPath(pathId: string) {
    return this.http.get<RawContent[]>(`${this.getUrl()}/path/${pathId}`);
  }

  create(rawContent: RawContent) {
    const createDto = toCreateRawContentDto(rawContent);
    return this.http.post(this.getUrl(), createDto);
  }

  update(rawContent: RawContent) {
    const updateDto = toUpdateRawContentDto(rawContent);
    return this.http.patch(this.getUrlWithId(rawContent.id), updateDto);
  }

  delete(rawContent: RawContent) {
    return this.http.delete(this.getUrlWithId(rawContent.id));
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string | undefined | null) {
    return `${this.getUrl()}/${id}`;
  }
}
