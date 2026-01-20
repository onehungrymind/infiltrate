export const QUEUE_NAMES = {
  BUILD_PATH: 'build-path',
  DECOMPOSE_CONCEPT: 'decompose-concept',
  GENERATE_KU: 'generate-ku',
} as const;

export const JOB_NAMES = {
  BUILD_LEARNING_PATH: 'build-learning-path',
  DECOMPOSE_SINGLE_CONCEPT: 'decompose-single-concept',
  GENERATE_SINGLE_KU: 'generate-single-ku',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];
