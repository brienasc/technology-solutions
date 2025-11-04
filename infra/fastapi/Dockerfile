FROM python:3.11-slim AS runtime

WORKDIR /app

COPY ai-service/pyproject.toml poetry.lock* /app/

RUN pip install --no-cache-dir uvicorn fastapi && \
    pip install -e . || true

ENV PYTHONUNBUFFERED=1

EXPOSE 8000
