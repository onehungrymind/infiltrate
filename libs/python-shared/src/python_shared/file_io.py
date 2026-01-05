"""File I/O utilities for reading/writing data."""
from pathlib import Path
from typing import Any, Union
import json
from datetime import datetime


class DataWriter:
    """Handles writing data to the appropriate directories."""
    
    def __init__(self, base_path: str | Path = "data"):
        self.base_path = Path(base_path)
        
    def write_raw(self, data: dict[str, Any], source_type: str, per_item: bool = False) -> Union[Path, list[Path]]:
        """
        Write raw content to data/raw/.
        
        Args:
            data: Data to write (either a batch dict with 'items' or a single item)
            source_type: Type of source (e.g., 'rss', 'article')
            per_item: If True and data has 'items', write each item to its own file
            
        Returns:
            Path to written file(s)
        """
        if per_item and 'items' in data:
            # Write each item to its own file
            paths = []
            for item in data['items']:
                item_id = item.get('id', datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f"))
                filename = f"{source_type}_{item_id}.json"
                output_path = self.base_path / "raw" / filename
                
                output_path.parent.mkdir(parents=True, exist_ok=True)
                
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(item, f, indent=2, ensure_ascii=False)
                
                paths.append(output_path)
            
            return paths
        else:
            # Write batch to single file (original behavior)
            timestamp = datetime.utcnow().isoformat()
            filename = f"{source_type}_{timestamp}.json"
            output_path = self.base_path / "raw" / filename
            
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                
            # Also write to "latest" for easy access
            latest_path = self.base_path / "raw" / f"{source_type}_latest.json"
            with open(latest_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                
            return output_path
    
    def write_processed(self, data: dict[str, Any], process_type: str) -> Path:
        """Write processed content to data/processed/."""
        timestamp = datetime.utcnow().isoformat()
        filename = f"{process_type}_{timestamp}.json"
        output_path = self.base_path / "processed" / filename
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        return output_path
    
    def write_synthesized(self, data: dict[str, Any], artifact_type: str) -> Path:
        """Write synthesized content to data/synthesized/."""
        timestamp = datetime.utcnow().isoformat()
        filename = f"{artifact_type}_{timestamp}.json"
        output_path = self.base_path / "synthesized" / filename
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        # Also write to "latest" for easy access
        latest_path = self.base_path / "synthesized" / f"{artifact_type}_latest.json"
        with open(latest_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        return output_path


class DataReader:
    """Handles reading data from directories."""
    
    def __init__(self, base_path: str | Path = "data"):
        self.base_path = Path(base_path)
        
    def read_latest_raw(self, source_type: str) -> dict[str, Any] | None:
        """Read the latest raw content for a source type."""
        latest_path = self.base_path / "raw" / f"{source_type}_latest.json"
        if not latest_path.exists():
            return None
            
        with open(latest_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def read_all_raw(self) -> list[dict[str, Any]]:
        """Read all raw content files."""
        raw_dir = self.base_path / "raw"
        if not raw_dir.exists():
            return []
            
        results = []
        for file_path in raw_dir.glob("*.json"):
            if file_path.stem.endswith("_latest"):
                continue  # Skip latest files to avoid duplicates
            with open(file_path, 'r', encoding='utf-8') as f:
                results.append(json.load(f))
                
        return results

