"""Script to scrape JavaScript Weekly archives and ingest all issues."""
import requests
from bs4 import BeautifulSoup
import sys
import subprocess
from pathlib import Path
import time

from python_shared.logging_config import setup_logging

logger = setup_logging("ingest_archives", "INFO")


def extract_issue_urls(archives_url: str) -> list[str]:
    """
    Extract all issue URLs from JavaScript Weekly archives page.
    
    Args:
        archives_url: URL to the archives page
        
    Returns:
        List of issue URLs
    """
    logger.info(f"Fetching archives page: {archives_url}")
    
    try:
        response = requests.get(archives_url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all links that point to issues
        issue_urls = []
        
        # Look for links in the archives list
        # JavaScript Weekly issue links are like "issues/766" or "/issues/766"
        for link in soup.find_all('a', href=True):
            href = link.get('href', '').strip()
            
            # Match issue URLs - can be "issues/766" or "/issues/766"
            if ('issues/' in href or '/issues/' in href) and href not in ('/issues', 'issues', '/issues/'):
                # Convert to full URL if needed
                if href.startswith('http'):
                    full_url = href
                elif href.startswith('/'):
                    full_url = f"https://javascriptweekly.com{href}"
                else:
                    # Handle relative URLs like "issues/766"
                    full_url = f"https://javascriptweekly.com/{href}"
                
                # Remove any fragments or query params
                full_url = full_url.split('#')[0].split('?')[0]
                
                # Ensure it's a valid issue URL (has a number after issues/)
                if '/issues/' in full_url and full_url.split('/issues/')[-1].isdigit():
                    if full_url not in issue_urls:
                        issue_urls.append(full_url)
        
        # Sort URLs (newest first typically)
        issue_urls.sort(reverse=True)
        
        logger.info(f"Found {len(issue_urls)} issue URLs")
        return issue_urls
        
    except Exception as e:
        logger.error(f"Failed to scrape archives: {e}")
        return []


def ingest_url(url: str) -> bool:
    """
    Ingest a single URL using patchbay.
    
    Args:
        url: URL to ingest
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Run patchbay ingest-source command
        workspace_root = Path(__file__).parent.parent.parent.parent
        result = subprocess.run(
            ['nx', 'run', 'patchbay:ingest-source', '--', url],
            cwd=workspace_root,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            logger.info(f"✓ Successfully ingested: {url}")
            return True
        else:
            logger.warning(f"✗ Failed to ingest: {url}")
            logger.debug(f"Error: {result.stderr}")
            return False
            
    except Exception as e:
        logger.error(f"Error ingesting {url}: {e}")
        return False


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Ingest JavaScript Weekly archives')
    parser.add_argument('archives_url', nargs='?', default='https://javascriptweekly.com/issues',
                       help='URL to the archives page')
    parser.add_argument('--yes', '-y', action='store_true',
                       help='Skip confirmation prompt')
    parser.add_argument('--limit', type=int, default=None,
                       help='Limit the number of issues to ingest (for testing)')
    
    args = parser.parse_args()
    
    # Extract issue URLs
    issue_urls = extract_issue_urls(args.archives_url)
    
    if not issue_urls:
        logger.error("No issue URLs found")
        sys.exit(1)
    
    # Apply limit if specified
    if args.limit:
        issue_urls = issue_urls[:args.limit]
        logger.info(f"Limited to first {args.limit} issues")
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Found {len(issue_urls)} issues to ingest")
    logger.info(f"{'='*60}\n")
    
    # Ask for confirmation if many URLs (unless --yes flag is set)
    if len(issue_urls) > 10 and not args.yes:
        response = input(f"Found {len(issue_urls)} issues. Ingest all? (y/N): ")
        if response.lower() != 'y':
            logger.info("Cancelled")
            sys.exit(0)
    
    # Ingest each URL
    successful = 0
    failed = 0
    
    for i, url in enumerate(issue_urls, 1):
        logger.info(f"\n[{i}/{len(issue_urls)}] Processing: {url}")
        
        if ingest_url(url):
            successful += 1
        else:
            failed += 1
        
        # Be nice to the server - add a small delay
        if i < len(issue_urls):
            time.sleep(1)
    
    # Summary
    logger.info(f"\n{'='*60}")
    logger.info(f"SUMMARY: {successful} successful, {failed} failed out of {len(issue_urls)} total")
    logger.info(f"{'='*60}")


if __name__ == "__main__":
    main()

