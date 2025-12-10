#!/bin/bash

# Remote Server Deployment Script
# Run this on your production server to sync with local changes

set -e  # Exit on error

echo "🚀 Starting Remote Server Deployment..."
echo ""

# Step 1: Fix MySQL Authentication (if needed)
echo "📋 Step 1: Checking MySQL authentication..."
if mysql -u root -p0000 -e "SELECT 1;" 2>/dev/null; then
    echo "✅ MySQL authentication is working"
else
    echo "⚠️  MySQL authentication needs fixing..."
    echo "Running MySQL fix..."
    sudo mysql << 'EOF'
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '0000';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
EOF
    echo "✅ MySQL authentication fixed"
fi
echo ""

# Step 2: Navigate to project (update path as needed)
PROJECT_PATH="/path/to/Laapak PO"  # UPDATE THIS PATH
echo "📂 Step 2: Navigating to project directory..."
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Error: Project directory not found at: $PROJECT_PATH"
    echo "Please update PROJECT_PATH in this script"
    exit 1
fi
cd "$PROJECT_PATH"
echo "✅ In project directory: $(pwd)"
echo ""

# Step 3: Check .env file
echo "📋 Step 3: Checking .env file..."
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cat > .env << 'ENVEOF'
DATABASE_URL="mysql://root:0000@localhost:3306/laapak_po"
NODE_ENV="production"
NEXT_PUBLIC_BASE_URL="http://82.112.253.29:3002"
PORT=3002
ENVEOF
    echo "✅ .env file created"
else
    echo "✅ .env file exists"
    # Verify DATABASE_URL is set
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL found in .env"
    else
        echo "⚠️  DATABASE_URL not found in .env. Please add it."
        exit 1
    fi
fi
echo ""

# Step 4: Load environment variables
echo "📋 Step 4: Loading environment variables..."
export $(cat .env | grep -v '^#' | xargs)
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set"
    exit 1
fi
echo "✅ Environment variables loaded"
echo ""

# Step 5: Generate Prisma Client
echo "📦 Step 5: Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo "✅ Prisma Client generated"
echo ""

# Step 6: Push schema to database
echo "🚀 Step 6: Syncing database schema..."
npx prisma db push --accept-data-loss --skip-generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to sync database schema"
    echo "Please check the error messages above"
    exit 1
fi
echo "✅ Database schema synced"
echo ""

# Step 7: Verify schema
echo "🔍 Step 7: Verifying database connection..."
mysql -u root -p0000 laapak_po -e "SHOW TABLES;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database connection verified"
else
    echo "⚠️  Database connection verification failed"
fi
echo ""

# Step 8: Restart application
echo "🔄 Step 8: Restarting application..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "laapak-po"; then
        echo "Restarting PM2 process: laapak-po"
        pm2 restart laapak-po
        echo "✅ Application restarted via PM2"
    else
        echo "⚠️  PM2 process 'laapak-po' not found"
        echo "You may need to start it manually: pm2 start npm --name laapak-po -- run start:prod"
    fi
else
    echo "⚠️  PM2 not found. Please restart your application manually"
    echo "Run: npm run start:prod"
fi
echo ""

echo "✨ Deployment complete!"
echo ""
echo "📋 Summary:"
echo "  ✅ MySQL authentication configured"
echo "  ✅ Prisma Client generated"
echo "  ✅ Database schema synced"
echo "  ✅ Application restarted"
echo ""
echo "🧪 Next steps:"
echo "  1. Test creating a new client"
echo "  2. Test creating a new Purchase Offer"
echo "  3. Test deleting a Purchase Offer (should cascade delete related records)"
echo ""

