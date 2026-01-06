/**
 * Kasita MVP Data Model
 * 
 * Simplified schema for rapid MVP development.
 * See full-schema.ts for complete vision.
 * 
 * Migration path: This is a subset of the full schema.
 * All migrations will be additive (adding columns/tables, not changing existing).
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  export type CognitiveLevel = 
    | 'remember'
    | 'understand'
    | 'apply'
    | 'analyze'
    | 'evaluate'
    | 'create';
  
  export type MasteryLevel = 'learning' | 'reviewing' | 'mastered';
  
  export type SourceType = 'rss' | 'article' | 'pdf';
  
  export type UnitStatus = 'pending' | 'approved' | 'rejected';
  
  export type PathStatus = 'not-started' | 'in-progress' | 'completed';
  
  // ============================================================================
  // CORE ENTITIES
  // ============================================================================
  
  /**
   * A learning path - user's learning goal
   */
  export interface LearningPath extends BaseEntity {
    userId: string;
    name: string;                    // "React Server Components"
    domain: string;                  // "Web Development"
    targetSkill: string;             // "Build production RSC app"
    status: PathStatus;
  }
  
  /**
   * Source configuration for content ingestion
   */
  export interface SourceConfig extends BaseEntity {
    pathId: string;
    url: string;                     // "https://javascriptweekly.com/rss"
    type: SourceType;
    name: string;                    // "JavaScript Weekly"
    enabled: boolean;
  }
  
  /**
   * Raw content extracted by Patchbay
   */
  export interface RawContent extends BaseEntity {
    pathId: string;
    sourceType: string;              // "rss", "article"
    sourceUrl: string;
    title: string;
    content: string;                 // Clean extracted text
    author?: string;
    publishedDate?: Date;
    metadata: Record<string, any>;
  }
  
  /**
   * Knowledge unit - atomic learning block
   */
  export interface KnowledgeUnit extends BaseEntity {
    pathId: string;
    
    // Core content
    concept: string;                 // "Server Components"
    question: string;                // "What are Server Components?"
    answer: string;                  // "Components that render on the server..."
    
    // Additional context (optional for MVP)
    elaboration?: string;
    examples: string[];              // Simplified from Example[] in full model
    analogies: string[];
    commonMistakes: string[];
    
    // Classification
    difficulty: DifficultyLevel;
    cognitiveLevel: CognitiveLevel;
    estimatedTimeSeconds: number;
    
    // Metadata
    tags: string[];
    sourceIds: string[];             // Links to RawContent IDs
    status: UnitStatus;
  }
  
  /**
   * User progress on a knowledge unit
   */
  export interface UserProgress extends BaseEntity {
    userId: string;
    unitId: string;
    
    // Mastery tracking
    masteryLevel: MasteryLevel;
    confidence: number;              // 0-100
    
    // SM-2 algorithm state
    easinessFactor: number;          // 1.3-2.5
    interval: number;                // Days until next review
    repetitions: number;             // Consecutive correct reviews
    nextReviewDate: Date;
    
    // History
    attempts: number;
    lastAttemptAt?: Date;
  }
  
  // ============================================================================
  // DTOs (Data Transfer Objects)
  // ============================================================================
  
  export interface CreateLearningPathDto {
    userId: string;
    name: string;
    domain: string;
    targetSkill: string;
  }
  
  export interface UpdateLearningPathDto {
    name?: string;
    domain?: string;
    targetSkill?: string;
    status?: PathStatus;
  }
  
  export interface CreateSourceConfigDto {
    pathId: string;
    url: string;
    type: SourceType;
    name: string;
  }
  
  export interface UpdateSourceConfigDto {
    url?: string;
    type?: SourceType;
    name?: string;
    enabled?: boolean;
  }
  
  export interface CreateRawContentDto {
    pathId: string;
    sourceType: string;
    sourceUrl: string;
    title: string;
    content: string;
    author?: string;
    publishedDate?: Date;
    metadata?: Record<string, any>;
  }
  
  export interface CreateKnowledgeUnitDto {
    pathId: string;
    concept: string;
    question: string;
    answer: string;
    elaboration?: string;
    examples?: string[];
    analogies?: string[];
    commonMistakes?: string[];
    difficulty: DifficultyLevel;
    cognitiveLevel: CognitiveLevel;
    estimatedTimeSeconds?: number;
    tags?: string[];
    sourceIds?: string[];
  }
  
  export interface UpdateKnowledgeUnitDto {
    concept?: string;
    question?: string;
    answer?: string;
    elaboration?: string;
    examples?: string[];
    analogies?: string[];
    commonMistakes?: string[];
    difficulty?: DifficultyLevel;
    cognitiveLevel?: CognitiveLevel;
    status?: UnitStatus;
  }

  export interface UpdateRawContentDto {
    pathId?: string;
    sourceType?: string;
    sourceUrl?: string;
    title?: string;
    content?: string;
    author?: string;
    publishedDate?: Date;
    metadata?: Record<string, any>;
  }

  export interface CreateUserProgressDto {
    userId: string;
    unitId: string;
    masteryLevel: MasteryLevel;
    confidence: number;
    easinessFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: Date;
    attempts: number;
    lastAttemptAt?: Date;
  }

  export interface UpdateUserProgressDto {
    masteryLevel?: MasteryLevel;
    confidence?: number;
    easinessFactor?: number;
    interval?: number;
    repetitions?: number;
    nextReviewDate?: Date;
    attempts?: number;
    lastAttemptAt?: Date;
  }
  
  export interface RecordAttemptDto {
    userId: string;
    unitId: string;
    quality: number;                 // 0-5 for SM-2 algorithm
  }
  
  export interface BulkCreateKnowledgeUnitsDto {
    pathId: string;
    units: CreateKnowledgeUnitDto[];
  }
  
  // ============================================================================
  // API RESPONSE TYPES
  // ============================================================================
  
  export interface GetNextReviewUnitsResponse {
    units: KnowledgeUnit[];
    totalDue: number;
  }
  
  export interface ProgressSummaryResponse {
    totalUnits: number;
    masteredUnits: number;
    learningUnits: number;
    reviewingUnits: number;
    dueForReview: number;
  }
  
  export interface IngestionStatusResponse {
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    progress: {
      current: number;
      total: number;
      message: string;
    };
  }
  
  // ============================================================================
  // UTILITY TYPES
  // ============================================================================
  
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }
  
  export interface QueryOptions {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }