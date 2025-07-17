# AdMimic Backend Dockerfile
# Production-ready Python environment with all dependencies

FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Required for image processing
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    # Required for font handling
    fontconfig \
    fonts-dejavu-core \
    fonts-liberation \
    # Build tools for some Python packages
    gcc \
    g++ \
    # Cleanup
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Create directories for application
RUN mkdir -p /app/uploads \
    /app/temp \
    /app/generated \
    /app/assets \
    /app/fonts \
    /app/logs \
    /app/models \
    /app/services

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Change ownership of app directory
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
