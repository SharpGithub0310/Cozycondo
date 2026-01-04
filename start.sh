#!/bin/bash
set -e  # Exit on any error

# Set environment variables with defaults
export NODE_ENV=production
export HOSTNAME="0.0.0.0"
export PORT=${PORT:-3000}
export NODE_OPTIONS="--max-old-space-size=512 --enable-source-maps=false"

# Startup performance optimizations
STARTUP_START_TIME=$(date +%s)

# Production debugging - always log critical startup info
echo "🚀 [$(date)] Container startup initiated"
echo "📊 Environment: NODE_ENV=$NODE_ENV, PORT=$PORT, HOSTNAME=$HOSTNAME"
echo "💾 Memory: NODE_OPTIONS=$NODE_OPTIONS"

# Silent startup mode for faster deployment
SILENT_MODE=${SILENT_MODE:-true}

if [ "$SILENT_MODE" != "true" ]; then
    echo "=== Next.js Standalone Server Startup ==="
    echo "Starting on port $PORT (env: $NODE_ENV)"
fi

# Fast validation - only check critical paths
if [ ! -f ".next/standalone/server.js" ]; then
    echo "FATAL: server.js not found in .next/standalone/" >&2
    exit 1
fi

# Validate critical environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "WARN: NEXT_PUBLIC_SUPABASE_URL not set - database features may not work" >&2
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "WARN: SUPABASE_SERVICE_ROLE_KEY not set - server-side database access may fail" >&2
fi

# Verify static files are present (built during nixpacks build phase)
if [ ! -d ".next/standalone/public" ]; then
    echo "FATAL: public files missing from standalone build" >&2
    exit 1
fi

if [ ! -d ".next/standalone/.next/static" ]; then
    echo "FATAL: static files missing from standalone build" >&2
    exit 1
fi

# Navigate to standalone directory
cd .next/standalone

# Performance monitoring
if [ "$SILENT_MODE" != "true" ]; then
    SETUP_TIME=$(($(date +%s) - STARTUP_START_TIME))
    echo "Setup completed in ${SETUP_TIME}s"
fi

# Production diagnostics - always logged for debugging
echo "📁 Working directory: $(pwd)"
echo "📄 Server file: $(ls -la server.js 2>/dev/null || echo 'NOT FOUND')"
echo "📂 Static files: $(ls -la .next/static/ 2>/dev/null | wc -l || echo '0') files"
echo "🌐 Network binding: $HOSTNAME:$PORT"
echo "⏰ [$(date)] Starting Node.js server process..."

# Final startup diagnostics
if [ "$SILENT_MODE" != "true" ]; then
    echo "=== Starting Next.js Server ==="
    echo "Port: $PORT"
    echo "Environment: $NODE_ENV"
    echo "Memory limit: 512MB"
    echo "Working directory: $(pwd)"
fi

# Test if port is available before starting
if netstat -tuln 2>/dev/null | grep -q ":$PORT "; then
    echo "⚠️  WARNING: Port $PORT already in use!" >&2
fi

# Start the server with optimizations and error handling
echo "🔄 Executing: node server.js"
exec node \
    --max-old-space-size=512 \
    --enable-source-maps=false \
    --unhandled-rejections=strict \
    --trace-warnings \
    server.js