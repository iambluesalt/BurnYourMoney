#!/bin/sh
set -e

echo "🔥 WasteYourMoney — Starting up..."

# Ensure data directory exists
mkdir -p data

# Push schema to DB (creates tables if they don't exist)
echo "📦 Pushing database schema..."
npx drizzle-kit push

# Start the server
echo "🚀 Starting server on port ${PORT:-3000}..."
exec node build/server/index.js
