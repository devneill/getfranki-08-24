# Fetch db backup
aws s3 cp s3://backups-sinp/backup-`date +%d`.db.gz ./backups/source-`date +%d`.db.gz  --endpoint-url=$AWS_ENDPOINT_URL_S3

# Decompress the file.
gunzip ./backups/source-`date +%d`.db.gz

# Make a snapshot of the current db
litefs import -name sqlite.db ./backups/source-`date +%d`.db
