"""Shared utility functions for Kasita Python applications."""
from pathlib import Path
from typing import Any
import json
from datetime import datetime


def ensure_directory(path: str | Path) -> Path:
    """Ensure a directory exists, create if it doesn't."""
    path = Path(path)
    path.mkdir(parents=True, exist_ok=True)
    return path


def generate_id() -> str:
    """Generate a unique ID based on timestamp."""
    return datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")


def load_json(path: str | Path) -> dict[str, Any]:
    """Load JSON from file."""
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(data: dict[str, Any], path: str | Path) -> None:
    """Save data as JSON to file."""
    path = Path(path)
    ensure_directory(path.parent)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

