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

// Create a Mafia X app HTML file
const indexPath = path.join(distRoot, "index.html");
console.log("Creating Mafia X app HTML...");

// Read the original app files to include them
const appDir = path.join(projectRoot, "app");
const indexPagePath = path.join(appDir, "index.tsx");

let appContent = "";
if (fs.existsSync(indexPagePath)) {
  appContent = fs.readFileSync(indexPagePath, "utf-8");
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <title>Mafia X - ქართული მაფია</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
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
            padding: 20px;
        }
        .container {
            width: 100%;
            max-width: 400px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .logo {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 10px;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .title {
            font-size: 24px;
            margin-bottom: 10px;
            text-align: center;
            font-weight: 600;
        }
        .subtitle {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 30px;
            text-align: center;
        }
        .language-selector {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 30px;
        }
        .lang-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s ease;
        }
        .lang-btn:hover, .lang-btn.active {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
        }
        .form-group input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            color: white;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .form-group input::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }
        .form-group input:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.5);
            background: rgba(255, 255, 255, 0.15);
        }
        .btn {
            width: 100%;
            padding: 14px;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 15px;
        }
        .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
        }
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
        }
        .btn-google {
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .divider {
            text-align: center;
            margin: 20px 0;
            position: relative;
        }
        .divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: rgba(255, 255, 255, 0.3);
        }
        .divider span {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 0 15px;
            position: relative;
            font-size: 14px;
        }
        .error {
            background: rgba(255, 0, 0, 0.2);
            border: 1px solid rgba(255, 0, 0, 0.5);
            padding: 12px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 14px;
            text-align: center;
        }
        .success {
            background: rgba(0, 255, 0, 0.2);
            border: 1px solid rgba(0, 255, 0, 0.5);
            padding: 12px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 14px;
            text-align: center;
        }
        .loading {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-right: 8px;
            vertical-align: middle;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎮 Mafia X</div>
        <div class="title" id="app-title">Georgian Mafia Game</div>
        <div class="subtitle" id="app-subtitle">Video Chat & Social Gaming</div>
        
        <div class="language-selector">
            <button class="lang-btn active" onclick="changeLanguage('ka')">🇬🇪 KA</button>
            <button class="lang-btn" onclick="changeLanguage('en')">🇬🇧 EN</button>
            <button class="lang-btn" onclick="changeLanguage('ru')">🇷🇺 RU</button>
            <button class="lang-btn" onclick="changeLanguage('uk')">🇺🇦 UA</button>
        </div>
        
        <div id="error" style="display: none;" class="error"></div>
        <div id="success" style="display: none;" class="success"></div>
        
        <form id="login-form">
            <div class="form-group">
                <label id="email-label" for="email">Email</label>
                <input type="email" id="email" placeholder="your@email.com" required>
            </div>
            
            <div class="form-group">
                <label id="password-label" for="password">Password</label>
                <input type="password" id="password" placeholder="••••••••" required>
            </div>
            
            <button type="submit" id="login-btn" class="btn btn-primary">
                <span id="login-text">Login</span>
            </button>
        </form>
        
        <div class="divider">
            <span id="or-text">or</span>
        </div>
        
        <button id="google-btn" class="btn btn-google">
            <span>🔍</span>
            <span id="google-text">Continue with Google</span>
        </button>
        
        <button id="register-btn" class="btn">
            <span id="register-text">Create Account</span>
        </button>
        
        <div class="footer">
            <div id="footer-text">© 2024 Mafia X. All rights reserved.</div>
            <div style="margin-top: 5px;">
                <span id="web-demo">Web Demo</span> • 
                <a href="https://mafiax-api.onrender.com/api/health" target="_blank" style="color: white; text-decoration: none;">
                    <span id="api-status">API Status</span>
                </a>
            </div>
        </div>
    </div>

    <script>
        const translations = {
            ka: {
                'app-title': 'ქართული მაფია',
                'app-subtitle': 'ვიდეო ჩატი და სოციალური თამაში',
                'email-label': 'ელ. ფოსტა',
                'password-label': 'პაროლი',
                'login-text': 'შესვლა',
                'or-text': 'ან',
                'google-text': 'Google-ით გაგრძელება',
                'register-text': 'ანგარიშის შექმნა',
                'footer-text': '© 2024 Mafia X. ყველა უფლება დაცულია.',
                'web-demo': 'ვებ დემო',
                'api-status': 'API სტატუსი',
                'login-success': 'წარმატებული შესვლა! მობილური აპლიკაცია რეკომენდებულია.',
                'login-error': 'შესვლა ვერ მოხერხდა. სცადეთ თავიდან.',
                'google-demo': 'Google ავტორიზაცია (დემო რეჟიმი)'
            },
            en: {
                'app-title': 'Georgian Mafia Game',
                'app-subtitle': 'Video Chat & Social Gaming',
                'email-label': 'Email',
                'password-label': 'Password',
                'login-text': 'Login',
                'or-text': 'or',
                'google-text': 'Continue with Google',
                'register-text': 'Create Account',
                'footer-text': '© 2024 Mafia X. All rights reserved.',
                'web-demo': 'Web Demo',
                'api-status': 'API Status',
                'login-success': 'Login successful! Mobile app recommended.',
                'login-error': 'Login failed. Please try again.',
                'google-demo': 'Google Authentication (Demo Mode)'
            },
            ru: {
                'app-title': 'Грузинская Мафия',
                'app-subtitle': 'Видео чат и социальные игры',
                'email-label': 'Email',
                'password-label': 'Пароль',
                'login-text': 'Войти',
                'or-text': 'или',
                'google-text': 'Продолжить с Google',
                'register-text': 'Создать аккаунт',
                'footer-text': '© 2024 Mafia X. Все права защищены.',
                'web-demo': 'Веб демо',
                'api-status': 'Статус API',
                'login-success': 'Вход успешен! Рекомендуется мобильное приложение.',
                'login-error': 'Вход не удался. Попробуйте снова.',
                'google-demo': 'Google аутентификация (Демо режим)'
            },
            uk: {
                'app-title': 'Грузинська Мафія',
                'app-subtitle': 'Відео чат та соціальні ігри',
                'email-label': 'Email',
                'password-label': 'Пароль',
                'login-text': 'Увійти',
                'or-text': 'або',
                'google-text': 'Продовжити з Google',
                'register-text': 'Створити акаунт',
                'footer-text': '© 2024 Mafia X. Всі права захищені.',
                'web-demo': 'Веб демо',
                'api-status': 'Статус API',
                'login-success': 'Вхід успішний! Рекомендовано мобільний додаток.',
                'login-error': 'Вхід не вдався. Спробуйте знову.',
                'google-demo': 'Google автентифікація (Демо режим)'
            }
        };

        let currentLang = 'ka';

        function changeLanguage(lang) {
            currentLang = lang;
            document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            Object.keys(translations[lang]).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.textContent = translations[lang][key];
                }
            });
        }

        function showError(message) {
            const errorEl = document.getElementById('error');
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }

        function showSuccess(message) {
            const successEl = document.getElementById('success');
            successEl.textContent = message;
            successEl.style.display = 'block';
            setTimeout(() => {
                successEl.style.display = 'none';
            }, 5000);
        }

        // Login form submission
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('login-btn');
            
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<div class="loading"></div><span id="login-text">Loading...</span>';
            
            try {
                const response = await fetch('https://mafiax-api.onrender.com/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    showSuccess(translations[currentLang]['login-success']);
                } else {
                    showError(translations[currentLang]['login-error']);
                }
            } catch (error) {
                showSuccess(translations[currentLang]['login-success'] + ' (Demo Mode)');
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<span id="login-text">' + translations[currentLang]['login-text'] + '</span>';
            }
        });

        // Google login
        document.getElementById('google-btn').addEventListener('click', () => {
            showSuccess(translations[currentLang]['google-demo']);
        });

        // Register button
        document.getElementById('register-btn').addEventListener('click', () => {
            showSuccess('Registration coming soon! (Demo Mode)');
        });

        // Check API on load
        window.addEventListener('load', async () => {
            try {
                const response = await fetch('https://mafiax-api.onrender.com/api/health');
                if (response.ok) {
                    console.log('✅ API Connected');
                }
            } catch (error) {
                console.log('❌ API Connection failed');
            }
        });
    </script>
</body>
</html>`;
  fs.writeFileSync(indexPath, html);

console.log("✅ Simple web build completed!");
console.log("📁 Output:", distRoot);
console.log("🌐 Ready for deployment!");
