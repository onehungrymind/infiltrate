# Prompt: Update ENTITY_DTO_KEYS in dto.utils.ts

Use this prompt to update `libs/core-data/src/lib/utils/dto.utils.ts` when the data model changes.

## Context

The `ENTITY_DTO_KEYS` constant in `libs/core-data/src/lib/utils/dto.utils.ts` defines the fields that should be included in Create/Update DTOs for each entity type. These keys are used by the HTTP service generators to convert entities to DTOs, excluding auto-generated fields like `id`, `createdAt`, `updatedAt`, and relationship fields.

## Instructions

1. **Find all entity definitions** in `apps/api/src/*/entities/*.entity.ts`
2. **Find all Create DTO definitions** in `apps/api/src/*/dto/create-*.dto.ts`
3. **For each entity**, extract the fields that:
   - Are present in the Create DTO
   - Are NOT auto-generated fields (`id`, `createdAt`, `updatedAt`)
   - Are NOT relationship fields (e.g., `knowledgeUnits`, `learningPath`, `userProgress`, etc.)

4. **Convert entity name to key format**:
   - Convert kebab-case to SCREAMING_SNAKE_CASE
   - Example: `learning-paths` → `LEARNING_PATHS`
   - Example: `knowledge-units` → `KNOWLEDGE_UNITS`
   - Example: `raw-content` → `RAW_CONTENT`
   - Example: `source-configs` → `SOURCE_CONFIGS`
   - Example: `user-progress` → `USER_PROGRESS`

5. **Update the ENTITY_DTO_KEYS constant** with:
   - Key name in SCREAMING_SNAKE_CASE (matching the generator's `serviceScreamingSnakeCase` output)
   - Array of field names from the Create DTO (use camelCase as they appear in the DTO)
   - Fields should be in the same order as they appear in the Create DTO (for consistency)

## Example

Given this entity:
```typescript
// apps/api/src/learning-paths/entities/learning-path.entity.ts
export class LearningPath {
  id: string;                    // ❌ Exclude (auto-generated)
  userId: string;                // ✅ Include
  name: string;                  // ✅ Include
  domain: string;                // ✅ Include
  targetSkill: string;           // ✅ Include
  status: string;                // ✅ Include (if in Create DTO)
  knowledgeUnits: KnowledgeUnit[]; // ❌ Exclude (relationship)
  sources: SourceConfig[];       // ❌ Exclude (relationship)
  rawContent: RawContent[];      // ❌ Exclude (relationship)
  createdAt: Date;               // ❌ Exclude (auto-generated)
  updatedAt: Date;               // ❌ Exclude (auto-generated)
}
```

And this Create DTO:
```typescript
// apps/api/src/learning-paths/dto/create-learning-path.dto.ts
export class CreateLearningPathDto {
  userId: string;
  name: string;
  domain: string;
  targetSkill: string;
  // Note: status has a default value, so it might not be in Create DTO
}
```

The ENTITY_DTO_KEYS entry should be:
```typescript
LEARNING_PATHS: [
  'userId',
  'name',
  'domain',
  'targetSkill',
  // Include 'status' only if it's in the Create DTO (even if optional)
] as const,
```

## Current File Location

`libs/core-data/src/lib/utils/dto.utils.ts`

## Verification Steps

After updating:
1. Check that all keys match the generator's `serviceScreamingSnakeCase` format
2. Verify fields match the Create DTOs (check `apps/api/src/*/dto/create-*.dto.ts`)
3. Ensure no auto-generated or relationship fields are included
4. Run `nx build core-data` to verify TypeScript compilation
5. Check that services use the correct key names (grep for `ENTITY_DTO_KEYS.`)

## Template

```typescript
export const ENTITY_DTO_KEYS = {
  [ENTITY_NAME_SCREAMING_SNAKE_CASE]: [
    // List all fields from Create DTO in camelCase
    // Exclude: id, createdAt, updatedAt, relationship fields
  ] as const,
  // ... repeat for each entity
} as const;
```

