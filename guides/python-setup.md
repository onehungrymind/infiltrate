# Python Components Setup

## Prerequisites
- Python 3.11+
- `uv` package manager: `pip install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`

## Installation
```bash
# Install all Python dependencies
nx run-many --target=install --projects=tag:python
```

Or install individually:
```bash
nx run python-shared:install
nx run patchbay:install
nx run synthesizer:install
```

## Usage

### Patchbay (Ingestion)
```bash
# Configure sources
cp apps/patchbay/.env.example apps/patchbay/.env
# Edit apps/patchbay/.env with your sources

# Run ingestion
nx run patchbay:ingest

# Or ingest a specific URL
nx run patchbay:ingest-source -- https://hnrss.org/frontpage
```

### Synthesizer (Processing)
```bash
# Configure
cp apps/synthesizer/.env.example apps/synthesizer/.env
# Add ANTHROPIC_API_KEY to apps/synthesizer/.env

# Run synthesis
nx run synthesizer:process
```

### Full Pipeline
```bash
# Ingest → Process → Generate
nx run patchbay:ingest && nx run synthesizer:process
```

## Development

### Linting
```bash
nx run-many --target=lint --projects=tag:python
```

### Testing
```bash
nx run-many --target=test --projects=tag:python
```

### Type Checking
```bash
nx run-many --target=type-check --projects=tag:python
```

### Formatting
```bash
nx run-many --target=format --projects=tag:python
```

## Architecture

```
Patchbay → data/raw/ → Synthesizer → data/synthesized/
```

See individual app READMEs for details:
- `apps/patchbay/README.md`
- `apps/synthesizer/README.md`

## Project Structure

```
kasita/
├── libs/
│   └── python-shared/     # Shared utilities
├── apps/
│   ├── patchbay/           # Content ingestion
│   └── synthesizer/        # Content processing & generation
└── data/
    ├── raw/                # Patchbay output
    ├── processed/          # Intermediate processing
    └── synthesized/        # Synthesizer output
```

## Quick Start

1. **Install dependencies:**
   ```bash
   nx run python-shared:install
   nx run patchbay:install
   nx run synthesizer:install
   ```

2. **Configure Patchbay:**
   ```bash
   cp apps/patchbay/.env.example apps/patchbay/.env
   # Edit apps/patchbay/.env with RSS_SOURCES
   ```

3. **Test ingestion:**
   ```bash
   nx run patchbay:ingest-source -- https://hnrss.org/frontpage
   ```

4. **Configure Synthesizer:**
   ```bash
   cp apps/synthesizer/.env.example apps/synthesizer/.env
   # Add ANTHROPIC_API_KEY to apps/synthesizer/.env
   ```

5. **Run full pipeline:**
   ```bash
   nx run patchbay:ingest
   nx run synthesizer:process
   ```

6. **Check results:**
   ```bash
   cat data/synthesized/knowledge_units_latest.json
   ```

## Troubleshooting

### Import errors
Make sure you've run `nx run python-shared:install` first, as other projects depend on it.

### Missing dependencies
Run `nx run <project>:install` to sync dependencies with `uv`.

### API key issues
Ensure `ANTHROPIC_API_KEY` is set in `apps/synthesizer/.env` for knowledge unit generation.

### Data directory issues
The `data/` directory is created automatically. If you see errors, ensure the workspace has write permissions.

