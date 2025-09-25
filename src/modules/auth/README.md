# Auth Module API Documentation

This module handles user authentication including registration, login, and token refresh functionality.

## Base URL
```
http://localhost:3000
```

---

## API Endpoints

### 1. Register User

**Endpoint:** `POST /auth/register`

**Description:** Create a new user account and receive authentication tokens

**Auth:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "userName": "username"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "userName": "username",
    "name": null,
    "image": null,
    "bio": null,
    "tiktok": null,
    "dateOfBirth": null,
    "region": null,
    "videos": [],
    "collections": [],
    "bookmarks": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

**Error Responses:**
- `400`: User already exists or validation error

---

### 2. Login User

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user credentials and receive authentication tokens

**Auth:** Not required

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
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "userName": "username",
    "name": null,
    "image": null,
    "bio": null,
    "tiktok": null,
    "dateOfBirth": null,
    "region": null,
    "videos": [],
    "collections": [],
    "bookmarks": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

**Error Responses:**
- `401`: Invalid credentials
- `400`: Validation error

---

### 3. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Description:** Get new access and refresh tokens using a valid refresh token

**Auth:** Not required (uses refresh token in body)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

**Error Responses:**
- `401`: Invalid or expired refresh token
- `400`: Validation error

---

## DTO Structure

### TokenDto
Centralized token information with complete API documentation:

```typescript
{
  accessToken: string;    // JWT access token for API authentication
  refreshToken: string;   // JWT refresh token for token renewal
  tokenType: string;      // Always "Bearer"
  expiresIn: number;      // Access token expiration in seconds
}
```

### Response DTOs
- **RegisterResponseDto**: User info + tokens
- **LoggedInUserDto**: User info + tokens  
- **TokenResponseDto**: Tokens only (for refresh endpoint)

---

## Token Management

### Token Types

1. **Access Token**
   - **Purpose**: API authentication
   - **Expiration**: 1 hour
   - **Usage**: Include in `Authorization: Bearer <token>` header
   - **Secret**: `JWT_SECRET` environment variable

2. **Refresh Token**
   - **Purpose**: Get new access tokens
   - **Expiration**: 7 days
   - **Usage**: Send in request body to `/auth/refresh`
   - **Secret**: `JWT_REFRESH_SECRET` environment variable

### Token Flow

```mermaid
sequenceDiagram
    participant Client
    participant Auth API
    participant Protected API

    Client->>Auth API: POST /auth/login
    Auth API->>Client: { user, tokens: { accessToken, refreshToken } }

    Client->>Protected API: GET /api/endpoint
    Note over Client,Protected API: Authorization: Bearer <accessToken>

    alt Access Token Expired
        Protected API->>Client: 401 Unauthorized
        Client->>Auth API: POST /auth/refresh
        Note over Client,Auth API: { refreshToken: "..." }
        Auth API->>Client: { accessToken, refreshToken }
        Client->>Protected API: GET /api/endpoint
        Note over Client,Protected API: Authorization: Bearer <newAccessToken>
    end
```

---

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key

# Optional: Custom expiration times
JWT_ACCESS_TOKEN_EXPIRES_IN=1h
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
```

---

## Security Features

### Rate Limiting
- All auth endpoints are rate limited to 5 requests per minute
- Prevents brute force attacks

### Token Security
- Access tokens expire quickly (1 hour)
- Refresh tokens have longer lifespan (7 days)
- Separate secrets for access and refresh tokens
- Refresh tokens are rotated on each use

### Validation
- Input validation using class-validator
- Password hashing with bcrypt
- Email uniqueness validation

---

## Testing Examples

### Register User
```bash
curl -X POST "http://localhost:3000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "userName": "testuser"
  }'
```

### Login User
```bash
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Refresh Token
```bash
curl -X POST "http://localhost:3000/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token-here"
  }'
```

### Use Access Token
```bash
curl -X GET "http://localhost:3000/users/profile" \
  -H "Authorization: Bearer your-access-token-here"
```

---

## Best Practices

### Client-Side Implementation

1. **Store tokens securely**
   - Access token: Memory or short-lived storage
   - Refresh token: Secure HTTP-only cookie or secure storage

2. **Handle token expiration**
   - Intercept 401 responses
   - Use refresh token to get new access token
   - Retry original request

3. **Token rotation**
   - Always use the new refresh token returned from `/auth/refresh`
   - Discard old refresh tokens

### Error Handling

1. **Invalid refresh token**
   - Redirect to login page
   - Clear stored tokens

2. **Network errors**
   - Implement retry logic
   - Show appropriate error messages

---

## Migration Notes

### From Previous Version
If you're upgrading from a version without refresh tokens:

1. **Update client code** to handle new response format with `tokens` object
2. **Store refresh tokens** securely
3. **Implement token refresh logic** in your app
4. **Update environment variables** to include `JWT_REFRESH_SECRET`

### Backward Compatibility
- The new response format includes a `tokens` object containing all token information
- Old clients expecting individual token properties will need to be updated
- All token-related documentation is now centralized in the `TokenDto` 