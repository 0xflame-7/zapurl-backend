# scan-service/Dockerfile
FROM python:3.11-slim-bookworm

# Install system dependencies required for building python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set working directory
WORKDIR /app

# Copy dependency files first (for caching)
COPY pyproject.toml .
COPY .python-version .
# If you have a uv.lock, copy it here too: COPY uv.lock .

# Install dependencies
# --frozen ensures we use exact versions if lockfile exists
# --no-dev excludes development dependencies
# --system installs into system python (fine for docker)
RUN uv sync --system

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run FastAPI with Uvicorn
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]