# Mafia Video Chat - Deployment Guide

## Backend Configuration

### Environment Variables
The backend is configured with the following environment variables:

```bash
DATABASE_URL=postgresql://postgres:Mkvdarilana32145@db.uulexfrpvydusifwixxy.supabase.co:5432/postgres
LIVEKIT_URL=wss://mafiax-a4cmo105.livekit.cloud
LIVEKIT_API_KEY=APIYri54qd9xj2r
LIVEKIT_API_SECRET=3QBRxzI3NAfHkkMjAwOjbuf7bR0RplgOfhfAO201z64B
PORT=3001
NODE_ENV=production
```

### Database Setup
- **Provider**: Supabase PostgreSQL
- **Connection**: Already configured in `.env` file
- **Schema**: Includes users, rooms, room_members, messages, and sessions tables

### LiveKit Integration
- **URL**: wss://mafiax-a4cmo105.livekit.cloud
- **API Key**: APIYri54qd9xj2r
- **Secret**: 3QBRxzI3NAfHkkMjAwOjbuf7bR0RplgOfhfAO201z64B
- **Features**: Video/audio communication, room management, token generation

## Deployment Options

### 1. Render Deployment (Recommended)
Use the provided `render.yaml` file for one-click deployment:

```yaml
services:
  - type: web
    name: mafia-api-server
    env: node
    plan: free
    buildCommand: "cd artifacts/api-server && pnpm install && pnpm run build"
    startCommand: "cd artifacts/api-server && pnpm run start"
    envVars:
      - key: DATABASE_URL
        value: postgresql://postgres:Mkvdarilana32145@db.uulexfrpvydusifwixxy.supabase.co:5432/postgres
      - key: LIVEKIT_URL
        value: wss://mafiax-a4cmo105.livekit.cloud
      - key: LIVEKIT_API_KEY
        value: APIYri54qd9xj2r
      - key: LIVEKIT_API_SECRET
        value: 3QBRxzI3NAfHkkMjAwOjbuf7bR0RplgOfhfAO201z64B
      - key: PORT
        value: 3001
      - key: NODE_ENV
        value: production
```

### 2. Docker Deployment
Use the provided `Dockerfile` for containerized deployment:

```bash
# Build and run
docker build -t mafia-api .
docker run -p 3001:3001 --env-file .env mafia-api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Rooms
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms/:id/join` - Join room
- `POST /api/rooms/:id/leave` - Leave room
- `POST /api/rooms/:id/livekit-token` - Get LiveKit token
- `POST /api/rooms/:id/moderate` - Moderate room (host only)

### Balance
- `GET /api/balance` - Get user balance
- `POST /api/balance/spend` - Spend coins

## Frontend Configuration

### Fixed Issues
✅ **Seat Swapping Crash**: Added proper error handling and validation to prevent Expo Go crashes
- Seat number validation (1-11)
- Empty seat checks
- Try-catch error handling
- Safe state updates

### Expo Go Compatibility
- All local text functionality preserved
- No changes to Expo Go integration
- Enhanced error handling for mobile environment

## Testing

### Backend Testing
```bash
cd artifacts/api-server
pnpm install
pnpm run dev
```

### Frontend Testing
```bash
cd artifacts/mafia-x
pnpm install
pnpm run dev
```

## Database Schema

### Users Table
- id (primary key)
- name
- balance
- isBanned
- createdAt

### Rooms Table
- id (primary key)
- name
- hostId (foreign key)
- isPrivate
- password
- capacity
- status
- livekitRoom
- createdAt

### Room Members Table
- roomId (foreign key)
- userId (foreign key)
- seatNumber
- hasCamera
- hasMic
- isMuted
- isBlocked
- joinedAt

### Messages Table
- id (primary key)
- roomId (foreign key)
- userId (foreign key)
- authorName
- text
- isSystem
- createdAt

## Security Notes

- All passwords are hashed using bcryptjs
- LiveKit tokens have 6-hour expiration
- Room access is validated through membership
- Host-only actions are protected by authorization checks

## Performance Considerations

- Database connections use pooling
- LiveKit tokens are cached where appropriate
- Socket.io for real-time updates
- Optimized queries with proper indexing
