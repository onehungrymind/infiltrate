import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Project,
  ProjectPrinciple,
  CreateProjectDto,
  UpdateProjectDto,
} from '@kasita/common-models';
import {
  extractDtoProperties,
  getDtoKeys,
  ENTITY_DTO_KEYS,
} from '../../utils/dto.utils';
import { API_URL } from '../../config/api-url.token';

/**
 * Converts a Project to CreateProjectDto by excluding auto-generated fields
 */
function toCreateProjectDto(project: Project): CreateProjectDto {
  const createDtoKeys = getDtoKeys<CreateProjectDto>(
    ENTITY_DTO_KEYS.PROJECTS,
  );
  return extractDtoProperties<CreateProjectDto>(
    project,
    createDtoKeys,
  ) as CreateProjectDto;
}

/**
 * Converts a Project to UpdateProjectDto by excluding auto-generated fields
 */
function toUpdateProjectDto(project: Project): UpdateProjectDto {
  const updateDtoKeys = getDtoKeys<UpdateProjectDto>(
    ENTITY_DTO_KEYS.PROJECTS,
  );
  return extractDtoProperties<UpdateProjectDto>(project, updateDtoKeys);
}

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  model = 'projects';

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  all() {
    return this.http.get<Project[]>(this.getUrl());
  }

  find(id: string) {
    return this.http.get<Project>(this.getUrlWithId(id));
  }

  findByPath(pathId: string) {
    return this.http.get<Project[]>(`${this.getUrl()}/path/${pathId}`);
  }

  findActive() {
    return this.http.get<Project[]>(`${this.getUrl()}?isActive=true`);
  }

  create(project: Project) {
    const createDto = toCreateProjectDto(project);
    return this.http.post<Project>(this.getUrl(), createDto);
  }

  update(project: Project) {
    const updateDto = toUpdateProjectDto(project);
    return this.http.patch<Project>(
      this.getUrlWithId(project.id),
      updateDto,
    );
  }

  delete(project: Project) {
    return this.http.delete(this.getUrlWithId(project.id));
  }

  // Principle linking methods
  linkPrinciple(projectId: string, principleId: string, weight: number) {
    return this.http.post<ProjectPrinciple>(
      `${this.getUrlWithId(projectId)}/principles`,
      { principleId, weight },
    );
  }

  unlinkPrinciple(projectId: string, principleId: string) {
    return this.http.delete(
      `${this.getUrlWithId(projectId)}/principles/${principleId}`,
    );
  }

  getProjectPrinciples(projectId: string) {
    return this.http.get<ProjectPrinciple[]>(
      `${this.getUrlWithId(projectId)}/principles`,
    );
  }

  private getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }

  private getUrlWithId(id: string | undefined | null) {
    return `${this.getUrl()}/${id}`;
  }
}
