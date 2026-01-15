import { Component, input, output } from '@angular/core';
import { Challenge } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-challenges-list',
  imports: [MaterialModule, TitleCasePipe],
  templateUrl: './challenges-list.html',
  styleUrl: './challenges-list.scss',
})
export class ChallengesList {
  challenges = input.required<Challenge[]>();
  selectedChallenge = input<Challenge | null>(null);

  selected = output<Challenge>();
  deleted = output<Challenge>();

  isSelected(challenge: Challenge): boolean {
    return this.selectedChallenge()?.id === challenge.id;
  }

  onDelete(challenge: Challenge) {
    this.deleted.emit(challenge);
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

  getEstimatedTime(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
}
