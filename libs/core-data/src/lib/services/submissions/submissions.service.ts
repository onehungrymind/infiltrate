import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Submission,
  Feedback,
  CreateSubmissionDto,
  UpdateSubmissionDto,
  CreateMentorFeedbackDto,
} from '@kasita/common-models';
import {
  extractDtoProperties,
  getDtoKeys,
  ENTITY_DTO_KEYS,
} from '../../utils/dto.utils';
import { API_URL } from '../../config/api-url.token';

/**
 * Converts a Submission to CreateSubmissionDto by excluding auto-generated fields
 */
function toCreateSubmissionDto(submission: Submission): CreateSubmissionDto {
  const createDtoKeys = getDtoKeys<CreateSubmissionDto>(
    ENTITY_DTO_KEYS.SUBMISSIONS,
  );
  return extractDtoProperties<CreateSubmissionDto>(
    submission,
    createDtoKeys,
  ) as CreateSubmissionDto;
}

/**
 * Converts a Submission to UpdateSubmissionDto by excluding auto-generated fields
 */
function toUpdateSubmissionDto(submission: Submission): UpdateSubmissionDto {
  const updateDtoKeys = getDtoKeys<UpdateSubmissionDto>(
    ENTITY_DTO_KEYS.SUBMISSIONS,
  );
  return extractDtoProperties<UpdateSubmissionDto>(submission, updateDtoKeys);
}

@Injectable({
  providedIn: 'root',
})
export class SubmissionsService {
  model = 'submissions';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<Submission[]>(this.getUrl());
  }

  find(id: string) {
    return this.http.get<Submission>(this.getUrlWithId(id));
  }

  findByUser(userId: string) {
    return this.http.get<Submission[]>(`${this.getUrl()}/user/${userId}`);
  }

  findByUnit(unitId: string) {
    return this.http.get<Submission[]>(`${this.getUrl()}/unit/${unitId}`);
  }

  findByPath(pathId: string) {
    return this.http.get<Submission[]>(`${this.getUrl()}?pathId=${pathId}`);
  }

  findByStatus(status: string) {
    return this.http.get<Submission[]>(`${this.getUrl()}?status=${status}`);
  }

  create(submission: Submission) {
    const createDto = toCreateSubmissionDto(submission);
    return this.http.post<Submission>(this.getUrl(), createDto);
  }

  update(submission: Submission) {
    const updateDto = toUpdateSubmissionDto(submission);
    return this.http.patch<Submission>(
      this.getUrlWithId(submission.id),
      updateDto,
    );
  }

  delete(submission: Submission) {
    return this.http.delete(this.getUrlWithId(submission.id));
  }

  submit(submissionId: string) {
    return this.http.post<Submission>(
      `${this.getUrlWithId(submissionId)}/submit`,
      {},
    );
  }

  requestAiFeedback(submissionId: string, rubricCriteria?: string[]) {
    return this.http.post<{ feedback: Feedback; submission: Submission }>(
      `${this.getUrlWithId(submissionId)}/feedback/ai`,
      { rubricCriteria },
    );
  }

  getFeedback(submissionId: string) {
    return this.http.get<Feedback[]>(
      `${this.getUrlWithId(submissionId)}/feedback`,
    );
  }

  findByChallenge(challengeId: string) {
    return this.http.get<Submission[]>(`${this.getUrl()}/challenge/${challengeId}`);
  }

  findByProject(projectId: string) {
    return this.http.get<Submission[]>(`${this.getUrl()}/project/${projectId}`);
  }

  uploadFile(file: File, data: { userId: string; title: string; challengeId?: string; projectId?: string; pathId?: string }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', data.userId);
    formData.append('title', data.title);
    if (data.challengeId) formData.append('challengeId', data.challengeId);
    if (data.projectId) formData.append('projectId', data.projectId);
    if (data.pathId) formData.append('pathId', data.pathId);

    return this.http.post<Submission>(`${this.getUrl()}/upload`, formData);
  }

  fetchUrlMetadata(url: string) {
    return this.http.post<{ title?: string; description?: string; platform?: string; repoStats?: { stars?: number; language?: string; lastCommit?: Date } }>(
      `${this.getUrl()}/url-metadata`,
      { url }
    );
  }

  findByMentor(mentorId: string, status?: string) {
    let url = `${this.getUrl()}/mentor/${mentorId}`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<Submission[]>(url);
  }

  submitMentorFeedback(submissionId: string, mentorId: string, feedback: CreateMentorFeedbackDto) {
    return this.http.post<{ feedback: Feedback; submission: Submission }>(
      `${this.getUrlWithId(submissionId)}/feedback/mentor?mentorId=${mentorId}`,
      feedback
    );
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string | undefined | null) {
    return `${this.getUrl()}/${id}`;
  }
}
