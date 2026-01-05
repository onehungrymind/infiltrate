"""Base class for all generators."""
from abc import ABC, abstractmethod
from ..models.cluster import ContentCluster
from ..models.processed_content import ProcessedContent


class BaseGenerator(ABC):
    """Base class for artifact generators."""
    
    @abstractmethod
    def generate(
        self,
        cluster: ContentCluster,
        content_items: list[ProcessedContent]
    ) -> dict:
        """
        Generate artifacts from a cluster of content.
        
        Args:
            cluster: The content cluster
            content_items: The actual content items in the cluster
            
        Returns:
            Dictionary with generated artifacts
        """
        pass
    
    @property
    @abstractmethod
    def generator_type(self) -> str:
        """Return the generator type identifier."""
        pass

