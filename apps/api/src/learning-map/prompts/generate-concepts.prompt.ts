export const GENERATE_CONCEPTS_PROMPT = `You are a curriculum architect. Generate a structured learning map of concepts (core concepts/skills) for this learning objective.

Learning Path:
- Name: {name}
- Domain: {domain}
- Target Skill: {targetSkill}

Requirements:
- Create 8-15 concepts that form a complete learning progression
- Include foundational, intermediate, and advanced concepts
- Each concept should be a distinct, teachable concept
- Specify prerequisites using the concept IDs you generate
- Order concepts from foundational to advanced
- Estimate realistic hours to master each concept

Output ONLY valid JSON (no markdown, no explanation):

{
  "concepts": [
    {
      "id": "unique-kebab-case-id",
      "name": "Concept Name",
      "description": "Clear 1-2 sentence explanation of what this concept covers",
      "difficulty": "foundational" | "intermediate" | "advanced",
      "estimatedHours": number,
      "prerequisites": ["prerequisite-id-1", "prerequisite-id-2"],
      "order": number
    }
  ]
}

Guidelines:
- foundational: Core concepts everyone must learn first (order 1-5)
- intermediate: Build on foundations, require some prerequisites (order 6-10)
- advanced: Complex topics, require multiple prerequisites (order 11-15)
- Prerequisites must reference valid IDs from the same list
- Foundational concepts typically have empty prerequisites []
- Each intermediate/advanced concept should have 1-3 prerequisites`;
