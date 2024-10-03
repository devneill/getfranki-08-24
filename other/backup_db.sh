# Make a snapshot of the current db
litefs export -name sqlite.db ./backups/backup-`date +%d`.db

# Compress the file.
gzip ./backups/backup-`date +%d`.db

# Daily backup
aws s3 cp ./backups/backup-`date +%d`.db.gz s3://backups-sinp/backup-`date +%d`.db.gz
