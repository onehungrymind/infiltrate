import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  LearningPath,
  CreateLearningPathDto,
  UpdateLearningPathDto,
} from '@kasita/common-models';
import {
  extractDtoProperties,
  getDtoKeys,
  ENTITY_DTO_KEYS,
} from '../../utils/dto.utils';
import { API_URL } from '../../config/api-url.token';

/**
 * Converts a LearningPath to CreateLearningPathDto by excluding auto-generated fields
 */
function toCreateLearningPathDto(
  learningPath: LearningPath,
): CreateLearningPathDto {
  const createDtoKeys = getDtoKeys<CreateLearningPathDto>(
    ENTITY_DTO_KEYS.LEARNING_PATHS,
  );
  return extractDtoProperties<CreateLearningPathDto>(
    learningPath,
    createDtoKeys,
  ) as CreateLearningPathDto;
}

/**
 * Converts a LearningPath to UpdateLearningPathDto by excluding auto-generated fields
 */
function toUpdateLearningPathDto(
  learningPath: LearningPath,
): UpdateLearningPathDto {
  const updateDtoKeys = getDtoKeys<UpdateLearningPathDto>(
    ENTITY_DTO_KEYS.LEARNING_PATHS,
  );
  return extractDtoProperties<UpdateLearningPathDto>(
    learningPath,
    updateDtoKeys,
  );
}

@Injectable({
  providedIn: 'root',
})
export class LearningPathsService {
  model = 'learning-paths';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<LearningPath[]>(this.getUrl());
  }

  find(id: string) {
    return this.http.get<LearningPath>(this.getUrlWithId(id));
  }

  create(learningPath: LearningPath) {
    const createDto = toCreateLearningPathDto(learningPath);
    return this.http.post(this.getUrl(), createDto);
  }

  update(learningPath: LearningPath) {
    const updateDto = toUpdateLearningPathDto(learningPath);
    return this.http.patch(this.getUrlWithId(learningPath.id), updateDto);
  }

  delete(learningPath: LearningPath) {
    return this.http.delete(this.getUrlWithId(learningPath.id));
  }

  findByMentor(mentorId: string) {
    return this.http.get<LearningPath[]>(`${this.getUrl()}/mentor/${mentorId}`);
  }

  assignMentor(pathId: string, mentorId: string) {
    return this.http.patch<LearningPath>(
      `${this.getUrlWithId(pathId)}/mentor`,
      { mentorId }
    );
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string | undefined | null) {
    return `${this.getUrl()}/${id}`;
  }
}
