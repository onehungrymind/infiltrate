export const GENERATE_PRINCIPLES_PROMPT = `You are a curriculum architect. Generate a structured learning map of principles (core concepts/skills) for this learning objective.

Learning Path:
- Name: {name}
- Domain: {domain}
- Target Skill: {targetSkill}

Requirements:
- Create 8-15 principles that form a complete learning progression
- Include foundational, intermediate, and advanced principles
- Each principle should be a distinct, teachable concept
- Specify prerequisites using the principle IDs you generate
- Order principles from foundational to advanced
- Estimate realistic hours to master each principle

Output ONLY valid JSON (no markdown, no explanation):

{
  "principles": [
    {
      "id": "unique-kebab-case-id",
      "name": "Principle Name",
      "description": "Clear 1-2 sentence explanation of what this principle covers",
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
- Foundational principles typically have empty prerequisites []
- Each intermediate/advanced principle should have 1-3 prerequisites`;
