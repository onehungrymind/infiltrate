"""Core ingestion logic."""
from pathlib import Path
from typing import Optional
import logging
import os
from models.raw_content import RawContentBatch
from src.router import AdapterRouter
from src.normalizer import ContentNormalizer
from src.api_client import KasitaApiClient
from python_shared.file_io import DataWriter


logger = logging.getLogger("patchbay")


class Ingestor:
    """Handles the ingestion pipeline."""
    
    def __init__(
        self,
        data_dir: str | Path = "data",
        min_content_length: int = 100,
        use_api: bool = True,
        api_base_url: Optional[str] = None
    ):
        self.router = AdapterRouter()
        self.normalizer = ContentNormalizer()
        self.writer = DataWriter(base_path=data_dir)
        self.min_content_length = min_content_length
        self.use_api = use_api and os.getenv("API_URL") is not None
        self.api_client = KasitaApiClient(api_base_url) if self.use_api else None
    
    def ingest(self, url: str, skip_validation: bool = False) -> Optional[RawContentBatch]:
        """
        Ingest content from a URL.
        
        Args:
            url: The URL to ingest
            skip_validation: Skip content validation checks
            
        Returns:
            RawContentBatch if successful, None if failed
        """
        logger.info(f"Starting ingestion: {url}")
        
        # Route to adapter
        adapter = self.router.get_adapter(url)
        if not adapter:
            logger.error(f"No adapter found for URL: {url}")
            return None
        
        logger.info(f"Using adapter: {adapter.adapter_type}")
        
        # Extract content
        try:
            batch = adapter.extract(url)
            logger.info(f"Extracted {batch.total} items")
        except Exception as e:
            logger.error(f"Extraction failed: {str(e)}")
            return None
        
        # Normalize and validate each item
        validated_items = []
        for item in batch.items:
            # Normalize
            normalized = self.normalizer.normalize(item)
            
            # Validate (unless skipped)
            if not skip_validation and self.normalizer.should_skip(
                normalized, 
                self.min_content_length
            ):
                logger.warning(f"Skipping item: {normalized.title} (validation failed)")
                continue
            
            validated_items.append(normalized)
        
        # Update batch with validated items
        batch.items = validated_items
        batch.total = len(validated_items)
        
        if batch.total == 0:
            logger.warning("No items passed validation")
            return None
        
        # Try to ingest to API if enabled
        path_id = os.getenv("DEFAULT_PATH_ID")
        if self.use_api and self.api_client and path_id:
            try:
                # Ingest to API (batch if multiple items, single otherwise)
                if batch.total > 1:
                    results = self.api_client.ingest_raw_content_batch(
                        batch.items,
                        path_id
                    )
                    if results:
                        logger.info(f"Successfully ingested {len(results)} items to API")
                else:
                    result = self.api_client.ingest_raw_content(
                        batch.items[0],
                        path_id
                    )
                    if result:
                        logger.info(f"Successfully ingested to API: {batch.items[0].title}")
            except Exception as e:
                logger.warning(f"API ingestion failed, falling back to file writing: {e}")
        
        # Always write to files as backup
        # For JavaScript Weekly issues, write all articles in one file per issue
        # For other sources, write one file per item
        use_per_item = batch.source_type != "javascript_weekly"
        
        output_paths = self.writer.write_raw(
            batch.model_dump(mode='json'),
            batch.source_type,
            per_item=use_per_item
        )
        
        if isinstance(output_paths, list):
            logger.info(f"Wrote {len(output_paths)} files (one per item)")
            if output_paths:
                logger.info(f"First file: {output_paths[0]}")
        else:
            logger.info(f"Wrote {batch.total} articles to: {output_paths}")
        
        return batch
    
    def ingest_multiple(self, urls: list[str]) -> dict[str, RawContentBatch]:
        """
        Ingest multiple URLs.
        
        Returns:
            Dictionary mapping URLs to their RawContentBatch results
        """
        results = {}
        for url in urls:
            logger.info(f"\n{'='*60}\nIngesting: {url}\n{'='*60}")
            batch = self.ingest(url)
            if batch:
                results[url] = batch
        
        logger.info(f"\nCompleted: {len(results)}/{len(urls)} successful")
        return results

