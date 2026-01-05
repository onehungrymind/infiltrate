"""JavaScript Weekly newsletter adapter - parses issue pages into individual articles."""
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional
from .base_adapter import BaseAdapter, ExtractionError
from models.raw_content import RawContent, RawContentBatch
from python_shared.utils import generate_id
import re


class JavaScriptWeeklyAdapter(BaseAdapter):
    """Adapter specifically for JavaScript Weekly issue pages."""
    
    @property
    def adapter_type(self) -> str:
        return "javascript_weekly"
    
    def validate_url(self, url: str) -> bool:
        """Check if URL is a JavaScript Weekly issue page."""
        return 'javascriptweekly.com/issues/' in url.lower()
    
    def extract(self, url: str) -> RawContentBatch:
        """Extract individual articles from a JavaScript Weekly issue page."""
        try:
            # Fetch the page
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract issue metadata
            issue_title = self._extract_issue_title(soup)
            issue_date = self._extract_issue_date(soup, url)
            
            # Extract all articles from the issue
            articles = self._extract_articles(soup, url, issue_title, issue_date)
            
            if not articles:
                raise ExtractionError("No articles found in issue page")
            
            return RawContentBatch(
                items=articles,
                total=len(articles),
                source_type=self.adapter_type
            )
            
        except requests.RequestException as e:
            raise ExtractionError(f"Failed to fetch URL: {str(e)}")
        except Exception as e:
            raise ExtractionError(f"JavaScript Weekly extraction failed: {str(e)}")
    
    def _extract_issue_title(self, soup: BeautifulSoup) -> str:
        """Extract the issue title/number."""
        # Try to find the issue number in the page
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.get_text(strip=True)
        
        # Fallback: look for h1 or main heading
        h1 = soup.find('h1')
        if h1:
            return h1.get_text(strip=True)
        
        return "JavaScript Weekly Issue"
    
    def _extract_issue_date(self, soup: BeautifulSoup, url: str) -> Optional[datetime]:
        """Extract the issue publication date."""
        # Try to find date in the page
        # JavaScript Weekly often has dates in the content
        date_patterns = [
            r'(\w+ \d{1,2}, \d{4})',  # "November 21, 2025"
            r'(\d{4}-\d{2}-\d{2})',   # "2025-11-21"
        ]
        
        page_text = soup.get_text()
        for pattern in date_patterns:
            match = re.search(pattern, page_text)
            if match:
                try:
                    date_str = match.group(1)
                    # Try parsing different formats
                    for fmt in ['%B %d, %Y', '%b %d, %Y', '%Y-%m-%d']:
                        try:
                            return datetime.strptime(date_str, fmt)
                        except ValueError:
                            continue
                except:
                    pass
        
        return None
    
    def _extract_articles(self, soup: BeautifulSoup, issue_url: str, issue_title: str, issue_date: Optional[datetime]) -> list[RawContent]:
        """Extract individual articles from the issue page."""
        articles = []
        
        # JavaScript Weekly structure: articles are typically in sections
        # Look for common patterns:
        # 1. Links with descriptions (main articles)
        # 2. Items in lists (brief items)
        # 3. Sections with headings
        
        # Find all article-like elements
        # Pattern 1: Links that are likely articles (have text and are not navigation)
        article_links = []
        
        # Look for links in main content areas
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile(r'content|main|issue', re.I))
        
        if not main_content:
            main_content = soup
        
        # Find all links that look like external articles
        for link in main_content.find_all('a', href=True):
            href = link.get('href', '').strip()
            text = link.get_text(strip=True)
            
            # Skip if it's a JavaScript Weekly internal link (except issue links)
            if href.startswith('#') or href.startswith('javascript:') or not text:
                continue
            
            # Skip navigation and footer links
            parent_classes = []
            parent = link.parent
            for _ in range(3):  # Check up to 3 levels up
                if parent and parent.get('class'):
                    parent_classes.extend(parent.get('class', []))
                parent = parent.parent if parent else None
            
            if any(cls in ['nav', 'navigation', 'footer', 'header', 'menu'] for cls in parent_classes):
                continue
            
            # Skip if it's just the issue URL itself
            if href == issue_url or href.endswith(issue_url.split('/')[-1]):
                continue
            
            # This looks like an article link
            if len(text) > 10:  # Minimum length to be an article title
                # Get the description/context around the link
                description = self._get_article_description(link)
                
                article_links.append({
                    'title': text,
                    'url': self._normalize_url(href, issue_url),
                    'description': description,
                    'element': link
                })
        
        # Remove duplicates (same URL)
        seen_urls = set()
        unique_articles = []
        for article in article_links:
            if article['url'] not in seen_urls:
                seen_urls.add(article['url'])
                unique_articles.append(article)
        
        # Create RawContent items for each article
        for i, article_data in enumerate(unique_articles):
            # Combine title and description for content
            content_parts = [article_data['title']]
            if article_data['description']:
                content_parts.append(article_data['description'])
            content = '\n\n'.join(content_parts)
            
            raw_content = RawContent(
                id=generate_id(),
                source_type=self.adapter_type,
                source_url=article_data['url'],
                title=article_data['title'],
                content=content,
                author=None,  # JavaScript Weekly doesn't always include author in issue pages
                published_date=issue_date,
                metadata={
                    'issue_url': issue_url,
                    'issue_title': issue_title,
                    'article_url': article_data['url'],
                    'article_index': i + 1,
                    'source': 'javascript_weekly'
                }
            )
            articles.append(raw_content)
        
        return articles
    
    def _get_article_description(self, link_element) -> str:
        """Extract description text for an article link."""
        # Look for description in nearby elements
        # Common patterns:
        # 1. Text in the same paragraph after the link
        # 2. Text in a sibling element
        # 3. Text in a parent's next sibling
        
        description = ""
        
        # Check parent paragraph
        parent = link_element.parent
        if parent and parent.name == 'p':
            parent_text = parent.get_text(strip=True)
            link_text = link_element.get_text(strip=True)
            # Get text after the link
            if link_text in parent_text:
                after_link = parent_text.split(link_text, 1)
                if len(after_link) > 1:
                    description = after_link[1].strip()
        
        # Check next sibling
        if not description:
            next_sibling = link_element.next_sibling
            if next_sibling and hasattr(next_sibling, 'get_text'):
                description = next_sibling.get_text(strip=True)
        
        # Check parent's next sibling
        if not description and parent:
            next_sibling = parent.next_sibling
            if next_sibling and hasattr(next_sibling, 'get_text'):
                description = next_sibling.get_text(strip=True)
        
        return description[:500]  # Limit description length
    
    def _normalize_url(self, href: str, base_url: str) -> str:
        """Convert relative URLs to absolute URLs."""
        if href.startswith('http://') or href.startswith('https://'):
            return href
        
        if href.startswith('/'):
            # Absolute path on same domain
            from urllib.parse import urlparse
            parsed = urlparse(base_url)
            return f"{parsed.scheme}://{parsed.netloc}{href}"
        
        # Relative URL
        from urllib.parse import urljoin
        return urljoin(base_url, href)

