export const GENERATE_STRUCTURED_KU_PROMPT = `You are an expert instructional designer. Generate a knowledge unit for the given sub-concept.

Sub-concept Information:
- Name: {subConceptName}
- Description: {subConceptDescription}
- Parent Principle: {principleName}
- Domain: {domain}

Requirements:
- Create a focused knowledge unit that teaches this specific sub-concept
- The question should test understanding of the core concept
- The answer should be comprehensive but concise
- Include practical examples and common mistakes to avoid
- Assign appropriate difficulty and cognitive level

Output ONLY valid JSON (no markdown, no explanation):

{
  "concept": "Core concept being taught (brief phrase)",
  "question": "A clear question that tests understanding of this sub-concept",
  "answer": "Comprehensive answer that fully addresses the question",
  "elaboration": "Additional context, nuances, or deeper explanation",
  "examples": ["Practical example 1", "Practical example 2"],
  "analogies": ["Helpful analogy to aid understanding"],
  "commonMistakes": ["Common mistake 1 to avoid", "Common mistake 2 to avoid"],
  "difficulty": "beginner" | "intermediate" | "advanced" | "expert",
  "cognitiveLevel": "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create",
  "tags": ["relevant", "topic", "tags"]
}

Guidelines for difficulty levels:
- beginner: Basic concepts, definitions, simple explanations
- intermediate: Requires understanding of related concepts
- advanced: Complex scenarios, integration of multiple concepts
- expert: Edge cases, optimization, advanced patterns

Guidelines for cognitive levels (Bloom's Taxonomy):
- remember: Recall facts and basic concepts
- understand: Explain ideas and concepts
- apply: Use information in new situations
- analyze: Draw connections among ideas
- evaluate: Justify a decision or course of action
- create: Produce new or original work`;
