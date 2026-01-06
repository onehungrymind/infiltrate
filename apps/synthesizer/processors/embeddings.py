"""Generate embeddings for content."""
import logging
from sentence_transformers import SentenceTransformer
from typing import Optional
from ..models.processed_content import ProcessedContent, ProcessedBatch
from python_shared.utils import generate_id


logger = logging.getLogger("synthesizer.embeddings")


class EmbeddingProcessor:
    """Generate vector embeddings for text content."""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize embedding processor.
        
        Args:
            model_name: Name of sentence-transformers model to use
        """
        logger.info(f"Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        self.model_name = model_name
        logger.info("Model loaded successfully")
    
    def process(self, raw_content_items: list[dict]) -> ProcessedBatch:
        """
        Generate embeddings for raw content items.
        
        Args:
            raw_content_items: List of RawContent dictionaries
            
        Returns:
            ProcessedBatch with embeddings
        """
        logger.info(f"Processing {len(raw_content_items)} items")
        
        # Prepare texts for embedding
        texts = []
        for item in raw_content_items:
            # Combine title and content for better embeddings
            text = f"{item['title']} {item['content']}"
            texts.append(text)
        
        # Generate embeddings (batched for efficiency)
        logger.info("Generating embeddings...")
        embeddings = self.model.encode(
            texts,
            show_progress_bar=True,
            batch_size=32
        )
        
        # Create ProcessedContent items
        processed_items = []
        for i, item in enumerate(raw_content_items):
            # Preserve pathId and api_id from raw content metadata if available
            metadata = {
                'source_type': item.get('source_type', ''),
                'source_url': item.get('source_url', ''),
                'author': item.get('author'),
                'published_date': item.get('published_date'),
            }
            # Copy metadata from raw content if it exists
            if 'metadata' in item and isinstance(item['metadata'], dict):
                raw_metadata = item['metadata']
                if 'pathId' in raw_metadata:
                    metadata['pathId'] = raw_metadata['pathId']
                if 'api_id' in raw_metadata:
                    metadata['api_id'] = raw_metadata['api_id']
                # Also preserve original_id for API lookup
                metadata['original_id'] = item.get('id')
            
            processed = ProcessedContent(
                id=generate_id(),
                original_id=item.get('id', ''),
                title=item.get('title', ''),
                content=item.get('content', ''),
                embedding=embeddings[i].tolist(),
                metadata=metadata
            )
            processed_items.append(processed)
        
        logger.info(f"Generated {len(processed_items)} embeddings")
        
        return ProcessedBatch(
            items=processed_items,
            total=len(processed_items),
            model_used=self.model_name
        )

