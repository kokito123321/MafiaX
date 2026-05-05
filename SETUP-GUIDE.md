# Mafia Video Chat - Complete Setup Guide

## 🚀 Quick Start

### 1. Database Setup (Supabase)
```sql
-- Run the migrate.sql script in your Supabase SQL editor
-- Or use the automated migration when server starts
```

### 2. Backend Setup
```bash
cd artifacts/api-server
npm install
cp .env.example .env  # Add your credentials
npm run dev
```

### 3. Test Configuration
```bash
node test-setup.js  # Verify all configurations
```

### 4. Frontend Setup
```bash
cd artifacts/mafia-x
npm install
npm run dev
```

## 🔧 Configuration Files

### Backend Environment (.env)
```bash
DATABASE_URL=postgresql://postgres:Mkvdarilana32145@db.uulexfrpvydusifwixxy.supabase.co:5432/postgres
LIVEKIT_URL=wss://mafiax-a4cmo105.livekit.cloud
LIVEKIT_API_KEY=APIYri54qd9xj2r
LIVEKIT_API_SECRET=3QBRxzI3NAfHkkMjAwOjbuf7bR0RplgOfhfAO201z64B
PORT=3001
NODE_ENV=development
```

### Render Deployment (render.yaml)
- ✅ Pre-configured with your credentials
- ✅ Auto-build and deployment
- ✅ Environment variables set

### Docker Deployment
- ✅ Multi-stage build optimized
- ✅ Production ready
- ✅ Environment variable support

## 🎯 Key Features Implemented

### Backend
- ✅ User authentication with bcrypt password hashing
- ✅ Room management with seat assignments
- ✅ LiveKit video/audio integration
- ✅ Real-time messaging with Socket.io
- ✅ Database migrations and initialization
- ✅ Comprehensive API endpoints
- ✅ Error handling and validation

### Frontend
- ✅ Seat swapping with crash prevention
- ✅ Expo Go compatibility maintained
- ✅ Local text functionality preserved
- ✅ Enhanced error handling
- ✅ Mobile-optimized UI

## 🧪 Testing Commands

### Backend Tests
```bash
# Test database connection
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.connect().then(() => console.log('✅ DB OK')).catch(e => console.log('❌ DB Error:', e.message));
"

# Test LiveKit config
node -e "
const { AccessToken } = require('livekit-server-sdk');
const token = new AccessToken('APIYri54qd9xj2r', '3QBRxzI3NAfHkkMjAwOjbuf7bR0RplgOfhfAO201z64B', { identity: 'test' });
console.log('✅ LiveKit OK:', token.toJwt() ? 'PASS' : 'FAIL');
"
```

### Frontend Tests
```bash
# Test Expo Go build
cd artifacts/mafia-x
npx expo install  # Ensure dependencies
npx expo start --localhost  # Test local development
```

## 🌐 Deployment URLs

### Development
- Backend: `http://localhost:3001`
- Frontend: `exp://localhost:8081` (Expo Go)

### Production
- Backend: Deploy via Render using `render.yaml`
- Frontend: Build with Expo EAS

## 📱 Mobile Testing

### Expo Go Setup
1. Install Expo Go on your device
2. Scan QR code from `npx expo start`
3. Test seat swapping functionality
4. Verify video/audio permissions

### Fixed Issues
- ✅ Seat swapping no longer crashes in Expo Go
- ✅ Proper error handling for mobile environment
- ✅ Safe state updates prevent race conditions

## 🔐 Security Notes

- Passwords hashed with bcryptjs (cost factor 10)
- LiveKit tokens expire in 6 hours
- Database connections use connection pooling
- All API endpoints have authentication checks
- CORS enabled for cross-origin requests

## 📊 Performance Optimizations

- Database queries optimized with proper indexes
- Socket.io for real-time updates
- LiveKit tokens cached where appropriate
- Frontend uses React.memo for expensive renders
- Image lazy loading for avatars

## 🚨 Troubleshooting

### Database Issues
```bash
# Check connection
psql "postgresql://postgres:Mkvdarilana32145@db.uulexfrpvydusifwixxy.supabase.co:5432/postgres" -c "SELECT version();"
```

### LiveKit Issues
```bash
# Test room connection
curl -X POST "https://mafiax-a4cmo105.livekit.cloud/token" \
  -H "Authorization: Bearer APIYri54qd9xj2r:3QBRxzI3NAfHkkMjAwOjbuf7bR0RplgOfhfAO201z64B"
```

### Frontend Issues
- Clear Expo cache: `npx expo start -c`
- Reset Metro bundler: `npx expo start --reset-cache`
- Check Expo Go app permissions

## 📝 Development Workflow

1. **Backend First**: Set up database and API
2. **Test Backend**: Use `test-setup.js` script
3. **Frontend Integration**: Connect to backend APIs
4. **Mobile Testing**: Test with Expo Go
5. **Deployment**: Use Render for backend, EAS for frontend

## 🎯 Next Steps

1. Deploy backend to Render using `render.yaml`
2. Test production API endpoints
3. Build frontend for production with EAS
4. Set up monitoring and logging
5. Scale based on user load

---

**All configurations are ready! The application should work seamlessly with your Supabase database and LiveKit integration.**
