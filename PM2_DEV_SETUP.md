# Running Dev Server with PM2 on Production

## Why This Works Better

- ✅ Dynamic rendering by default (no caching issues)
- ✅ Hot reloading (code changes apply immediately)
- ✅ No need to rebuild after code changes
- ✅ Data changes appear immediately

## Setup Commands

### Option 1: Stop Current PM2 Process and Start Dev

```bash
# Stop the current production process
pm2 stop laapak-po
pm2 delete laapak-po

# Start dev server with PM2
pm2 start npm --name laapak-po-dev -- run dev -- --port 3002

# Save PM2 configuration
pm2 save
```

### Option 2: Use PM2 Ecosystem File (Recommended)

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'laapak-po-dev',
    script: 'npm',
    args: 'run dev -- --port 3002',
    cwd: '/path/to/laapak-po', // Update with your actual path
    env: {
      NODE_ENV: 'development',
      PORT: 3002,
    },
    instances: 1,
    autorestart: true,
    watch: false, // Set to true if you want auto-restart on file changes
    max_memory_restart: '1G',
  }]
};
```

Then run:
```bash
pm2 start ecosystem.config.js
pm2 save
```

## Important Notes

### Performance
- Dev server is slower than production build
- But for your use case (dynamic data), it's more reliable

### Security
- Dev server exposes more debugging info
- Make sure your `.env` file has correct settings
- Consider using a reverse proxy (Nginx) in front

### Nginx Configuration
Your Nginx config should work the same way - it just proxies to port 3002.

## Commands Reference

```bash
# Start dev server
pm2 start npm --name laapak-po-dev -- run dev -- --port 3002

# Stop
pm2 stop laapak-po-dev

# Restart
pm2 restart laapak-po-dev

# View logs
pm2 logs laapak-po-dev

# View status
pm2 status

# Save configuration
pm2 save
```

## After Switching to Dev

1. ✅ No more build step needed
2. ✅ Code changes apply immediately (if watch is enabled)
3. ✅ Data changes appear immediately
4. ✅ No caching issues

## If You Need to Go Back to Production

```bash
pm2 stop laapak-po-dev
pm2 delete laapak-po-dev
npm run build
pm2 start npm --name laapak-po -- run start:prod
pm2 save
```

