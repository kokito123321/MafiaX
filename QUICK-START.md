# 🚀 სწრაფი სტარტი - Mafia Video Chat

## 📦 ავტომატური Git Push

### ვარიანტი 1: Batch სკრიპტი (Windows)
```bash
# გაუშვით პროექტის ფოლდერში
cd "c:\Users\lchib\OneDrive\Desktop\Mafia-Video-Chat"
auto-git-push.bat
```

### ვარიანტი 2: PowerShell სკრიპტი (Windows/Mac/Linux)
```powershell
# გაუშვით პროექტის ფოლდერში
cd "c:\Users\lchib\OneDrive\Desktop\Mafia-Video-Chat"
.\auto-git-push.ps1
```

### ვარიანტი 3: ხელით ბრძანებები
```bash
# 1. პროექტის ფოლდერში გადადით
cd "c:\Users\lchib\OneDrive\Desktop\Mafia-Video-Chat"

# 2. Git ინიციალიზაცია (თუ არ არის)
git init

# 3. ფაილების დამატება
git add .

# 4. კომიტი
git commit -m "Mafia Video Chat - Initial Commit"

# 5. GitHub-ის დაკავშირება
git remote add origin https://github.com/username/mafia-video-chat.git

# 6. Push
git push -u origin main
```

## 🎯 რა მოხდება ავტომატურად?

### ✅ სკრიპტი შეასრულებს:
1. **Git ინიციალიზაციას** - თუ არ არის გაკეთებული
2. **Git კონფიგურაციას** - მომხმარებლის სახელი და email
3. **ფაილების დამატებას** - ყველა ფაილის git-ში დამატება
4. **კომიტს** - დეტალური აღწერით
5. **Remote-ის შემოწმებას** - GitHub-თან კავშირი
6. **Push-ს** - ყველა ცვლილების GitHub-ზე ატვირთვა

### 📝 კომიტის შეტყობინება შეიცავს:
- ✅ ბექენდის ფუნქციონალი
- ✅ ფრონტენდის ფიქსები
- ✅ დეპლოიმენტის კონფიგურაცია
- ✅ დოკუმენტაცია

## 🔧 ავტომატური CI/CD

### GitHub Actions
ყოველი push-ის შემდეგ ავტომატურად მოხდება:
1. **ტესტირება** - ბექენდის და ფრონტენდის შემოწმება
2. **ბილდი** - პროდაქშენ ბილდის შექმნა
3. **დეპლოიმენტი** - Render-ზე და GitHub Pages-ზე

### საჭირო Secrets (GitHub Settings > Secrets):
```
RENDER_API_KEY=your_render_api_key
RENDER_SERVICE_ID=your_render_service_id
GITHUB_TOKEN=auto_generated
```

## 📱 მობილურის ტესტირება

### Expo Go-ში გასაშვებად:
```bash
cd artifacts/mafia-x
pnpm run dev:clean
```

### QR კოდის სკანირება:
1. გაუშვით ზემოთ მოცემული ბრძანება
2. გახსენით Expo Go აპლიკაცია
3. დაასკანერეთ QR კოდი
4. დაელოდეთ აპლიკაციის ჩატვირთვას

## 🌐 ვებ ვერსიის გასაშვებად:
```bash
cd artifacts/mafia-x
pnpm run build
pnpm run serve
```

## 🗄️ ბაზის დაკავშირების შემოწმება:
```bash
node artifacts/api-server/test-setup.js
```

## 🎯 მთავარი მახასიათებლები

### ✅ შესრულებულია:
- **ბექენდი**: Express.js + Supabase + LiveKit
- **ფრონტენდი**: React Native + Expo (შეცდომების გარეშე)
- **მონაცემთა ბაზა**: PostgreSQL სქემით
- **ვიდეო/აუდიო**: LiveKit ინტეგრაცია
- **დეპლოიმენტი**: Render + Docker კონფიგურაცია
- **დოკუმენტაცია**: სრული API და setup გზამკვლევები

## 🆘 პრობლემების მოგვარება

### თუ Push ვერ მოხერხდა:
```bash
# შეამოწმეთ remote URL
git remote -v

# გადააკეთეთ თუ საჭიროა
git remote remove origin
git remote add origin https://github.com/username/repo.git

# ხელახალი push
git push -u origin main --force
```

### თუ კონფლიქტია:
```bash
# განაახლეთ კოდი
git pull origin main

# გადაჭერით კონფლიქტები
# შემდეგ:
git add .
git commit -m "Merge conflicts resolved"
git push
```

## 📞 დახმარება

### შეცდომების შემთხვევაში:
1. შეამოწმეთ [FRONTEND-FIX-GUIDE.md](FRONTEND-FIX-GUIDE.md)
2. შეამოწმეთ [SETUP-GUIDE.md](SETUP-GUIDE.md)
3. შეამოწმეთ [DEPLOYMENT.md](DEPLOYMENT.md)

### ლოგების ნახვა:
```bash
# ბოლო კომიტის ნახვა
git log --oneline -5

# ბოლო push-ის სტატუსი
git status

# შეცდომების ნახვა
git log --graph --oneline
```

---

**🎉 თქვენი პროექტი მზად არის ავტომატური განაწილებისთვის!**
