@echo off
chcp 65001 >nul
echo === Mafia Video Chat - ავტომატური Git Push ===
echo.

REM შეამოწმე თუ git ინიციალიზებულია
if not exist ".git" (
    echo Git რეპოზიტორიის ინიციალიზაცია...
    git init
    echo ✅ Git რეპოზიტორია ინიციალიზებულია
) else (
    echo ✅ Git რეპოზიტორია უკვე არსებობს
)

REM დააკონფიგურე git მომხმარებელი
git config --global user.name "Mafia Video Chat Bot"
git config --global user.email "bot@mafiavideo.chat"

REM დაამატე ყველა ფაილი
echo.
echo ფაილების დამატება...
git add .

REM შეამოწმე თუ არის ცვლილებები
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo.
    echo ✅ არ არის ცვლილებები დასაკომიტებლად
    goto :check_remote
) else (
    echo.
    echo ცვლილებების კომიტი...
    git commit -m "🔥 Mafia Video Chat - სრული იმპლემენტაცია

✅ ბექენდი:
- Supabase PostgreSQL მონაცემთა ბაზა
- LiveKit ვიდეო/აუდიო ინტეგრაცია
- Express.js API ენდპოინტები
- Socket.io რეალტაიმ კომუნიკაცია
- Drizzle ORM მონაცემთა ბაზის მართვა

✅ ფრონტენდი:
- Expo Go მხარდაჭერა
- ადგილების გადანაცვლების ფიქსი
- მობილურის ოპტიმიზაცია
- Expo Router ნავიგაცია

✅ დეპლოიმენტი:
- Render კონფიგურაცია
- Docker კონტეინერი
- API დოკუმენტაცია
- ტესტირების სკრიპტები"
    
    echo ✅ კომიტი შესრულებულია
)

:check_remote
REM შეამოწმე თუ არის remote კონფიგურირებული
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Remote რეპოზიტორია არ არის კონფიგურირებული
    echo.
    echo გთხოვთ შეიყვანოთ GitHub რეპოზიტორიის URL:
    echo მაგალითი: https://github.com/username/mafia-video-chat.git
    set /p repo_url="GitHub URL: "
    
    git remote add origin %repo_url%
    echo ✅ Remote რეპოზიტორია დამატებულია
)

REM გააკეთე push
echo.
echo Push GitHub-ზე...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo 🎉 წარმატებით დაინსტალირდა GitHub-ზე!
    echo.
    echo 📊 რეპოზიტორიის სტატისტიკა:
    git log --oneline -5
    echo.
    echo 🌐 თქვენი პროექტი ახლა ხელმისაწვდომია GitHub-ზე
) else (
    echo.
    echo ❌ Push ვერ მოხერხდა
    echo გთხოვთ შეამოწმოთ:
    echo 1. GitHub რეპოზიტორიის URL სისწორე
    echo 2. GitHub credentials
    echo 3. ინტერნეტ კავშირი
)

echo.
pause
