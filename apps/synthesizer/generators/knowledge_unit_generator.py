"""Generate knowledge units using Claude."""
import logging
import os
from anthropic import Anthropic
from typing import Optional
from .base_generator import BaseGenerator
from ..models.cluster import ContentCluster
from ..models.processed_content import ProcessedContent
from ..models.synthesis_result import (
    KnowledgeUnit, 
    KnowledgeUnitBatch,
    DifficultyLevel,
    CognitiveLevel
)
from python_shared.utils import generate_id


logger = logging.getLogger("synthesizer.knowledge_units")


class KnowledgeUnitGenerator(BaseGenerator):
    """Generate knowledge units (flashcards) using Claude."""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "claude-sonnet-4-20250514",
        max_tokens: int = 4000
    ):
        """
        Initialize knowledge unit generator.
        
        Args:
            api_key: Anthropic API key (from env if not provided)
            model: Claude model to use
            max_tokens: Maximum tokens per generation
        """
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")
        
        self.client = Anthropic(api_key=self.api_key)
        self.model = model
        self.max_tokens = max_tokens
        logger.info(f"Initialized with model: {model}")
    
    @property
    def generator_type(self) -> str:
        return "knowledge_unit"
    
    def generate(
        self,
        cluster: ContentCluster,
        content_items: list[ProcessedContent]
    ) -> KnowledgeUnitBatch:
        """Generate knowledge units from a cluster."""
        logger.info(f"Generating knowledge units for cluster {cluster.cluster_id}")
        
        # Prepare context from content items
        context = self._prepare_context(content_items)
        
        # Generate prompt
        prompt = self._create_prompt(context, cluster.size)
        
        # Call Claude API
        logger.info("Calling Claude API...")
        response = self.client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        # Parse response into knowledge units
        units = self._parse_response(
            response.content[0].text,
            cluster,
            content_items
        )
        
        logger.info(f"Generated {len(units)} knowledge units")
        
        return KnowledgeUnitBatch(
            units=units,
            total=len(units),
            cluster_id=cluster.cluster_id,
            model_used=self.model
        )
    
    def _prepare_context(self, content_items: list[ProcessedContent]) -> str:
        """Prepare content context for prompt."""
        context_parts = []
        for i, item in enumerate(content_items[:10], 1):  # Limit to 10 items
            context_parts.append(f"Article {i}: {item.title}\n{item.content[:500]}...")
        
        return "\n\n".join(context_parts)
    
    def _create_prompt(self, context: str, num_units: int) -> str:
        """Create prompt for Claude."""
        # Target ~5 units per cluster, but at least 3
        target_units = max(3, min(num_units // 2, 10))
        
        return f"""Given these related articles about a technical topic, extract the core concepts and generate knowledge units (flashcards) for learning.

ARTICLES:
{context}

Generate {target_units} knowledge units following this EXACT JSON structure (respond ONLY with valid JSON, no other text):

{{
  "units": [
    {{
      "concept": "Brief name of the concept",
      "question": "How would you ask about this concept?",
      "answer": "2-3 sentence explanation using simple analogies",
      "elaboration": "Optional deeper explanation for advanced learners",
      "examples": ["Concrete example 1", "Concrete example 2"],
      "analogies": ["Helpful analogy for understanding"],
      "common_mistakes": ["What learners typically get wrong"],
      "difficulty": "beginner|intermediate|advanced|expert",
      "cognitive_level": "remember|understand|apply|analyze|evaluate|create"
    }}
  ]
}}

REQUIREMENTS:
- Focus on concepts that appear across multiple articles (high signal)
- Use the "Infiltrate" methodology: answers should be convincing in social/professional settings
- Answers should be 2-3 sentences max, clear and memorable
- Examples should be concrete and practical
- Analogies should make complex ideas accessible
- Difficulty should match the concept complexity
- Cognitive level should match Bloom's taxonomy

Generate ONLY valid JSON, no other text."""
    
    def _parse_response(
        self,
        response_text: str,
        cluster: ContentCluster,
        content_items: list[ProcessedContent]
    ) -> list[KnowledgeUnit]:
        """Parse Claude's response into KnowledgeUnit objects."""
        import json
        
        try:
            # Strip markdown code blocks if present
            clean_text = response_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            clean_text = clean_text.strip()
            
            # Parse JSON
            data = json.loads(clean_text)
            
            # Convert to KnowledgeUnit objects
            units = []
            for unit_data in data.get("units", []):
                unit = KnowledgeUnit(
                    id=generate_id(),
                    concept=unit_data["concept"],
                    question=unit_data["question"],
                    answer=unit_data["answer"],
                    elaboration=unit_data.get("elaboration"),
                    examples=unit_data.get("examples", []),
                    analogies=unit_data.get("analogies", []),
                    common_mistakes=unit_data.get("common_mistakes", []),
                    difficulty=unit_data["difficulty"],
                    cognitive_level=unit_data["cognitive_level"],
                    estimated_time_seconds=unit_data.get("estimated_time_seconds", 120),
                    source_ids=[item.id for item in content_items],
                    tags=[f"cluster_{cluster.cluster_id}"]
                )
                units.append(unit)
            
            return units
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response text: {response_text[:500]}")
            return []
        except Exception as e:
            logger.error(f"Error parsing response: {e}")
            return []

