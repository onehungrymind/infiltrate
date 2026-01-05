"""Models for processed content."""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ProcessedContent(BaseModel):
    """Content after embedding generation."""
    id: str
    original_id: str  # Reference to RawContent ID
    title: str
    content: str
    embedding: list[float]  # Vector embedding
    processed_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: dict = Field(default_factory=dict)


class ProcessedBatch(BaseModel):
    """A batch of processed content."""
    items: list[ProcessedContent]
    total: int
    model_used: str
    processed_at: datetime = Field(default_factory=datetime.utcnow)

