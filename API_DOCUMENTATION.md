# MadEasy Backend API Documentation

Base URL: `http://localhost:5000/api`

All endpoints return JSON responses with the following structure:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": {} // Response data (if applicable)
}
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

1. [Base Routes](#base-routes)
2. [Authentication Routes](#authentication-routes)
3. [Admin Routes](#admin-routes)
   - [Log Management](#get-logs)
4. [Booking Routes](#booking-routes)
5. [User Routes](#user-routes)
6. [Cleaner Routes](#cleaner-routes)

---

## Base Routes

### Health Check
**GET** `/api/health`

Check if the server is running.

**Access:** Public

**Response:**
```json
{
  "success": true,
  "message": "✅ Server is healthy",
  "timestamp": "2025-11-28T15:47:21.402Z",
  "uptime": 7.706708616
}
```

### Server Status
**GET** `/`

Get server status and environment info.

**Access:** Public

**Response:**
```json
{
  "success": true,
  "message": "🚀 Mamafua Backend API is running!",
  "timestamp": "2025-11-28T15:47:27.911Z",
  "environment": "development"
}
```

---

## Authentication Routes

### Register User
**POST** `/api/auth/register`

Register a new user account.

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+254712345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+254712345678",
    "role": "user"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

---

### Login User
**POST** `/api/auth/login`

Login with email and password to get JWT token.

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+254712345678",
    "role": "user"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### Get Current User
**GET** `/api/auth/me`

Get the currently authenticated user's information.

**Access:** Private (requires JWT)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+254712345678",
    "role": "user",
    "address": {
      "street": "123 Main St",
      "city": "Nairobi",
      "state": "Nairobi",
      "zipCode": "00100"
    },
    "isVerified": false,
    "createdAt": "2025-11-28T10:00:00.000Z",
    "updatedAt": "2025-11-28T10:00:00.000Z"
  }
}
```

---

## Admin Routes

### Admin Login
**POST** `/api/admin/login`

Login as admin to get JWT token.

**Access:** Public

**Request Body:**
```json
{
  "email": "admin@madeasy.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "name": "System Administrator",
    "email": "admin@madeasy.com",
    "role": "super_admin"
  }
}
```

---

### Get Dashboard Stats
**GET** `/api/admin/dashboard`

Get dashboard statistics (total users, cleaners, bookings, etc.).

**Access:** Private (Admin/Super Admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalCleaners": 45,
    "pendingCleaners": 8,
    "totalBookings": 320,
    "pendingBookings": 12
  }
}
```

---

### Get All Bookings
**GET** `/api/admin/bookings`

Get all bookings with optional filters and pagination.

**Access:** Private (Admin/Super Admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (optional): Filter by booking status (`pending`, `confirmed`, `in_progress`, `completed`, `cancelled`, `payment_pending`)
- `startDate` (optional): Filter bookings from this date (ISO format: `2025-11-01`)
- `endDate` (optional): Filter bookings until this date (ISO format: `2025-11-30`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```
GET /api/admin/bookings?status=pending&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "count": 20,
  "total": 320,
  "page": 1,
  "pages": 16,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+254712345678"
      },
      "cleaner": {
        "_id": "507f1f77bcf86cd799439013",
        "user": {
          "_id": "507f1f77bcf86cd799439014",
          "name": "Jane Cleaner",
          "email": "jane@example.com",
          "phone": "+254798765432"
        }
      },
      "serviceType": "regular_cleaning",
      "schedule": {
        "date": "2025-12-01T00:00:00.000Z",
        "startTime": "09:00",
        "duration": 4,
        "endTime": "13:00"
      },
      "address": {
        "street": "123 Main St",
        "city": "Nairobi",
        "state": "Nairobi",
        "zipCode": "00100"
      },
      "pricing": {
        "baseAmount": 2000,
        "extraCharges": 500,
        "discount": 0,
        "totalAmount": 2500
      },
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2025-11-28T10:00:00.000Z"
    }
  ]
}
```

---

### Get Pending Cleaner Applications
**GET** `/api/admin/cleaners/pending`

Get all pending cleaner applications.

**Access:** Private (Admin/Super Admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Jane Cleaner",
      "email": "jane@example.com",
      "phone": "+254798765432",
      "cleanerApplication": {
        "status": "pending",
        "appliedAt": "2025-11-25T10:00:00.000Z",
        "bio": "Experienced cleaner with 5 years in the industry",
        "experience": 5,
        "specialties": ["residential", "deep_cleaning"],
        "hourlyRate": 800
      }
    }
  ]
}
```

---

### Review Cleaner Application
**PUT** `/api/admin/cleaners/:id/review`

Approve or reject a cleaner application.

**Access:** Private (Admin/Super Admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**URL Parameters:**
- `id`: User ID of the cleaner applicant

**Request Body:**
```json
{
  "status": "approved",
  "rejectionReason": "" // Optional, required if status is "rejected"
}
```

**Response (Approved):**
```json
{
  "success": true,
  "message": "Cleaner application approved",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Cleaner",
    "email": "jane@example.com",
    "role": "cleaner",
    "cleanerApplication": {
      "status": "approved",
      "reviewedAt": "2025-11-28T10:00:00.000Z",
      "reviewedBy": "507f1f77bcf86cd799439015"
    }
  }
}
```

**Response (Rejected):**
```json
{
  "success": true,
  "message": "Cleaner application rejected",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "cleanerApplication": {
      "status": "rejected",
      "rejectionReason": "Incomplete documentation",
      "reviewedAt": "2025-11-28T10:00:00.000Z"
    }
  }
}
```

---

### Get Logs
**GET** `/api/admin/logs`

Get all logs with optional filters. Only accessible by super_admin.

**Access:** Private (Super Admin only)

**Headers:**
```
Authorization: Bearer <super_admin_token>
```

**Query Parameters:**
- `level` (optional): Filter by log level (`error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`)
- `startDate` (optional): Filter logs from this date (ISO format: `2025-11-01`)
- `endDate` (optional): Filter logs until this date (ISO format: `2025-11-30`)
- `userId` (optional): Filter logs by user ID
- `path` (optional): Filter logs by request path (partial match, case-insensitive)
- `statusCode` (optional): Filter logs by HTTP status code
- `search` (optional): Search in log messages (case-insensitive)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Example Request:**
```
GET /api/admin/logs?level=error&startDate=2025-11-01&page=1&limit=50
```

**Response:**
```json
{
  "success": true,
  "count": 50,
  "total": 1250,
  "page": 1,
  "pages": 25,
  "stats": {
    "error": 45,
    "warn": 5
  },
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "level": "error",
      "message": "GET /api/bookings - 500",
      "timestamp": "2025-11-28T15:47:21.402Z",
      "request": {
        "method": "GET",
        "url": "/api/bookings",
        "path": "/api/bookings",
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0..."
      },
      "response": {
        "statusCode": 500,
        "statusMessage": "Internal Server Error",
        "responseTime": 125
      },
      "user": {
        "id": "507f1f77bcf86cd799439012",
        "email": "john@example.com",
        "role": "user"
      },
      "error": {
        "name": "Error",
        "message": "Database connection failed",
        "stack": "Error: Database connection failed\n    at..."
      },
      "service": "madeasy-backend",
      "createdAt": "2025-11-28T15:47:21.402Z"
    }
  ]
}
```

---

### Get Log Statistics
**GET** `/api/admin/logs/stats`

Get aggregated log statistics.

**Access:** Private (Super Admin only)

**Headers:**
```
Authorization: Bearer <super_admin_token>
```

**Query Parameters:**
- `startDate` (optional): Filter statistics from this date (ISO format: `2025-11-01`)
- `endDate` (optional): Filter statistics until this date (ISO format: `2025-11-30`)

**Example Request:**
```
GET /api/admin/logs/stats?startDate=2025-11-01
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLogs": 15234,
    "recentErrors": 12,
    "statsByLevel": {
      "info": 12500,
      "error": 450,
      "warn": 1200,
      "debug": 1084
    },
    "statsByStatusCode": {
      "2xx": 11500,
      "4xx": 1200,
      "5xx": 450,
      "3xx": 84
    },
    "topEndpoints": [
      {
        "_id": "/api/bookings",
        "count": 4520,
        "avgResponseTime": 145.5
      },
      {
        "_id": "/api/cleaners",
        "count": 3210,
        "avgResponseTime": 98.3
      }
    ]
  }
}
```

---

### Get Log by ID
**GET** `/api/admin/logs/:id`

Get a specific log entry by ID.

**Access:** Private (Super Admin only)

**Headers:**
```
Authorization: Bearer <super_admin_token>
```

**URL Parameters:**
- `id`: Log ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "level": "error",
    "message": "GET /api/bookings - 500",
    "timestamp": "2025-11-28T15:47:21.402Z",
    "meta": {},
    "request": {
      "method": "GET",
      "url": "/api/bookings?status=pending",
      "path": "/api/bookings",
      "query": {
        "status": "pending"
      },
      "headers": {
        "user-agent": "Mozilla/5.0...",
        "authorization": "Bearer ***"
      },
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    },
    "response": {
      "statusCode": 500,
      "statusMessage": "Internal Server Error",
      "responseTime": 125
    },
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "email": "john@example.com",
      "role": "user"
    },
    "error": {
      "name": "Error",
      "message": "Database connection failed",
      "stack": "Error: Database connection failed\n    at..."
    },
    "service": "madeasy-backend",
    "createdAt": "2025-11-28T15:47:21.402Z",
    "updatedAt": "2025-11-28T15:47:21.402Z"
  }
}
```

---

### Delete Logs
**DELETE** `/api/admin/logs`

Delete logs based on filters. Use with caution!

**Access:** Private (Super Admin only)

**Headers:**
```
Authorization: Bearer <super_admin_token>
```

**Query Parameters:**
- `level` (optional): Delete logs by log level
- `startDate` (optional): Delete logs from this date (ISO format: `2025-11-01`)
- `endDate` (optional): Delete logs until this date (ISO format: `2025-11-30`)
- `olderThan` (optional): Delete logs older than X days (number)

**Example Request:**
```
DELETE /api/admin/logs?olderThan=90
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully deleted 1250 log(s)",
  "deletedCount": 1250
}
```

**Note:** This operation cannot be undone. Use with extreme caution!

---

## Booking Routes

### Create Booking
**POST** `/api/bookings`

Create a new booking.

**Access:** Private (User only)

**Headers:**
```
Authorization: Bearer <user_token>
```

**Request Body:**
```json
{
  "cleaner": "507f1f77bcf86cd799439013",
  "serviceType": "regular_cleaning",
  "schedule": {
    "date": "2025-12-01",
    "startTime": "09:00",
    "duration": 4
  },
  "address": {
    "street": "123 Main St",
    "city": "Nairobi",
    "state": "Nairobi",
    "zipCode": "00100",
    "instructions": "Ring doorbell twice",
    "coordinates": {
      "lat": -1.2921,
      "lng": 36.8219
    }
  },
  "details": {
    "bedrooms": 3,
    "bathrooms": 2,
    "livingRooms": 1,
    "kitchens": 1,
    "extraTasks": ["window_cleaning", "oven_cleaning"],
    "specialInstructions": "Please use eco-friendly products"
  },
  "pricing": {
    "baseAmount": 2000,
    "extraCharges": 500,
    "discount": 0,
    "totalAmount": 2500
  }
}
```

**Service Types:**
- `regular_cleaning`
- `deep_cleaning`
- `move_in_out`
- `office_cleaning`
- `post_construction`

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "user": "507f1f77bcf86cd799439012",
    "cleaner": "507f1f77bcf86cd799439013",
    "serviceType": "regular_cleaning",
    "schedule": {
      "date": "2025-12-01T00:00:00.000Z",
      "startTime": "09:00",
      "duration": 4,
      "endTime": "13:00"
    },
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

**Note:** The cleaner will receive a notification when a booking is created.

---

### Get User's Bookings
**GET** `/api/bookings`

Get all bookings for the authenticated user.

**Access:** Private (User only)

**Headers:**
```
Authorization: Bearer <user_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `confirmed`, `in_progress`, `completed`, `cancelled`, `payment_pending`)

**Example Request:**
```
GET /api/bookings?status=pending
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "cleaner": {
        "_id": "507f1f77bcf86cd799439013",
        "user": {
          "_id": "507f1f77bcf86cd799439014",
          "name": "Jane Cleaner",
          "email": "jane@example.com",
          "phone": "+254798765432"
        }
      },
      "serviceType": "regular_cleaning",
      "schedule": {
        "date": "2025-12-01T00:00:00.000Z",
        "startTime": "09:00",
        "duration": 4,
        "endTime": "13:00"
      },
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2025-11-28T10:00:00.000Z"
    }
  ]
}
```

---

### Get Cleaner's Bookings
**GET** `/api/bookings/cleaner`

Get all bookings for the authenticated cleaner.

**Access:** Private (Cleaner only)

**Headers:**
```
Authorization: Bearer <cleaner_token>
```

**Query Parameters:**
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+254712345678"
      },
      "serviceType": "regular_cleaning",
      "schedule": {
        "date": "2025-12-01T00:00:00.000Z",
        "startTime": "09:00",
        "duration": 4
      },
      "status": "pending",
      "createdAt": "2025-11-28T10:00:00.000Z"
    }
  ]
}
```

---

### Get Booking by ID
**GET** `/api/bookings/:id`

Get a specific booking by ID. User can only access their own bookings, cleaner can only access their assigned bookings, admin can access all.

**Access:** Private (User/Cleaner/Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Booking ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+254712345678"
    },
    "cleaner": {
      "_id": "507f1f77bcf86cd799439013",
      "user": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Jane Cleaner",
        "email": "jane@example.com",
        "phone": "+254798765432"
      }
    },
    "serviceType": "regular_cleaning",
    "schedule": {
      "date": "2025-12-01T00:00:00.000Z",
      "startTime": "09:00",
      "duration": 4,
      "endTime": "13:00"
    },
    "address": {
      "street": "123 Main St",
      "city": "Nairobi",
      "state": "Nairobi",
      "zipCode": "00100"
    },
    "details": {
      "bedrooms": 3,
      "bathrooms": 2,
      "livingRooms": 1,
      "kitchens": 1
    },
    "pricing": {
      "baseAmount": 2000,
      "extraCharges": 500,
      "discount": 0,
      "totalAmount": 2500
    },
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

---

### Update Booking Status
**PUT** `/api/bookings/:id/status`

Update the status of a booking.

**Access:** Private (User/Cleaner/Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Booking ID

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `in_progress`
- `completed`
- `cancelled`
- `payment_pending`

**Response:**
```json
{
  "success": true,
  "message": "Booking status updated",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "status": "confirmed",
    "updatedAt": "2025-11-28T11:00:00.000Z"
  }
}
```

---

### Cancel Booking
**PUT** `/api/bookings/:id/cancel`

Cancel a booking.

**Access:** Private (User/Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Booking ID

**Request Body:**
```json
{
  "cancellationReason": "Change of plans" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "status": "cancelled",
    "cancellationReason": "Change of plans",
    "updatedAt": "2025-11-28T11:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Cannot cancel a completed booking"
}
```

---

## User Routes

### Get User Profile
**GET** `/api/users/me`

Get the current authenticated user's profile.

**Access:** Private (requires JWT)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+254712345678",
    "role": "user",
    "address": {
      "street": "123 Main St",
      "city": "Nairobi",
      "state": "Nairobi",
      "zipCode": "00100",
      "coordinates": {
        "lat": -1.2921,
        "lng": 36.8219
      }
    },
    "profilePhoto": "default-avatar.png",
    "isVerified": false,
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-11-28T10:00:00.000Z"
  }
}
```

---

### Update User Profile
**PUT** `/api/users/me`

Update the current user's profile.

**Access:** Private (requires JWT)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+254712345679",
  "address": {
    "street": "456 New St",
    "city": "Nairobi",
    "state": "Nairobi",
    "zipCode": "00101"
  },
  "profilePhoto": "new-photo.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "John Updated",
    "phone": "+254712345679",
    "address": {
      "street": "456 New St",
      "city": "Nairobi",
      "state": "Nairobi",
      "zipCode": "00101"
    },
    "updatedAt": "2025-11-28T11:00:00.000Z"
  }
}
```

---

### Get User's Bookings
**GET** `/api/users/me/bookings`

Get all bookings for the current user.

**Access:** Private (requires JWT)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "cleaner": {
        "_id": "507f1f77bcf86cd799439013",
        "user": {
          "_id": "507f1f77bcf86cd799439014",
          "name": "Jane Cleaner",
          "email": "jane@example.com",
          "phone": "+254798765432"
        }
      },
      "serviceType": "regular_cleaning",
      "schedule": {
        "date": "2025-12-01T00:00:00.000Z",
        "startTime": "09:00",
        "duration": 4
      },
      "status": "pending",
      "createdAt": "2025-11-28T10:00:00.000Z"
    }
  ]
}
```

---

## Cleaner Routes

### List/Search Cleaners
**GET** `/api/cleaners`

Get a list of verified cleaners with optional filters.

**Access:** Public

**Query Parameters:**
- `city` (optional): Filter by city
- `state` (optional): Filter by state
- `serviceType` (optional): Filter by service type (`residential`, `commercial`, `deep_cleaning`, `move_in_out`, `office`, `post_construction`)
- `minRating` (optional): Minimum rating (number)
- `maxPrice` (optional): Maximum hourly rate (number)
- `isAvailable` (optional): Filter by availability (`true`/`false`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```
GET /api/cleaners?city=Nairobi&minRating=4&maxPrice=1000&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "count": 20,
  "total": 45,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "user": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Jane Cleaner",
        "email": "jane@example.com",
        "phone": "+254798765432",
        "profilePhoto": "jane-photo.jpg"
      },
      "bio": "Experienced cleaner with 5 years in the industry",
      "experience": 5,
      "specialties": ["residential", "deep_cleaning"],
      "hourlyRate": 800,
      "rating": {
        "average": 4.8,
        "count": 25
      },
      "isVerified": true,
      "isAvailable": true,
      "servicesCompleted": 120,
      "createdAt": "2025-10-01T10:00:00.000Z"
    }
  ]
}
```

---

### Get Cleaner by ID
**GET** `/api/cleaners/:id`

Get detailed information about a specific cleaner.

**Access:** Public

**URL Parameters:**
- `id`: Cleaner ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "user": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Jane Cleaner",
      "email": "jane@example.com",
      "phone": "+254798765432",
      "profilePhoto": "jane-photo.jpg",
      "address": {
        "street": "789 Cleaner St",
        "city": "Nairobi",
        "state": "Nairobi",
        "zipCode": "00100"
      }
    },
    "bio": "Experienced cleaner with 5 years in the industry",
    "experience": 5,
    "specialties": ["residential", "deep_cleaning", "move_in_out"],
    "hourlyRate": 800,
    "availability": {
      "monday": true,
      "tuesday": true,
      "wednesday": true,
      "thursday": true,
      "friday": true,
      "saturday": false,
      "sunday": false
    },
    "workingHours": {
      "start": "08:00",
      "end": "17:00"
    },
    "rating": {
      "average": 4.8,
      "count": 25
    },
    "isVerified": true,
    "isAvailable": true,
    "servicesCompleted": 120,
    "earnings": {
      "total": 96000,
      "pending": 5000
    },
    "createdAt": "2025-10-01T10:00:00.000Z"
  }
}
```

---

### Apply as Cleaner
**POST** `/api/cleaners/apply`

Apply to become a cleaner (for users only).

**Access:** Private (User only)

**Headers:**
```
Authorization: Bearer <user_token>
```

**Request Body:**
```json
{
  "bio": "Experienced cleaner with 5 years in the industry",
  "experience": 5,
  "specialties": ["residential", "deep_cleaning"],
  "hourlyRate": 800,
  "availability": {
    "monday": true,
    "tuesday": true,
    "wednesday": true,
    "thursday": true,
    "friday": true,
    "saturday": false,
    "sunday": false
  },
  "workingHours": {
    "start": "08:00",
    "end": "17:00"
  },
  "documents": {
    "idPhoto": "https://example.com/id-photo.jpg",
    "certificate": "https://example.com/certificate.pdf",
    "policeClearance": "https://example.com/clearance.pdf"
  }
}
```

**Specialties Options:**
- `residential`
- `commercial`
- `deep_cleaning`
- `move_in_out`
- `office`
- `post_construction`

**Response:**
```json
{
  "success": true,
  "message": "Cleaner application submitted successfully",
  "data": {
    "applicationStatus": "pending",
    "appliedAt": "2025-11-28T10:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Cannot apply. Current application status: pending"
}
```

---

### Get Cleaner's Bookings
**GET** `/api/cleaners/me/bookings`

Get all bookings for the authenticated cleaner.

**Access:** Private (Cleaner only)

**Headers:**
```
Authorization: Bearer <cleaner_token>
```

**Query Parameters:**
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+254712345678"
      },
      "serviceType": "regular_cleaning",
      "schedule": {
        "date": "2025-12-01T00:00:00.000Z",
        "startTime": "09:00",
        "duration": 4
      },
      "status": "pending",
      "createdAt": "2025-11-28T10:00:00.000Z"
    }
  ]
}
```

---

### Update Cleaner Profile
**PUT** `/api/cleaners/me`

Update the authenticated cleaner's profile.

**Access:** Private (Cleaner only)

**Headers:**
```
Authorization: Bearer <cleaner_token>
```

**Request Body:**
```json
{
  "bio": "Updated bio with more experience",
  "experience": 6,
  "specialties": ["residential", "deep_cleaning", "office"],
  "hourlyRate": 900,
  "availability": {
    "monday": true,
    "tuesday": true,
    "wednesday": true,
    "thursday": true,
    "friday": true,
    "saturday": true,
    "sunday": false
  },
  "workingHours": {
    "start": "07:00",
    "end": "18:00"
  },
  "photos": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ],
  "isAvailable": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cleaner profile updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "bio": "Updated bio with more experience",
    "hourlyRate": 900,
    "isAvailable": true,
    "updatedAt": "2025-11-28T11:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide email and password"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role user is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Booking not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server Error",
  "error": "Error message details"
}
```

---

## Authentication Flow

1. **Register/Login** to get a JWT token
2. **Include token** in the `Authorization` header for protected routes:
   ```
   Authorization: Bearer <your_jwt_token>
   ```
3. **Token expires** based on `JWT_EXPIRE` environment variable (default: 30 days)

---

## Notes

- All dates are in ISO 8601 format (UTC)
- All prices are in KES (Kenyan Shillings)
- Phone numbers should include country code (e.g., +254 for Kenya)
- Cleaner notifications are logged to console when bookings are created (SMS/Email integration can be added)
- Pagination defaults: `page=1`, `limit=10`
- All timestamps are in UTC

---

## Logging System

The backend uses a comprehensive logging system built with Winston. All logs are stored both in files and MongoDB for easy retrieval through the admin panel.

### Log Levels

The system supports the following log levels:
- **error**: Error events that might still allow the application to continue running
- **warn**: Warning messages for potentially harmful situations
- **info**: Informational messages highlighting the progress of the application
- **http**: HTTP request/response logging
- **verbose**: Detailed informational messages
- **debug**: Debug-level messages for development
- **silly**: The most verbose logging level

### Log Storage

1. **File Logs**: Stored in `Backend/logs/` directory
   - `combined.log`: All logs
   - `error.log`: Error-level logs only
   - `debug.log`: Debug-level logs only
   - `exceptions.log`: Uncaught exceptions
   - `rejections.log`: Unhandled promise rejections

2. **Database Logs**: Stored in MongoDB `logs` collection for admin panel access

### Log Retention

Logs in MongoDB are automatically deleted after the retention period (default: 90 days, configurable via `LOG_RETENTION_DAYS` environment variable).

### Logging Features

- **Automatic HTTP Request/Response Logging**: All API requests are automatically logged with request details, response status, and response time
- **User Context**: Logs include user information when authenticated
- **Error Stack Traces**: Errors include full stack traces for debugging
- **Searchable**: All logs can be filtered and searched through admin endpoints
- **Admin Dashboard**: Super admins can view and manage logs through the admin panel

---

## Environment Variables

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT expiration time (e.g., "30d")
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

Optional environment variables:
- `LOG_LEVEL` - Minimum log level to record (default: `info`)
- `LOG_RETENTION_DAYS` - Number of days to retain logs in database (default: 90)

---

**Last Updated:** November 28, 2025


