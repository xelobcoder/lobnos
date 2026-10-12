#!/bin/bash

set -e

echo "======================================"
echo "PrimeLabSys deployment started"
echo "======================================"

echo
echo "Fetching the latest changes..."
git fetch origin

echo
echo "Backing up production files..."

if [ -f .env ]; then
    cp .env /tmp/pls.env.bak
fi

echo
echo "Pulling updates..."
git pull --autostash

echo
echo "Restoring production files..."

if [ -f /tmp/pls.env.bak ]; then
    cp /tmp/pls.env.bak .env
fi

echo
echo "Installing dependencies..."
pnpm install

echo
echo "Running application tests..."
pnpm run test

echo
echo "Building the application..."
pnpm run build

echo
echo "Restarting PM2..."
pm2 restart all

echo
echo "======================================"
echo "Deployment completed successfully"
echo "======================================"