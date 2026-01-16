import { CommonModule } from '@angular/common';
import { Component, inject,OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnowledgeUnit, LearningPath, UserProgress } from '@kasita/common-models';
import { AuthService } from '@kasita/core-data';
import { KnowledgeUnitFacade, LearningPathsFacade, UserProgressFacade } from '@kasita/core-state';
import { combineLatest,Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type QuestionType = 'multiple-choice' | 'true-false';

interface QuizQuestion {
  knowledgeUnit: KnowledgeUnit;
  type: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: number;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
}

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  questions: QuizQuestion[];
}

@Component({
  selector: 'app-study-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class StudyQuiz implements OnInit, OnDestroy {
  private knowledgeUnitFacade = inject(KnowledgeUnitFacade);
  private learningPathsFacade = inject(LearningPathsFacade);
  private userProgressFacade = inject(UserProgressFacade);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  // State
  learningPaths: LearningPath[] = [];
  selectedPathId: string | null = null;
  questionCount = 10;
  showDueOnly = false;

  // Quiz state
  mode: 'setup' | 'quiz' | 'results' = 'setup';
  questions: QuizQuestion[] = [];
  currentIndex = 0;
  isLoading = true;
  hasAnswered = false;

  // Results
  result: QuizResult | null = null;

  private allKnowledgeUnits: KnowledgeUnit[] = [];
  private allProgress: UserProgress[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;

    // Load learning paths
    this.learningPathsFacade.loadLearningPaths();
    this.learningPathsFacade.allLearningPaths$
      .pipe(takeUntil(this.destroy$))
      .subscribe((paths) => {
        this.learningPaths = paths;
      });

    // Load knowledge units
    this.knowledgeUnitFacade.loadKnowledgeUnits();

    // Load user progress
    const userId = this.authService.getUserId();
    if (userId) {
      this.userProgressFacade.loadUserProgressByUser(userId);
    }

    // Combine knowledge units and progress
    combineLatest([
      this.knowledgeUnitFacade.allKnowledgeUnits$,
      this.userProgressFacade.allUserProgress$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([units, progress]) => {
        this.allKnowledgeUnits = units;
        this.allProgress = progress;
        this.isLoading = false;
      });
  }

  get availableUnitsCount(): number {
    return this.getFilteredUnits().length;
  }

  private getFilteredUnits(): KnowledgeUnit[] {
    let units = this.allKnowledgeUnits;

    // Filter by learning path if selected
    if (this.selectedPathId) {
      units = units.filter((u) => u.pathId === this.selectedPathId);
    }

    // Filter by due for review if enabled
    if (this.showDueOnly) {
      const now = new Date();
      units = units.filter((unit) => {
        const progress = this.allProgress.find((p) => p.unitId === unit.id);
        if (!progress) return true; // New units are always due
        return new Date(progress.nextReviewDate) <= now;
      });
    }

    return units;
  }

  startQuiz(): void {
    const filteredUnits = this.getFilteredUnits();

    if (filteredUnits.length === 0) {
      return;
    }

    // Shuffle and take the requested number of questions
    const shuffled = this.shuffleArray([...filteredUnits]);
    const selectedUnits = shuffled.slice(0, Math.min(this.questionCount, shuffled.length));

    // Generate questions
    this.questions = selectedUnits.map((unit, index) => {
      // Alternate between question types
      const type: QuestionType = index % 2 === 0 ? 'multiple-choice' : 'true-false';
      return this.generateQuestion(unit, type, filteredUnits);
    });

    this.currentIndex = 0;
    this.hasAnswered = false;
    this.mode = 'quiz';
  }

  private generateQuestion(
    unit: KnowledgeUnit,
    type: QuestionType,
    allUnits: KnowledgeUnit[]
  ): QuizQuestion {
    if (type === 'true-false') {
      return this.generateTrueFalseQuestion(unit);
    }
    return this.generateMultipleChoiceQuestion(unit, allUnits);
  }

  private generateMultipleChoiceQuestion(
    unit: KnowledgeUnit,
    allUnits: KnowledgeUnit[]
  ): QuizQuestion {
    const correctAnswer = unit.answer;

    // Get distractor answers from other units
    const otherUnits = allUnits.filter((u) => u.id !== unit.id);
    const shuffledOthers = this.shuffleArray(otherUnits);
    const distractors = shuffledOthers.slice(0, 3).map((u) => u.answer);

    // If not enough distractors, add generic ones
    while (distractors.length < 3) {
      distractors.push(this.getGenericDistractor(distractors.length));
    }

    // Shuffle options and find correct index
    const options = this.shuffleArray([correctAnswer, ...distractors]);
    const correctIndex = options.indexOf(correctAnswer);

    return {
      knowledgeUnit: unit,
      type: 'multiple-choice',
      questionText: unit.question,
      options,
      correctAnswer: correctIndex,
      selectedAnswer: null,
      isCorrect: null,
    };
  }

  private generateTrueFalseQuestion(unit: KnowledgeUnit): QuizQuestion {
    // Randomly decide if we show a true or false statement
    const showTrue = Math.random() > 0.5;

    let questionText: string;
    let correctAnswer: number;

    if (showTrue) {
      // True statement using the actual answer
      questionText = `True or False: "${unit.concept}" - ${this.createTrueStatement(unit)}`;
      correctAnswer = 0; // True is first option
    } else {
      // False statement by modifying the concept
      questionText = `True or False: "${unit.concept}" - ${this.createFalseStatement(unit)}`;
      correctAnswer = 1; // False is second option
    }

    return {
      knowledgeUnit: unit,
      type: 'true-false',
      questionText,
      options: ['True', 'False'],
      correctAnswer,
      selectedAnswer: null,
      isCorrect: null,
    };
  }

  private createTrueStatement(unit: KnowledgeUnit): string {
    // Use the answer or elaboration to create a true statement
    const answer = unit.answer.split('.')[0];
    return answer.length > 100 ? answer.substring(0, 100) + '...' : answer;
  }

  private createFalseStatement(unit: KnowledgeUnit): string {
    // Create a false statement by negating or modifying the answer
    const answer = unit.answer.split('.')[0];
    const modifiers = [
      'is not related to',
      'cannot be used with',
      'is the opposite of',
      'should never involve',
    ];
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];

    // Take a key phrase and negate it
    const truncated = answer.length > 80 ? answer.substring(0, 80) + '...' : answer;
    return `This ${modifier} the following: ${truncated}`;
  }

  private getGenericDistractor(index: number): string {
    const distractors = [
      'This concept is not applicable in this context.',
      'The answer depends on specific implementation details.',
      'None of the above applies to this scenario.',
    ];
    return distractors[index] || 'Not applicable.';
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  selectAnswer(index: number): void {
    if (this.hasAnswered) return;

    const question = this.questions[this.currentIndex];
    question.selectedAnswer = index;
    question.isCorrect = index === question.correctAnswer;
    this.hasAnswered = true;

    // Record the attempt with SM-2
    const userId = this.authService.getUserId();
    if (userId) {
      const quality = question.isCorrect ? 4 : 1; // Good (4) for correct, incorrect recall (1) for wrong
      this.userProgressFacade.recordAttempt({
        userId,
        unitId: question.knowledgeUnit.id,
        quality,
      });
    }
  }

  nextQuestion(): void {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.hasAnswered = false;
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz(): void {
    const correctAnswers = this.questions.filter((q) => q.isCorrect).length;
    const totalQuestions = this.questions.length;

    this.result = {
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      score: Math.round((correctAnswers / totalQuestions) * 100),
      questions: this.questions,
    };

    this.mode = 'results';
  }

  restartQuiz(): void {
    this.mode = 'setup';
    this.questions = [];
    this.currentIndex = 0;
    this.hasAnswered = false;
    this.result = null;
  }

  get currentQuestion(): QuizQuestion | null {
    return this.questions[this.currentIndex] || null;
  }

  get progress(): number {
    if (this.questions.length === 0) return 0;
    return ((this.currentIndex + 1) / this.questions.length) * 100;
  }

  getOptionClass(index: number): string {
    const question = this.currentQuestion;
    if (!question || !this.hasAnswered) return '';

    if (index === question.correctAnswer) {
      return 'correct';
    }
    if (index === question.selectedAnswer && !question.isCorrect) {
      return 'incorrect';
    }
    return '';
  }

  getScoreClass(): string {
    if (!this.result) return '';
    if (this.result.score >= 80) return 'excellent';
    if (this.result.score >= 60) return 'good';
    if (this.result.score >= 40) return 'fair';
    return 'needs-work';
  }
}
