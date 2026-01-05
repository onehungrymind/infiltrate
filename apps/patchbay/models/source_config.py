"""Configuration models for content sources."""
from pydantic import BaseModel, HttpUrl
from typing import Optional, Literal


SourceType = Literal['rss', 'newsletter', 'article', 'pdf']


class SourceConfig(BaseModel):
    """Configuration for a content source."""
    id: str
    type: SourceType
    url: HttpUrl
    name: str
    enabled: bool = True
    schedule: Optional[str] = None  # Cron expression for scheduled ingestion
    adapter_config: dict = {}  # Adapter-specific configuration

