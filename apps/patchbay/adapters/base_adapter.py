"""Base adapter interface that all adapters must implement."""
from abc import ABC, abstractmethod
from typing import Optional
from models.raw_content import RawContent, RawContentBatch


class BaseAdapter(ABC):
    """
    Base class for all content adapters.
    
    Each adapter is responsible for:
    1. Fetching content from a specific source type
    2. Extracting clean text
    3. Normalizing to RawContent format
    """
    
    def __init__(self, config: Optional[dict] = None):
        self.config = config or {}
    
    @abstractmethod
    def extract(self, url: str) -> RawContentBatch:
        """
        Extract content from a URL and return normalized RawContent.
        
        Args:
            url: The URL to extract content from
            
        Returns:
            RawContentBatch containing normalized content items
            
        Raises:
            ExtractionError: If content cannot be extracted
        """
        pass
    
    @abstractmethod
    def validate_url(self, url: str) -> bool:
        """
        Validate if this adapter can handle the given URL.
        
        Args:
            url: The URL to validate
            
        Returns:
            True if this adapter can handle the URL
        """
        pass
    
    @property
    @abstractmethod
    def adapter_type(self) -> str:
        """Return the adapter type identifier."""
        pass


class ExtractionError(Exception):
    """Raised when content extraction fails."""
    pass

