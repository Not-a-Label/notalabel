# Not a Label API Documentation

## Base URL
- Production: `https://not-a-label.art/api`
- Development: `http://localhost:4000/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "userId": "uuid-here"
}
```

#### POST /auth/login
Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "artist"
  },
  "token": "jwt-token-here"
}
```

## User Profile

#### GET /profile
Get the authenticated user's profile.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "displayName": "John Doe",
  "bio": "Independent artist from LA",
  "avatarUrl": "https://...",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### PUT /profile
Update user profile.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "displayName": "Updated Name",
  "bio": "Updated bio",
  "location": "New York, NY"
}
```

## Music Management

#### GET /tracks
Get user's tracks.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `genre` (optional): Filter by genre

**Response:**
```json
{
  "tracks": [
    {
      "id": "track-uuid",
      "title": "My Song",
      "artistId": "artist-uuid",
      "duration": 245,
      "genre": "Electronic",
      "releaseDate": "2024-01-01",
      "streamCount": 1234,
      "fileUrl": "https://..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### POST /tracks
Upload a new track.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: Audio file (mp3, wav, flac)
- `title`: Track title
- `genre`: Track genre
- `releaseDate`: Release date (optional)

**Response:**
```json
{
  "message": "Track uploaded successfully",
  "track": {
    "id": "new-track-uuid",
    "title": "New Song",
    "fileUrl": "https://..."
  }
}
```

## Analytics

#### GET /analytics/overview
Get analytics overview.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: `day`, `week`, `month`, `year`

**Response:**
```json
{
  "streams": {
    "total": 12345,
    "change": "+15%"
  },
  "revenue": {
    "total": 543.21,
    "change": "+8%"
  },
  "fans": {
    "total": 892,
    "change": "+12%"
  },
  "topTracks": [
    {
      "id": "track-uuid",
      "title": "Popular Song",
      "streams": 5432
    }
  ]
}
```

## Events

#### GET /events
Get artist's events.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "events": [
    {
      "id": "event-uuid",
      "title": "Summer Concert",
      "date": "2024-07-15T20:00:00Z",
      "venue": "The Venue",
      "city": "Los Angeles, CA",
      "ticketLink": "https://...",
      "capacity": 500,
      "ticketsSold": 350
    }
  ]
}
```

#### POST /events
Create a new event.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "New Concert",
  "date": "2024-08-01T19:00:00Z",
  "venue": "Music Hall",
  "city": "New York, NY",
  "ticketLink": "https://tickets.example.com",
  "capacity": 300
}
```

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {} // Optional additional details
}
```

### Common Error Codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate limited:
- General endpoints: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes
- Upload endpoints: 10 requests per hour

Rate limit headers:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## Webhooks

Configure webhooks to receive real-time updates:

### Event Types:
- `track.uploaded` - New track uploaded
- `track.played` - Track played
- `user.registered` - New user registration
- `payment.processed` - Payment processed
- `event.created` - New event created

### Webhook Payload:
```json
{
  "event": "track.uploaded",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    // Event-specific data
  }
}
```

## SDK Examples

### JavaScript/TypeScript
```javascript
import { NotALabelAPI } from '@notalabel/sdk';

const api = new NotALabelAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://not-a-label.art/api'
});

// Login
const { token } = await api.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Get tracks
const tracks = await api.tracks.list({
  page: 1,
  limit: 20
});
```

### Python
```python
from notalabel import NotALabelAPI

api = NotALabelAPI(
    api_key='your-api-key',
    base_url='https://not-a-label.art/api'
)

# Login
auth = api.auth.login(
    email='user@example.com',
    password='password'
)

# Get analytics
analytics = api.analytics.overview(period='month')
```

## Testing

Use our test environment:
- Base URL: `https://test.not-a-label.art/api`
- Test API Keys available in dashboard

### Postman Collection
Import our Postman collection for easy testing:
[Download Postman Collection](https://not-a-label.art/api/postman-collection.json)

## Support

- Documentation: https://docs.not-a-label.art
- API Status: https://status.not-a-label.art
- Support Email: api@not-a-label.art
- Discord: https://discord.gg/notalabel