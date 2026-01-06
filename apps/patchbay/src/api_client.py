"""API client for Kasita API."""
import os
import logging
from typing import Optional, List
import requests
from models.raw_content import RawContent

logger = logging.getLogger("patchbay")


class KasitaApiClient:
    """Client for interacting with Kasita API."""
    
    def __init__(self, base_url: Optional[str] = None):
        """
        Initialize API client.
        
        Args:
            base_url: Base URL of the API (defaults to http://localhost:3333/api)
        """
        self.base_url = base_url or os.getenv("API_URL", "http://localhost:3333/api")
        if not self.base_url.endswith("/"):
            self.base_url += "/"
    
    def get_enabled_source_configs(self) -> List[dict]:
        """
        Fetch enabled source configs from API.
        
        Returns:
            List of source config dictionaries
        """
        try:
            url = f"{self.base_url}source-configs?enabled=true"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            configs = response.json()
            logger.info(f"Fetched {len(configs)} enabled source configs from API")
            return configs
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch source configs: {e}")
            return []
    
    def ingest_raw_content(self, raw_content: RawContent, path_id: str) -> Optional[dict]:
        """
        Ingest a single raw content item to the API.
        
        Args:
            raw_content: RawContent model instance
            path_id: Learning path ID to associate with
            
        Returns:
            Created raw content dict if successful, None otherwise
        """
        try:
            # Convert RawContent to API DTO format
            dto = {
                "pathId": path_id,
                "sourceType": raw_content.source_type,
                "sourceUrl": raw_content.source_url,
                "title": raw_content.title,
                "content": raw_content.content,
                "author": raw_content.author,
                "publishedDate": raw_content.published_date.isoformat() if raw_content.published_date else None,
                "metadata": raw_content.metadata,
            }
            
            url = f"{self.base_url}ingestion/raw-content"
            response = requests.post(url, json=dto, timeout=30)
            response.raise_for_status()
            result = response.json()
            logger.debug(f"Successfully ingested raw content: {raw_content.title}")
            # Store the API ID in metadata for later reference
            if result and 'id' in result:
                raw_content.metadata['api_id'] = result['id']
            return result
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to ingest raw content '{raw_content.title}': {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response: {e.response.text}")
            return None
    
    def ingest_raw_content_batch(
        self, 
        raw_content_items: List[RawContent], 
        path_id: str
    ) -> List[dict]:
        """
        Ingest multiple raw content items in batch.
        
        Args:
            raw_content_items: List of RawContent model instances
            path_id: Learning path ID to associate with
            
        Returns:
            List of created raw content dicts
        """
        try:
            # Convert RawContent items to API DTO format
            dtos = []
            for raw_content in raw_content_items:
                dto = {
                    "pathId": path_id,
                    "sourceType": raw_content.source_type,
                    "sourceUrl": raw_content.source_url,
                    "title": raw_content.title,
                    "content": raw_content.content,
                    "author": raw_content.author,
                    "publishedDate": raw_content.published_date.isoformat() if raw_content.published_date else None,
                    "metadata": raw_content.metadata,
                }
                dtos.append(dto)
            
            url = f"{self.base_url}ingestion/raw-content/batch"
            response = requests.post(url, json=dtos, timeout=60)
            response.raise_for_status()
            results = response.json()
            logger.info(f"Successfully ingested {len(results)} raw content items in batch")
            # Store API IDs in metadata for later reference
            for i, result in enumerate(results):
                if i < len(raw_content_items) and result and 'id' in result:
                    raw_content_items[i].metadata['api_id'] = result['id']
            return results
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to ingest raw content batch: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response: {e.response.text}")
            return []

