# Make a snapshot of the current db
litefs export -name sqlite.db /backups/backup-`date +%M`.db

# For local testing
# cp ./prisma/data.db ./backups/backup-`date +%M`.db

# Compress the file.
gzip ./backups/backup-`date +%M`.db

# Daily backup
aws s3 cp ./backups/backup-`date +%M`.db.gz s3://getfranki-backup/backup-`date +%M`.db.gz
