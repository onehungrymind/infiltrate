"""API client for Kasita API."""
import os
import logging
from typing import Optional, List
import requests
from models.synthesis_result import KnowledgeUnit

logger = logging.getLogger("synthesizer")


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
    
    def ingest_knowledge_unit(
        self, 
        knowledge_unit: KnowledgeUnit, 
        path_id: str,
        source_ids: List[str]
    ) -> Optional[dict]:
        """
        Ingest a single knowledge unit to the API.
        
        Args:
            knowledge_unit: KnowledgeUnit model instance
            path_id: Learning path ID to associate with
            source_ids: List of raw content IDs that were used to generate this unit
            
        Returns:
            Created knowledge unit dict if successful, None otherwise
        """
        try:
            # Convert KnowledgeUnit to API DTO format (snake_case to camelCase)
            dto = {
                "pathId": path_id,
                "concept": knowledge_unit.concept,
                "question": knowledge_unit.question,
                "answer": knowledge_unit.answer,
                "elaboration": knowledge_unit.elaboration,
                "examples": knowledge_unit.examples or [],
                "analogies": knowledge_unit.analogies or [],
                "commonMistakes": knowledge_unit.common_mistakes or [],
                "difficulty": knowledge_unit.difficulty,
                "cognitiveLevel": knowledge_unit.cognitive_level,
                "estimatedTimeSeconds": knowledge_unit.estimated_time_seconds or 120,
                "tags": knowledge_unit.tags or [],
                "sourceIds": source_ids,
            }
            
            url = f"{self.base_url}ingestion/knowledge-units"
            response = requests.post(url, json=dto, timeout=30)
            response.raise_for_status()
            result = response.json()
            logger.debug(f"Successfully ingested knowledge unit: {knowledge_unit.concept}")
            return result
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to ingest knowledge unit '{knowledge_unit.concept}': {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response: {e.response.text}")
            return None
    
    def ingest_knowledge_units_batch(
        self,
        knowledge_units: List[KnowledgeUnit],
        path_id: str,
        source_id_mapping: dict[str, List[str]]  # Maps unit id to source_ids
    ) -> List[dict]:
        """
        Ingest multiple knowledge units in batch.
        
        Args:
            knowledge_units: List of KnowledgeUnit model instances
            path_id: Learning path ID to associate with
            source_id_mapping: Dictionary mapping unit.id to list of source IDs
            
        Returns:
            List of created knowledge unit dicts
        """
        try:
            # Convert KnowledgeUnit items to API DTO format
            dtos = []
            for unit in knowledge_units:
                source_ids = source_id_mapping.get(unit.id, [])
                dto = {
                    "pathId": path_id,
                    "concept": unit.concept,
                    "question": unit.question,
                    "answer": unit.answer,
                    "elaboration": unit.elaboration,
                    "examples": unit.examples or [],
                    "analogies": unit.analogies or [],
                    "commonMistakes": unit.common_mistakes or [],
                    "difficulty": unit.difficulty,
                    "cognitiveLevel": unit.cognitive_level,
                    "estimatedTimeSeconds": unit.estimated_time_seconds or 120,
                    "tags": unit.tags or [],
                    "sourceIds": source_ids,
                }
                dtos.append(dto)
            
            url = f"{self.base_url}ingestion/knowledge-units/batch"
            response = requests.post(url, json=dtos, timeout=60)
            response.raise_for_status()
            results = response.json()
            logger.info(f"Successfully ingested {len(results)} knowledge units in batch")
            return results
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to ingest knowledge units batch: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response: {e.response.text}")
            return []
    
    def get_raw_content_by_original_id(self, original_id: str) -> Optional[dict]:
        """
        Fetch raw content from API by original ID (used to find pathId and API ID).
        
        Args:
            original_id: Original raw content ID from file
            
        Returns:
            Raw content dict if found, None otherwise
        """
        try:
            # Search for raw content - we'll need to get all and filter
            # In a real implementation, you might want a search endpoint
            url = f"{self.base_url}raw-content"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            all_content = response.json()
            
            # Find by sourceUrl or metadata
            for content in all_content:
                if (content.get('metadata', {}).get('original_id') == original_id or
                    content.get('id') == original_id):
                    return content
            return None
        except requests.exceptions.RequestException as e:
            logger.debug(f"Could not fetch raw content for {original_id}: {e}")
            return None

