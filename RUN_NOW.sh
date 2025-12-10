#!/bin/bash

# Quick deployment script - Run this NOW on your server

set -e

echo "🚀 Starting deployment..."

# Step 1: Fix MySQL (if needed)
echo "📋 Step 1: Checking MySQL..."
if mysql -u root -p0000 -e "SELECT 1;" 2>/dev/null; then
    echo "✅ MySQL auth OK"
else
    echo "⚠️  Fixing MySQL auth..."
    sudo mysql << 'EOF'
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '0000';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
EOF
    echo "✅ MySQL fixed"
fi

# Step 2: Load env and sync database
echo "📋 Step 2: Syncing database schema..."
export DATABASE_URL="mysql://root:0000@localhost:3306/laapak_po"
npx prisma generate
npx prisma db push --accept-data-loss

echo "✅ Database synced"

# Step 3: Restart app
echo "📋 Step 3: Restarting application..."
if command -v pm2 &> /dev/null && pm2 list | grep -q "laapak-po"; then
    pm2 restart laapak-po
    echo "✅ App restarted"
else
    echo "⚠️  PM2 not found or app not running. Restart manually:"
    echo "   pm2 restart laapak-po"
    echo "   OR"
    echo "   npm run start:prod"
fi

echo ""
echo "✨ Done! Test creating a client or PO now."

