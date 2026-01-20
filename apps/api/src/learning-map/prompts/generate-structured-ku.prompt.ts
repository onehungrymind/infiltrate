export const GENERATE_STRUCTURED_KU_PROMPT = `You are an expert instructional designer. Generate exactly 5 knowledge units for the given sub-concept. Each KU MUST serve a different pedagogical purpose.

Sub-concept Information:
- Name: {subConceptName}
- Description: {subConceptDescription}
- Parent Principle: {principleName}
- Domain: {domain}

CRITICAL: You MUST generate exactly 5 KUs, one for each type below. Do NOT create variations of the same question.

Generate these 5 DISTINCT knowledge units:

1. DEFINITION KU (cognitiveLevel: "remember", difficulty: "beginner")
   - Question asks: "What is [concept]?" or "Define [concept]"
   - Tests recall of core definition and key characteristics

2. MECHANISM KU (cognitiveLevel: "understand", difficulty: "intermediate")
   - Question asks: "How does [concept] work?" or "Explain the process of..."
   - Tests understanding of underlying principles, steps, or mechanisms

3. APPLICATION KU (cognitiveLevel: "apply", difficulty: "intermediate")
   - Question asks: "When would you use..." or "How would you implement..."
   - Tests ability to use the concept in real scenarios

4. COMPARISON KU (cognitiveLevel: "analyze", difficulty: "advanced")
   - Question asks: "How does [concept] differ from..." or "Compare and contrast..."
   - Tests ability to distinguish from related/similar concepts

5. BEST PRACTICES KU (cognitiveLevel: "evaluate", difficulty: "advanced")
   - Question asks: "What are the best practices for..." or "What mistakes should you avoid..."
   - Tests judgment about correct usage and common pitfalls

Output ONLY valid JSON (no markdown, no explanation):

{
  "knowledgeUnits": [
    {
      "concept": "Core concept being taught (brief phrase)",
      "question": "A clear question that tests understanding",
      "answer": "Comprehensive answer that fully addresses the question",
      "elaboration": "Additional context, nuances, or deeper explanation",
      "examples": ["Practical example 1", "Practical example 2"],
      "analogies": ["Helpful analogy to aid understanding"],
      "commonMistakes": ["Common mistake 1 to avoid"],
      "difficulty": "beginner" | "intermediate" | "advanced" | "expert",
      "cognitiveLevel": "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create",
      "tags": ["relevant", "topic", "tags"]
    }
  ]
}

Guidelines for cognitive levels (Bloom's Taxonomy):
- remember: Recall facts and basic concepts
- understand: Explain ideas and concepts
- apply: Use information in new situations
- analyze: Draw connections among ideas
- evaluate: Justify a decision or course of action
- create: Produce new or original work`;
