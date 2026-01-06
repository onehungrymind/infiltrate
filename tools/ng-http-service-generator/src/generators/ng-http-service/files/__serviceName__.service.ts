import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  <%= singularClassName %>,
  Create<%= singularClassName %>Dto,
  Update<%= singularClassName %>Dto,
} from '<%= npmScope %>/api-interfaces';
import {
  extractDtoProperties,
  getDtoKeys,
  ENTITY_DTO_KEYS,
} from '../../utils/dto.utils';
import { API_URL } from '../../config/api-url.token';

/**
 * Converts a <%= singularClassName %> to Create<%= singularClassName %>Dto by excluding auto-generated fields
 */
function toCreate<%= singularClassName %>Dto(<%= singularPropertyName %>: <%= singularClassName %>): Create<%= singularClassName %>Dto {
  const createDtoKeys = getDtoKeys<Create<%= singularClassName %>Dto>(ENTITY_DTO_KEYS.<%= serviceScreamingSnakeCase %>);
  return extractDtoProperties<Create<%= singularClassName %>Dto>(
    <%= singularPropertyName %>,
    createDtoKeys
  ) as Create<%= singularClassName %>Dto;
}

/**
 * Converts a <%= singularClassName %> to Update<%= singularClassName %>Dto by excluding auto-generated fields
 */
function toUpdate<%= singularClassName %>Dto(<%= singularPropertyName %>: <%= singularClassName %>): Update<%= singularClassName %>Dto {
  const updateDtoKeys = getDtoKeys<Update<%= singularClassName %>Dto>(ENTITY_DTO_KEYS.<%= serviceScreamingSnakeCase %>);
  return extractDtoProperties<Update<%= singularClassName %>Dto>(<%= singularPropertyName %>, updateDtoKeys);
}

@Injectable({
  providedIn: 'root',
})
export class <%= serviceClassName %>Service {
  model = '<%= serviceCamelCase %>';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<<%= singularClassName %>[]>(this.getUrl());
  }

  find(id: string) {
    return this.http.get<<%= singularClassName %>>(this.getUrlWithId(id));
  }

  create(<%= singularPropertyName %>: <%= singularClassName %>) {
    const createDto = toCreate<%= singularClassName %>Dto(<%= singularPropertyName %>);
    return this.http.post(this.getUrl(), createDto);
  }

  update(<%= singularPropertyName %>: <%= singularClassName %>) {
    const updateDto = toUpdate<%= singularClassName %>Dto(<%= singularPropertyName %>);
    return this.http.patch(this.getUrlWithId(<%= singularPropertyName %>.id), updateDto);
  }

  delete(<%= singularPropertyName %>: <%= singularClassName %>) {
    return this.http.delete(this.getUrlWithId(<%= singularPropertyName %>.id));
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string | undefined | null) {
    return `${this.getUrl()}/${id}`;
  }
}
