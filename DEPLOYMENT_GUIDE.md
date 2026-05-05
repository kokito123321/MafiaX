# Mafia X - Render Deployment Guide

## პრობლემის აღწერა

აპლიკაცია წარმატებით არის deploy-ზე Render-ზე, მაგრამ ვებ აპლიკაციას ვერ ხედავდით ("Cannot GET /" შეცდომა). ეს იყო იმიტომ, რომ მხოლოდ API სერვერი იყო კონფიგურირებული.

## ✅ გასწორებული პრობლემები

### 1. **Render.yaml კონფიგურაცია**
დაემატა ორი სერვისი:
- **mafiax-api** - Backend API სერვერი
- **mafiax-app** - Frontend ვებ აპლიკაცია

### 2. **ვებ სერვერის შექმნა**
შექმნილია `server/web-server.js` - მარტივი Node.js სერვერი ვებ აპლიკაციისთვის.

### 3. **API URL კონფიგურაცია**
განახლებულია `lib/api.ts` რომ გამოიყენოს გარემოს ცვლადები პროდუქშენში.

### 4. **ვებ აპლიკაციის სტრუქტურა**
შექმნილია `public/index.html` და საჭირო სკრიპტები.

## 🚀 როგორ განავლოთ ცვლილებები Render-ზე

### 1. **Push ცვლილებები GitHub-ზე**
```bash
git add .
git commit -m "Add frontend web service for Render deployment"
git push origin main
```

### 2. **Render-ზე ახალი სერვისის შექმნა**
1. შედით Render Dashboard-ში
2. დააჭირეთ "New +" -> "Web Service"
3. აირჩიეთ GitHub რეპოზიტორია
4. დააყენეთ სახელი: `mafiax-app`
5. Runtime: `Node`
6. Build Command: `cd artifacts/mafia-x && npm run build:web`
7. Start Command: `cd artifacts/mafia-x && node server/web-server.js`

### 3. **გარემოს ცვლადების დაყენება**
Environment Variables-ში დაამატეთ:
- `NODE_VERSION`: `20.18.1`
- `EXPO_PUBLIC_API_URL`: `https://mafiax-api.onrender.com`

## 📱 როგორ გატესტოთ აპლიკაცია

### 1. **ლოკალური ტესტირება**
```bash
# API სერვერის გაშვება
cd artifacts/api-server
npm start

# ვებ აპლიკაციის გაშვება
cd artifacts/mafia-x
npm run build:web
node server/web-server.js
```

### 2. **ვებ ტესტირება**
- API: `http://localhost:8080/api/health`
- აპლიკაცია: `http://localhost:3000`

### 3. **პროდუქშენის ტესტირება**
- API: `https://mafiax-api.onrender.com/api/health`
- აპლიკაცია: `https://mafiax-app.onrender.com`

## 🔧 ცვლილებების დეტალები

### render.yaml
```yaml
services:
  # API Server
  - type: web
    name: mafiax-api
    # ... (existing config)
  
  # Frontend Web App
  - type: web
    name: mafiax-app
    runtime: node
    plan: free
    buildCommand: >-
      corepack enable && corepack prepare pnpm@9.15.9 --activate
      && pnpm install --no-frozen-lockfile 
      && cd artifacts/mafia-x && pnpm install --no-frozen-lockfile 
      && pnpm run build:web
    startCommand: cd artifacts/mafia-x && node server/web-server.js
    envVars:
      - key: NODE_VERSION
        value: 20.18.1
      - key: EXPO_PUBLIC_API_URL
        value: https://mafiax-api.onrender.com
```

### lib/api.ts
```typescript
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? Platform.select({
  ios: "https://mafiax-44op.onrender.com/api",
  android: "https://mafiax-44op.onrender.com/api",
  web: "https://mafiax-44op.onrender.com/api",
  default: "https://mafiax-44op.onrender.com/api",
}) ?? "https://mafiax-44op.onrender.com/api";
```

## 🎯 შემდეგი ნაბიჯები

1. **Push ცვლილებები GitHub-ზე**
2. **შექმენით ახალი Web Service Render-ზე**
3. **დააყენეთ Environment Variables**
4. **Deploy-ზე დააკვირთეთ აპლიკაცია**
5. **გატესტეთ ფუნქციონალი**

## 📋 ტესტირების ჩეკლისტი

- [ ] API სერვერი მუშაობს
- [ ] ვებ აპლიკაცია იტვირთება
- [ ] ენის შეცვლა მუშაობს
- [ ] რეგისტრაცია/ლოგინი მუშაობს
- [ ] ოთახების სია ჩანს
- [ ] პროფილის გვერდი მუშაობს

## 🔍 ცნობიერებები

- **კამერა/მიკროფონი** ვებში შეზღუდულია უსაფრთხოების გამო
- **LiveKit ვიდეო** შეიძლება არ მუშაობდეს localhost-ზე
- **ნამდვილი გადახდები** არ არის ჩართული (demo რეჟიმი)

ამ კონფიგურაციით აპლიკაცია უნდა იმუშაოს Render-ზე და ხელმისაწვდომი იქნება ვებსაში!
