import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  SourceConfig,
  CreateSourceConfigDto,
  UpdateSourceConfigDto,
} from '@kasita/common-models';
import {
  extractDtoProperties,
  getDtoKeys,
  ENTITY_DTO_KEYS,
} from '../../utils/dto.utils';
import { API_URL } from '../../config/api-url.token';

/**
 * Converts a SourceConfig to CreateSourceConfigDto by excluding auto-generated fields
 */
function toCreateSourceConfigDto(
  sourceConfig: SourceConfig,
): CreateSourceConfigDto {
  const createDtoKeys = getDtoKeys<CreateSourceConfigDto>(
    ENTITY_DTO_KEYS.SOURCE_CONFIGS,
  );
  return extractDtoProperties<CreateSourceConfigDto>(
    sourceConfig,
    createDtoKeys,
  ) as CreateSourceConfigDto;
}

/**
 * Converts a SourceConfig to UpdateSourceConfigDto by excluding auto-generated fields
 */
function toUpdateSourceConfigDto(
  sourceConfig: SourceConfig,
): UpdateSourceConfigDto {
  const updateDtoKeys = getDtoKeys<UpdateSourceConfigDto>(
    ENTITY_DTO_KEYS.SOURCE_CONFIGS,
  );
  return extractDtoProperties<UpdateSourceConfigDto>(
    sourceConfig,
    updateDtoKeys,
  );
}

@Injectable({
  providedIn: 'root',
})
export class SourceConfigsService {
  model = 'source-configs';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<SourceConfig[]>(this.getUrl());
  }

  find(id: string) {
    return this.http.get<SourceConfig>(this.getUrlWithId(id));
  }

  create(sourceConfig: SourceConfig) {
    const createDto = toCreateSourceConfigDto(sourceConfig);
    return this.http.post(this.getUrl(), createDto);
  }

  update(sourceConfig: SourceConfig) {
    const updateDto = toUpdateSourceConfigDto(sourceConfig);
    return this.http.patch(this.getUrlWithId(sourceConfig.id), updateDto);
  }

  delete(sourceConfig: SourceConfig) {
    return this.http.delete(this.getUrlWithId(sourceConfig.id));
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string | undefined | null) {
    return `${this.getUrl()}/${id}`;
  }
}
