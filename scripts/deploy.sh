#!/usr/bin/env bash
# ==============================================================================
# Business Digital Twin - One-Click Production Deployment Script (VPS / Linux)
# ==============================================================================

set -euo pipefail

echo "======================================================================"
echo "    Business Digital Twin — Production Deployment"
echo "======================================================================"

if [ ! -f .env ]; then
    echo "[!] No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "[!] Please edit .env with your production secrets before proceeding."
    exit 1
fi

echo "[+] Pulling latest images and building containers..."
docker compose -f docker-compose.production.yml pull || true
docker compose -f docker-compose.production.yml build --no-cache

echo "[+] Starting stack in background..."
docker compose -f docker-compose.production.yml up -d

echo "[+] Waiting for services to become healthy..."
sleep 10

echo "[+] Checking container status..."
docker compose -f docker-compose.production.yml ps

echo "======================================================================"
echo "[✓] Deployment completed successfully!"
echo "• Web App & Nginx: http://localhost / https://yourdomain.com"
echo "• Health check:    http://localhost/health"
echo "• API Swagger:     http://localhost/swagger"
echo "======================================================================"
