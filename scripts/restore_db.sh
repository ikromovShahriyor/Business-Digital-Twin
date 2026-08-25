#!/usr/bin/env bash
# ==============================================================================
# Business Digital Twin - Database Restore Script
# Restores a compressed SQL dump to the active database container
# ==============================================================================

set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path_to_backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="${POSTGRES_CONTAINER:-business_twin_postgres}"
DB_NAME="${POSTGRES_DB:-business_twin_db}"
DB_USER="${POSTGRES_USER:-twin_admin}"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "[-] Error: Backup file '${BACKUP_FILE}' not found!"
    exit 1
fi

echo "[!] WARNING: This will overwrite data in '${DB_NAME}'. Are you sure? (y/N)"
read -r CONFIRM
if [[ ! "${CONFIRM}" =~ ^[Yy]$ ]]; then
    echo "[-] Restore cancelled."
    exit 0
fi

echo "[+] Restoring database from '${BACKUP_FILE}'..."

gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}"

echo "[✓] Database restored successfully!"
