export const QUEUE_NAMES = {
  BUILD_PATH: 'build-path',
  DECOMPOSE_CONCEPT: 'decompose-concept',
  GENERATE_KU: 'generate-ku',
  CLASSROOM_GENERATION: 'classroom-generation',
} as const;

export const JOB_NAMES = {
  BUILD_LEARNING_PATH: 'build-learning-path',
  DECOMPOSE_SINGLE_CONCEPT: 'decompose-single-concept',
  GENERATE_SINGLE_KU: 'generate-single-ku',
  GENERATE_CLASSROOM_CONTENT: 'generate-classroom-content',
  GENERATE_CLASSROOM_FOR_PATH: 'generate-classroom-for-path',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];
