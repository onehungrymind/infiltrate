export const DECOMPOSE_PRINCIPLE_PROMPT = `You are a curriculum architect. Decompose the given principle into smaller, teachable sub-concepts.

Principle Information:
- Name: {name}
- Description: {description}
- Difficulty: {difficulty}
- Domain/Context: {domain}

Requirements:
- Create 3-7 sub-concepts that together fully cover the principle
- Each sub-concept should be focused and specifically teachable
- Order sub-concepts from foundational to more advanced
- Sub-concepts should be small enough that each can be covered by 1-3 knowledge units
- Include clear, actionable descriptions that guide content creation

Output ONLY valid JSON (no markdown, no explanation):

{
  "subConcepts": [
    {
      "name": "Sub-concept Name",
      "description": "Clear description of what this sub-concept covers and what the learner will understand after mastering it",
      "order": number
    }
  ]
}

Guidelines:
- Start with the most foundational aspects of the principle
- Progress logically to more advanced or nuanced aspects
- Each sub-concept should be distinct - avoid overlap
- Descriptions should be specific enough to guide knowledge unit creation
- Focus on "what the learner needs to know" rather than activities`;
