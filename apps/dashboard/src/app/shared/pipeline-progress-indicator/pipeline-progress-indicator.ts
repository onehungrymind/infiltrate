import { CommonModule } from '@angular/common';
import { Component, Input, signal, WritableSignal } from '@angular/core';
import { MaterialModule } from '@kasita/material';

export interface PipelineStage {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-pipeline-progress-indicator',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './pipeline-progress-indicator.html',
  styleUrl: './pipeline-progress-indicator.scss',
})
export class PipelineProgressIndicator {
  @Input() stages: PipelineStage[] = [];
  @Input() currentStage: WritableSignal<string | null> = signal(null);
  @Input() completedStages: WritableSignal<string[]> = signal([]);
  @Input() errorStage: WritableSignal<string | null> = signal(null);

  isCompleted(stageId: string): boolean {
    return this.completedStages().includes(stageId);
  }

  isCurrent(stageId: string): boolean {
    return this.currentStage() === stageId;
  }

  hasError(stageId: string): boolean {
    return this.errorStage() === stageId;
  }

  getStageStatus(stageId: string): 'completed' | 'current' | 'error' | 'pending' {
    if (this.hasError(stageId)) return 'error';
    if (this.isCompleted(stageId)) return 'completed';
    if (this.isCurrent(stageId)) return 'current';
    return 'pending';
  }
}
