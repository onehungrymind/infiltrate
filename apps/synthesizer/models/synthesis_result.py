"""Models for synthesized artifacts."""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal, Optional


DifficultyLevel = Literal["beginner", "intermediate", "advanced", "expert"]
CognitiveLevel = Literal["remember", "understand", "apply", "analyze", "evaluate", "create"]


class KnowledgeUnit(BaseModel):
    """
    A generated knowledge unit (flashcard).
    
    This should match the TypeScript KnowledgeUnit interface
    in libs/common-models.
    """
    id: str
    concept: str
    question: str
    answer: str
    elaboration: Optional[str] = None
    examples: list[str] = Field(default_factory=list)
    analogies: list[str] = Field(default_factory=list)
    common_mistakes: list[str] = Field(default_factory=list)
    difficulty: DifficultyLevel
    cognitive_level: CognitiveLevel
    estimated_time_seconds: int = 120
    source_ids: list[str] = Field(default_factory=list)  # ProcessedContent IDs
    tags: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class KnowledgeUnitBatch(BaseModel):
    """A batch of generated knowledge units."""
    units: list[KnowledgeUnit]
    total: int
    cluster_id: Optional[int] = None
    model_used: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)

