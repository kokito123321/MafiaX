# GitHub Repository Setup Guide

## 🚀 Quick Start Commands

```bash
# Navigate to project directory
cd "c:\Users\lchib\OneDrive\Desktop\Mafia-Video-Chat"

# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Mafia Video Chat with backend and frontend

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/mafia-video-chat.git

# Push to GitHub
git push -u origin main
```

## 📋 Step-by-Step Instructions

### 1. Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Repository name: `mafia-video-chat`
4. Description: `Mafia Video Chat with LiveKit integration`
5. Choose Public or Private
6. Don't initialize with README (we have one)
7. Click "Create repository"

### 2. Initialize Local Git Repository
```bash
# Navigate to project
cd "c:\Users\lchib\OneDrive\Desktop\Mafia-Video-Chat"

# Initialize git
git init

# Configure git (if not already configured)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Add Files to Git
```bash
# Add all files
git add .

# Check status
git status

# Commit changes
git commit -m "Initial commit: Mafia Video Chat with backend and frontend

- Backend: Express.js with Supabase and LiveKit integration
- Frontend: React Native with Expo and seat swapping fixes
- Database: PostgreSQL with complete schema
- Deployment: Render and Docker configurations
- Documentation: Comprehensive setup and API docs"
```

### 4. Connect to GitHub
```bash
# Add remote (replace with your actual repository URL)
git remote add origin https://github.com/yourusername/mafia-video-chat.git

# Verify remote
git remote -v

# Push to GitHub
git push -u origin main
```

## 🌐 Web Deployment Setup

### Option 1: GitHub Pages (Free)
```bash
# Install gh-pages for frontend deployment
cd artifacts/mafia-x
npm install --save-dev gh-pages

# Update package.json with homepage
# Add to package.json:
# "homepage": "https://yourusername.github.io/mafia-video-chat"

# Build and deploy
npm run build
npx gh-pages -d web-build -b gh-pages
```

### Option 2: Vercel (Recommended for React)
1. Connect GitHub account to [Vercel](https://vercel.com)
2. Import `mafia-video-chat` repository
3. Configure build settings:
   - Framework: Expo
   - Build Command: `cd artifacts/mafia-x && npm run build`
   - Output Directory: `artifacts/mafia-x/dist`
4. Deploy

### Option 3: Netlify
1. Connect to [Netlify](https://netlify.com)
2. Import from GitHub
3. Build settings:
   - Build command: `cd artifacts/mafia-x && npm run build`
   - Publish directory: `artifacts/mafia-x/web-build`
4. Deploy

## 📱 Mobile App Deployment

### Expo Go (Development)
1. Start development server:
   ```bash
   cd artifacts/mafia-x
   pnpm run dev:clean
   ```
2. Scan QR code with Expo Go app
3. Test all features

### Expo EAS (Production)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Deploy to stores
eas submit --platform android
eas submit --platform ios
```

## 🔧 Repository Structure

```
mafia-video-chat/
├── .gitignore                    # Git ignore rules
├── README.md                     # Project overview
├── DEPLOYMENT.md                 # Deployment guide
├── SETUP-GUIDE.md               # Setup instructions
├── API-DOCUMENTATION.md          # API reference
├── FRONTEND-FIX-GUIDE.md         # Frontend fixes
├── IMPLEMENTATION-STATUS.md       # Implementation status
├── GITHUB-SETUP-GUIDE.md       # This file
├── artifacts/
│   ├── api-server/              # Backend application
│   │   ├── .env               # Environment variables
│   │   ├── render.yaml         # Render deployment
│   │   ├── Dockerfile          # Docker configuration
│   │   ├── migrate.sql         # Database migration
│   │   ├── src/               # Source code
│   │   └── package.json       # Dependencies
│   └── mafia-x/               # Frontend application
│       ├── app/                # App screens
│       ├── components/          # React components
│       ├── contexts/           # React contexts
│       ├── app.json            # Expo configuration
│       ├── package.json        # Dependencies
│       └── metro.config.js     # Metro bundler config
└── lib/
    ├── db/                    # Database schema and config
    └── api-zod/             # API validation schemas
```

## 🏷️ Branching Strategy

### Main Branch
- `main` - Production-ready code
- All features merged here after testing

### Development Branches
- `feature/seat-swapping-fix` - Frontend fixes
- `feature/backend-api` - Backend development
- `feature/livekit-integration` - Video/audio features

### Release Tags
- `v1.0.0` - Initial release
- `v1.1.0` - Seat swapping fixes
- `v1.2.0` - LiveKit integration

## 📝 Commit Message Format

```
<type>(<scope>): <description>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

### Examples
```
feat(frontend): Add seat swapping error handling

Fixes crash in Expo Go when host swaps player seats.
Added validation and try-catch blocks to prevent null reference errors.

Closes #1
```

```
fix(backend): Add database initialization

Auto-create tables and indexes when server starts.
Prevents manual database setup requirements.

Closes #2
```

## 🔐 Security Considerations

### Environment Variables
- `.env` files are in `.gitignore`
- Use GitHub Secrets for production
- Never commit sensitive data

### API Keys
- LiveKit keys stored securely
- Database credentials protected
- Session tokens properly hashed

## 🚀 CI/CD Setup

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Mafia Video Chat

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to Render
      run: |
        curl -X POST \
          -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
          -H "Content-Type: application/json" \
          -d '{"serviceId": "your-service-id"}' \
          https://api.render.com/v1/services/your-service-id/deploys
```

## 📊 Project Statistics

### Files Created
- **Backend**: 15+ files including API, database, deployment
- **Frontend**: 20+ files including screens, components, configs
- **Documentation**: 8 comprehensive guides
- **Configuration**: Complete deployment and CI/CD setup

### Features Implemented
- ✅ User authentication with bcrypt
- ✅ Room management with seat swapping
- ✅ LiveKit video/audio integration
- ✅ Real-time messaging with Socket.io
- ✅ Mobile-optimized frontend
- ✅ Production deployment ready

## 🎯 Next Steps After GitHub Setup

1. **Repository Live**: Push code to GitHub
2. **Web Deployment**: Set up Vercel/Netlify for frontend
3. **Backend Deployment**: Deploy to Render using render.yaml
4. **Testing**: Test all features in production
5. **Documentation**: Update README with live URLs
6. **Monitoring**: Set up error tracking and analytics

---

**Your Mafia Video Chat project is ready for GitHub deployment with comprehensive documentation and deployment automation!**
