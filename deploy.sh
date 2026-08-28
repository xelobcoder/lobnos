#!/bin/bash

set -e

echo "======================================"
echo "PrimeLabSys deployment started"
echo "======================================"

echoecho
echo "Fetching the latest changes..."
git fetch origin

echo
echo "Backing up production files..."

if [ -f .env ]; then
    cp .env /tmp/pls.env.bak
fi

if [ -f package.json ]; then
    cp package.json /tmp/pls.package.json.bak
fi

if [ -f package-lock.json ]; then
    cp package-lock.json /tmp/pls.package-lock.json.bak
fi

if [ -f next.config.js ]; then
    cp next.config.js /tmp/pls.next.config.js.bak
fi

echo
echo "Pulling updates..."
git pull --autostash

echo
echo "Restoring production files..."

if [ -f /tmp/pls.env.bak ]; then
    cp /tmp/pls.env.bak .env
fi

if [ -f /tmp/pls.package.json.bak ]; then
    cp /tmp/pls.package.json.bak package.json
fi

if [ -f /tmp/pls.package-lock.json.bak ]; then
    cp /tmp/pls.package-lock.json.bak package-lock.json
fi

if [ -f /tmp/pls.next.config.js.bak ]; then
    cp /tmp/pls.next.config.js.bak next.config.js
fi

echo
echo "Installing dependencies..."
pnpm install

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