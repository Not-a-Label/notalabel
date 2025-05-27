# Not a Label - API Documentation

## Base URL
```
Production: https://not-a-label.art/api
Development: http://localhost:4000/api
```

## Authentication

Not a Label uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header for protected endpoints.

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Health Check

#### Check API Status
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-05-27T16:35:56.485Z",
  "uptime": 3600
}
```

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "artist@example.com",
  "password": "securepassword123",
  "name": "Artist Name"
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "artist@example.com",
    "name": "Artist Name"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Email already exists"
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "artist@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "artist@example.com",
    "name": "Artist Name"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

### User Profile

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "artist@example.com",
    "name": "Artist Name",
    "created_at": "2025-05-27T12:00:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Unauthorized"
}
```

### AI Assistant

#### Chat with AI Assistant
```http
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "How can I promote my new single?",
  "context": {
    "genre": "indie rock",
    "experience": "beginner"
  }
}
```

**Success Response (200):**
```json
{
  "response": "Here are some effective strategies for promoting your indie rock single as a beginner artist...",
  "usage": {
    "total_tokens": 150,
    "prompt_tokens": 50,
    "completion_tokens": 100
  }
}
```

**Error Response (400):**
```json
{
  "error": "Message is required"
}
```

**Error Response (500):**
```json
{
  "error": "AI service temporarily unavailable",
  "details": "Service error message"
}
```

## Request & Response Format

### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <token> (for protected endpoints)
```

### Standard Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### Validation Errors
```json
{
  "errors": [
    {
      "msg": "Invalid email format",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## Rate Limiting

API requests are rate-limited to ensure fair usage:
- **Rate limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit info included in response headers
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

**Rate Limit Error (429):**
```json
{
  "error": "Too many requests, please try again later"
}
```

## Code Examples

### JavaScript/Node.js
```javascript
// Login example
const response = await fetch('https://not-a-label.art/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'artist@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.token;

// AI Chat example
const aiResponse = await fetch('https://not-a-label.art/api/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'How do I get more Spotify streams?'
  })
});

const aiData = await aiResponse.json();
console.log(aiData.response);
```

### Python
```python
import requests

# Login
login_response = requests.post(
    'https://not-a-label.art/api/auth/login',
    json={
        'email': 'artist@example.com',
        'password': 'password123'
    }
)
token = login_response.json()['token']

# AI Chat
headers = {'Authorization': f'Bearer {token}'}
ai_response = requests.post(
    'https://not-a-label.art/api/ai/chat',
    headers=headers,
    json={'message': 'How do I book more gigs?'}
)
print(ai_response.json()['response'])
```

### cURL
```bash
# Login
curl -X POST https://not-a-label.art/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"artist@example.com","password":"password123"}'

# AI Chat (replace YOUR_TOKEN)
curl -X POST https://not-a-label.art/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"What music distribution service should I use?"}'
```

## Testing the API

### Using the Status Dashboard
Visit https://not-a-label.art/status/ for an interactive API testing interface.

### Postman Collection
Import the following endpoints into Postman:

```json
{
  "info": {
    "name": "Not a Label API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/health"
      }
    },
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/auth/register",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
        }
      }
    },
    {
      "name": "AI Chat",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/ai/chat",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"message\":\"How can I grow my music career?\"}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://not-a-label.art"
    }
  ]
}
```

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** (never in plain text)
3. **Include error handling** for all API calls
4. **Respect rate limits** to avoid service interruption
5. **Validate inputs** before sending requests
6. **Handle token expiration** gracefully

## Support

For API issues or questions:
- Email: api-support@not-a-label.art
- Status Page: https://not-a-label.art/status/
- GitHub Issues: https://github.com/Not-a-Label/notalabel/issues

---
*API Version: 1.0.0 | Last Updated: May 2025*