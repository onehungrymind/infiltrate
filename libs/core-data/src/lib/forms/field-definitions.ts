import { FieldDef } from './field-def';
import { DifficultyLevel, CognitiveLevel, PathStatus, SourceType, ParsingMode, ScheduleFrequency, PrincipleDifficulty, PrincipleStatus } from '@kasita/common-models';

/**
 * Field definitions for LearningPath entity
 * Note: userId is automatically set from the current user, not included in form
 */
export const learningPathFields: FieldDef[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 200,
    placeholder: 'Enter learning path name',
  },
  {
    name: 'domain',
    label: 'Domain',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 100,
    placeholder: 'e.g., Web Development',
  },
  {
    name: 'targetSkill',
    label: 'Target Skill',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 200,
    placeholder: 'e.g., Build production RSC app',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: [
      { value: 'not-started', label: 'Not Started' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
    ],
  },
  {
    name: 'visibility',
    label: 'Visibility',
    type: 'select',
    required: false,
    options: [
      { value: 'private', label: 'Private (Only you)' },
      { value: 'shared', label: 'Shared (Enrolled users)' },
      { value: 'public', label: 'Public (Everyone)' },
    ],
    helpText: 'Controls who can see and enroll in this learning path',
  },
];

/**
 * Field definitions for Principle entity
 * Note: pathId is handled separately, not in form
 */
export const principleFields: FieldDef[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 200,
    placeholder: 'e.g., Server Components',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    minLength: 1,
    maxLength: 2000,
    rows: 4,
    placeholder: 'Brief description of this principle',
  },
  {
    name: 'estimatedHours',
    label: 'Estimated Hours',
    type: 'number',
    required: false,
    min: 0.5,
    max: 100,
    placeholder: '1',
    helpText: 'Estimated time to master this principle',
  },
  {
    name: 'difficulty',
    label: 'Difficulty',
    type: 'select',
    required: true,
    options: [
      { value: 'foundational', label: 'Foundational' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
    ],
  },
  {
    name: 'prerequisites',
    label: 'Prerequisites',
    type: 'textarea',
    required: false,
    rows: 2,
    placeholder: 'One principle ID per line',
    helpText: 'Enter prerequisite principle IDs, one per line',
  },
  {
    name: 'order',
    label: 'Order',
    type: 'number',
    required: false,
    min: 0,
    max: 1000,
    placeholder: '0',
    helpText: 'Display order in the learning map',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'mastered', label: 'Mastered' },
    ],
  },
];

/**
 * Field definitions for KnowledgeUnit entity
 * Note: pathId and sourceIds are handled separately, not in form
 */
export const knowledgeUnitFields: FieldDef[] = [
  {
    name: 'concept',
    label: 'Concept',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 200,
    placeholder: 'e.g., Server Components',
  },
  {
    name: 'question',
    label: 'Question',
    type: 'textarea',
    required: true,
    minLength: 1,
    maxLength: 1000,
    rows: 3,
    placeholder: 'What are Server Components?',
  },
  {
    name: 'answer',
    label: 'Answer',
    type: 'textarea',
    required: true,
    minLength: 1,
    maxLength: 2000,
    rows: 5,
    placeholder: 'Components that render on the server...',
  },
  {
    name: 'elaboration',
    label: 'Elaboration',
    type: 'textarea',
    required: false,
    maxLength: 5000,
    rows: 4,
    placeholder: 'Additional context and details...',
  },
  {
    name: 'examples',
    label: 'Examples',
    type: 'textarea',
    required: false,
    rows: 3,
    placeholder: 'One example per line',
    helpText: 'Enter one example per line (will be converted to array)',
  },
  {
    name: 'analogies',
    label: 'Analogies',
    type: 'textarea',
    required: false,
    rows: 3,
    placeholder: 'One analogy per line',
    helpText: 'Enter one analogy per line (will be converted to array)',
  },
  {
    name: 'commonMistakes',
    label: 'Common Mistakes',
    type: 'textarea',
    required: false,
    rows: 3,
    placeholder: 'One mistake per line',
    helpText: 'Enter one mistake per line (will be converted to array)',
  },
  {
    name: 'tags',
    label: 'Tags',
    type: 'text',
    required: false,
    placeholder: 'tag1, tag2, tag3',
    helpText: 'Comma-separated tags (will be converted to array)',
  },
  {
    name: 'difficulty',
    label: 'Difficulty',
    type: 'select',
    required: true,
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
      { value: 'expert', label: 'Expert' },
    ],
  },
  {
    name: 'cognitiveLevel',
    label: 'Cognitive Level',
    type: 'select',
    required: true,
    options: [
      { value: 'remember', label: 'Remember' },
      { value: 'understand', label: 'Understand' },
      { value: 'apply', label: 'Apply' },
      { value: 'analyze', label: 'Analyze' },
      { value: 'evaluate', label: 'Evaluate' },
      { value: 'create', label: 'Create' },
    ],
  },
  {
    name: 'estimatedTimeSeconds',
    label: 'Estimated Time (seconds)',
    type: 'number',
    required: false,
    min: 1,
    max: 3600,
    placeholder: '120',
  },
];

/**
 * Field definitions for SourceConfig entity (deprecated - use sourceFields)
 * Note: pathId is handled separately, not in form
 */
export const sourceConfigFields: FieldDef[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 200,
    placeholder: 'e.g., JavaScript Weekly',
  },
  {
    name: 'url',
    label: 'URL',
    type: 'url',
    required: true,
    minLength: 1,
    maxLength: 500,
    placeholder: 'https://javascriptweekly.com/rss',
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'rss', label: 'RSS Feed' },
      { value: 'article', label: 'Article' },
      { value: 'pdf', label: 'PDF' },
    ],
  },
  {
    name: 'enabled',
    label: 'Enabled',
    type: 'checkbox',
    required: false,
  },
];

/**
 * Field definitions for Source entity (new many-to-many model)
 * Note: enabled is per-path in SourcePathLink junction table
 */
export const sourceFields: FieldDef[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 200,
    placeholder: 'e.g., JavaScript Weekly',
  },
  {
    name: 'url',
    label: 'URL',
    type: 'url',
    required: true,
    minLength: 1,
    maxLength: 500,
    placeholder: 'https://javascriptweekly.com/rss',
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'rss', label: 'RSS Feed' },
      { value: 'article', label: 'Article' },
      { value: 'pdf', label: 'PDF' },
    ],
  },
];

/**
 * Field definitions for DataSource entity
 */
export const dataSourceFields: FieldDef[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 200,
    placeholder: 'e.g., JavaScript Weekly',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    maxLength: 1000,
    rows: 3,
    placeholder: 'Brief description of the data source',
  },
  {
    name: 'url',
    label: 'URL',
    type: 'url',
    required: true,
    minLength: 1,
    maxLength: 500,
    placeholder: 'https://javascriptweekly.com/rss',
    helpText: 'Primary URL for current/ongoing content',
  },
  {
    name: 'archiveUrl',
    label: 'Archive URL',
    type: 'url',
    required: false,
    maxLength: 500,
    placeholder: 'https://javascriptweekly.com/issues',
    helpText: 'URL for archive/historical content (optional)',
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'rss', label: 'RSS Feed' },
      { value: 'article', label: 'Article' },
      { value: 'pdf', label: 'PDF' },
    ],
  },
  {
    name: 'tags',
    label: 'Tags',
    type: 'text',
    required: false,
    placeholder: 'javascript, newsletter, web',
    helpText: 'Comma-separated tags',
  },
  {
    name: 'enabled',
    label: 'Enabled',
    type: 'checkbox',
    required: false,
  },
  {
    name: 'parsingMode',
    label: 'Parsing Mode',
    type: 'select',
    required: true,
    options: [
      { value: 'current', label: 'Current Only' },
      { value: 'archive', label: 'Archive Only' },
      { value: 'both', label: 'Both Current & Archive' },
    ],
    helpText: 'What content should be parsed from this source',
  },
  {
    name: 'scheduleFrequency',
    label: 'Schedule Frequency',
    type: 'select',
    required: false,
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'manual', label: 'Manual' },
    ],
    helpText: 'How often to check for new content',
  },
];

/**
 * Field definitions for RawContent entity
 * Note: pathId and sourceType are handled separately, not in form
 */
export const rawContentFields: FieldDef[] = [
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 500,
    placeholder: 'Article title',
  },
  {
    name: 'content',
    label: 'Content',
    type: 'textarea',
    required: true,
    minLength: 1,
    rows: 10,
    placeholder: 'Article content',
  },
  {
    name: 'author',
    label: 'Author',
    type: 'text',
    required: false,
    maxLength: 200,
    placeholder: 'Author name',
  },
  {
    name: 'sourceUrl',
    label: 'Source URL',
    type: 'url',
    required: true,
    maxLength: 500,
    placeholder: 'https://example.com/article',
  },
];

/**
 * Field definitions for UserProgress entity
 * Note: userId and unitId are handled separately, not in form
 */
/**
 * Field definitions for User entity
 */
export const userFields: FieldDef[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 200,
    placeholder: 'John Doe',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    minLength: 1,
    maxLength: 255,
    placeholder: 'user@example.com',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: true,
    minLength: 8,
    maxLength: 200,
    placeholder: 'Enter password',
    helpText: 'Password is required. When editing, the field is pre-filled with the hashed password.',
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    required: false,
    options: [
      { value: 'guest', label: 'Guest' },
      { value: 'user', label: 'User' },
      { value: 'mentor', label: 'Mentor' },
      { value: 'manager', label: 'Manager' },
      { value: 'admin', label: 'Admin' },
    ],
    helpText: 'User role determines access level and permissions',
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'checkbox',
    required: false,
    helpText: 'Whether the user account is active',
  },
];

export const userProgressFields: FieldDef[] = [
  {
    name: 'masteryLevel',
    label: 'Mastery Level',
    type: 'select',
    required: true,
    options: [
      { value: 'learning', label: 'Learning' },
      { value: 'reviewing', label: 'Reviewing' },
      { value: 'mastered', label: 'Mastered' },
    ],
  },
  {
    name: 'confidence',
    label: 'Confidence (0-100)',
    type: 'number',
    required: true,
    min: 0,
    max: 100,
    placeholder: '50',
  },
  {
    name: 'easinessFactor',
    label: 'Easiness Factor',
    type: 'number',
    required: true,
    min: 1.3,
    max: 2.5,
    placeholder: '2.5',
  },
  {
    name: 'interval',
    label: 'Interval (days)',
    type: 'number',
    required: true,
    min: 1,
    placeholder: '1',
  },
  {
    name: 'repetitions',
    label: 'Repetitions',
    type: 'number',
    required: true,
    min: 0,
    placeholder: '0',
  },
  {
    name: 'attempts',
    label: 'Attempts',
    type: 'number',
    required: true,
    min: 0,
    placeholder: '0',
  },
];

/**
 * Field definitions for Challenge entity
 * Note: unitId is handled separately
 */
export const challengeFields: FieldDef[] = [
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 200,
    placeholder: 'e.g., Implement a Binary Search',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    minLength: 1,
    maxLength: 5000,
    rows: 6,
    placeholder: 'Instructions for the learner...',
    helpText: 'Detailed instructions and context for completing the challenge',
  },
  {
    name: 'difficulty',
    label: 'Difficulty',
    type: 'select',
    required: true,
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
      { value: 'expert', label: 'Expert' },
    ],
  },
  {
    name: 'estimatedMinutes',
    label: 'Estimated Minutes',
    type: 'number',
    required: true,
    min: 1,
    max: 480,
    placeholder: '30',
    helpText: 'Expected time to complete (1-480 minutes)',
  },
  {
    name: 'successCriteria',
    label: 'Success Criteria',
    type: 'textarea',
    required: false,
    rows: 4,
    placeholder: 'One criterion per line',
    helpText: 'What must be achieved to pass (one per line)',
  },
  {
    name: 'contentTypes',
    label: 'Allowed Content Types',
    type: 'text',
    required: false,
    placeholder: 'code, written, project',
    helpText: 'Comma-separated: code, written, project',
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'checkbox',
    required: false,
    helpText: 'Whether the challenge is visible to learners',
  },
];

/**
 * Field definitions for Project entity
 * Note: pathId is handled separately
 */
export const projectFields: FieldDef[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 200,
    placeholder: 'e.g., Build a REST API',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    minLength: 1,
    maxLength: 5000,
    rows: 6,
    placeholder: 'Project overview and context...',
  },
  {
    name: 'objectives',
    label: 'Learning Objectives',
    type: 'textarea',
    required: false,
    rows: 4,
    placeholder: 'One objective per line',
    helpText: 'What the learner will achieve (one per line)',
  },
  {
    name: 'requirements',
    label: 'Requirements',
    type: 'textarea',
    required: false,
    rows: 4,
    placeholder: 'One requirement per line',
    helpText: 'What must be delivered (one per line)',
  },
  {
    name: 'estimatedHours',
    label: 'Estimated Hours',
    type: 'number',
    required: true,
    min: 1,
    max: 100,
    placeholder: '8',
    helpText: 'Expected time to complete (1-100 hours)',
  },
  {
    name: 'difficulty',
    label: 'Difficulty',
    type: 'select',
    required: true,
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
      { value: 'expert', label: 'Expert' },
    ],
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'checkbox',
    required: false,
    helpText: 'Whether the project is visible to learners',
  },
];

/**
 * Field definitions for Submission entity
 * Note: userId, unitId, and pathId are handled separately
 */
export const submissionFields: FieldDef[] = [
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 200,
    placeholder: 'Submission title',
  },
  {
    name: 'contentType',
    label: 'Content Type',
    type: 'select',
    required: true,
    options: [
      { value: 'text', label: 'Text / Code' },
      { value: 'url', label: 'URL Link' },
      { value: 'file', label: 'File Upload' },
    ],
    helpText: 'How you want to submit your work',
  },
];

