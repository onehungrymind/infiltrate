# Synthesizer

Content processing and knowledge unit generation for Kasita.

## Overview

Synthesizer processes raw content from Patchbay through multiple stages:
1. **Embeddings**: Generate vector representations
2. **Clustering**: Group similar content by topic
3. **Generation**: Use Claude to create knowledge units

## Architecture

```
data/raw/ → Embeddings → Clustering → LLM Generation → data/synthesized/
```

## Usage

### Run full pipeline:
```bash
nx run synthesizer:process
```

### Run individual stages:
```bash
nx run synthesizer:embeddings
nx run synthesizer:cluster
nx run synthesizer:generate
```

### Run tests:
```bash
nx run synthesizer:test
```

## Configuration

Create `.env` file (see `.env.example`):
```env
ANTHROPIC_API_KEY=your-api-key
EMBEDDING_MODEL=all-MiniLM-L6-v2
CLAUDE_MODEL=claude-sonnet-4-20250514
MIN_CLUSTER_SIZE=3
MAX_CLUSTERS=10
```

## Pipeline Stages

### 1. Embeddings
Converts text to vector representations using sentence-transformers.

**Input**: `data/raw/*.json`  
**Output**: `data/processed/embeddings_*.json`

### 2. Clustering
Groups similar content using K-means clustering.

**Input**: `data/processed/embeddings_*.json`  
**Output**: `data/processed/clusters_*.json`

### 3. Knowledge Unit Generation
Uses Claude to generate flashcards from each cluster.

**Input**: `data/processed/clusters_*.json`  
**Output**: `data/synthesized/knowledge_units_*.json`

## Output Format

Knowledge units are generated in this format:
```json
{
  "units": [
    {
      "id": "20241229_143022_123456",
      "concept": "Gradient Descent",
      "question": "How does gradient descent work?",
      "answer": "Walking downhill in the dark...",
      "difficulty": "intermediate",
      "cognitive_level": "understand",
      "examples": [...],
      "analogies": [...]
    }
  ],
  "total": 25
}
```

## Adding Custom Generators

Create new generator in `generators/`:
```python
from generators.base_generator import BaseGenerator

class MyGenerator(BaseGenerator):
    @property
    def generator_type(self) -> str:
        return "my-artifact"
    
    def generate(self, cluster, content_items):
        # Implementation
        pass
```

