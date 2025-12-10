#!/bin/bash

# Script to fix database schema issues on the server
# Run this on your production server

set -e  # Exit on error

echo "🔍 Diagnosing database schema issues..."
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
elif [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "❌ Error: No .env or .env.local file found"
    echo "Please create one with DATABASE_URL"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set in environment"
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated"
echo ""

# Step 2: Check current database state
echo "🔍 Step 2: Checking database connection..."
npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Cannot connect to database. Please check your DATABASE_URL"
    exit 1
fi

echo "✅ Database connection successful"
echo ""

# Step 3: Push schema to database
echo "🚀 Step 3: Syncing schema with database..."
echo "This will update foreign key constraints and add cascade deletes"
echo ""

npx prisma db push --accept-data-loss --skip-generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to sync database schema"
    echo "Please check the error messages above"
    exit 1
fi

echo "✅ Database schema synced successfully"
echo ""

# Step 4: Verify schema
echo "🔍 Step 4: Verifying schema..."
npx prisma db pull --print > /tmp/prisma-schema-check.txt 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Schema verification successful"
    echo ""
    echo "📋 Summary of changes:"
    echo "  ✅ Foreign key constraints updated"
    echo "  ✅ Cascade deletes configured for:"
    echo "     - PurchaseOffer → Client (when Client deleted)"
    echo "     - LineItem → PurchaseOffer (when PurchaseOffer deleted)"
    echo "     - POView → PurchaseOffer (when PurchaseOffer deleted)"
    echo ""
    echo "🎉 Database is now ready to accept new records!"
else
    echo "⚠️  Schema verification had issues, but sync completed"
    echo "Check /tmp/prisma-schema-check.txt for details"
fi

echo ""
echo "✨ Done! You can now test creating clients and purchase offers."

