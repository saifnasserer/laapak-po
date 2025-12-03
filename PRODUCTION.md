# Production Deployment Guide

This guide covers the steps to deploy the Laapak PO system to production.

## Prerequisites

- Node.js 18+ and npm
- MySQL database (8.0+)
- Domain name and SSL certificate (recommended)

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd laapak-po-web
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your production values:

```env
DATABASE_URL="mysql://user:password@host:3306/laapak_po"
NODE_ENV="production"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
```

**Important:** Never commit `.env` files to version control.

### 3. Database Setup

#### Create Database

```sql
CREATE DATABASE laapak_po CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Run Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for initial setup)
npm run db:push

# Or use migrations (recommended for production)
npm run db:migrate
```

### 4. Build the Application

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### 5. Start Production Server

```bash
npm start
```

The application will run on port 3000 by default. Use a process manager like PM2 for production:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start npm --name "laapak-po" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Vercel automatically:
- Builds the application
- Handles SSL certificates
- Provides CDN
- Manages scaling

### Option 2: Self-Hosted with Nginx

#### Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

#### Configure Nginx

Create `/etc/nginx/sites-available/laapak-po`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/laapak-po /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 3: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

Update `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  // ... rest of config
};
```

Build and run:

```bash
docker build -t laapak-po .
docker run -p 3000:3000 --env-file .env laapak-po
```

## Database Maintenance

### Backup Database

```bash
mysqldump -u user -p laapak_po > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
mysql -u user -p laapak_po < backup_20240101.sql
```

## Monitoring

### Health Check Endpoint

The application includes error handling and logging. Monitor:

- Application logs (PM2: `pm2 logs`)
- Database connection
- API response times
- Error rates

### Recommended Monitoring Tools

- **Application**: PM2 Monitoring, Sentry
- **Database**: MySQL Workbench, phpMyAdmin
- **Server**: htop, netstat, iostat

## Security Checklist

- [ ] Environment variables are secure and not committed
- [ ] Database credentials are strong
- [ ] SSL/TLS is enabled
- [ ] Security headers are configured (already in `next.config.ts`)
- [ ] Database user has minimal required permissions
- [ ] Regular backups are scheduled
- [ ] Dependencies are up to date (`npm audit`)
- [ ] Firewall rules are configured

## Performance Optimization

1. **Database Indexing**: Ensure indexes on frequently queried fields
2. **Caching**: Consider Redis for session/data caching
3. **CDN**: Use CDN for static assets (Vercel provides this automatically)
4. **Database Connection Pooling**: Prisma handles this automatically

## Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Database Connection Issues

- Verify `DATABASE_URL` format
- Check database server is running
- Verify network connectivity
- Check firewall rules

### PDF Generation Issues

- Ensure Puppeteer dependencies are installed
- For serverless (Vercel), use `@sparticuz/chromium` instead

## Updates and Maintenance

### Update Dependencies

```bash
npm update
npm audit fix
```

### Update Database Schema

```bash
# After modifying schema.prisma
npm run db:push
# Or
npm run db:migrate
```

### Deploy Updates

1. Pull latest code
2. Install dependencies: `npm install`
3. Run migrations if needed
4. Rebuild: `npm run build`
5. Restart: `pm2 restart laapak-po` (or redeploy on Vercel)

## Support

For issues or questions, refer to:
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs
- Project README.md

