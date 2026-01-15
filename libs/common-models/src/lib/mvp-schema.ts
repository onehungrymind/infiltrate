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
  
  export type ParsingMode = 'current' | 'archive' | 'both';
  
  export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'manual';
  
  export type UserRole = 'guest' | 'user' | 'manager' | 'admin';

  export type PrincipleDifficulty = 'foundational' | 'intermediate' | 'advanced';

  export type PrincipleStatus = 'pending' | 'in_progress' | 'mastered';

  // Legacy content types for challenge constraints
  export type ChallengeContentType = 'code' | 'written' | 'project';

  // Expanded submission content types
  export type SubmissionContentType = 'text' | 'url' | 'file';

  export type SubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

  export type FeedbackSource = 'ai' | 'mentor';

  // ============================================================================
  // CORE ENTITIES
  // ============================================================================
  
  /**
   * User entity
   */
  export interface User extends BaseEntity {
    email: string;
    name: string;
    password?: string; // Hashed password (included when fetching single user for editing)
    isActive: boolean;
    role?: UserRole;
  }
  
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
   * A principle - core concept within a learning path
   */
  export interface Principle extends BaseEntity {
    pathId: string;                  // Links to LearningPath
    name: string;                    // "Server Components"
    description: string;             // Brief explanation
    estimatedHours: number;          // Time to master
    difficulty: PrincipleDifficulty; // 'foundational' | 'intermediate' | 'advanced'
    prerequisites: string[];         // IDs of prerequisite principles
    order: number;                   // Display order in learning map
    status: PrincipleStatus;         // 'pending' | 'in_progress' | 'mastered'
  }

  /**
   * Rubric criterion for grading submissions
   */
  export interface RubricCriterion {
    name: string;                    // "Correctness"
    description: string;             // "Solution produces correct output"
    maxPoints: number;               // 30
  }

  /**
   * Challenge - focused exercise tied to a single KnowledgeUnit
   */
  export interface Challenge extends BaseEntity {
    unitId: string;                  // FK to KnowledgeUnit
    title: string;                   // "Implement a Binary Search"
    description: string;             // Instructions for the learner
    difficulty: DifficultyLevel;     // 'beginner' | 'intermediate' | 'advanced' | 'expert'
    estimatedMinutes: number;        // Expected time to complete
    rubricCriteria: RubricCriterion[]; // Custom rubric for this challenge
    successCriteria: string[];       // What must be achieved
    contentTypes: ChallengeContentType[]; // Allowed: ['code'], ['written'], etc.
    isActive: boolean;               // Can hide challenges
  }

  /**
   * Project - multi-principle assessment
   */
  export interface Project extends BaseEntity {
    pathId: string;                  // FK to LearningPath
    name: string;                    // "Build a REST API"
    description: string;             // Overview
    objectives: string[];            // Learning goals
    requirements: string[];          // What must be delivered
    estimatedHours: number;          // 8-20 hours
    difficulty: DifficultyLevel;
    isActive: boolean;
  }

  /**
   * Junction table: Project ↔ Principle (many-to-many)
   */
  export interface ProjectPrinciple extends BaseEntity {
    projectId: string;
    principleId: string;
    weight: number;                  // % of total grade (0-100)
    rubricCriteria: RubricCriterion[]; // Criteria for this principle
  }

  /**
   * URL metadata for URL submissions
   */
  export interface UrlMetadata {
    title?: string;                  // Fetched page title
    description?: string;            // Meta description
    platform?: string;               // 'github' | 'codepen' | 'other'
    repoStats?: {                    // For GitHub
      stars?: number;
      language?: string;
      lastCommit?: Date;
    };
  }

  /**
   * File metadata for file submissions
   */
  export interface FileMetadata {
    originalName: string;            // "solution.py"
    mimeType: string;                // "text/x-python"
    size: number;                    // bytes
    storagePath: string;             // "uploads/submissions/{id}/{filename}"
  }

  /**
   * Source configuration for content ingestion (tied to a learning path)
   * @deprecated Use Source + SourcePathLink instead for many-to-many relationship
   */
  export interface SourceConfig extends BaseEntity {
    pathId: string;
    url: string;                     // "https://javascriptweekly.com/rss"
    type: SourceType;
    name: string;                    // "JavaScript Weekly"
    enabled: boolean;
  }

  /**
   * Source - a content source that can be shared across learning paths
   * URL is unique to prevent duplicates
   */
  export interface Source extends BaseEntity {
    url: string;                     // "https://javascriptweekly.com/rss" (unique)
    type: SourceType;
    name: string;                    // "JavaScript Weekly"
  }

  /**
   * Links a Source to a LearningPath with per-path settings
   */
  export interface SourcePathLink extends BaseEntity {
    sourceId: string;
    pathId: string;
    enabled: boolean;                // Can be enabled/disabled per path
  }

  /**
   * Source with link information (for API responses when querying by path)
   */
  export interface SourceWithLink extends Source {
    enabled: boolean;                // From SourcePathLink
    linkId: string;                  // SourcePathLink ID
  }
  
  /**
   * Data source - global content source that can be used across learning paths
   * Supports archive parsing and scheduled ingestion
   */
  export interface DataSource extends BaseEntity {
    name: string;                    // "JavaScript Weekly"
    description?: string;            // "Weekly newsletter about JavaScript"
    url: string;                     // "https://javascriptweekly.com/rss" or "https://javascriptweekly.com/issues"
    archiveUrl?: string;              // "https://javascriptweekly.com/issues" (for archive parsing)
    type: SourceType;
    tags: string[];                  // ["javascript", "newsletter", "web"]
    enabled: boolean;
    parsingMode: ParsingMode;        // 'current' | 'archive' | 'both'
    scheduleFrequency?: ScheduleFrequency; // 'daily' | 'weekly' | 'monthly' | 'manual'
    lastIngestedAt?: Date;            // Last successful ingestion
    parsingInstructions?: Record<string, any>; // Future: custom parsing config
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
    principleId?: string;            // Optional link to Principle

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

  /**
   * Submission - user's work submitted for a challenge or project
   */
  export interface Submission extends BaseEntity {
    userId: string;
    unitId?: string;                 // @deprecated - use challengeId instead
    challengeId?: string;            // FK to Challenge (for challenge submissions)
    projectId?: string;              // FK to Project (for project submissions)
    pathId?: string;                 // Optional link to LearningPath
    title: string;
    contentType: SubmissionContentType; // 'text' | 'url' | 'file'
    content: string;                 // Text content OR URL OR file path
    urlMetadata?: UrlMetadata;       // Metadata when contentType='url'
    fileMetadata?: FileMetadata;     // Metadata when contentType='file'
    status: SubmissionStatus;
    score?: number;                  // 0-100 after review
    submittedAt?: Date;
    reviewedAt?: Date;
    metadata?: Record<string, any>;
  }

  /**
   * Rubric score breakdown
   */
  export interface RubricScore {
    criterion: string;
    achieved: number;
    maximum: number;
    feedback?: string;
  }

  /**
   * Feedback - AI or mentor feedback on a submission
   */
  export interface Feedback extends BaseEntity {
    submissionId: string;
    source: FeedbackSource;
    reviewerId?: string;             // For mentor feedback
    overallScore: number;            // 0-100
    rubricBreakdown: RubricScore[];
    suggestions: string[];
    content: string;                 // Detailed feedback
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

  export interface CreatePrincipleDto {
    pathId: string;
    name: string;
    description: string;
    estimatedHours?: number;
    difficulty?: PrincipleDifficulty;
    prerequisites?: string[];
    order?: number;
  }

  export interface UpdatePrincipleDto {
    name?: string;
    description?: string;
    estimatedHours?: number;
    difficulty?: PrincipleDifficulty;
    prerequisites?: string[];
    order?: number;
    status?: PrincipleStatus;
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

  // New Source DTOs (many-to-many model)
  export interface CreateSourceDto {
    url: string;
    type: SourceType;
    name: string;
  }

  export interface UpdateSourceDto {
    type?: SourceType;
    name?: string;
  }

  export interface LinkSourceToPathDto {
    sourceId: string;
    pathId: string;
    enabled?: boolean;
  }

  export interface UpdateSourceLinkDto {
    enabled: boolean;
  }
  
  export interface CreateDataSourceDto {
    name: string;
    description?: string;
    url: string;
    archiveUrl?: string;
    type: SourceType;
    tags?: string[];
    enabled?: boolean;
    parsingMode: ParsingMode;
    scheduleFrequency?: ScheduleFrequency;
    parsingInstructions?: Record<string, any>;
  }
  
  export interface UpdateDataSourceDto {
    name?: string;
    description?: string;
    url?: string;
    archiveUrl?: string;
    type?: SourceType;
    tags?: string[];
    enabled?: boolean;
    parsingMode?: ParsingMode;
    scheduleFrequency?: ScheduleFrequency;
    parsingInstructions?: Record<string, any>;
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
    principleId?: string;
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
    principleId?: string;
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

  export interface CreateUserDto {
    email: string;
    name: string;
    password?: string;
    isActive?: boolean;
    role?: UserRole;
  }

  export interface UpdateUserDto {
    email?: string;
    name?: string;
    password?: string;
    isActive?: boolean;
    role?: UserRole;
  }
  
  export interface RecordAttemptDto {
    userId: string;
    unitId: string;
    quality: number;                 // 0-5 for SM-2 algorithm
  }

  export interface CreateSubmissionDto {
    userId: string;
    unitId?: string;                 // @deprecated - use challengeId instead
    challengeId?: string;
    projectId?: string;
    pathId?: string;
    title: string;
    contentType?: SubmissionContentType;
    content: string;
    urlMetadata?: UrlMetadata;
    fileMetadata?: FileMetadata;
    metadata?: Record<string, any>;
  }

  export interface UpdateSubmissionDto {
    title?: string;
    content?: string;
    contentType?: SubmissionContentType;
    urlMetadata?: UrlMetadata;
    fileMetadata?: FileMetadata;
    status?: SubmissionStatus;
    score?: number;
    metadata?: Record<string, any>;
  }

  // Challenge DTOs
  export interface CreateChallengeDto {
    unitId: string;
    title: string;
    description: string;
    difficulty?: DifficultyLevel;
    estimatedMinutes?: number;
    rubricCriteria?: RubricCriterion[];
    successCriteria?: string[];
    contentTypes?: ChallengeContentType[];
    isActive?: boolean;
  }

  export interface UpdateChallengeDto {
    title?: string;
    description?: string;
    difficulty?: DifficultyLevel;
    estimatedMinutes?: number;
    rubricCriteria?: RubricCriterion[];
    successCriteria?: string[];
    contentTypes?: ChallengeContentType[];
    isActive?: boolean;
  }

  // Project DTOs
  export interface CreateProjectDto {
    pathId: string;
    name: string;
    description: string;
    objectives?: string[];
    requirements?: string[];
    estimatedHours?: number;
    difficulty?: DifficultyLevel;
    isActive?: boolean;
  }

  export interface UpdateProjectDto {
    name?: string;
    description?: string;
    objectives?: string[];
    requirements?: string[];
    estimatedHours?: number;
    difficulty?: DifficultyLevel;
    isActive?: boolean;
  }

  // ProjectPrinciple DTO for linking principles to projects
  export interface LinkPrincipleDto {
    principleId: string;
    weight: number;
    rubricCriteria?: RubricCriterion[];
  }

  export interface UpdateProjectPrincipleDto {
    weight?: number;
    rubricCriteria?: RubricCriterion[];
  }

  export interface RequestFeedbackDto {
    rubricCriteria?: string[];
  }

  export interface StudyStats {
    totalUnits: number;
    dueForReview: number;
    mastered: number;
    learning: number;
    reviewing: number;
    averageConfidence: number;
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