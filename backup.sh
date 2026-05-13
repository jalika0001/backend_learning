#!/bin/bash

# Data Backup Script for Render
# Run this before each session to backup users.json, items.json, and uploads to GitHub

echo "🔄 Starting data backup to GitHub..."

# Check if we're in the Node backend directory
if [ ! -f "app.js" ]; then
  echo "❌ Error: Please run this script from the Node backend directory (d:\React + Node\Node)"
  exit 1
fi

# Add data files
echo "📦 Staging data files..."
git add src/db/users.json src/db/items.json uploads/ 2>/dev/null || echo "⚠️  Some files may not exist yet"

# Check if there are changes to commit
if git diff --cached --quiet; then
  echo "✅ No changes to backup."
  exit 0
fi

# Commit
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
echo "💾 Committing with timestamp..."
git commit -m "backup: save users, items, and uploads data ($TIMESTAMP)"

# Push to GitHub
echo "📤 Pushing to GitHub..."
if git push origin main; then
  echo "✅ Backup complete! Data saved to GitHub."
else
  echo "❌ Push failed. Check your git configuration."
  exit 1
fi
