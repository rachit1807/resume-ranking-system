# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS frontend-builder
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.13.5-slim-bookworm AS python-builder
WORKDIR /build
ENV PIP_NO_CACHE_DIR=1
COPY backend/requirements.txt ./requirements.txt
RUN pip wheel --no-deps --wheel-dir /wheels -r requirements.txt

FROM python:3.13.5-slim-bookworm AS runner
WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
RUN useradd --create-home --uid 1001 appuser
COPY --from=python-builder /wheels /wheels
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels
COPY backend/app ./backend/app
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist
RUN chown -R appuser:appuser /app
USER appuser
WORKDIR /app/backend
EXPOSE 10000
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
