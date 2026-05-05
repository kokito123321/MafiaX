# Mafia Video Chat - API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://your-app-name.onrender.com/api
```

## Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "Username"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com", 
    "name": "Username",
    "balance": 0,
    "level": 1,
    "xp": 0
  },
  "session": "session-token-123"
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "Username", 
    "balance": 100,
    "level": 5,
    "xp": 2500
  },
  "session": "session-token-123"
}
```

### Logout User
```http
POST /auth/logout
Authorization: Bearer session-token-123
```

**Response:**
```json
{
  "ok": true
}
```

## Rooms

### List All Rooms
```http
GET /rooms
Authorization: Bearer session-token-123
```

**Response:**
```json
{
  "rooms": [
    {
      "id": "room-123",
      "name": "Mafia Game Room",
      "hostId": "host-456",
      "hostName": "HostPlayer",
      "isPrivate": false,
      "capacity": 11,
      "memberCount": 5,
      "status": "waiting",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Create Room
```http
POST /rooms
Authorization: Bearer session-token-123
Content-Type: application/json

{
  "name": "My Mafia Room",
  "isPrivate": false,
  "password": null
}
```

**Response:**
```json
{
  "roomId": "room-789"
}
```

### Get Room Details
```http
GET /rooms/{roomId}
Authorization: Bearer session-token-123
```

**Response:**
```json
{
  "state": {
    "room": {
      "id": "room-123",
      "name": "Mafia Game",
      "hostId": "host-456",
      "isPrivate": false,
      "capacity": 11,
      "status": "playing"
    },
    "members": [
      {
        "id": "user-789",
        "name": "Player1",
        "seatNumber": 1,
        "hasCamera": true,
        "hasMic": true,
        "isMuted": false,
        "isBlocked": false,
        "joinedAt": "2024-01-01T12:30:00Z"
      }
    ],
    "messages": [
      {
        "id": "msg-123",
        "authorName": "system",
        "text": "Game started",
        "isSystem": true,
        "createdAt": "2024-01-01T12:00:00Z"
      }
    ]
  }
}
```

### Join Room
```http
POST /rooms/{roomId}/join
Authorization: Bearer session-token-123
Content-Type: application/json

{
  "password": "room-password",
  "seatNumber": 5,
  "hasCamera": true,
  "hasMic": true
}
```

**Response:**
```json
{
  "ok": true,
  "seatNumber": 5
}
```

### Leave Room
```http
POST /rooms/{roomId}/leave
Authorization: Bearer session-token-123
```

**Response:**
```json
{
  "ok": true
}
```

### Get LiveKit Token
```http
POST /rooms/{roomId}/livekit-token
Authorization: Bearer session-token-123
Content-Type: application/json
```

**Response:**
```json
{
  "token": "livekit-jwt-token",
  "url": "wss://mafiax-a4cmo105.livekit.cloud",
  "roomName": "mafia-room-123"
}
```

### Moderate Room (Host Only)
```http
POST /rooms/{roomId}/moderate
Authorization: Bearer session-token-123
Content-Type: application/json

{
  "action": "kick",
  "targetUserId": "user-789"
}

{
  "action": "mute", 
  "targetUserId": "user-789"
}

{
  "action": "swap",
  "fromUserId": "user-111",
  "toUserId": "user-222"
}
```

**Response:**
```json
{
  "ok": true
}
```

## Balance

### Get User Balance
```http
GET /balance
Authorization: Bearer session-token-123
```

**Response:**
```json
{
  "balance": 150,
  "level": 3,
  "xp": 1200
}
```

### Spend Coins
```http
POST /balance/spend
Authorization: Bearer session-token-123
Content-Type: application/json

{
  "amount": 10
}
```

**Response:**
```json
{
  "ok": true,
  "newBalance": 140
}
```

## Health Checks

### Basic Health
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "uptime": 3600,
  "environment": "production",
  "services": {
    "database": "connected",
    "livekit": "configured"
  }
}
```

### Database Health
```http
GET /health/database
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "stats": {
    "users": 150,
    "rooms": 25
  }
}
```

### LiveKit Health
```http
GET /health/livekit
```

**Response:**
```json
{
  "status": "healthy",
  "livekit": "connected",
  "url": "wss://mafiax-a4cmo105.livekit.cloud"
}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "invalid_input"
}
```

### 401 Unauthorized  
```json
{
  "error": "invalid_session"
}
```

### 402 Payment Required
```json
{
  "error": "insufficient_balance"
}
```

### 403 Forbidden
```json
{
  "error": "host_only"
}
```

### 404 Not Found
```json
{
  "error": "not_found"
}
```

### 409 Conflict
```json
{
  "error": "room_full"
}
```

### 503 Service Unavailable
```json
{
  "status": "unhealthy",
  "error": "database_disconnected"
}
```

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Room creation: 3 requests per minute
- Room operations: 60 requests per minute
- Balance operations: 20 requests per minute

## WebSocket Events

### Connection
```javascript
// Connect to room
const socket = io('ws://localhost:3001', {
  auth: {
    token: 'session-token-123'
  }
});

// Join room
socket.emit('join-room', { roomId: 'room-123' });
```

### Room Events
```javascript
// Room state updated
socket.on('room-state', (state) => {
  console.log('New room state:', state);
});

// System message
socket.on('system-message', (message) => {
  console.log('System message:', message);
});

// User kicked
socket.on('kicked', (reason) => {
  console.log('Kicked:', reason);
});
```

## Security Notes

- All passwords are hashed using bcryptjs
- Session tokens expire after 24 hours
- LiveKit tokens expire after 6 hours
- All API endpoints require valid session
- Host-only actions are protected by authorization checks
- Rate limiting applies to prevent abuse

## Testing

Use the provided `test-setup.js` script to verify all configurations:

```bash
node artifacts/api-server/test-setup.js
```

This will test:
- Database connectivity
- LiveKit configuration
- Environment variables
- API endpoint availability
