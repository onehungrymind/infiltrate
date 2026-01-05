"""Web article adapter using trafilatura."""
import trafilatura
import requests
from datetime import datetime
from .base_adapter import BaseAdapter, ExtractionError
from models.raw_content import RawContent, RawContentBatch
from python_shared.utils import generate_id


class ArticleAdapter(BaseAdapter):
    """Adapter for web articles and blog posts."""
    
    @property
    def adapter_type(self) -> str:
        return "article"
    
    def validate_url(self, url: str) -> bool:
        """All HTTP(S) URLs are potentially articles."""
        return url.startswith(('http://', 'https://'))
    
    def extract(self, url: str) -> RawContentBatch:
        """Extract article content from web page."""
        try:
            # Fetch the page
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            # Extract clean text with trafilatura
            downloaded = response.text
            content = trafilatura.extract(
                downloaded,
                include_comments=False,
                include_tables=False,  # Disable tables to avoid pipe separators
                no_fallback=False,
                favor_recall=True,  # Get more content
                favor_precision=False
            )
            
            if not content:
                raise ExtractionError("No content could be extracted from the page")
            
            # Clean up the content - remove excessive whitespace and normalize
            content = self._clean_content(content)
            
            # Extract metadata
            metadata = trafilatura.extract_metadata(downloaded)
            
            raw_content = RawContent(
                id=generate_id(),
                source_type=self.adapter_type,
                source_url=url,
                title=metadata.title if metadata and metadata.title else "Untitled Article",
                content=content,
                author=metadata.author if metadata and metadata.author else None,
                published_date=self._parse_date(metadata.date) if metadata and metadata.date else None,
                metadata={
                    'sitename': metadata.sitename if metadata and metadata.sitename else None,
                    'description': metadata.description if metadata and metadata.description else None,
                    'categories': metadata.categories if metadata and metadata.categories else [],
                    'tags': metadata.tags if metadata and metadata.tags else []
                }
            )
            
            return RawContentBatch(
                items=[raw_content],
                total=1,
                source_type=self.adapter_type
            )
            
        except requests.RequestException as e:
            raise ExtractionError(f"Failed to fetch URL: {str(e)}")
        except Exception as e:
            raise ExtractionError(f"Article extraction failed: {str(e)}")
    
    def _clean_content(self, content: str) -> str:
        """Clean and normalize extracted content."""
        if not content:
            return content
        
        # Replace multiple spaces with single space
        import re
        content = re.sub(r' +', ' ', content)
        
        # Replace multiple newlines with double newline (paragraph breaks)
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        # Remove excessive pipe separators (common in table extraction)
        content = re.sub(r'\|{2,}', ' | ', content)
        
        # Strip leading/trailing whitespace
        content = content.strip()
        
        return content
    
    def _parse_date(self, date_str: str) -> datetime | None:
        """Parse date string to datetime."""
        try:
            # trafilatura returns ISO format dates
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except:
            return None

