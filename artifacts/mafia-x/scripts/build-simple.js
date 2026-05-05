/**
 * Simple build script for web deployment without Expo
 * Copies static files and creates a basic web build
 */

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");

console.log("Starting simple web build...");

// Clean and create dist directory
if (fs.existsSync(distRoot)) {
  fs.rmSync(distRoot, { recursive: true });
}
fs.mkdirSync(distRoot, { recursive: true });

// Copy public directory to dist
const publicDir = path.join(projectRoot, "public");
if (fs.existsSync(publicDir)) {
  console.log("Copying public files...");
  fs.cpSync(publicDir, distRoot, { recursive: true });
}

// Create a simple HTML file
const indexPath = path.join(distRoot, "index.html");
console.log("Creating index.html...");
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <title>Mafia X - Georgian Mafia Game</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            text-align: center;
            max-width: 500px;
            padding: 40px;
        }
        .logo {
            font-size: 64px;
            font-weight: bold;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            animation: pulse 2s infinite;
        }
        .title {
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: 600;
        }
        .subtitle {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 40px;
        }
        .status {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .loading {
            display: inline-block;
            width: 24px;
            height: 24px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-right: 12px;
            vertical-align: middle;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .buttons {
            margin-top: 30px;
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .btn {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
            padding: 15px 30px;
            border-radius: 10px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s ease;
            min-width: 150px;
        }
        .btn:hover {
            background: rgba(255,255,255,0.3);
            border-color: rgba(255,255,255,0.5);
            transform: translateY(-2px);
        }
        .error {
            background: rgba(255,0,0,0.2);
            border-color: rgba(255,0,0,0.5);
        }
        .success {
            background: rgba(0,255,0,0.2);
            border-color: rgba(0,255,0,0.5);
        }
        .features {
            margin-top: 40px;
            text-align: left;
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        .features h3 {
            margin-top: 0;
            margin-bottom: 15px;
            text-align: center;
        }
        .features ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .features li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        .features li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #4ade80;
            font-weight: bold;
        }
        .mobile-badge {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            margin-bottom: 20px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎮 Mafia X</div>
        <div class="title">Georgian Mafia Game</div>
        <div class="subtitle">Video Chat & Social Gaming Platform</div>
        
        <div class="mobile-badge">
            📱 Mobile App Available • Web Demo Below
        </div>
        
        <div class="status" id="status-container">
            <div class="loading"></div>
            <span id="status">Initializing application...</span>
        </div>
        
        <div class="buttons">
            <a href="https://mafiax-api.onrender.com/api/health" class="btn" target="_blank">🔍 Check API</a>
            <button onclick="testConnection()" class="btn">🧪 Test Connection</button>
            <button onclick="showInfo()" class="btn">📋 App Info</button>
        </div>
        
        <div id="error" style="display: none;" class="status error">
            <strong>❌ Connection Error</strong><br>
            <span id="error-message"></span>
        </div>
        
        <div id="info" style="display: none;" class="status success">
            <strong>🎮 Mafia X Features</strong><br>
            <div class="features">
                <ul>
                    <li>Multi-language support (GE, EN, RU, UA)</li>
                    <li>Real-time video chat with LiveKit</li>
                    <li>11-player game rooms</li>
                    <li>X coins virtual economy</li>
                    <li>Google authentication</li>
                    <li>Avatar customization</li>
                    <li>Lobby chat system</li>
                    <li>Host management tools</li>
                </ul>
            </div>
        </div>
    </div>

    <script>
        const statusEl = document.getElementById('status');
        const statusContainer = document.getElementById('status-container');
        const errorEl = document.getElementById('error');
        const errorMessageEl = document.getElementById('error-message');
        const infoEl = document.getElementById('info');
        
        async function testConnection() {
            statusEl.textContent = 'Testing API connection...';
            statusContainer.className = 'status';
            errorEl.style.display = 'none';
            infoEl.style.display = 'none';
            
            try {
                const response = await fetch('https://mafiax-api.onrender.com/api/health');
                if (response.ok) {
                    const data = await response.json();
                    statusEl.textContent = '✅ API Connected successfully!';
                    statusContainer.className = 'status success';
                    setTimeout(() => {
                        statusEl.textContent = '🎮 Backend ready - Download mobile app for full experience';
                    }, 2000);
                } else {
                    throw new Error('API not responding');
                }
            } catch (error) {
                statusEl.textContent = '❌ Connection failed';
                statusContainer.className = 'status error';
                errorEl.style.display = 'block';
                errorMessageEl.textContent = error.message;
            }
        }
        
        function showInfo() {
            errorEl.style.display = 'none';
            statusContainer.style.display = 'none';
            infoEl.style.display = infoEl.style.display === 'none' ? 'block' : 'none';
        }
        
        // Auto-test on load
        setTimeout(testConnection, 1000);
        
        // Update status periodically
        setInterval(() => {
            if (statusEl.textContent.includes('ready') || statusEl.textContent.includes('✅')) return;
            const messages = ['🔄 Loading game assets...', '🌐 Connecting to server...', '🎯 Preparing lobby...', '⚡ Optimizing experience...'];
            const random = messages[Math.floor(Math.random() * messages.length)];
            statusEl.textContent = random;
        }, 3000);
    </script>
</body>
</html>`;
  fs.writeFileSync(indexPath, html);

console.log("✅ Simple web build completed!");
console.log("📁 Output:", distRoot);
console.log("🌐 Ready for deployment!");
