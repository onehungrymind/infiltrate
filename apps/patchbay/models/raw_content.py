"""Models for raw content from Patchbay."""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class RawContent(BaseModel):
    """
    Normalized raw content output from Patchbay.
    
    This is the standard format all adapters must produce.
    """
    id: str
    source_type: str  # 'newsletter', 'rss', 'article', 'pdf', etc.
    source_url: str
    title: str
    content: str  # Clean text content
    author: Optional[str] = None
    published_date: Optional[datetime] = None
    extracted_date: datetime = Field(default_factory=datetime.utcnow)
    metadata: dict = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class RawContentBatch(BaseModel):
    """A batch of raw content items."""
    items: list[RawContent]
    total: int
    source_type: str
    extracted_at: datetime = Field(default_factory=datetime.utcnow)

