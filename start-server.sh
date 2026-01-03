#!/bin/bash
# Start local development server for Montgomery County MD Networking App

echo "Starting local development server..."
echo "Server will be available at http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
# Check if Python 2 is available
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
# Check if Node.js http-server is available
elif command -v npx &> /dev/null; then
    npx http-server -p 8000
else
    echo "Error: No suitable server found. Please install Python 3 or Node.js."
    exit 1
fi

