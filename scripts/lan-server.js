#!/usr/bin/env node
/**
 * LAN Server for Islamic Center Charity Association
 * Allows access from other devices on the same network
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
// Configuration
const PORT = process.env.PORT || 8080;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
// MIME types
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf'
};
// Get local network IP addresses
function getNetworkIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
            if (!interface.internal && interface.family === 'IPv4') {
                ips.push(interface.address);
            }
        }
    }
    
    return ips;
}
// Create HTTP server
const server = http.createServer((req, res) => {
    // Enable CORS for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS requests (preflight)
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Parse URL and get file path
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // Remove query parameters
    filePath = filePath.split('?')[0];
    
    // Security: prevent directory traversal
    filePath = path.normalize(filePath);
    if (filePath.includes('..')) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }
    
    // Full path to the file
    const fullPath = path.join(FRONTEND_DIR, filePath);
    
    // Get file extension
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Check if file exists and serve it
    fs.readFile(fullPath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html lang="ar" dir="rtl">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>404 - الصفحة غير موجودة</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            h1 { color: #dc3545; }
                        </style>
                    </head>
                    <body>
                        <h1>404 - الصفحة غير موجودة</h1>
                        <p>الصفحة التي تبحث عنها غير موجودة.</p>
                        <a href="/">العودة للصفحة الرئيسية</a>
                    </body>
                    </html>
                `);
            } else {
                // Server error
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            // Success - serve the file
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});
// Start server
server.listen(PORT, '0.0.0.0', () => {
    const networkIPs = getNetworkIPs();
    
    console.log('\n🌐 Islamic Center Charity Association - LAN Server Started');
    console.log('=' .repeat(60));
    console.log(`✅ Server is running on port ${PORT}`);
    console.log('\n📱 Access from this device:');
    console.log(`   http://localhost:${PORT}`);
    console.log(`   http://127.0.0.1:${PORT}`);
    
    if (networkIPs.length > 0) {
        console.log('\n📲 Access from other devices on the same network:');
        networkIPs.forEach(ip => {
            console.log(`   http://${ip}:${PORT}`);
        });
        
        console.log('\n📋 Instructions for mobile/other devices:');
        console.log('1. Make sure your device is connected to the same WiFi network');
        console.log('2. Open a web browser on your mobile device');
        console.log('3. Type one of the network URLs above');
        console.log('4. The application should load and work normally');
    } else {
        console.log('\n⚠️  Could not detect network IP addresses');
        console.log('   Make sure you are connected to a network');
    }
    
    console.log('\n🛑 To stop the server, press Ctrl+C');
    console.log('=' .repeat(60));
});
// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down server...');
    server.close(() => {
        console.log('Server stopped successfully');
        process.exit(0);
    });
});
// Error handling
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please choose a different port.`);
        console.error(`   Example: PORT=8081 node lan-server.js`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});