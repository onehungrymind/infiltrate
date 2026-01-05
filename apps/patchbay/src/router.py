"""Routes URLs to appropriate adapters."""
from typing import Optional
from adapters.base_adapter import BaseAdapter
from adapters.rss_adapter import RSSAdapter
from adapters.article_adapter import ArticleAdapter
from adapters.pdf_adapter import PDFAdapter
from adapters.newsletter_adapter import NewsletterAdapter
from adapters.javascript_weekly_adapter import JavaScriptWeeklyAdapter


class AdapterRouter:
    """
    Routes content sources to appropriate adapters.
    
    Tries adapters in order of specificity:
    1. JavaScript Weekly (specific domain/pattern)
    2. RSS (most specific URL patterns)
    3. PDF (specific file extension)
    4. Newsletter (email-based, not URL)
    5. Article (fallback for any HTTP(S) URL)
    """
    
    def __init__(self):
        self.adapters: list[BaseAdapter] = [
            JavaScriptWeeklyAdapter(),  # Most specific - parse issue pages into articles
            RSSAdapter(),
            PDFAdapter(),
            NewsletterAdapter(),
            ArticleAdapter(),  # Fallback
        ]
    
    def get_adapter(self, url: str) -> Optional[BaseAdapter]:
        """
        Get the appropriate adapter for a URL.
        
        Args:
            url: The URL to route
            
        Returns:
            The adapter that can handle this URL, or None
        """
        for adapter in self.adapters:
            if adapter.validate_url(url):
                return adapter
        return None
    
    def add_adapter(self, adapter: BaseAdapter) -> None:
        """Add a custom adapter to the router."""
        self.adapters.insert(0, adapter)  # Add at beginning for priority

