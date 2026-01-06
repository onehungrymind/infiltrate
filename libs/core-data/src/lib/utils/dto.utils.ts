/**
 * Utility functions for converting entities to DTOs
 */

/**
 * Dynamically extracts properties from source object that exist in target type
 */
export function extractDtoProperties<T extends Record<string, any>>(
  source: Record<string, any>,
  targetKeys: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of targetKeys) {
    if (key in source) {
      result[key] = source[key as keyof typeof source];
    }
  }

  return result;
}

/**
 * Gets all keys from a type (excluding auto-generated fields)
 * @param entityKeys - Array of keys specific to the entity type
 * @param excludeKeys - Keys to exclude from the result
 */
export function getDtoKeys<T extends Record<string, any>>(
  entityKeys: readonly string[],
  excludeKeys: (keyof T)[] = []
): (keyof T)[] {
  const allKeys: (keyof T)[] = entityKeys as (keyof T)[];
  return allKeys.filter((key) => !excludeKeys.includes(key));
}

/**
 * Common DTO keys for different entity types
 * These are the fields included in Create/Update DTOs (excluding auto-generated fields like id, createdAt, updatedAt, and relationship fields)
 */
export const ENTITY_DTO_KEYS = {
  DATA_SOURCES: [
    'name',
    'description',
    'url',
    'archiveUrl',
    'type',
    'tags',
    'enabled',
    'parsingMode',
    'scheduleFrequency',
    'parsingInstructions',
  ] as const,
  LEARNING_PATHS: [
    'userId',
    'name',
    'domain',
    'targetSkill',
    'status',
  ] as const,

  KNOWLEDGE_UNITS: [
    'pathId',
    'concept',
    'question',
    'answer',
    'elaboration',
    'examples',
    'analogies',
    'commonMistakes',
    'difficulty',
    'cognitiveLevel',
    'estimatedTimeSeconds',
    'tags',
    'sourceIds',
    'status',
  ] as const,

  RAW_CONTENT: [
    'pathId',
    'sourceType',
    'sourceUrl',
    'title',
    'content',
    'author',
    'publishedDate',
    'metadata',
  ] as const,

  SOURCE_CONFIGS: [
    'pathId',
    'url',
    'type',
    'name',
    'enabled',
  ] as const,

  USER_PROGRESS: [
    'userId',
    'unitId',
    'masteryLevel',
    'confidence',
    'easinessFactor',
    'interval',
    'repetitions',
    'nextReviewDate',
    'attempts',
    'lastAttemptAt',
  ] as const,
} as const;
