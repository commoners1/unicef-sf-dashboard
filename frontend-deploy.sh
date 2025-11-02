#!/usr/bin/env bash
set -euo pipefail

echo "=== React Frontend Deployment Script ==="

# 1. Clean install
echo "[1/4] Installing dependencies..."
npm ci

# 2. Clean old build and rebuild
echo "[2/4] Building production build..."
rm -rf build
npm run build

# 3. Create deploy folder (optional if you want to zip only the build)
echo "[3/4] Preparing deploy folder..."
rm -rf deploy && mkdir deploy
cp -r build deploy/
[ -f ".env.production" ] && cp .env.production deploy/

# 4. Zip build
echo "[4/4] Zipping build folder..."
rm -f frontend-build.zip
(cd deploy && zip -r ../frontend-build.zip .)

echo ""
echo "✅ Done! 'frontend-build.zip' is ready."
echo "Upload the CONTENTS of 'deploy/build/' (or unzip 'frontend-build.zip')"
echo "into '/public_html' on your cPanel hosting."
echo ""
