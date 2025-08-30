# Multi-stage build for Cloud Run
FROM python:3.11-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir hatchling && \
    pip install --no-cache-dir -e .

# Production stage
FROM python:3.11-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --create-home --shell /bin/bash app

# Set working directory
WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY main.py .

# Create ephemeris directory and download ephemeris files
RUN mkdir -p /app/ephe && chown -R app:app /app

# Switch to non-root user
USER app

# Download ephemeris files (if available)
RUN if command -v wget >/dev/null 2>&1; then \
        echo "Downloading ephemeris files..." && \
        cd /app/ephe && \
        wget -q https://www.astro.com/ftp/swisseph/ephe/seas_18.se1 || echo "Failed to download seas_18.se1" && \
        wget -q https://www.astro.com/ftp/swisseph/ephe/semo_18.se1 || echo "Failed to download semo_18.se1" && \
        wget -q https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1 || echo "Failed to download sepl_18.se1" && \
        echo "Ephemeris files downloaded successfully"; \
    else \
        echo "wget not available, skipping ephemeris download"; \
    fi

# Set environment variables
ENV PYTHONPATH=/app
ENV EPHE_PATH=/app/ephe
ENV TZ_DEFAULT=UTC
ENV SIDEREAL_AYANAMSHA=TRUE_CHITRA_PAKSHA_LAHIRI

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/healthz || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]

