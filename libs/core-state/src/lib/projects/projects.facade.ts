import { Injectable, inject } from '@angular/core';
import { Project } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { ProjectsActions } from './projects.actions';
import {
  selectAllProjects,
  selectProjectsLoaded,
  selectProjectsError,
  selectSelectedProject,
  selectProjectsByPathId,
} from './projects.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectsFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectProjectsLoaded);
  error$ = this.store.select(selectProjectsError);
  allProjects$ = this.store.select(selectAllProjects);
  selectedProject$ = this.store.select(selectSelectedProject);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === ProjectsActions.createProject.type ||
        action.type === ProjectsActions.updateProject.type ||
        action.type === ProjectsActions.deleteProject.type ||
        action.type === ProjectsActions.linkConcept.type ||
        action.type === ProjectsActions.unlinkConcept.type,
    ),
  );

  selectProjectsByPath(pathId: string) {
    return this.store.select(selectProjectsByPathId(pathId));
  }

  resetSelectedProject() {
    this.dispatch(ProjectsActions.resetSelectedProject());
  }

  selectProject(selectedId: string) {
    this.dispatch(ProjectsActions.selectProject({ selectedId }));
  }

  loadProjects() {
    this.dispatch(ProjectsActions.loadProjects());
  }

  loadProject(projectId: string) {
    this.dispatch(ProjectsActions.loadProject({ projectId }));
  }

  loadProjectsByPath(pathId: string) {
    this.dispatch(ProjectsActions.loadProjectsByPath({ pathId }));
  }

  saveProject(project: Project) {
    if (project.id) {
      this.updateProject(project);
    } else {
      this.createProject(project);
    }
  }

  createProject(project: Project) {
    this.dispatch(ProjectsActions.createProject({ project }));
  }

  updateProject(project: Project) {
    this.dispatch(ProjectsActions.updateProject({ project }));
  }

  deleteProject(project: Project) {
    this.dispatch(ProjectsActions.deleteProject({ project }));
  }

  linkConcept(projectId: string, conceptId: string, weight: number) {
    this.dispatch(ProjectsActions.linkConcept({ projectId, conceptId, weight }));
  }

  unlinkConcept(projectId: string, conceptId: string) {
    this.dispatch(ProjectsActions.unlinkConcept({ projectId, conceptId }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
