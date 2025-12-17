#!/bin/bash

# Fix Port 3002 Conflict Script
# Run this on your server to free port 3002 and restart the application

set -e

echo "🔍 Diagnosing Port 3002 Conflict"
echo "=================================="
echo ""

# Step 1: Check PM2 processes
echo "📋 Step 1: Checking PM2 processes..."
if command -v pm2 &> /dev/null; then
    echo "PM2 processes:"
    pm2 list
    echo ""
    
    # Stop all laapak-po related processes
    echo "🛑 Stopping all laapak-po processes..."
    pm2 stop laapak-po-dev 2>/dev/null || true
    pm2 stop laapak-po 2>/dev/null || true
    sleep 2
    
    # Delete them
    echo "🗑️  Deleting PM2 processes..."
    pm2 delete laapak-po-dev 2>/dev/null || true
    pm2 delete laapak-po 2>/dev/null || true
    sleep 2
else
    echo "⚠️  PM2 not found"
fi
echo ""

# Step 2: Find what's using port 3002
echo "🔍 Step 2: Finding processes using port 3002..."
echo ""

# Try different methods to find the process
PID=""
if command -v lsof &> /dev/null; then
    echo "Using lsof..."
    PID=$(sudo lsof -ti :3002 2>/dev/null || echo "")
elif command -v fuser &> /dev/null; then
    echo "Using fuser..."
    PID=$(sudo fuser 3002/tcp 2>/dev/null | awk '{print $NF}' | head -1 || echo "")
elif command -v netstat &> /dev/null; then
    echo "Using netstat..."
    PID=$(sudo netstat -tlnp 2>/dev/null | grep :3002 | awk '{print $7}' | cut -d'/' -f1 | head -1 || echo "")
elif command -v ss &> /dev/null; then
    echo "Using ss..."
    PID=$(sudo ss -tlnp 2>/dev/null | grep :3002 | grep -oP 'pid=\K[0-9]+' | head -1 || echo "")
fi

if [ -n "$PID" ] && [ "$PID" != "" ]; then
    echo "⚠️  Found process using port 3002: PID $PID"
    echo "Process details:"
    ps -p $PID -o pid,ppid,cmd 2>/dev/null || true
    echo ""
    echo "🔪 Killing process $PID..."
    sudo kill -9 $PID 2>/dev/null || true
    sleep 2
    echo "✅ Process killed"
else
    echo "ℹ️  No process found using lsof/fuser/netstat/ss"
    echo "   Trying alternative method..."
    
    # Alternative: Use fuser to kill directly
    if command -v fuser &> /dev/null; then
        echo "🔪 Using fuser to kill processes on port 3002..."
        sudo fuser -k 3002/tcp 2>/dev/null || true
        sleep 2
    fi
fi
echo ""

# Step 3: Verify port is free
echo "🔍 Step 3: Verifying port 3002 is free..."
sleep 2
if command -v lsof &> /dev/null; then
    REMAINING=$(sudo lsof -ti :3002 2>/dev/null || echo "")
    if [ -z "$REMAINING" ]; then
        echo "✅ Port 3002 is now free"
    else
        echo "⚠️  Port 3002 still in use by PID: $REMAINING"
        echo "   Force killing again..."
        sudo kill -9 $REMAINING 2>/dev/null || true
        sleep 2
    fi
else
    echo "⚠️  Cannot verify (lsof not available), but continuing..."
fi
echo ""

# Step 4: Clean up any zombie Node processes
echo "🧹 Step 4: Cleaning up zombie Node processes..."
# Kill any node processes that might be related (be careful with this)
# Only kill processes that are clearly related to next/laapak
pkill -f "next start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2
echo ""

# Step 5: Restart the application
echo "🚀 Step 5: Restarting application..."
if command -v pm2 &> /dev/null; then
    # Check if we should use dev or prod
    echo "Starting with production mode..."
    pm2 start npm --name laapak-po-dev -- run start:prod
    pm2 save
    
    echo ""
    echo "⏳ Waiting 3 seconds for application to start..."
    sleep 3
    
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
    
    echo ""
    echo "📋 Recent logs (last 20 lines):"
    pm2 logs laapak-po-dev --lines 20 --nostream
else
    echo "⚠️  PM2 not found. Please start manually:"
    echo "   npm run start:prod"
fi
echo ""

echo "✨ Fix Complete!"
echo ""
echo "🔍 If you still see port errors:"
echo "   1. Check: sudo lsof -i :3002"
echo "   2. Check: pm2 list"
echo "   3. Try: sudo fuser -k 3002/tcp"
echo "   4. Check for other Node processes: ps aux | grep node"
echo ""

