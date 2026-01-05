# Patchbay

Content ingestion and routing system for Kasita.

## Overview

Patchbay ingests content from diverse sources (newsletters, RSS feeds, articles, PDFs) and normalizes them into a standard format for downstream processing.

## Architecture

```
Source → Router → Adapter → Normalizer → Output (data/raw/)
```

## Supported Sources

- **RSS Feeds**: Any RSS/Atom feed
- **Web Articles**: Any HTTP(S) URL (uses trafilatura)
- **PDF Documents**: Local or remote PDF files
- **Newsletters**: Email newsletters (requires IMAP setup)

## Usage

### Ingest from configured sources:
```bash
nx run patchbay:ingest
```

### Ingest a specific URL:
```bash
nx run patchbay:ingest-source -- https://example.com/feed.rss
```

### Run tests:
```bash
nx run patchbay:test
```

## Configuration

Create `.env` file (see `.env.example`):
```env
RSS_SOURCES=https://javascriptweekly.com/rss,https://nodeweekly.com/rss
DATA_DIR=../../data
LOG_LEVEL=INFO
```

## Adding Custom Adapters

1. Create new adapter in `adapters/`:
```python
from adapters.base_adapter import BaseAdapter

class MyAdapter(BaseAdapter):
    @property
    def adapter_type(self) -> str:
        return "my-source"
    
    def validate_url(self, url: str) -> bool:
        return url.startswith("my://")
    
    def extract(self, url: str) -> RawContentBatch:
        # Implementation
        pass
```

2. Register in `src/router.py`:
```python
from adapters.my_adapter import MyAdapter

router.add_adapter(MyAdapter())
```

## Output Format

All adapters output `RawContent` in this structure:
```json
{
  "id": "20241229_143022_123456",
  "source_type": "rss",
  "source_url": "https://example.com/article",
  "title": "Article Title",
  "content": "Clean text content...",
  "author": "Author Name",
  "published_date": "2024-12-29T14:30:22",
  "metadata": {}
}
```

Files are written to:
- `data/raw/<source_type>_<timestamp>.json`
- `data/raw/<source_type>_latest.json`

