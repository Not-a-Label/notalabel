# Not a Label API Documentation

Base URL: `http://localhost:4000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Auth Endpoints

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "artist" // or "fan"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "artist",
    "fullName": "John Doe"
  }
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "artist",
    "fullName": "John Doe"
  }
}
```

## Profile Management

#### GET /profile
Get current user's profile. (Protected)

#### PUT /profile
Update profile. (Protected)

**Request Body:**
```json
{
  "fullName": "John Doe",
  "bio": "Independent artist from LA",
  "artistName": "DJ Johnny",
  "genre": ["Electronic", "House"],
  "location": "Los Angeles, CA",
  "socialLinks": {
    "instagram": "@djjohnny",
    "twitter": "@djjohnny"
  }
}
```

#### POST /profile/avatar
Upload avatar image. (Protected)

**Request:** Multipart form data with `avatar` field

#### GET /profile/artists/all
Get all artist profiles.

**Query Parameters:**
- `limit` (default: 10)
- `offset` (default: 0)

## Music Management

#### GET /music/tracks
Get public tracks.

**Query Parameters:**
- `limit` (default: 50)
- `offset` (default: 0)

#### POST /music/tracks
Upload new track. (Protected)

**Request:** Multipart form data with:
- `audio` - Audio file (required)
- `title` - Track title (required)
- `genre` - Genre
- `releaseDate` - Release date
- `description` - Track description

#### POST /music/tracks/:id/cover
Upload track cover art. (Protected)

**Request:** Multipart form data with `cover` field

#### PUT /music/tracks/:id
Update track details. (Protected)

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "New description",
  "genre": "Electronic",
  "isPublic": true
}
```

#### POST /music/tracks/:id/play
Record a play for analytics.

## Playlists

#### GET /music/playlists
Get public playlists.

#### POST /music/playlists
Create a playlist. (Protected)

**Request Body:**
```json
{
  "title": "My Playlist",
  "description": "Description here"
}
```

#### POST /music/playlists/:id/tracks
Add track to playlist. (Protected)

**Request Body:**
```json
{
  "trackId": "track_uuid"
}
```

## Analytics

#### GET /analytics/dashboard
Get dashboard summary. (Protected)

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "totalStreams": 125430,
    "monthlyGrowth": 15.3,
    "topPlatforms": [
      {
        "platform": "Spotify",
        "total_streams": 85234,
        "track_count": 15
      }
    ],
    "recentActivity": [...]
  }
}
```

#### GET /analytics/streams
Get streaming analytics. (Protected)

**Query Parameters:**
- `startDate` (required) - YYYY-MM-DD
- `endDate` (required) - YYYY-MM-DD

## Distribution

#### GET /distribution/platforms
Get available distribution platforms.

#### POST /distribution/distribute
Distribute track to platforms. (Protected)

**Request Body:**
```json
{
  "trackId": "track_uuid",
  "platforms": ["spotify", "apple", "youtube"]
}
```

#### GET /distribution/status/:trackId
Get distribution status for a track. (Protected)

#### GET /distribution/oauth/:platform
Get OAuth URL for platform connection. (Protected)

#### POST /distribution/sync
Sync analytics from connected platforms. (Protected)

**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

## AI Assistant

#### POST /ai/chat
Chat with AI assistant. (Protected)

**Request Body:**
```json
{
  "message": "How can I improve my music promotion?",
  "conversationId": "optional_conversation_id"
}
```

**Response:**
```json
{
  "response": "Here are some tips for music promotion...",
  "conversationId": "conversation_uuid"
}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- 200 - Success
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Testing

Use the test accounts:
- Email: `testartist@example.com`, Password: `password123`
- Email: `janesmith@example.com`, Password: `password123`