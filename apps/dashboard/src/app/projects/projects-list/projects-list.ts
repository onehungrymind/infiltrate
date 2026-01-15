import { Component, input, output } from '@angular/core';
import { Project } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-projects-list',
  imports: [MaterialModule, TitleCasePipe],
  templateUrl: './projects-list.html',
  styleUrl: './projects-list.scss',
})
export class ProjectsList {
  projects = input.required<Project[]>();
  selectedProject = input<Project | null>(null);

  selected = output<Project>();
  deleted = output<Project>();

  isSelected(project: Project): boolean {
    return this.selectedProject()?.id === project.id;
  }

  onDelete(project: Project) {
    this.deleted.emit(project);
  }

  getDifficultyColor(difficulty: string): string {
    const colors: Record<string, string> = {
      beginner: '#22c55e',
      intermediate: '#eab308',
      advanced: '#f97316',
      expert: '#ef4444',
    };
    return colors[difficulty] || '#6b7280';
  }

  getEstimatedTime(hours: number): string {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours}h`;
  }
}
