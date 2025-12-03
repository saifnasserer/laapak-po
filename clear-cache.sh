#!/bin/bash
# Clear Next.js cache and regenerate Prisma client

echo "Clearing Next.js cache..."
rm -rf .next

echo "Regenerating Prisma client..."
npx prisma generate

echo "Done! You can now restart your dev server with: npm run dev"

