# Mafia Video Chat - ავტომატური Git Push (PowerShell)
Write-Host "=== Mafia Video Chat - ავტომატური Git Push ===" -ForegroundColor Cyan
Write-Host ""

# შეამოწმე თუ git ინიციალიზებულია
if (-not (Test-Path ".git")) {
    Write-Host "Git რეპოზიტორიის ინიციალიზაცია..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git რეპოზიტორია ინიციალიზებულია" -ForegroundColor Green
} else {
    Write-Host "✅ Git რეპოზიტორია უკვე არსებობს" -ForegroundColor Green
}

# დააკონფიგურე git მომხმარებელი
git config --global user.name "Mafia Video Chat Bot"
git config --global user.email "bot@mafiavideo.chat"

# დაამატე ყველა ფაილი
Write-Host ""
Write-Host "ფაილების დამატება..." -ForegroundColor Yellow
git add .

# შეამოწმე თუ არის ცვლილებები
$status = git status --short
if (-not $status) {
    Write-Host ""
    Write-Host "✅ არ არის ცვლილებები დასაკომიტებლად" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ცვლილებების კომიტი..." -ForegroundColor Yellow
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
    
    Write-Host "✅ კომიტი შესრულებულია" -ForegroundColor Green
}

# შეამოწმე თუ არის remote კონფიგურირებული
try {
    $remoteUrl = git remote get-url origin 2>$null
    if (-not $remoteUrl) {
        Write-Host ""
        Write-Host "⚠️ Remote რეპოზიტორია არ არის კონფიგურირებული" -ForegroundColor Yellow
        $repoUrl = Read-Host "გთხოვთ შეიყვანოთ GitHub რეპოზიტორიის URL (მაგ: https://github.com/username/repo.git)"
        git remote add origin $repoUrl
        Write-Host "✅ Remote რეპოზიტორია დამატებულია" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Remote რეპოზიტორია არ არის კონფიგურირებული" -ForegroundColor Yellow
}

# გააკეთე push
Write-Host ""
Write-Host "Push GitHub-ზე..." -ForegroundColor Yellow
try {
    git push -u origin main
    Write-Host ""
    Write-Host "🎉 წარმატებით დაინსტალირდა GitHub-ზე!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 რეპოზიტორიის სტატისტიკა:" -ForegroundColor Cyan
    git log --oneline -5
    Write-Host ""
    Write-Host "🌐 თქვენი პროექტი ახლა ხელმისაწვდომია GitHub-ზე" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Push ვერ მოხერხდა" -ForegroundColor Red
    Write-Host "გთხოვთ შეამოწმოთ:" -ForegroundColor Yellow
    Write-Host "1. GitHub რეპოზიტორიის URL სისწორე"
    Write-Host "2. GitHub credentials"
    Write-Host "3. ინტერნეტ კავშირი"
}

Write-Host ""
Read-Host "დააჭირეთ Enter-ს გასაგრძელებლად"
