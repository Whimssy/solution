# Cleaner Database Save Verification Guide

This document explains how to verify that cleaner creation properly saves to the database.

## Overview

When a user applies to become a cleaner via `POST /api/cleaners/apply`, the system performs two database operations:

1. **User Document Update**: Updates the User document with `cleanerApplication` data
2. **Cleaner Document Creation**: Creates or updates a Cleaner document in the `cleaners` collection

## Implementation Details

### Transaction Support

The cleaner creation process attempts to use MongoDB transactions for atomicity (both operations succeed or both fail). If transactions aren't supported (e.g., no replica set), it falls back to individual operations with detailed error logging.

### Error Logging

Both operations include detailed error logging:
- Success logs confirm which operation completed
- Error logs include user ID, error message, and stack trace
- Verification step confirms Cleaner document was created

### Verification Step

After both operations complete, the system verifies that the Cleaner document exists in the database before returning a success response.

## Testing

### Automated Test Script

Run the automated test script to verify data persistence:

```bash
# Using pnpm (recommended)
pnpm run test:cleaner-save

# Or using node directly
node Backend/scripts/testCleanerSave.js
```

The test script will:
1. Create a test user
2. Apply as cleaner (simulating the API call)
3. Verify both User and Cleaner documents are saved correctly
4. Verify the relationship between User and Cleaner documents

### Manual Verification

#### 1. Check Environment Configuration

Ensure `MONGODB_URI` is set in your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/mamafua
```

#### 2. Create a Cleaner Application

Make a POST request to `/api/cleaners/apply` with valid user authentication:

```bash
curl -X POST http://localhost:5000/api/cleaners/apply \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Experienced cleaner",
    "experience": 3,
    "specialties": ["residential", "deep_cleaning"],
    "hourlyRate": 800
  }'
```

#### 3. Verify in MongoDB

Query the database to verify both documents were saved:

**Check User Document:**
```javascript
db.users.findOne({ _id: ObjectId("USER_ID") })
// Should have cleanerApplication object with status: "pending"
```

**Check Cleaner Document:**
```javascript
db.cleaners.findOne({ user: ObjectId("USER_ID") })
// Should exist with bio, hourlyRate, and isVerified: false
```

#### 4. Check Server Logs

Look for these log messages in the server console:

```
✅ User document saved successfully for user: USER_ID
✅ Cleaner document saved successfully for user: USER_ID, cleaner ID: CLEANER_ID
✅ Verification passed: Cleaner document confirmed in database for user: USER_ID
```

## Troubleshooting

### Issue: User document saved but Cleaner document missing

**Possible Causes:**
- Cleaner document creation failed after user save
- Transaction rollback occurred
- Database connection issue

**Solution:**
- Check server logs for error messages
- Verify MongoDB connection is stable
- Run the test script to identify the issue

### Issue: Transaction errors

**Possible Causes:**
- MongoDB instance doesn't have replica set configured
- This is normal for development - the system will fall back to individual operations

**Solution:**
- No action needed - the fallback mechanism handles this automatically
- For production, configure a replica set to enable transactions

### Issue: Verification fails

**Possible Causes:**
- Cleaner document wasn't created despite successful operation
- Database query timing issue
- Document ID mismatch

**Solution:**
- Check server logs for detailed error information
- Query MongoDB directly to verify document existence
- Contact support if issue persists

## Environment Variables

Required environment variables (see `.env.example` for reference):

- `MONGODB_URI` - MongoDB connection string (required)
- `JWT_SECRET` - Secret key for JWT tokens (required)
- `JWT_EXPIRE` - JWT expiration time (optional, default: "30d")
- `PORT` - Server port (optional, default: 5000)
- `NODE_ENV` - Environment (optional, default: "development")

## Database Schema

### User Document - cleanerApplication Field

```javascript
{
  cleanerApplication: {
    status: "pending" | "approved" | "rejected" | "not_applied",
    appliedAt: Date,
    bio: String,
    experience: Number,
    specialties: [String],
    hourlyRate: Number,
    availability: Object,
    workingHours: Object,
    documents: Object
  }
}
```

### Cleaner Document

```javascript
{
  user: ObjectId, // Reference to User document
  bio: String,
  experience: Number,
  specialties: [String],
  hourlyRate: Number,
  availability: Object,
  workingHours: Object,
  isVerified: Boolean, // false until admin approves
  // ... other fields
}
```

## Related Files

- `Backend/controllers/cleanerController.js` - Main controller with save logic
- `Backend/models/User.js` - User model with cleanerApplication schema
- `Backend/models/Cleaner.js` - Cleaner model schema
- `Backend/scripts/testCleanerSave.js` - Test script for verification
- `Backend/config/database.js` - Database connection configuration

