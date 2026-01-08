import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
} from '@kasita/common-models';
import {
  extractDtoProperties,
  getDtoKeys,
  ENTITY_DTO_KEYS,
} from '../../../lib/utils/dto.utils';
import { API_URL } from '../../config/api-url.token';

/**
 * Converts a User to CreateUserDto by excluding auto-generated fields
 */
function toCreateUserDto(
  user: User,
): CreateUserDto {
  const createDtoKeys = getDtoKeys<CreateUserDto>(
    ENTITY_DTO_KEYS.USERS,
  );
  return extractDtoProperties<CreateUserDto>(
    user,
    createDtoKeys,
  ) as CreateUserDto;
}

/**
 * Converts a User to UpdateUserDto by excluding auto-generated fields
 */
function toUpdateUserDto(
  user: User,
): UpdateUserDto {
  const updateDtoKeys = getDtoKeys<UpdateUserDto>(
    ENTITY_DTO_KEYS.USERS,
  );
  return extractDtoProperties<UpdateUserDto>(
    user,
    updateDtoKeys,
  );
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  model = 'users';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<User[]>(this.getUrl());
  }

  find(id: string) {
    return this.http.get<User>(this.getUrlWithId(id));
  }

  create(user: User) {
    const createDto = toCreateUserDto(user);
    return this.http.post(this.getUrl(), createDto);
  }

  update(user: User) {
    const updateDto = toUpdateUserDto(user);
    return this.http.patch(this.getUrlWithId(user.id), updateDto);
  }

  delete(user: User) {
    return this.http.delete(this.getUrlWithId(user.id));
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string | undefined | null) {
    return `${this.getUrl()}/${id}`;
  }
}
