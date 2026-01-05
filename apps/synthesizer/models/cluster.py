"""Models for content clusters."""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ContentCluster(BaseModel):
    """A cluster of related content."""
    cluster_id: int
    content_ids: list[str]  # ProcessedContent IDs
    centroid: list[float]  # Cluster centroid
    size: int
    topic_label: Optional[str] = None  # Human-readable label
    keywords: list[str] = Field(default_factory=list)
    

class ClusterBatch(BaseModel):
    """Result of clustering operation."""
    clusters: list[ContentCluster]
    total_clusters: int
    total_items: int
    algorithm: str
    parameters: dict
    clustered_at: datetime = Field(default_factory=datetime.utcnow)

