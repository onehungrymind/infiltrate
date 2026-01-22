import { Component, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import {
  ClassroomApiService,
  MicroQuiz,
  QuizAnswer,
  QuizResult,
} from '../../services/classroom-api.service';

@Component({
  selector: 'lib-micro-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="micro-quiz">
      <div class="quiz-header">
        <h3>📝 Quick Check</h3>
        <p class="subtitle">
          Test your understanding of what you just read
        </p>
      </div>

      @if (!submitted()) {
        <!-- Quiz questions -->
        <div class="questions">
          @for (question of quiz.questions; track question.id; let i = $index) {
            <div class="question" [class.answered]="answers()[question.id]">
              <div class="question-number">Question {{ i + 1 }}</div>
              <div class="question-text">{{ question.question }}</div>

              @if (question.type === 'multiple_choice' && question.options) {
                <div class="options">
                  @for (option of question.options; track option) {
                    <label
                      class="option"
                      [class.selected]="answers()[question.id] === option"
                    >
                      <input
                        type="radio"
                        [name]="'q-' + question.id"
                        [value]="option"
                        (change)="selectAnswer(question.id, option)"
                      />
                      <span class="option-text">{{ option }}</span>
                    </label>
                  }
                </div>
              } @else if (question.type === 'true_false') {
                <div class="options true-false">
                  <label
                    class="option"
                    [class.selected]="answers()[question.id] === 'true'"
                  >
                    <input
                      type="radio"
                      [name]="'q-' + question.id"
                      value="true"
                      (change)="selectAnswer(question.id, 'true')"
                    />
                    <span class="option-text">True</span>
                  </label>
                  <label
                    class="option"
                    [class.selected]="answers()[question.id] === 'false'"
                  >
                    <input
                      type="radio"
                      [name]="'q-' + question.id"
                      value="false"
                      (change)="selectAnswer(question.id, 'false')"
                    />
                    <span class="option-text">False</span>
                  </label>
                </div>
              } @else if (question.type === 'fill_blank') {
                <input
                  type="text"
                  class="fill-blank-input"
                  placeholder="Type your answer..."
                  [value]="answers()[question.id] || ''"
                  (input)="selectAnswer(question.id, $any($event.target).value)"
                />
              }
            </div>
          }
        </div>

        <div class="quiz-actions">
          <button
            class="submit-btn"
            [disabled]="!allAnswered() || submitting()"
            (click)="submitQuiz()"
          >
            {{ submitting() ? 'Submitting...' : 'Submit Answers' }}
          </button>
          <span class="answer-count">
            {{ answeredCount() }}/{{ quiz.questions.length }} answered
          </span>
        </div>
      } @else {
        <!-- Results -->
        <div class="results">
          <div class="score-display" [class.passed]="passed()">
            <div class="score-value">{{ score() }}%</div>
            <div class="score-label">
              {{ passed() ? '🎉 Passed!' : '📚 Keep practicing' }}
            </div>
          </div>

          <div class="result-details">
            @for (result of results(); track result.questionId; let i = $index) {
              <div class="result-item" [class.correct]="result.correct">
                <div class="result-header">
                  <span class="result-icon">{{ result.correct ? '✓' : '✗' }}</span>
                  <span class="result-question">
                    {{ getQuestionText(result.questionId) }}
                  </span>
                </div>
                @if (!result.correct) {
                  <div class="result-answer">
                    <div class="your-answer">Your answer: {{ result.userAnswer }}</div>
                    <div class="correct-answer">Correct: {{ result.correctAnswer }}</div>
                  </div>
                }
                <div class="result-explanation">{{ result.explanation }}</div>
              </div>
            }
          </div>

          <div class="quiz-actions">
            @if (passed()) {
              <button class="continue-btn" (click)="quizComplete.emit(true)">
                Continue →
              </button>
            } @else {
              <button class="retry-btn" (click)="resetQuiz()">
                Try Again
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './micro-quiz.component.scss',
})
export class MicroQuizComponent {
  @Input({ required: true }) quiz!: MicroQuiz;
  @Input({ required: true }) subConceptId!: string;

  @Output() quizComplete = new EventEmitter<boolean>();

  private readonly classroomApi = inject(ClassroomApiService);
  private readonly destroy$ = new Subject<void>();

  readonly answers = signal<Record<string, string | number>>({});
  readonly submitted = signal(false);
  readonly submitting = signal(false);
  readonly score = signal(0);
  readonly passed = signal(false);
  readonly results = signal<QuizResult[]>([]);

  readonly answeredCount = computed(() => Object.keys(this.answers()).length);
  readonly allAnswered = computed(
    () => this.answeredCount() === this.quiz.questions.length
  );

  selectAnswer(questionId: string, answer: string | number): void {
    this.answers.update((current) => ({
      ...current,
      [questionId]: answer,
    }));
  }

  submitQuiz(): void {
    this.submitting.set(true);

    const quizAnswers: QuizAnswer[] = Object.entries(this.answers()).map(
      ([questionId, answer]) => ({ questionId, answer })
    );

    this.classroomApi
      .submitMicroQuiz(this.quiz.id, quizAnswers)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.score.set(Math.round(response.score));
          this.passed.set(response.passed);
          this.results.set(response.results);
          this.submitted.set(true);
          this.submitting.set(false);
        },
        error: (err) => {
          console.error('Failed to submit quiz:', err);
          this.submitting.set(false);
        },
      });
  }

  resetQuiz(): void {
    this.answers.set({});
    this.submitted.set(false);
    this.score.set(0);
    this.passed.set(false);
    this.results.set([]);
  }

  getQuestionText(questionId: string): string {
    const question = this.quiz.questions.find((q) => q.id === questionId);
    return question?.question || '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
