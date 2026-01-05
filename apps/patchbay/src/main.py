"""Main entry point for Patchbay."""
import os
import sys
from pathlib import Path

# Add parent directory to path so we can import adapters and models
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from python_shared.logging_config import setup_logging
from src.ingest import Ingestor


def main():
    """Main function."""
    # Load environment variables
    load_dotenv()
    
    # Setup logging
    log_level = os.getenv("LOG_LEVEL", "INFO")
    log_file = os.getenv("LOG_FILE")
    logger = setup_logging("patchbay", log_level, log_file)
    
    # Get data directory
    data_dir = os.getenv("DATA_DIR", "../../data")
    
    # Create ingestor
    ingestor = Ingestor(data_dir=data_dir)
    
    # Parse command line arguments
    if len(sys.argv) < 2:
        print("Usage: python -m src.main <command> [args]")
        print("\nCommands:")
        print("  ingest              - Ingest from configured sources")
        print("  ingest-source <url> - Ingest a specific URL")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "ingest":
        # Get sources from environment or config file
        sources_env = os.getenv("RSS_SOURCES", "")
        if not sources_env:
            logger.error("No sources configured. Set RSS_SOURCES environment variable.")
            sys.exit(1)
        
        sources = [s.strip() for s in sources_env.split(",")]
        logger.info(f"Ingesting {len(sources)} sources")
        
        results = ingestor.ingest_multiple(sources)
        
        # Summary
        total_items = sum(batch.total for batch in results.values())
        logger.info(f"\n{'='*60}")
        logger.info(f"SUMMARY: {len(results)} sources, {total_items} total items")
        logger.info(f"{'='*60}")
        
    elif command == "ingest-source":
        if len(sys.argv) < 3:
            print("Usage: python -m src.main ingest-source <url>")
            sys.exit(1)
        
        url = sys.argv[2]
        batch = ingestor.ingest(url)
        
        if batch:
            logger.info(f"\nSuccess! Extracted {batch.total} items")
        else:
            logger.error("\nIngestion failed")
            sys.exit(1)
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()

