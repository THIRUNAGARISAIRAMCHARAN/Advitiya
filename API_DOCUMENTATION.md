# API Documentation - Smart Link Hub Generator

Base URL: `http://localhost:3001/api`

## Authentication Endpoints

### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Error Response (400):**
```json
{
  "error": "User already exists or DB error"
}
```

---

### POST /auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

---

## Link Management Endpoints

### GET /links
Retrieve all links for the current hub.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "hub_id": 1,
    "title": "My Portfolio",
    "url": "https://example.com",
    "icon": null,
    "position": 0,
    "clicks": 42,
    "is_active": 1,
    "created_at": "2026-01-27 16:33:57"
  }
]
```

---

### POST /links
Create a new link.

**Request Body:**
```json
{
  "title": "GitHub Profile",
  "url": "https://github.com/username"
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "title": "GitHub Profile",
  "url": "https://github.com/username",
  "clicks": 0
}
```

**Error Response (400):**
```json
{
  "error": "Title and URL are required"
}
```

---

### DELETE /links/:id
Delete a link by ID.

**URL Parameters:**
- `id` (integer) - Link ID to delete

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Analytics Endpoints

### GET /stats
Get aggregated statistics for the current hub.

**Response (200 OK):**
```json
{
  "totalClicks": "156",
  "uniqueVisitors": "42",
  "ctr": "4.8%"
}
```

---

### POST /analytics
Record an analytics event (click, view, etc.).

**Request Body:**
```json
{
  "link_id": 1,
  "event_type": "click"
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Error Response (404):**
```json
{
  "error": "Link not found"
}
```

---

## Public Hub Endpoints

### GET /hub/:slug
Get public hub view with rule-optimized links.

**URL Parameters:**
- `slug` (string) - Hub slug identifier

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "slug": "demo-hub",
  "title": "Demo Hub",
  "description": "My smart link hub",
  "theme_config": null,
  "created_at": "2026-01-27 16:33:57",
  "links": [
    {
      "id": 1,
      "hub_id": 1,
      "title": "Portfolio",
      "url": "https://example.com",
      "clicks": 42,
      "position": 0,
      "is_active": 1
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "Hub not found"
}
```

**Notes:**
- Links are automatically filtered and reordered based on active rules
- Rules are evaluated based on context (device type, time, etc.)
- Only active links (`is_active = 1`) are returned

---

## Health Check

### GET /health
Check if the API is running.

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "HubGen API is running"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

### 404 Not Found
```json
{
  "error": "Not Found"
}
```

---

## Rate Limiting

Currently not implemented. Recommended for production:
- 100 requests per 15 minutes per IP for general endpoints
- 10 requests per minute for auth endpoints

---

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

---

## Database Schema Reference

### users
- `id` - INTEGER PRIMARY KEY
- `email` - TEXT UNIQUE NOT NULL
- `password_hash` - TEXT NOT NULL
- `created_at` - DATETIME DEFAULT CURRENT_TIMESTAMP

### hubs
- `id` - INTEGER PRIMARY KEY
- `user_id` - INTEGER REFERENCES users(id)
- `slug` - TEXT UNIQUE NOT NULL
- `title` - TEXT
- `description` - TEXT
- `theme_config` - TEXT (JSON)
- `created_at` - DATETIME DEFAULT CURRENT_TIMESTAMP

### links
- `id` - INTEGER PRIMARY KEY
- `hub_id` - INTEGER REFERENCES hubs(id)
- `title` - TEXT NOT NULL
- `url` - TEXT NOT NULL
- `icon` - TEXT
- `position` - INTEGER DEFAULT 0
- `clicks` - INTEGER DEFAULT 0
- `is_active` - BOOLEAN DEFAULT TRUE
- `created_at` - DATETIME DEFAULT CURRENT_TIMESTAMP

### rules
- `id` - INTEGER PRIMARY KEY
- `hub_id` - INTEGER REFERENCES hubs(id)
- `name` - TEXT
- `type` - TEXT NOT NULL (time/device/location/performance)
- `conditions` - TEXT (JSON)
- `action` - TEXT (JSON)
- `priority` - INTEGER DEFAULT 0
- `is_active` - BOOLEAN DEFAULT TRUE
- `created_at` - DATETIME DEFAULT CURRENT_TIMESTAMP

### analytics
- `id` - INTEGER PRIMARY KEY
- `hub_id` - INTEGER REFERENCES hubs(id)
- `link_id` - INTEGER REFERENCES links(id)
- `event_type` - TEXT NOT NULL (view/click)
- `visitor_id` - TEXT
- `device_type` - TEXT
- `country` - TEXT
- `user_agent` - TEXT
- `timestamp` - DATETIME DEFAULT CURRENT_TIMESTAMP
