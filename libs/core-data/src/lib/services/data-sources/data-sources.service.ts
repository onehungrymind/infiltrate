import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  DataSource,
  CreateDataSourceDto,
  UpdateDataSourceDto,
} from '@kasita/common-models';
import {
  extractDtoProperties,
  getDtoKeys,
  ENTITY_DTO_KEYS,
} from '../../utils/dto.utils';
import { API_URL } from '../../config/api-url.token';

/**
 * Converts a DataSource to CreateDataSourceDto by excluding auto-generated fields
 */
function toCreateDataSourceDto(
  dataSource: DataSource,
): CreateDataSourceDto {
  const createDtoKeys = getDtoKeys<CreateDataSourceDto>(
    ENTITY_DTO_KEYS.DATA_SOURCES,
  );
  return extractDtoProperties<CreateDataSourceDto>(
    dataSource,
    createDtoKeys,
  ) as CreateDataSourceDto;
}

/**
 * Converts a DataSource to UpdateDataSourceDto by excluding auto-generated fields
 */
function toUpdateDataSourceDto(
  dataSource: DataSource,
): UpdateDataSourceDto {
  const updateDtoKeys = getDtoKeys<UpdateDataSourceDto>(
    ENTITY_DTO_KEYS.DATA_SOURCES,
  );
  return extractDtoProperties<UpdateDataSourceDto>(
    dataSource,
    updateDtoKeys,
  );
}

@Injectable({
  providedIn: 'root',
})
export class DataSourcesService {
  model = 'data-sources';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<DataSource[]>(this.getUrl());
  }

  find(id: string) {
    return this.http.get<DataSource>(this.getUrlWithId(id));
  }

  create(dataSource: DataSource) {
    const createDto = toCreateDataSourceDto(dataSource);
    return this.http.post(this.getUrl(), createDto);
  }

  update(dataSource: DataSource) {
    const updateDto = toUpdateDataSourceDto(dataSource);
    return this.http.patch(this.getUrlWithId(dataSource.id), updateDto);
  }

  delete(dataSource: DataSource) {
    return this.http.delete(this.getUrlWithId(dataSource.id));
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string | undefined | null) {
    return `${this.getUrl()}/${id}`;
  }
}

