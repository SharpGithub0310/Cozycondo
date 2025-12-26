#!/bin/sh

# Docker entrypoint script for Cozy Condo
# Handles inotify limits and other runtime configurations

# Increase inotify limits if possible (requires privileged container or appropriate capabilities)
if [ -w /proc/sys/fs/inotify/max_user_watches ]; then
  echo 524288 > /proc/sys/fs/inotify/max_user_watches
  echo "✅ Increased inotify watches limit"
fi

if [ -w /proc/sys/fs/inotify/max_user_instances ]; then
  echo 512 > /proc/sys/fs/inotify/max_user_instances
  echo "✅ Increased inotify instances limit"
fi

# Set Node.js memory limit for better performance
export NODE_OPTIONS="--max-old-space-size=2048"

# Disable Next.js telemetry for production
export NEXT_TELEMETRY_DISABLED=1

# Start the application
echo "🚀 Starting Cozy Condo application..."
exec "$@"