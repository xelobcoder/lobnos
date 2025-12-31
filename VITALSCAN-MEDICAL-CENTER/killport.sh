#!/bin/bash

# Script to kill process running on port 5000 in Windows using Git Bash

echo "Finding process using port 5000..."

# Find the PID of the process using port 5000 (properly formatted)
PID=$(netstat -ano | grep ':2377 ' | grep 'LISTENING' | awk '{print $5}' | head -1 | tr -d '\r\n')

if [ -z "$PID" ]; then
  echo "No process found running on port 5000"
  exit 0
fi

echo "Found process with PID: $PID"

# Kill the process (using proper Windows syntax)
if cmd //c "taskkill /PID $PID /F" 2>/dev/null; then
  echo "Successfully killed process $PID running on port 5000"
else
  echo "Failed to kill process $PID (process may have already ended)"
fi