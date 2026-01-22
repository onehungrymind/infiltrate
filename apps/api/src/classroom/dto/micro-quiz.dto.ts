import { IsString, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MicroQuizQuestion } from '../entities/micro-quiz.entity';

export class QuizAnswerDto {
  @IsString()
  questionId: string;

  answer: string | number;
}

export class SubmitMicroQuizDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
}

export class MicroQuizQuestionResponseDto {
  id: string;
  order: number;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  question: string;
  options?: string[];
  // Note: correctAnswer and explanation are NOT included - only sent after submission
}

export class MicroQuizResponseDto {
  id: string;
  subConceptId: string;
  questions: MicroQuizQuestionResponseDto[];
  passingScore: number;
  status: string;
}

export class QuizResultDto {
  questionId: string;
  correct: boolean;
  userAnswer: string | number;
  correctAnswer: string | number;
  explanation: string;
}

export class MicroQuizSubmissionResultDto {
  score: number;
  passed: boolean;
  results: QuizResultDto[];
}
