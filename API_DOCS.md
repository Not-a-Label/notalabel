# Not a Label Platform - API Documentation

## Overview

The Not a Label Platform provides a comprehensive REST API and GraphQL endpoint for managing music industry operations, including artist management, content distribution, royalty calculations, live performances, and NFT marketplace functionality.

**Base URL:** `https://api.not-a-label.art`  
**GraphQL Endpoint:** `https://api.not-a-label.art/graphql`  
**WebSocket:** `wss://api.not-a-label.art`

## Authentication

All API requests require authentication using JWT tokens.

### Obtaining a Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "artist@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_id",
      "email": "artist@example.com",
      "name": "Artist Name",
      "role": "artist"
    }
  }
}
```

### Using the Token

Include the JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Core API Endpoints

### User Management

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword",
  "name": "User Name",
  "role": "artist"
}
```

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer {token}
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "Artist biography",
  "genre": "Electronic",
  "location": "Los Angeles, CA"
}
```

### Music Management

#### Upload Track
```http
POST /api/music/tracks
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "Track Title",
  "description": "Track description",
  "genre": "Electronic",
  "audioFile": [audio file],
  "artwork": [image file],
  "metadata": {
    "bpm": 128,
    "key": "Am",
    "duration": 180
  }
}
```

#### Get User Tracks
```http
GET /api/music/tracks
Authorization: Bearer {token}
```

#### Get Track by ID
```http
GET /api/music/tracks/:trackId
Authorization: Bearer {token}
```

#### Update Track
```http
PUT /api/music/tracks/:trackId
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "genre": "House"
}
```

#### Delete Track
```http
DELETE /api/music/tracks/:trackId
Authorization: Bearer {token}
```

### Analytics

#### Get User Analytics
```http
GET /api/analytics/user
Authorization: Bearer {token}
```

#### Get Track Analytics
```http
GET /api/analytics/tracks/:trackId
Authorization: Bearer {token}
```

#### Get Revenue Analytics
```http
GET /api/analytics/revenue?period=30d
Authorization: Bearer {token}
```

### Royalty Management

#### Get Royalty Dashboard
```http
GET /api/royalties/dashboard
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 1250.75,
    "monthlyEarnings": [
      {"month": "2024-01", "amount": 450.25},
      {"month": "2024-02", "amount": 800.50}
    ],
    "topTracks": [
      {"trackId": "track_1", "title": "Hit Song", "earnings": 650.25}
    ],
    "pendingPayments": 125.50,
    "lastPayment": {
      "date": "2024-02-15T10:30:00Z",
      "amount": 450.25
    }
  }
}
```

#### Set Royalty Rates
```http
POST /api/royalties/rates/:trackId
Authorization: Bearer {token}
Content-Type: application/json

{
  "rates": [
    {
      "stakeholderType": "artist",
      "stakeholderId": "user_id",
      "percentage": 70,
      "effectiveFrom": "2024-01-01T00:00:00Z"
    },
    {
      "stakeholderType": "producer",
      "stakeholderId": "producer_id",
      "percentage": 30,
      "effectiveFrom": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Live Performances

#### Create Performance
```http
POST /api/live/performances
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Live Performance Title",
  "description": "Performance description",
  "scheduledStart": "2024-06-15T20:00:00Z",
  "scheduledEnd": "2024-06-15T22:00:00Z",
  "venue": {
    "type": "virtual",
    "name": "Virtual Stage"
  },
  "streaming": {
    "enabled": true,
    "platforms": ["youtube", "twitch"],
    "quality": "1080p"
  },
  "ticketing": {
    "enabled": true,
    "freeAccess": false,
    "tiers": [
      {
        "name": "General Admission",
        "price": 15,
        "currency": "USD",
        "quantity": 1000
      }
    ]
  }
}
```

#### Get Performances
```http
GET /api/live/performances
Authorization: Bearer {token}
```

#### Start Performance
```http
POST /api/live/performances/:performanceId/start
Authorization: Bearer {token}
```

#### End Performance
```http
POST /api/live/performances/:performanceId/end
Authorization: Bearer {token}
```

### Distribution

#### Create Release
```http
POST /api/distribution/releases
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Album Title",
  "type": "album",
  "releaseDate": "2024-07-01T00:00:00Z",
  "genre": "Electronic",
  "language": "en",
  "tracks": [
    {
      "position": 1,
      "title": "Track 1",
      "audioFile": {
        "url": "https://storage.not-a-label.art/track1.wav",
        "format": "wav",
        "bitrate": 1411,
        "sampleRate": 44100
      }
    }
  ],
  "artwork": {
    "primary": "https://storage.not-a-label.art/artwork.jpg"
  },
  "distribution": {
    "territories": ["worldwide"],
    "platforms": ["spotify", "apple_music", "youtube_music"]
  }
}
```

#### Submit for Distribution
```http
POST /api/distribution/releases/:releaseId/submit
Authorization: Bearer {token}
```

#### Get Distribution Status
```http
GET /api/distribution/releases/:releaseId/status
Authorization: Bearer {token}
```

### NFT Marketplace

#### Create NFT Collection
```http
POST /api/nft/collections
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Music NFT Collection",
  "description": "Exclusive music NFTs",
  "symbol": "MUSIC",
  "blockchain": "ethereum",
  "type": "collection",
  "metadata": {
    "image": "https://storage.not-a-label.art/collection.jpg",
    "attributes": []
  },
  "pricing": {
    "mintPrice": 0.1,
    "currency": "ETH",
    "royaltyPercentage": 10
  },
  "sales": {
    "enabled": true,
    "startDate": "2024-06-01T00:00:00Z"
  }
}
```

#### Mint NFT
```http
POST /api/nft/collections/:collectionId/mint
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipient": "0x742d35Cc6677C4532431Cc31648cE1eB6D70E9d4",
  "metadata": {
    "name": "Exclusive Track NFT #1",
    "description": "Limited edition NFT for exclusive track",
    "image": "https://storage.not-a-label.art/nft1.jpg"
  },
  "attributes": [
    {"trait_type": "Rarity", "value": "Legendary"},
    {"trait_type": "Genre", "value": "Electronic"}
  ]
}
```

#### Get NFT Collections
```http
GET /api/nft/collections
Authorization: Bearer {token}
```

#### Create Marketplace Listing
```http
POST /api/nft/listings
Authorization: Bearer {token}
Content-Type: application/json

{
  "nftId": "nft_id",
  "type": "fixed",
  "price": 1.5,
  "currency": "ETH"
}
```

### Business Intelligence

#### Get KPI Dashboard
```http
GET /api/business/dashboard
Authorization: Bearer {token}
```

#### Generate Business Report
```http
POST /api/business/reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "monthly",
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

#### Get Business Insights
```http
GET /api/business/insights
Authorization: Bearer {token}
```

### Marketing Automation

#### Create Campaign
```http
POST /api/marketing/campaigns
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Release Promotion",
  "description": "Promote latest single",
  "type": "email",
  "target": {
    "criteria": {
      "demographics": {
        "genre": ["electronic", "house"]
      },
      "behavior": {
        "engagementLevel": "high"
      }
    }
  },
  "content": {
    "subject": "New Track Available Now!",
    "body": "Check out our latest release...",
    "cta": {
      "text": "Listen Now",
      "url": "https://not-a-label.art/track/123"
    }
  },
  "schedule": {
    "type": "immediate"
  }
}
```

## GraphQL API

### Schema Overview

```graphql
type User {
  id: ID!
  email: String!
  name: String!
  role: UserRole!
  profile: UserProfile
  tracks: [Track!]!
  analytics: UserAnalytics
}

type Track {
  id: ID!
  title: String!
  description: String
  genre: String!
  audioFile: AudioFile!
  artwork: String
  metadata: TrackMetadata
  analytics: TrackAnalytics
  owner: User!
}

type Query {
  me: User
  track(id: ID!): Track
  tracks(filter: TrackFilter): [Track!]!
  analytics(period: String): Analytics
}

type Mutation {
  login(email: String!, password: String!): AuthPayload!
  createTrack(input: CreateTrackInput!): Track!
  updateTrack(id: ID!, input: UpdateTrackInput!): Track!
  deleteTrack(id: ID!): Boolean!
}

type Subscription {
  trackUploaded: Track!
  analyticsUpdated: Analytics!
  performanceStarted: LivePerformance!
}
```

### Example Queries

#### Get User Profile with Tracks
```graphql
query GetUserProfile {
  me {
    id
    name
    email
    profile {
      bio
      genre
      location
    }
    tracks {
      id
      title
      genre
      analytics {
        playCount
        revenue
      }
    }
  }
}
```

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('wss://api.not-a-label.art');

ws.onopen = function() {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your_jwt_token'
  }));
};
```

### Live Performance Events
```javascript
// Join performance room
ws.send(JSON.stringify({
  type: 'join_performance',
  performanceId: 'performance_id',
  userId: 'user_id'
}));

// Send chat message
ws.send(JSON.stringify({
  type: 'send_message',
  performanceId: 'performance_id',
  message: 'Hello everyone!',
  username: 'Artist Name'
}));
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **General API**: 100 requests per minute per user
- **Authentication**: 5 requests per minute per IP
- **Upload endpoints**: 10 requests per minute per user
- **Analytics**: 60 requests per minute per user

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Invalid or missing authentication token |
| `FORBIDDEN` | User doesn't have permission for this action |
| `NOT_FOUND` | Requested resource not found |
| `VALIDATION_ERROR` | Input validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

## Support

### Documentation
- **API Docs**: https://docs.not-a-label.art
- **GraphQL Playground**: https://api.not-a-label.art/graphql
- **Status Page**: https://status.not-a-label.art

### Contact
- **Technical Support**: api-support@not-a-label.art
- **Developer Community**: https://discord.gg/not-a-label
- **GitHub Issues**: https://github.com/not-a-label/platform/issues

---

This API documentation provides comprehensive information for integrating with the Not a Label platform. For additional examples and tutorials, visit our developer portal at https://developers.not-a-label.art.