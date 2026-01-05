"""Orchestrates the full synthesis pipeline."""
import logging
from pathlib import Path
from processors.embeddings import EmbeddingProcessor
from processors.clustering import ClusteringProcessor
from generators.knowledge_unit_generator import KnowledgeUnitGenerator
from python_shared.file_io import DataReader, DataWriter


logger = logging.getLogger("synthesizer.orchestrator")


class SynthesisOrchestrator:
    """Orchestrates the full synthesis pipeline."""
    
    def __init__(
        self,
        data_dir: str | Path = "data",
        embedding_model: str = "all-MiniLM-L6-v2",
        claude_model: str = "claude-sonnet-4-20250514",
        min_cluster_size: int = 3,
        max_clusters: int = 10
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
        raw_items = self.reader.read_all_raw()
        if not raw_items:
            logger.error("No raw content found!")
            return {"error": "No raw content available"}
        
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
                logger.info(f"Generated {unit_batch.total} units")
            except Exception as e:
                logger.error(f"Failed to generate units for cluster {cluster.cluster_id}: {e}")
        
        # Save knowledge units
        if all_units:
            output = {
                "units": [unit.model_dump(mode='json') for unit in all_units],
                "total": len(all_units)
            }
            self.writer.write_synthesized(output, "knowledge_units")
            logger.info(f"\nSaved {len(all_units)} knowledge units")
        
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

