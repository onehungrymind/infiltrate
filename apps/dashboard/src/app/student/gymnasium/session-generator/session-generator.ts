import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GenerateSessionDto, SessionDifficulty, SessionVisibility } from '@kasita/common-models';
import { GymnasiumFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

@Component({
  selector: 'app-session-generator',
  imports: [MaterialModule, FormsModule],
  templateUrl: './session-generator.html',
  styleUrl: './session-generator.scss',
})
export class SessionGenerator {
  private gymnasiumFacade = inject(GymnasiumFacade);

  @Input() generating = false;
  @Output() generated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  // Form fields
  topic = '';
  targetAudience = '';
  difficulty: SessionDifficulty = 'intermediate';
  estimatedLength = '60 minutes';
  focusAreas = '';
  codeLanguage = '';
  tone: 'professional' | 'casual' | 'academic' = 'professional';
  visibility: SessionVisibility = 'private';

  difficulties: { value: SessionDifficulty; label: string }[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
  ];

  tones: { value: 'professional' | 'casual' | 'academic'; label: string }[] = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'academic', label: 'Academic' },
  ];

  visibilities: { value: SessionVisibility; label: string; description: string }[] = [
    { value: 'private', label: 'Private', description: 'Only you can see this' },
    { value: 'unlisted', label: 'Unlisted', description: 'Anyone with the link can view' },
    { value: 'public', label: 'Public', description: 'Visible to everyone' },
  ];

  lengthOptions = [
    '30 minutes',
    '45 minutes',
    '60 minutes',
    '90 minutes',
    '2 hours',
  ];

  constructor() {
    // Subscribe to generation success
    this.gymnasiumFacade.generationSuccess$.subscribe(() => {
      this.generated.emit();
    });
  }

  generate() {
    if (!this.topic.trim()) return;

    const dto: GenerateSessionDto = {
      topic: this.topic.trim(),
      difficulty: this.difficulty,
      estimatedLength: this.estimatedLength,
      tone: this.tone,
      visibility: this.visibility,
    };

    if (this.targetAudience.trim()) {
      dto.targetAudience = this.targetAudience.trim();
    }

    if (this.focusAreas.trim()) {
      dto.focusAreas = this.focusAreas.split(',').map((s) => s.trim()).filter(Boolean);
    }

    if (this.codeLanguage.trim()) {
      dto.codeLanguage = this.codeLanguage.trim();
    }

    this.gymnasiumFacade.generateSession(dto);
  }

  cancel() {
    this.cancelled.emit();
  }
}
