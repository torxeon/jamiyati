@echo off
echo.
echo =====================================
echo  Islamic Center Charity Association
echo        LAN Server Starter
echo =====================================
echo.
cd /d "%~dp0"
if not exist "lan-server.js" (
    echo ERROR: lan-server.js not found!
    echo Please make sure you're running this from the scripts folder.
    pause
    exit /b 1
)
echo Starting LAN server...
echo.
echo This will allow access from other devices on your network.
echo The server will display network URLs when ready.
echo.
echo Press Ctrl+C to stop the server when you're done.
echo.
node lan-server.js
pause