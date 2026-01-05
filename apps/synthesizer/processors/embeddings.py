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
            processed = ProcessedContent(
                id=generate_id(),
                original_id=item['id'],
                title=item['title'],
                content=item['content'],
                embedding=embeddings[i].tolist(),
                metadata={
                    'source_type': item['source_type'],
                    'source_url': item['source_url'],
                    'author': item.get('author'),
                    'published_date': item.get('published_date')
                }
            )
            processed_items.append(processed)
        
        logger.info(f"Generated {len(processed_items)} embeddings")
        
        return ProcessedBatch(
            items=processed_items,
            total=len(processed_items),
            model_used=self.model_name
        )

