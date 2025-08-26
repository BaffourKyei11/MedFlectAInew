#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql"
KEEP_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Set default values if not provided in .env
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-medflect}

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
  echo "Error: pg_dump is not installed. Please install postgresql-client."
  exit 1
fi

# Create backup
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Database backup created successfully: $BACKUP_FILE"
  
  # Compress the backup
  gzip "$BACKUP_FILE"
  echo "Backup compressed: ${BACKUP_FILE}.gz"
  
  # Remove old backups
  find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +$KEEP_DAYS -delete -printf "Deleted old backup: %f\n"
  
  # Optional: Upload to cloud storage (uncomment and configure as needed)
  # Example for AWS S3:
  # aws s3 cp "${BACKUP_FILE}.gz" "s3://your-bucket/backups/"
  
  exit 0
else
  echo "Error: Database backup failed"
  exit 1
fi
