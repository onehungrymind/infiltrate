/**
 * Knowledge Acquisition System (KAS) - Unified Data Model
 * 
 * A flexible, extensible system for managing learning across multiple modalities:
 * - Flashcard systems (Infiltrate)
 * - Games and challenges
 * - Spaced repetition
 * - Concept mapping
 * - Progressive disclosure
 */

// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

/**
 * Base metadata for all entities in the system
 */
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Learning domains - high-level subject areas
 */
interface Domain extends BaseEntity {
  name: string;
  description: string;
  slug: string;
  parentDomainId?: string; // Supports hierarchical domains (e.g., CS -> ML -> NLP)
  icon?: string;
  color?: string;
}

/**
 * Topics within a domain
 */
interface Topic extends BaseEntity {
  domainId: string;
  name: string;
  description: string;
  slug: string;
  difficulty: DifficultyLevel;
  prerequisites?: string[]; // Topic IDs that should be learned first
  estimatedTimeMinutes?: number;
}

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// ============================================================================
// KNOWLEDGE UNITS - The atomic building blocks
// ============================================================================

/**
 * The fundamental unit of knowledge
 * Can be rendered in multiple formats (flashcard, question, challenge, etc.)
 */
interface KnowledgeUnit extends BaseEntity {
  topicId: string;
  
  // Core content
  concept: string; // The thing being learned (e.g., "Gradient Descent")
  question: string; // How to prompt for this knowledge
  answer: string; // The explanation/answer
  
  // Additional context
  elaboration?: string; // Deeper dive for advanced learners
  examples?: Example[];
  analogies?: string[];
  commonMistakes?: string[];
  
  // Relationships
  relatedUnitIds?: string[];
  prerequisiteUnitIds?: string[];
  
  // Learning metadata
  difficulty: DifficultyLevel;
  cognitiveLevel: CognitiveLevel; // Bloom's taxonomy
  estimatedTimeSeconds: number;
  
  // Source tracking
  sources?: Source[];
}

type CognitiveLevel = 
  | 'remember'    // Recall facts
  | 'understand'  // Explain concepts
  | 'apply'       // Use in new situations
  | 'analyze'     // Break down and examine
  | 'evaluate'    // Make judgments
  | 'create';     // Produce new work

interface Example {
  id: string;
  description: string;
  code?: string;
  language?: string;
  visual?: string; // URL to diagram/image
}

interface Source {
  title: string;
  url?: string;
  author?: string;
  type: 'book' | 'article' | 'video' | 'course' | 'documentation' | 'paper' | 'conversation';
  accessedAt?: Date;
  notes?: string;
}

// ============================================================================
// LEARNING ACTIVITIES - Different ways to interact with knowledge
// ============================================================================

/**
 * Base interface for all learning activities
 */
interface LearningActivity extends BaseEntity {
  type: ActivityType;
  name: string;
  description?: string;
  knowledgeUnitIds: string[]; // Which units this activity covers
  config: ActivityConfig;
}

type ActivityType = 
  | 'flashcard'
  | 'quiz'
  | 'challenge'
  | 'game'
  | 'practice'
  | 'project'
  | 'whiteboard'
  | 'verbal-recitation';

/**
 * Polymorphic configuration for different activity types
 */
type ActivityConfig = 
  | FlashcardConfig
  | QuizConfig
  | ChallengeConfig
  | GameConfig
  | WhiteboardConfig
  | VerbalRecitationConfig;

interface FlashcardConfig {
  type: 'flashcard';
  showHints: boolean;
  allowFlip: boolean;
  timedMode?: boolean;
  timePerCardSeconds?: number;
}

interface QuizConfig {
  type: 'quiz';
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showExplanations: boolean;
  passingScore?: number; // Percentage
  allowRetry: boolean;
  questionFormat: 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay';
}

interface ChallengeConfig {
  type: 'challenge';
  challengeType: 'coding' | 'whiteboard' | 'oral-defense' | 'essay';
  timeLimit?: number;
  rubric?: Rubric[];
  successCriteria: string[];
}

interface GameConfig {
  type: 'game';
  gameType: 'trivia' | 'matching' | 'race' | 'battle' | 'puzzle';
  difficulty: DifficultyLevel;
  scoreMultiplier?: number;
  penalties?: boolean;
}

interface WhiteboardConfig {
  type: 'whiteboard';
  providedDiagrams?: string[];
  requiredElements: string[]; // What must be drawn/explained
  timeLimit?: number;
}

interface VerbalRecitationConfig {
  type: 'verbal-recitation';
  recordAudio?: boolean;
  providedPrompts?: string[];
  evaluationCriteria: string[];
}

interface Rubric {
  criterion: string;
  points: number;
  description: string;
}

// ============================================================================
// LEARNING PATHS - Structured progression through knowledge
// ============================================================================

/**
 * A curated sequence of learning activities
 */
interface LearningPath extends BaseEntity {
  name: string;
  description: string;
  domainId?: string;
  topicIds: string[];
  
  // Progression
  phases: LearningPhase[];
  
  // Completion criteria
  minimumScore?: number;
  requiredActivities?: string[]; // Activity IDs that must be completed
  
  // Metadata
  difficulty: DifficultyLevel;
  estimatedHours: number;
}

/**
 * Phases within a learning path (e.g., Infiltrate's 3 phases)
 */
interface LearningPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  activityIds: string[];
  completionCriteria: CompletionCriteria;
}

interface CompletionCriteria {
  type: 'all' | 'percentage' | 'score' | 'time' | 'custom';
  value?: number;
  customLogic?: string; // Reference to a validation function
}

// ============================================================================
// USER PROGRESS TRACKING
// ============================================================================

/**
 * Tracks a user's overall progress in the system
 */
interface UserProfile extends BaseEntity {
  userId: string;
  displayName?: string;
  goals?: string[];
  preferredLearningStyle?: LearningStyle[];
  timezone?: string;
}

type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing';

/**
 * Progress on a specific learning path
 */
interface PathProgress extends BaseEntity {
  userId: string;
  pathId: string;
  status: ProgressStatus;
  currentPhaseId?: string;
  
  // Timing
  startedAt: Date;
  lastActivityAt?: Date;
  completedAt?: Date;
  
  // Performance
  overallScore?: number;
  phaseProgress: PhaseProgress[];
}

type ProgressStatus = 'not-started' | 'in-progress' | 'completed' | 'paused';

interface PhaseProgress {
  phaseId: string;
  status: ProgressStatus;
  completedActivityIds: string[];
  score?: number;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Granular tracking of knowledge unit mastery
 */
interface KnowledgeUnitProgress extends BaseEntity {
  userId: string;
  unitId: string;
  
  // Mastery tracking
  masteryLevel: MasteryLevel;
  confidence: number; // 0-100
  
  // Spaced repetition (SM-2 algorithm compatible)
  easinessFactor: number; // 1.3 - 2.5
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  nextReviewDate: Date;
  
  // History
  attempts: KnowledgeAttempt[];
  lastAttemptAt?: Date;
  
  // Analytics
  averageResponseTime?: number; // Seconds
  streakDays?: number;
}

type MasteryLevel = 'unknown' | 'learning' | 'reviewing' | 'mastered' | 'expert';

interface KnowledgeAttempt {
  attemptedAt: Date;
  activityId: string;
  activityType: ActivityType;
  
  // Performance
  correct: boolean;
  responseTime?: number; // Seconds
  confidence?: number; // Self-reported 0-100
  
  // Context
  notes?: string;
  struggledWith?: string[];
}

// ============================================================================
// INFILTRATE-SPECIFIC MODELS
// ============================================================================

/**
 * Specialized deck for Infiltrate methodology
 * Extends the generic LearningPath with Infiltrate-specific phases
 */
interface InfiltrateDeck extends LearningPath {
  methodology: 'infiltrate';
  targetAudience: 'technical' | 'non-technical' | 'mixed';
  socialContext: string; // Description of the social setting to infiltrate
  
  // The three phases
  phases: [
    MemorizationPhase,
    RecitationPhase,
    PerformancePhase
  ];
}

interface MemorizationPhase extends LearningPhase {
  name: 'Memorization';
  activityIds: string[]; // Flashcard activities
  completionCriteria: {
    type: 'percentage';
    value: 80; // Must get 80% correct
  };
}

interface RecitationPhase extends LearningPhase {
  name: 'Recitation';
  activityIds: string[]; // Verbal recitation activities
  completionCriteria: {
    type: 'all'; // Must complete all recitations
  };
}

interface PerformancePhase extends LearningPhase {
  name: 'Performance';
  activityIds: string[]; // Whiteboard challenges
  completionCriteria: {
    type: 'score';
    value: 75; // Must score 75% on whiteboard explanations
  };
}

// ============================================================================
// GAMIFICATION & ENGAGEMENT
// ============================================================================

interface Achievement extends BaseEntity {
  name: string;
  description: string;
  icon?: string;
  
  // Unlock criteria
  requirement: AchievementRequirement;
  
  // Rewards
  points?: number;
  badge?: string;
}

type AchievementRequirement =
  | { type: 'complete-path'; pathId: string }
  | { type: 'master-units'; count: number; domainId?: string }
  | { type: 'streak-days'; days: number }
  | { type: 'perfect-score'; activityId: string }
  | { type: 'speed-run'; activityId: string; timeSeconds: number };

interface UserAchievement extends BaseEntity {
  userId: string;
  achievementId: string;
  earnedAt: Date;
  context?: string; // What they did to earn it
}

interface Leaderboard extends BaseEntity {
  name: string;
  scope: 'global' | 'domain' | 'topic' | 'path';
  scopeId?: string;
  metric: LeaderboardMetric;
  timeframe: 'all-time' | 'monthly' | 'weekly' | 'daily';
}

type LeaderboardMetric = 
  | 'total-points'
  | 'units-mastered'
  | 'paths-completed'
  | 'streak-days'
  | 'speed';

// ============================================================================
// ANALYTICS & INSIGHTS
// ============================================================================

interface LearningSession extends BaseEntity {
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  durationMinutes?: number;
  
  // Activities in this session
  activities: SessionActivity[];
  
  // Performance summary
  unitsReviewed: number;
  unitsLearned: number;
  averageScore?: number;
  
  // Context
  deviceType?: string;
  location?: string;
}

interface SessionActivity {
  activityId: string;
  unitIds: string[];
  startedAt: Date;
  completedAt?: Date;
  score?: number;
}

/**
 * Aggregated analytics for insights
 */
interface LearningAnalytics {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year' | 'all-time';
  
  // Volume metrics
  totalSessions: number;
  totalMinutes: number;
  totalUnitsLearned: number;
  totalUnitsMastered: number;
  
  // Performance metrics
  averageScore: number;
  averageSessionLength: number;
  averageUnitsPerSession: number;
  
  // Patterns
  bestTimeOfDay?: string;
  bestDayOfWeek?: string;
  strongestDomains: string[]; // Domain IDs
  weakestDomains: string[]; // Domain IDs
  
  // Trends
  scoreOverTime: DataPoint[];
  volumeOverTime: DataPoint[];
}

interface DataPoint {
  timestamp: Date;
  value: number;
}

// ============================================================================
// CONTENT MANAGEMENT
// ============================================================================

/**
 * Tracks versions of knowledge units for iteration
 */
interface ContentVersion extends BaseEntity {
  entityType: 'knowledge-unit' | 'activity' | 'path';
  entityId: string;
  version: number;
  changes: string;
  author?: string;
  publishedAt?: Date;
  status: 'draft' | 'review' | 'published' | 'archived';
}

/**
 * User-generated content / contributions
 */
interface Contribution extends BaseEntity {
  userId: string;
  contributionType: 'knowledge-unit' | 'example' | 'analogy' | 'correction';
  targetEntityId: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
}

// ============================================================================
// EXPORT FORMATS
// ============================================================================

/**
 * Support for exporting to various formats
 */
interface ExportConfig {
  format: ExportFormat;
  includeProgress?: boolean;
  includeAnalytics?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

type ExportFormat = 
  | 'anki' // Anki deck
  | 'quizlet' // Quizlet set
  | 'csv' // Spreadsheet
  | 'json' // Raw data
  | 'markdown' // Documentation
  | 'pdf'; // Printable study guide

// ============================================================================
// API TYPES
// ============================================================================

/**
 * Request/Response types for common operations
 */

interface CreateKnowledgeUnitRequest {
  topicId: string;
  concept: string;
  question: string;
  answer: string;
  difficulty: DifficultyLevel;
  cognitiveLevel: CognitiveLevel;
  examples?: Example[];
  sources?: Source[];
}

interface RecordAttemptRequest {
  userId: string;
  unitId: string;
  activityId: string;
  correct: boolean;
  responseTime?: number;
  confidence?: number;
}

interface GetNextReviewUnitsRequest {
  userId: string;
  limit?: number;
  domainId?: string;
  topicId?: string;
}

interface GetNextReviewUnitsResponse {
  units: KnowledgeUnit[];
  totalDue: number;
  totalOverdue: number;
}

interface GetProgressSummaryRequest {
  userId: string;
  domainId?: string;
  topicId?: string;
  pathId?: string;
}

interface GetProgressSummaryResponse {
  totalUnits: number;
  masteredUnits: number;
  learningUnits: number;
  dueForReview: number;
  currentStreak: number;
  longestStreak: number;
  recentSessions: LearningSession[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Pagination helper
 */
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Filter/sort options
 */
interface QueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

// ============================================================================
// EXAMPLES OF USAGE
// ============================================================================

/**
 * Example: Creating an Infiltrate deck for ML/AI
 */
const mlInfiltrateDeck: InfiltrateDeck = {
  id: 'infiltrate-ml-ai',
  methodology: 'infiltrate',
  name: 'ML/AI Fundamentals - Infiltrate Protocol',
  description: 'Master core ML/AI concepts to convincingly discuss in any technical setting',
  targetAudience: 'non-technical',
  socialContext: 'Technical team meetings, interviews, networking events',
  
  domainId: 'machine-learning',
  topicIds: ['ml-fundamentals', 'neural-networks', 'training', 'evaluation'],
  
  difficulty: 'intermediate',
  estimatedHours: 8,
  
  phases: [
    {
      id: 'phase-1-memorization',
      name: 'Memorization',
      description: 'Commit core principles to memory via flashcards',
      order: 1,
      activityIds: ['flashcard-ml-basics'],
      completionCriteria: {
        type: 'percentage',
        value: 80
      }
    },
    {
      id: 'phase-2-recitation',
      name: 'Recitation',
      description: 'Practice reciting principles out loud',
      order: 2,
      activityIds: ['recitation-ml-basics'],
      completionCriteria: {
        type: 'all'
      }
    },
    {
      id: 'phase-3-performance',
      name: 'Performance',
      description: 'Demonstrate understanding via whiteboard explanations',
      order: 3,
      activityIds: ['whiteboard-ml-basics'],
      completionCriteria: {
        type: 'score',
        value: 75
      }
    }
  ],
  
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: ['infiltrate', 'ml', 'interview-prep']
};

/**
 * Example: Creating a knowledge unit
 */
const gradientDescentUnit: KnowledgeUnit = {
  id: 'ku-gradient-descent',
  topicId: 'ml-training',
  
  concept: 'Gradient Descent & Backpropagation',
  question: 'How do gradient descent and backpropagation work together?',
  answer: 'Gradient descent is walking downhill in the dark - you feel the slope and step in the steepest downward direction. Backpropagation calculates those slopes (gradients) efficiently by working backward through the network. This is how neural networks learn - adjust weights to reduce loss.',
  
  elaboration: 'Gradient descent is an optimization algorithm that iteratively adjusts parameters to minimize a loss function. The "gradient" is the vector of partial derivatives that points in the direction of steepest ascent. We move in the opposite direction (descent) by a step size determined by the learning rate.',
  
  examples: [
    {
      id: 'ex-1',
      description: 'Simple linear regression example showing how gradient descent finds optimal weights',
      code: `# Pseudocode
for epoch in range(num_epochs):
    predictions = model(X)
    loss = loss_function(predictions, y)
    gradients = compute_gradients(loss)
    weights = weights - learning_rate * gradients`,
      language: 'python'
    }
  ],
  
  analogies: [
    'Walking down a foggy mountain by always stepping in the direction that slopes downward most steeply',
    'Adjusting a radio dial to minimize static - small turns in the direction that improves signal'
  ],
  
  commonMistakes: [
    'Learning rate too high causes overshooting the minimum',
    'Learning rate too low causes very slow convergence',
    'Forgetting that backprop is just the algorithm to compute gradients efficiently'
  ],
  
  difficulty: 'intermediate',
  cognitiveLevel: 'understand',
  estimatedTimeSeconds: 120,
  
  sources: [
    {
      title: 'Deep Learning Book',
      author: 'Ian Goodfellow',
      type: 'book',
      url: 'https://www.deeplearningbook.org/'
    }
  ],
  
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: ['neural-networks', 'optimization', 'training']
};

/**
 * Example: Recording user progress
 */
const recordProgress = async (
  userId: string,
  unitId: string,
  correct: boolean
): Promise<KnowledgeUnitProgress> => {
  // This would be implemented in your backend
  // Returns updated progress with new SM-2 calculations
  return {} as KnowledgeUnitProgress;
};

export type {
  // Core domain
  Domain,
  Topic,
  KnowledgeUnit,
  Example,
  Source,
  
  // Activities
  LearningActivity,
  ActivityConfig,
  FlashcardConfig,
  QuizConfig,
  ChallengeConfig,
  GameConfig,
  WhiteboardConfig,
  VerbalRecitationConfig,
  
  // Learning paths
  LearningPath,
  LearningPhase,
  InfiltrateDeck,
  
  // Progress tracking
  UserProfile,
  PathProgress,
  KnowledgeUnitProgress,
  KnowledgeAttempt,
  LearningSession,
  
  // Analytics
  LearningAnalytics,
  Achievement,
  Leaderboard,
  
  // Content management
  ContentVersion,
  Contribution,
  
  // API types
  CreateKnowledgeUnitRequest,
  RecordAttemptRequest,
  GetNextReviewUnitsRequest,
  GetNextReviewUnitsResponse,
  GetProgressSummaryRequest,
  GetProgressSummaryResponse,
  PaginatedResponse,
  QueryOptions,
  
  // Enums
  DifficultyLevel,
  CognitiveLevel,
  ActivityType,
  ProgressStatus,
  MasteryLevel,
  LearningStyle,
  ExportFormat
};