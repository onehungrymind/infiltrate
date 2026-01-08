export const GENERATE_KNOWLEDGE_GRAPH_PROMPT = `You are a knowledge graph architect. Generate a hierarchical knowledge graph for learning this topic.

Topic: {topic}

Requirements:
- Include concepts up to 3 levels deep
- Show prerequisites, core concepts, and advanced topics
- Create clear learning progression
- Estimate hours for each concept

Output ONLY valid JSON (no markdown, no explanation):

{
  "topic": "topic name",
  "nodes": [
    {
      "id": "unique-kebab-case-id",
      "label": "Concept Name",
      "type": "prerequisite" | "core" | "subtopic" | "skill" | "tool",
      "description": "Brief explanation (1 sentence)",
      "difficulty": "beginner" | "intermediate" | "advanced",
      "estimatedHours": number,
      "level": 1 | 2 | 3
    }
  ],
  "edges": [
    {
      "source": "node-id",
      "target": "node-id",
      "relationship": "prerequisite" | "leads-to" | "related-to"
    }
  ]
}

Generate 12-20 nodes with clear hierarchical structure.`;
