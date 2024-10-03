# Make a snapshot of the current db
litefs export -name sqlite.db ./backups/backup-`date +%M`.db

# Compress the file.
gzip ./backups/backup-`date +%M`.db

# Daily backup
aws s3 cp ./backups/backup-`date +%M`.db.gz s3://backups-sinp/backup-`date +%M`.db.gz --endpoint-url=$AWS_ENDPOINT_URL_S3
