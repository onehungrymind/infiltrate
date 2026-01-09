# ML Services - Notebook Learning Platform

This module provides notebook-based learning exercises using Marimo notebooks.

## Overview

The ML Services app contains:
- **Marimo Notebooks**: Interactive Python notebooks for learning exercises
- **Sample Data**: Educational datasets for exercises
- **Integration**: Backend API and frontend components for progress tracking

## Structure

```
apps/ml-services/
├── notebooks/           # Marimo notebook files (.py)
│   └── pandas_exercises.py
├── data/               # Sample datasets
│   └── pandas_exercises/
│       ├── students.csv
│       ├── courses.csv
│       └── enrollments.csv
├── src/                # Python utilities (future)
├── pyproject.toml      # Python dependencies
└── Dockerfile          # Docker configuration for Marimo
```

## Setup

### Prerequisites

- Python 3.11+
- `uv` package manager (install with `pip install uv`)

### Installation

```bash
# Install dependencies
nx install ml-services

# Or manually:
cd apps/ml-services
uv sync
```

## Running Marimo

### Development Mode (Local)

```bash
# Start Marimo editor
npm run notebook:dev

# Or using nx directly:
nx notebook:dev ml-services
```

This starts Marimo on `http://localhost:2718` where you can edit the notebook interactively.

### Production Mode (Serve Static)

```bash
# Serve the notebook (read-only)
npm run notebook:serve

# Or:
nx notebook:serve ml-services
```

### Docker

```bash
# Build and start Marimo in Docker
npm run notebook:docker

# Or:
docker-compose up marimo
```

The notebook will be available at `http://localhost:2718`.

## Notebook Structure

The `pandas_exercises.py` notebook contains 5 progressive exercises:

1. **Exercise 1**: Loading and inspecting data
   - `read_csv()`, `head()`, `info()`, `describe()`

2. **Exercise 2**: Basic filtering and selection
   - Boolean indexing, `loc`, `iloc`

3. **Exercise 3**: Data transformation
   - New columns, `apply()`, `map()`

4. **Exercise 4**: Grouping and aggregation
   - `groupby()`, `agg()`, `pivot_table()`

5. **Exercise 5**: Merging datasets
   - `merge()`, `join()`, `concat()`

Each exercise includes:
- Clear instructions
- Starter code with TODOs
- Sample dataset
- Validation function
- Visual feedback (✓/❌)

## Integration

### Backend API

The Nest.js API provides endpoints in `apps/api/src/notebooks/`:

- `GET /api/notebooks/template/:notebookId` - Get notebook template
- `POST /api/notebooks/submit` - Submit notebook for validation
- `GET /api/notebooks/user/:userId/progress` - Get all user progress
- `GET /api/notebooks/user/:userId/progress/:notebookId` - Get specific progress

### Frontend Components

Angular components in `apps/dashboard/src/app/notebook/`:

- `NotebookViewerComponent` - Embeds Marimo notebook via iframe
- `NotebookProgressComponent` - Shows progress tracker

Access at: `http://localhost:4200/notebook`

## Development

### Adding a New Notebook

1. Create a new `.py` file in `notebooks/`
2. Follow Marimo notebook format (see [Marimo docs](https://marimo.io))
3. Add validation functions for exercises
4. Update API to handle the new notebook ID

### Adding Sample Data

1. Add CSV files to `data/pandas_exercises/`
2. Update notebook to load the new data
3. Reference in exercises

## Notes

- Marimo notebooks are Python files with special syntax
- The notebook uses reactive execution (cells update automatically)
- Progress is tracked at the exercise level
- Notebook code is stored in the database for resumption

## Future Enhancements

- [ ] Marimo API integration for better code extraction
- [ ] Sandboxed execution environment (Docker-based)
- [ ] Real-time collaboration
- [ ] Export to Jupyter notebooks
- [ ] More exercise types (NumPy, Matplotlib, etc.)
