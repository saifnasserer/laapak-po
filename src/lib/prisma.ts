import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Log database URL (without password) for debugging
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
  console.log(`[Prisma] Initializing with DATABASE_URL: ${maskedUrl}`);
} else {
  console.error('[Prisma] WARNING: DATABASE_URL is not set!');
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: ['query', 'error', 'warn'], // Always log queries in production for debugging
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
