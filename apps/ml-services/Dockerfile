FROM python:3.11-slim

WORKDIR /app

# Install uv for fast Python package management
RUN pip install --no-cache-dir uv

# Copy dependency files
COPY apps/ml-services/pyproject.toml ./
COPY libs/python-shared ./libs/python-shared

# Install dependencies
RUN uv sync --frozen

# Copy notebooks and data
COPY apps/ml-services/notebooks ./notebooks
COPY apps/ml-services/data ./data

# Expose Marimo port
EXPOSE 2718

# Default command (can be overridden in docker-compose)
CMD ["uv", "run", "marimo", "edit", "notebooks/pandas_exercises.py", "--port", "2718", "--host", "0.0.0.0", "--watch"]
