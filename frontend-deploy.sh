#!/usr/bin/env bash
set -euo pipefail

echo "=== Vite Frontend Deployment ==="

# 1) Clean install (repeatable builds)
echo "[1/4] Installing deps..."
npm ci

# 2) Build production (outputs to dist/)
echo "[2/4] Building Vite app..."
rm -rf dist
npm run build

# 3) Prepare deploy folder (optional staging before zip)
echo "[3/4] Staging files..."
rm -rf deploy && mkdir deploy
cp -r dist deploy/
# If you keep an .htaccess for SPA routing, include it:
# (see snippet below; place it at project root)
[ -f ".htaccess" ] && cp .htaccess deploy/dist/

# 4) Zip for upload
echo "[4/4] Zipping dist -> frontend-dist.zip"
# rm -f frontend-dist.zip
# ( cd deploy && zip -r ../frontend-dist.zip dist )

echo
echo "✅ Done! Upload the CONTENTS of 'dist/' (or unzip 'frontend-dist.zip')"
echo "into '/public_html' on cPanel."
echo
