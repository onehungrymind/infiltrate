import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  UserProgress,
  CreateUserProgressDto,
  UpdateUserProgressDto,
  RecordAttemptDto,
  StudyStats,
} from '@kasita/common-models';
import {
  extractDtoProperties,
  getDtoKeys,
  ENTITY_DTO_KEYS,
} from '../../utils/dto.utils';
import { API_URL } from '../../config/api-url.token';

/**
 * Converts a UserProgress to CreateUserProgressDto by excluding auto-generated fields
 */
function toCreateUserProgressDto(
  userProgress: UserProgress,
): CreateUserProgressDto {
  const createDtoKeys = getDtoKeys<CreateUserProgressDto>(
    ENTITY_DTO_KEYS.USER_PROGRESS,
  );
  return extractDtoProperties<CreateUserProgressDto>(
    userProgress,
    createDtoKeys,
  ) as CreateUserProgressDto;
}

/**
 * Converts a UserProgress to UpdateUserProgressDto by excluding auto-generated fields
 */
function toUpdateUserProgressDto(
  userProgress: UserProgress,
): UpdateUserProgressDto {
  const updateDtoKeys = getDtoKeys<UpdateUserProgressDto>(
    ENTITY_DTO_KEYS.USER_PROGRESS,
  );
  return extractDtoProperties<UpdateUserProgressDto>(
    userProgress,
    updateDtoKeys,
  );
}

@Injectable({
  providedIn: 'root',
})
export class UserProgressService {
  model = 'user-progress';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<UserProgress[]>(this.getUrl());
  }

  find(id: string) {
    return this.http.get<UserProgress>(this.getUrlWithId(id));
  }

  create(userProgress: UserProgress) {
    const createDto = toCreateUserProgressDto(userProgress);
    return this.http.post(this.getUrl(), createDto);
  }

  update(userProgress: UserProgress) {
    const updateDto = toUpdateUserProgressDto(userProgress);
    return this.http.patch(this.getUrlWithId(userProgress.id), updateDto);
  }

  delete(userProgress: UserProgress) {
    return this.http.delete(this.getUrlWithId(userProgress.id));
  }

  /**
   * Record a study attempt using SM-2 algorithm
   */
  recordAttempt(dto: RecordAttemptDto) {
    return this.http.post<UserProgress>(`${this.getUrl()}/record-attempt`, dto);
  }

  /**
   * Get all progress records due for review for a user
   */
  getDueForReview(userId: string) {
    return this.http.get<UserProgress[]>(`${this.getUrl()}/due-for-review`, {
      params: { userId },
    });
  }

  /**
   * Get study statistics for a user
   */
  getStudyStats(userId: string) {
    return this.http.get<StudyStats>(`${this.getUrl()}/stats`, {
      params: { userId },
    });
  }

  /**
   * Get all progress records for a user
   */
  getByUser(userId: string) {
    return this.http.get<UserProgress[]>(`${this.getUrl()}/user/${userId}`);
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string | undefined | null) {
    return `${this.getUrl()}/${id}`;
  }
}
