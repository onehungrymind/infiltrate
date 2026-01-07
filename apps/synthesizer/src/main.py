"""Main entry point for Synthesizer."""
import os
import sys
from pathlib import Path

# Add parent directory to path so we can import modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from python_shared.logging_config import setup_logging
from src.orchestrator import SynthesisOrchestrator


def main():
    """Main function."""
    # Load environment variables from .env file in synthesizer directory
    # Get the synthesizer directory (parent of src/)
    synthesizer_dir = Path(__file__).parent.parent
    env_path = synthesizer_dir / '.env'
    load_dotenv(dotenv_path=env_path)
    
    # Setup logging
    log_level = os.getenv("LOG_LEVEL", "INFO")
    log_file = os.getenv("LOG_FILE")
    logger = setup_logging("synthesizer", log_level, log_file)
    
    # Get configuration
    data_dir = os.getenv("DATA_DIR", "../../data")
    embedding_model = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    claude_model = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")
    min_cluster_size = int(os.getenv("MIN_CLUSTER_SIZE", "3"))
    max_clusters = int(os.getenv("MAX_CLUSTERS", "10"))
    api_base_url = os.getenv("API_URL")
    use_api = api_base_url is not None
    
    # Create orchestrator
    orchestrator = SynthesisOrchestrator(
        data_dir=data_dir,
        embedding_model=embedding_model,
        claude_model=claude_model,
        min_cluster_size=min_cluster_size,
        max_clusters=max_clusters,
        use_api=use_api,
        api_base_url=api_base_url
    )
    
    # Parse command
    if len(sys.argv) < 2:
        print("Usage: python -m src.main <command>")
        print("\nCommands:")
        print("  process    - Run full synthesis pipeline")
        print("  embeddings - Generate embeddings only")
        print("  cluster    - Cluster existing embeddings")
        print("  generate   - Generate knowledge units from clusters")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "process":
        summary = orchestrator.run_full_pipeline()
        if "error" in summary:
            logger.error(summary["error"])
            sys.exit(1)
    else:
        logger.error(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()

