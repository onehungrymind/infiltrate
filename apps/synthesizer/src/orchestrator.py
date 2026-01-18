"""Orchestrates the full synthesis pipeline."""
import logging
import os
from pathlib import Path
from typing import Optional
from processors.embeddings import EmbeddingProcessor
from processors.clustering import ClusteringProcessor
from generators.knowledge_unit_generator import KnowledgeUnitGenerator
from python_shared.file_io import DataReader, DataWriter
from src.api_client import KasitaApiClient


logger = logging.getLogger("synthesizer.orchestrator")


class SynthesisOrchestrator:
    """Orchestrates the full synthesis pipeline."""
    
    def __init__(
        self,
        data_dir: str | Path = "data",
        embedding_model: str = "all-MiniLM-L6-v2",
        claude_model: str = "claude-sonnet-4-20250514",
        min_cluster_size: int = 3,
        max_clusters: int = 10,
        use_api: bool = True,
        api_base_url: Optional[str] = None
    ):
        self.reader = DataReader(base_path=data_dir)
        self.writer = DataWriter(base_path=data_dir)
        
        # Initialize processors
        self.embedding_processor = EmbeddingProcessor(model_name=embedding_model)
        self.clustering_processor = ClusteringProcessor(
            min_cluster_size=min_cluster_size,
            max_clusters=max_clusters
        )
        self.knowledge_unit_generator = KnowledgeUnitGenerator(model=claude_model)
        
        # API client (optional)
        self.use_api = use_api and os.getenv("API_URL") is not None
        self.api_client = KasitaApiClient(api_base_url) if self.use_api else None
    
    def run_full_pipeline(self) -> dict:
        """
        Run the complete synthesis pipeline:
        1. Load raw content
        2. Generate embeddings
        3. Cluster content
        4. Generate knowledge units
        
        Returns:
            Summary statistics
        """
        logger.info("="*60)
        logger.info("STARTING SYNTHESIS PIPELINE")
        logger.info("="*60)
        
        # Step 1: Load raw content
        logger.info("\n[1/4] Loading raw content...")
        raw_files = self.reader.read_all_raw()
        if not raw_files:
            logger.error("No raw content found!")
            return {"error": "No raw content available"}
        
        # Extract individual items from batches
        raw_items = []
        for file_data in raw_files:
            if 'items' in file_data:
                # This is a batch file, extract items
                raw_items.extend(file_data['items'])
            else:
                # This is a single item file
                raw_items.append(file_data)
        
        if not raw_items:
            logger.error("No raw content items found!")
            return {"error": "No raw content items available"}
        
        logger.info(f"Loaded {len(raw_items)} raw items")
        
        # Step 2: Generate embeddings
        logger.info("\n[2/4] Generating embeddings...")
        processed_batch = self.embedding_processor.process(raw_items)
        self.writer.write_processed(
            processed_batch.model_dump(mode='json'),
            "embeddings"
        )
        logger.info(f"Generated embeddings for {processed_batch.total} items")
        
        # Step 3: Cluster content
        logger.info("\n[3/4] Clustering content...")
        cluster_batch = self.clustering_processor.process(processed_batch.items)
        self.writer.write_processed(
            cluster_batch.model_dump(mode='json'),
            "clusters"
        )
        logger.info(f"Created {cluster_batch.total_clusters} clusters")
        
        # Step 4: Generate knowledge units
        logger.info("\n[4/4] Generating knowledge units...")
        all_units = []
        unit_source_mapping = {}  # Maps unit.id to list of source IDs (API raw content IDs)
        
        # Get pathId - prioritize DEFAULT_PATH_ID env var over metadata
        # This ensures we use the pathId from the current synthesis request
        path_id = os.getenv("DEFAULT_PATH_ID")
        if not path_id and processed_batch.items:
            first_processed = processed_batch.items[0]
            path_id = first_processed.metadata.get('pathId')

        logger.info(f"Using pathId: {path_id}")
        
        for cluster in cluster_batch.clusters:
            logger.info(f"\nProcessing cluster {cluster.cluster_id} ({cluster.size} items)...")
            
            # Get content items for this cluster
            content_items = [
                item for item in processed_batch.items
                if item.id in cluster.content_ids
            ]
            
            # Generate units
            try:
                unit_batch = self.knowledge_unit_generator.generate(
                    cluster,
                    content_items
                )
                all_units.extend(unit_batch.units)
                
                # Map source IDs for each unit
                # We need to map ProcessedContent original_id to API raw content IDs
                for unit in unit_batch.units:
                    source_ids = []
                    for content_item in content_items:
                        # Try to find the API ID for this raw content
                        # First check if we have an API ID in metadata
                        api_id = content_item.metadata.get('api_id')
                        if api_id:
                            source_ids.append(api_id)
                        elif self.use_api and self.api_client:
                            # Try to fetch from API
                            raw_content = self.api_client.get_raw_content_by_original_id(
                                content_item.original_id
                            )
                            if raw_content:
                                source_ids.append(raw_content['id'])
                        else:
                            # Fallback: use original_id if we can't fetch from API
                            source_ids.append(content_item.original_id)
                    unit_source_mapping[unit.id] = source_ids
                
                logger.info(f"Generated {unit_batch.total} units")
            except Exception as e:
                logger.error(f"Failed to generate units for cluster {cluster.cluster_id}: {e}")
        
        # Try to ingest to API if enabled
        if all_units and self.use_api and self.api_client and path_id:
            try:
                # Ingest to API (batch if multiple items, single otherwise)
                if len(all_units) > 1:
                    results = self.api_client.ingest_knowledge_units_batch(
                        all_units,
                        path_id,
                        unit_source_mapping
                    )
                    if results:
                        logger.info(f"Successfully ingested {len(results)} knowledge units to API")
                else:
                    source_ids = unit_source_mapping.get(all_units[0].id, [])
                    result = self.api_client.ingest_knowledge_unit(
                        all_units[0],
                        path_id,
                        source_ids
                    )
                    if result:
                        logger.info(f"Successfully ingested to API: {all_units[0].concept}")
            except Exception as e:
                logger.warning(f"API ingestion failed, falling back to file writing: {e}")
        
        # Always save knowledge units to files as backup
        if all_units:
            output = {
                "units": [unit.model_dump(mode='json') for unit in all_units],
                "total": len(all_units)
            }
            self.writer.write_synthesized(output, "knowledge_units")
            logger.info(f"\nSaved {len(all_units)} knowledge units to files")
        
        # Summary
        summary = {
            "raw_items": len(raw_items),
            "processed_items": processed_batch.total,
            "clusters": cluster_batch.total_clusters,
            "knowledge_units": len(all_units)
        }
        
        logger.info("\n" + "="*60)
        logger.info("PIPELINE COMPLETE")
        logger.info("="*60)
        logger.info(f"Summary: {summary}")
        
        return summary

