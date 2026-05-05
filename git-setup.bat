@echo off
echo === Mafia Video Chat - Git Setup Script ===
echo.

REM Check if git is initialized
if not exist ".git" (
    echo Initializing git repository...
    git init
    echo Git repository initialized.
) else (
    echo Git repository already exists.
)

REM Add all files
echo Adding files to git...
git add .

REM Check if there are changes to commit
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo No changes to commit.
    echo.
    echo Repository is ready for push.
) else (
    echo Committing changes...
    git commit -m "Initial commit: Mafia Video Chat with backend and frontend

- Backend: Express.js with Supabase and LiveKit integration
- Frontend: React Native with Expo and seat swapping fixes  
- Database: PostgreSQL with complete schema
- Deployment: Render and Docker configurations
- Documentation: Comprehensive setup and API docs
- Fixes: Expo Go transform errors resolved"
    
    echo Changes committed successfully.
)

echo.
echo === Next Steps ===
echo 1. Create GitHub repository at: https://github.com/new
echo 2. Replace 'yourusername' in the command below:
echo 3. Run: git remote add origin https://github.com/yourusername/mafia-video-chat.git
echo 4. Run: git push -u origin main
echo.
echo Repository is ready for GitHub push!
pause
