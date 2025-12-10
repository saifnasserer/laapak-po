#!/bin/bash

# Script to sync Prisma schema with the database
# This will update foreign key constraints and add cascade delete behavior

echo "🔄 Syncing Prisma schema with database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set it in .env.local file"
    exit 1
fi

echo "✅ DATABASE_URL is set"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Push schema to database (this will update foreign key constraints)
echo "🚀 Pushing schema to database..."
npx prisma db push --accept-data-loss

echo "✅ Database schema synced successfully!"
echo ""
echo "The following changes have been applied:"
echo "  - Added cascade delete to PurchaseOffer -> Client relation"
echo "  - Added cascade delete to LineItem -> PurchaseOffer relation"
echo "  - Added cascade delete to POView -> PurchaseOffer relation"
echo ""
echo "Now when you delete a PurchaseOffer, all related LineItems and POViews"
echo "will be automatically deleted by the database."

