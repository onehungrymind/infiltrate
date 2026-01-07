import { FieldDef } from './field-def';
import { DifficultyLevel, CognitiveLevel, PathStatus, SourceType, ParsingMode, ScheduleFrequency } from '@kasita/common-models';

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
 * Field definitions for SourceConfig entity
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

