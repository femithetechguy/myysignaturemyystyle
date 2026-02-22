# API Documentation

Base URL: `/api`

## Public Endpoints

### Health Check

Check if the API is running.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-14T12:00:00.000Z"
}
```

---

## Admin Endpoints

### Login

Authenticate as an admin user.

**Endpoint:** `POST /api/admin/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_string"
}
```

**Errors:**
- `400` - Missing username or password
- `401` - Invalid credentials
- `405` - Method not allowed

---

### Get Users

Fetch users from a specified table. Requires admin authentication.

**Endpoint:** `GET /api/admin/users?table={tableName}`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| table | string | Yes | Table name (`admins`, `users`, or `products`) |

**Response (200) - Admins Table:**
```json
[
  {
    "id": 1,
    "username": "string",
    "email": "string",
    "is_active": true,
    "created_at": "2026-02-14T12:00:00.000Z"
  }
]
```

**Response (200) - Products Table:**
```json
[
  {
    "product_id": 1,
    "product_name": "Basic Haircut",
    "category": "Cutting",
    "description": "Professional haircut with wash, cut, and style",
    "price": [
      {"name": "Short Hair", "amount": 35},
      {"name": "Medium Hair", "amount": 45},
      {"name": "Long Hair", "amount": 55}
    ],
    "duration_minutes": 45,
    "staff_required": 1,
    "difficulty_level": "Beginner",
    "required_materials": ["Shampoo", "Conditioner", "Scissors", "Styling Product"],
    "availability_status": "Available",
    "is_active": true,
    "date_created": "2026-02-14T12:00:00.000Z",
    "date_updated": "2026-02-14T12:00:00.000Z"
  }
]
```

**Errors:**
- `400` - Invalid or missing table name
- `401` - Unauthorized
- `405` - Method not allowed
- `500` - Database error

---

### Get Config

Retrieve the current site configuration. Requires admin authentication.

**Endpoint:** `GET /api/config`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):** Returns the current `pages.json` configuration object.

**Errors:**
- `401` - Unauthorized
- `405` - Method not allowed

---

### Update Config

Update the site configuration. Requires admin authentication.

**Endpoint:** `PUT /api/config`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** The updated configuration object.

**Response (200):**
```json
{
  "message": "Config updated successfully",
  "config": { ... }
}
```

**Errors:**
- `401` - Unauthorized
- `405` - Method not allowed
- `500` - Failed to update config

---

## Authentication

Protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained by logging in via `/api/admin/login`.
