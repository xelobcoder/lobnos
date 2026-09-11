#!/bin/bash

# Build script for Electron app on Linux/macOS
# Usage: ./build-electron.sh [version]

set -e

echo "========================================"
echo "Lobnos LIMS Electron Build Script"
echo "========================================"
echo ""

# Get version from argument or package.json
VERSION=${1:-""}
if [ -z "$VERSION" ]; then
    echo "[INFO] No version specified, using current package.json version"
else
    echo "[INFO] Building version: $VERSION"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm is not installed"
    exit 1
fi

# Clean previous builds
echo "[STEP 1] Cleaning previous builds..."
rm -rf dist
rm -rf .next
echo "Cleaned"

# Install dependencies
echo ""
echo "[STEP 2] Installing dependencies..."
npm install

# Build Next.js
echo ""
echo "[STEP 3] Building Next.js frontend..."
npm run build

# Build Electron
echo ""
echo "[STEP 4] Building Electron app..."
npm run electron:build

echo ""
echo "========================================"
echo "Build completed successfully!"
echo "========================================"
echo "Installers available in: dist/"
echo ""
