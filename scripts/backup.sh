#!/bin/bash

# Database backup script for LMS application
set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="lms_backup_$DATE.sql"
RETENTION_DAYS=30

# Database connection details from environment
DB_HOST="postgres"
DB_PORT="5432"
DB_NAME="${POSTGRES_DB:-lms_production}"
DB_USER="${POSTGRES_USER:-lms_user}"

echo "Starting database backup..."
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST"
echo "Backup file: $BACKUP_FILE"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create database backup
echo "Creating database dump..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-password \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=custom \
    --file="$BACKUP_DIR/$BACKUP_FILE.dump"

# Also create a plain SQL backup for easier restoration
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-password \
    --verbose \
    --clean \
    --if-exists \
    --create \
    > "$BACKUP_DIR/$BACKUP_FILE"

# Compress the SQL backup
echo "Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE.gz" | cut -f1)
echo "Backup completed: $BACKUP_FILE.gz ($BACKUP_SIZE)"

# Clean up old backups
echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "lms_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "lms_backup_*.dump" -mtime +$RETENTION_DAYS -delete

# List remaining backups
echo "Remaining backups:"
ls -lh "$BACKUP_DIR"/lms_backup_*

echo "Backup process completed successfully!"

# Optional: Upload to cloud storage (uncomment and configure as needed)
# echo "Uploading to cloud storage..."
# aws s3 cp "$BACKUP_DIR/$BACKUP_FILE.gz" s3://your-backup-bucket/database-backups/
# echo "Upload completed!"
