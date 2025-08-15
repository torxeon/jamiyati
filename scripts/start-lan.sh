#!/bin/bash
echo ""
echo "====================================="
echo " Islamic Center Charity Association"
echo "       LAN Server Starter"
echo "====================================="
echo ""
# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
# Check if lan-server.js exists
if [ ! -f "lan-server.js" ]; then
    echo "ERROR: lan-server.js not found!"
    echo "Please make sure you're running this from the scripts folder."
    exit 1
fi
echo "Starting LAN server..."
echo ""
echo "This will allow access from other devices on your network."
echo "The server will display network URLs when ready."
echo ""
echo "Press Ctrl+C to stop the server when you're done."
echo ""
# Make sure we have Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
# Start the server
node lan-server.js