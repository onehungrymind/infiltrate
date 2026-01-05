"""Content normalization utilities."""
import re
from models.raw_content import RawContent


class ContentNormalizer:
    """Normalizes and cleans raw content."""
    
    @staticmethod
    def normalize(content: RawContent) -> RawContent:
        """
        Normalize content for consistency.
        
        - Clean whitespace
        - Standardize line breaks
        - Remove control characters
        - Truncate if too long (optional)
        """
        # Clean content text
        cleaned = ContentNormalizer._clean_text(content.content)
        
        # Update the content
        content.content = cleaned
        
        return content
    
    @staticmethod
    def _clean_text(text: str) -> str:
        """Clean and normalize text content."""
        # Remove control characters except newlines/tabs
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Normalize line breaks
        text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
        
        return text.strip()
    
    @staticmethod
    def should_skip(content: RawContent, min_length: int = 100) -> bool:
        """
        Determine if content should be skipped.
        
        Args:
            content: The content to check
            min_length: Minimum content length in characters
            
        Returns:
            True if content should be skipped
        """
        # Skip if content is too short
        if len(content.content) < min_length:
            return True
        
        # Skip if title is empty
        if not content.title or content.title == "Untitled":
            return True
        
        return False

