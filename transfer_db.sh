#!/bin/bash
# Transfer database dump to remote server
# Usage: ./transfer_db.sh

DUMP_FILE=$(ls -t laapak_po_backup_*.sql | head -1)

if [ -z "$DUMP_FILE" ]; then
    echo "No dump file found!"
    exit 1
fi

echo "Transferring $DUMP_FILE to deploy@82.112.253.29..."
echo "Password: 0000"
scp -o StrictHostKeyChecking=no "$DUMP_FILE" deploy@82.112.253.29:~/

if [ $? -eq 0 ]; then
    echo "✓ Transfer successful!"
    echo "File location on remote: ~/$DUMP_FILE"
else
    echo "✗ Transfer failed!"
    exit 1
fi
