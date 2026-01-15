import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Challenge,
  CreateChallengeDto,
  UpdateChallengeDto,
} from '@kasita/common-models';
import {
  extractDtoProperties,
  getDtoKeys,
  ENTITY_DTO_KEYS,
} from '../../utils/dto.utils';
import { API_URL } from '../../config/api-url.token';

/**
 * Converts a Challenge to CreateChallengeDto by excluding auto-generated fields
 */
function toCreateChallengeDto(challenge: Challenge): CreateChallengeDto {
  const createDtoKeys = getDtoKeys<CreateChallengeDto>(
    ENTITY_DTO_KEYS.CHALLENGES,
  );
  return extractDtoProperties<CreateChallengeDto>(
    challenge,
    createDtoKeys,
  ) as CreateChallengeDto;
}

/**
 * Converts a Challenge to UpdateChallengeDto by excluding auto-generated fields
 */
function toUpdateChallengeDto(challenge: Challenge): UpdateChallengeDto {
  const updateDtoKeys = getDtoKeys<UpdateChallengeDto>(
    ENTITY_DTO_KEYS.CHALLENGES,
  );
  return extractDtoProperties<UpdateChallengeDto>(challenge, updateDtoKeys);
}

@Injectable({
  providedIn: 'root',
})
export class ChallengesService {
  model = 'challenges';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<Challenge[]>(this.getUrl());
  }

  find(id: string) {
    return this.http.get<Challenge>(this.getUrlWithId(id));
  }

  findByUnit(unitId: string) {
    return this.http.get<Challenge[]>(`${this.getUrl()}/unit/${unitId}`);
  }

  findActive() {
    return this.http.get<Challenge[]>(`${this.getUrl()}?isActive=true`);
  }

  create(challenge: Challenge) {
    const createDto = toCreateChallengeDto(challenge);
    return this.http.post<Challenge>(this.getUrl(), createDto);
  }

  update(challenge: Challenge) {
    const updateDto = toUpdateChallengeDto(challenge);
    return this.http.patch<Challenge>(
      this.getUrlWithId(challenge.id),
      updateDto,
    );
  }

  delete(challenge: Challenge) {
    return this.http.delete(this.getUrlWithId(challenge.id));
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string | undefined | null) {
    return `${this.getUrl()}/${id}`;
  }
}
