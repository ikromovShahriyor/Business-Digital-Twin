#!/usr/bin/env bash
# ==============================================================================
# Business Digital Twin - Automated Database Backup Script
# Creates compressed SQL dumps with timestamp and rotation
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/twin_backup_${TIMESTAMP}.sql.gz"
CONTAINER_NAME="${POSTGRES_CONTAINER:-business_twin_postgres}"
DB_NAME="${POSTGRES_DB:-business_twin_db}"
DB_USER="${POSTGRES_USER:-twin_admin}"

mkdir -p "${BACKUP_DIR}"

echo "[+] Starting database backup for '${DB_NAME}' at $(date)..."

docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${BACKUP_FILE}"

echo "[✓] Backup created successfully: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# Retention policy: Keep backups for 30 days
echo "[+] Cleaning up backups older than 30 days..."
find "${BACKUP_DIR}" -type f -name "twin_backup_*.sql.gz" -mtime +30 -delete
echo "[✓] Backup routine completed."
