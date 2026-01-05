"""RSS feed adapter."""
import feedparser
from datetime import datetime
from typing import Optional
from .base_adapter import BaseAdapter, ExtractionError
from .article_adapter import ArticleAdapter
from models.raw_content import RawContent, RawContentBatch
from python_shared.utils import generate_id


class RSSAdapter(BaseAdapter):
    """Adapter for RSS/Atom feeds."""
    
    @property
    def adapter_type(self) -> str:
        return "rss"
    
    def validate_url(self, url: str) -> bool:
        """Check if URL looks like an RSS feed."""
        url_lower = url.lower()
        
        # Exclude individual issue/article pages - these should use article adapter
        if '/issues/' in url_lower and url_lower.split('/issues/')[-1].isdigit():
            return False  # Individual issue pages, not RSS feeds
        
        # Check for common RSS feed patterns
        return (
            url_lower.endswith(('.rss', '.xml', '/rss', '/feed', '/atom', '/feeds'))
            or '/feed' in url_lower
            or '/feeds' in url_lower
            or url_lower.startswith('https://feeds.')
            or url_lower.startswith('http://feeds.')
        )
    
    def extract(self, url: str) -> RawContentBatch:
        """Extract entries from RSS feed."""
        try:
            feed = feedparser.parse(url)
            
            if feed.bozo:  # Feed parsing error
                raise ExtractionError(f"Failed to parse RSS feed: {feed.bozo_exception}")
            
            items = []
            article_adapter = ArticleAdapter()  # For fetching full content from linked pages
            
            for entry in feed.entries:
                entry_url = entry.link if hasattr(entry, 'link') else url
                
                # Extract published date
                published_date = None
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    published_date = datetime(*entry.published_parsed[:6])
                
                # Try to get full content from the linked page if it's an issue/article page
                content = ""
                source_type = self.adapter_type
                
                # Check if this entry links to an issue page that we can extract full content from
                if '/issues/' in entry_url and entry_url.split('/issues/')[-1].isdigit():
                    try:
                        # Use article adapter to get full content
                        article_batch = article_adapter.extract(entry_url)
                        if article_batch.items:
                            # Use the full extracted content
                            article_item = article_batch.items[0]
                            content = article_item.content
                            source_type = "article"  # Mark as article since we extracted full content
                    except Exception as e:
                        # Fall back to RSS content if article extraction fails
                        content = self._get_rss_content(entry)
                        content = self._clean_html(content)
                else:
                    # Use RSS feed content for non-issue links
                    content = self._get_rss_content(entry)
                    content = self._clean_html(content)
                
                raw_content = RawContent(
                    id=generate_id(),
                    source_type=source_type,
                    source_url=entry_url,
                    title=entry.title if hasattr(entry, 'title') else "Untitled",
                    content=content,
                    author=entry.author if hasattr(entry, 'author') else None,
                    published_date=published_date,
                    metadata={
                        'feed_title': feed.feed.title if hasattr(feed.feed, 'title') else None,
                        'feed_url': url,
                        'tags': [tag.term for tag in entry.tags] if hasattr(entry, 'tags') else [],
                        'extracted_from_feed': True
                    }
                )
                items.append(raw_content)
            
            return RawContentBatch(
                items=items,
                total=len(items),
                source_type=self.adapter_type
            )
            
        except Exception as e:
            raise ExtractionError(f"RSS extraction failed: {str(e)}")
    
    def _get_rss_content(self, entry) -> str:
        """Extract content from RSS entry."""
        if hasattr(entry, 'content') and entry.content:
            return entry.content[0].value
        elif hasattr(entry, 'summary'):
            return entry.summary
        elif hasattr(entry, 'description'):
            return entry.description
        return ""
    
    def _clean_html(self, html: str) -> str:
        """Remove HTML tags from content."""
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, 'html.parser')
        return soup.get_text(separator=' ', strip=True)

