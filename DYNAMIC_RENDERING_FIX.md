# Dynamic Rendering Fix for Production

## Problem
Changes to data (clients, POs) require rebuilding (`npm run build`) to appear in production, even though they work fine in development.

## Root Cause
Next.js was statically optimizing pages during build time, causing them to be cached even with `dynamic = 'force-dynamic'`.

## Solution Applied

### 1. Route Segment Config
Added to all dynamic pages:
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
```

### 2. Cache Control Headers
Added to `next.config.ts`:
- `Cache-Control: no-store, no-cache, must-revalidate` for homepage and dashboard routes

### 3. Explicit No-Store
Added `unstable_noStore()` from `next/cache` to:
- Page-level (module scope)
- Function-level (inside the component)

## Pages Updated
- ✅ `/` (Homepage)
- ✅ `/dashboard/clients/[id]` (Client detail)
- ✅ `/dashboard/clients/[id]/edit` (Edit client)
- ✅ `/dashboard/clients/[id]/pos/[poId]` (Edit PO)
- ✅ `/dashboard/clients/[id]/pos/new` (New PO)

## After Deploying

1. **Build once** (to apply the changes):
   ```bash
   npm run build
   ```

2. **Restart**:
   ```bash
   pm2 restart laapak-po
   ```

3. **Test**: 
   - Add a new client → Should appear immediately
   - Delete a client → Should disappear immediately
   - Create a PO → Should appear immediately
   - No rebuild needed!

## Important Notes

- ✅ **Code changes** still require rebuild
- ✅ **Data changes** now appear immediately (no rebuild needed)
- ✅ Pages are rendered on each request (not cached)
- ✅ Browser caching is disabled via headers

## If Still Not Working

1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check PM2 logs: `pm2 logs laapak-po`
3. Verify headers: Check browser DevTools → Network → Response Headers for `Cache-Control`
4. Ensure you've rebuilt after deploying these changes

