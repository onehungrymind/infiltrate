"""Cluster content by topic."""
import logging
import numpy as np
from sklearn.cluster import KMeans
from typing import Optional
from ..models.processed_content import ProcessedContent
from ..models.cluster import ContentCluster, ClusterBatch


logger = logging.getLogger("synthesizer.clustering")


class ClusteringProcessor:
    """Cluster content into topics."""
    
    def __init__(
        self,
        n_clusters: Optional[int] = None,
        min_cluster_size: int = 3,
        max_clusters: int = 10
    ):
        """
        Initialize clustering processor.
        
        Args:
            n_clusters: Number of clusters (auto-determined if None)
            min_cluster_size: Minimum items per cluster
            max_clusters: Maximum number of clusters
        """
        self.n_clusters = n_clusters
        self.min_cluster_size = min_cluster_size
        self.max_clusters = max_clusters
    
    def process(self, processed_items: list[ProcessedContent]) -> ClusterBatch:
        """
        Cluster processed content items.
        
        Args:
            processed_items: List of ProcessedContent with embeddings
            
        Returns:
            ClusterBatch with cluster assignments
        """
        logger.info(f"Clustering {len(processed_items)} items")
        
        # Extract embeddings
        embeddings = np.array([item.embedding for item in processed_items])
        
        # Determine number of clusters if not specified
        n_clusters = self.n_clusters
        if n_clusters is None:
            n_clusters = self._determine_optimal_clusters(embeddings)
        
        logger.info(f"Using {n_clusters} clusters")
        
        # Perform K-means clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(embeddings)
        
        # Group items by cluster
        clusters_dict: dict[int, list[str]] = {}
        for item, label in zip(processed_items, cluster_labels):
            if label not in clusters_dict:
                clusters_dict[label] = []
            clusters_dict[label].append(item.id)
        
        # Create ContentCluster objects
        clusters = []
        for cluster_id, content_ids in clusters_dict.items():
            # Skip clusters that are too small
            if len(content_ids) < self.min_cluster_size:
                logger.warning(
                    f"Cluster {cluster_id} has only {len(content_ids)} items "
                    f"(min: {self.min_cluster_size}), skipping"
                )
                continue
            
            cluster = ContentCluster(
                cluster_id=cluster_id,
                content_ids=content_ids,
                centroid=kmeans.cluster_centers_[cluster_id].tolist(),
                size=len(content_ids),
                topic_label=f"Topic {cluster_id}",  # Placeholder
                keywords=[]  # Would be extracted with NLP
            )
            clusters.append(cluster)
        
        logger.info(f"Created {len(clusters)} clusters")
        
        return ClusterBatch(
            clusters=clusters,
            total_clusters=len(clusters),
            total_items=len(processed_items),
            algorithm="kmeans",
            parameters={
                "n_clusters": n_clusters,
                "min_cluster_size": self.min_cluster_size
            }
        )
    
    def _determine_optimal_clusters(self, embeddings: np.ndarray) -> int:
        """
        Determine optimal number of clusters using elbow method.
        
        Args:
            embeddings: Array of embeddings
            
        Returns:
            Optimal number of clusters
        """
        n_samples = len(embeddings)
        
        # Don't create more clusters than we can properly populate
        max_possible = min(
            self.max_clusters,
            n_samples // self.min_cluster_size
        )
        
        if max_possible < 2:
            return 2
        
        # Simple heuristic: sqrt(n/2)
        optimal = int(np.sqrt(n_samples / 2))
        optimal = max(2, min(optimal, max_possible))
        
        logger.info(f"Determined optimal clusters: {optimal}")
        return optimal

