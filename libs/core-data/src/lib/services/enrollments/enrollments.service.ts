import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Enrollment, CreateEnrollmentDto, UpdateEnrollmentDto } from '@kasita/common-models';
import { API_URL } from '../../config/api-url.token';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentsService {
  model = 'enrollments';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<Enrollment[]>(this.getUrl());
  }

  findByUser(userId: string) {
    return this.http.get<Enrollment[]>(`${this.getUrl()}/user/${userId}`);
  }

  findByPath(pathId: string, activeOnly = false) {
    const query = activeOnly ? '?activeOnly=true' : '';
    return this.http.get<Enrollment[]>(`${this.getUrl()}/path/${pathId}${query}`);
  }

  getLeaderboard(pathId: string) {
    return this.http.get<any[]>(`${this.getUrl()}/path/${pathId}/leaderboard`);
  }

  checkEnrollment(userId: string, pathId: string) {
    return this.http.get<{ isEnrolled: boolean; enrollment: Enrollment | null }>(
      `${this.getUrl()}/check/${userId}/${pathId}`
    );
  }

  enroll(enrollment: CreateEnrollmentDto) {
    return this.http.post<Enrollment>(this.getUrl(), enrollment);
  }

  update(userId: string, pathId: string, updateDto: UpdateEnrollmentDto) {
    return this.http.patch<Enrollment>(
      `${this.getUrl()}/${userId}/${pathId}`,
      updateDto
    );
  }

  unenroll(userId: string, pathId: string) {
    return this.http.delete<Enrollment>(`${this.getUrl()}/${userId}/${pathId}`);
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }
}
