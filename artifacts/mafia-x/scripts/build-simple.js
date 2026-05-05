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

// Create a simple HTML file if it doesn't exist
const indexPath = path.join(distRoot, "index.html");
if (!fs.existsSync(indexPath)) {
  console.log("Creating index.html...");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <title>Mafia X - Loading...</title>
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
            max-width: 400px;
            padding: 40px;
        }
        .logo {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .title {
            font-size: 24px;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 16px;
            opacity: 0.8;
            margin-bottom: 30px;
        }
        .status {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-right: 10px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .buttons {
            margin-top: 20px;
        }
        .btn {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
            text-decoration: none;
            display: inline-block;
        }
        .btn:hover {
            background: rgba(255,255,255,0.3);
        }
        .error {
            background: rgba(255,0,0,0.2);
            border-color: rgba(255,0,0,0.5);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎮 Mafia X</div>
        <div class="title">Georgian Mafia Game</div>
        <div class="subtitle">Video Chat & Social Gaming</div>
        
        <div class="status">
            <div class="loading"></div>
            <span id="status">Initializing application...</span>
        </div>
        
        <div class="buttons">
            <a href="https://mafiax-api.onrender.com/api/health" class="btn">Check API Status</a>
            <button onclick="testConnection()" class="btn">Test Connection</button>
        </div>
        
        <div id="error" style="display: none;" class="status error">
            <strong>Connection Error</strong><br>
            <span id="error-message"></span>
        </div>
    </div>

    <script>
        const statusEl = document.getElementById('status');
        const errorEl = document.getElementById('error');
        const errorMessageEl = document.getElementById('error-message');
        
        async function testConnection() {
            statusEl.textContent = 'Testing API connection...';
            errorEl.style.display = 'none';
            
            try {
                const response = await fetch('https://mafiax-api.onrender.com/api/health');
                if (response.ok) {
                    const data = await response.json();
                    statusEl.textContent = '✅ API Connected successfully!';
                    setTimeout(() => {
                        statusEl.textContent = '🎮 Ready to play - Mobile app recommended';
                    }, 2000);
                } else {
                    throw new Error('API not responding');
                }
            } catch (error) {
                statusEl.textContent = '❌ Connection failed';
                errorEl.style.display = 'block';
                errorMessageEl.textContent = error.message;
            }
        }
        
        // Auto-test on load
        setTimeout(testConnection, 1000);
        
        // Update status periodically
        setInterval(() => {
            if (statusEl.textContent.includes('Ready')) return;
            const messages = ['Loading game assets...', 'Connecting to server...', 'Preparing lobby...'];
            const random = messages[Math.floor(Math.random() * messages.length)];
            statusEl.textContent = random;
        }, 3000);
    </script>
</body>
</html>`;
  fs.writeFileSync(indexPath, html);
}

console.log("✅ Simple web build completed!");
console.log("📁 Output:", distRoot);
console.log("🌐 Ready for deployment!");
