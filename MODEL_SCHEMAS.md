# MadEasy Model Schemas & Data Integrity Documentation

## Table of Contents

1. [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
2. [User Model](#user-model)
3. [Cleaner Model](#cleaner-model)
4. [Booking Model](#booking-model)
5. [Admin Model](#admin-model)
6. [Log Model](#log-model)
7. [Relationships Summary](#relationships-summary)
8. [Index Summary](#index-summary)
9. [Data Integrity Rules](#data-integrity-rules)

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐
│    User     │
│─────────────│
│ _id (PK)    │
│ email (UQ)  │◄──────────┐
│ phone (UQ)  │           │
│ role        │           │
│ ...         │           │
└─────────────┘           │
       │                  │
       │ 1                │ 1
       │                  │
       │ has many        │ referenced by
       │                  │
       ▼                  │
┌─────────────┐           │
│  Booking    │           │
│─────────────│           │
│ _id (PK)    │           │
│ user (FK)   │───────────┘
│ cleaner (FK)│───────────┐
│ status      │           │
│ ...         │           │
└─────────────┘           │
                          │
                          │
┌─────────────┐           │
│  Cleaner    │           │
│─────────────│           │
│ _id (PK)    │           │
│ user (FK/UQ)│───────────┘
│ isVerified  │
│ hourlyRate  │
│ ...         │
└─────────────┘

┌─────────────┐
│    Admin    │
│─────────────│
│ _id (PK)    │
│ email (UQ)  │◄──────────┐
│ role        │           │
│ ...         │           │
└─────────────┘           │
                          │
                          │ 1
                          │ reviews
                          │
                          │
┌─────────────┐           │
│    User     │           │
│─────────────│           │
│ ...         │           │
│ cleanerApp. │           │
│   reviewedBy│───────────┘
│   (FK)      │
└─────────────┘

┌─────────────┐
│    Log      │
│─────────────│
│ _id (PK)    │
│ level       │
│ timestamp   │
│ user.id     │ (Optional FK)
│ ...         │
└─────────────┘
```

### Relationship Summary

- **User → Cleaner**: One-to-One (User can have at most one Cleaner profile)
- **User → Booking**: One-to-Many (User can have many Bookings)
- **Cleaner → Booking**: One-to-Many (Cleaner can have many Bookings)
- **Admin → User.cleanerApplication.reviewedBy**: One-to-Many (Admin can review many applications)
- **User → Log**: One-to-Many (User can have many Log entries, optional)

---

## User Model

### Schema Overview

The User model represents all users in the system (regular users, cleaners, admins). Users can apply to become cleaners through an embedded application system.

### Field Definitions

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `_id` | ObjectId | Yes | Yes | Auto-generated | Primary key |
| `name` | String | Yes | No | maxlength: 50, trim | User's full name |
| `email` | String | Yes | Yes | lowercase, email regex | User's email address |
| `password` | String | Yes | No | minlength: 6, select: false | Hashed password |
| `phone` | String | Yes | Yes | phone regex, trim | User's phone number |
| `role` | String | Yes | No | enum: ['user', 'cleaner', 'admin'], default: 'user' | User role |
| `profilePhoto` | String | No | No | default: 'default-avatar.png' | Profile photo filename |
| `address.street` | String | No | No | - | Street address |
| `address.city` | String | No | No | - | City |
| `address.state` | String | No | No | - | State/Province |
| `address.zipCode` | String | No | No | - | ZIP/Postal code |
| `address.coordinates.lat` | Number | No | No | min: -90, max: 90 | Latitude |
| `address.coordinates.lng` | Number | No | No | min: -180, max: 180 | Longitude |
| `address.location` | GeoJSON | No | No | 2dsphere index, sparse | GeoJSON Point for geospatial queries |
| `isVerified` | Boolean | No | No | default: false | Email verification status |
| `verificationToken` | String | No | No | - | Email verification token |
| `resetPasswordToken` | String | No | No | - | Password reset token |
| `resetPasswordExpire` | Date | No | No | - | Password reset token expiration |
| `cleanerApplication.status` | String | No | No | enum: ['not_applied', 'pending', 'approved', 'rejected'], default: 'not_applied' | Application status |
| `cleanerApplication.appliedAt` | Date | No | No | - | Application submission date |
| `cleanerApplication.reviewedAt` | Date | No | No | - | Application review date |
| `cleanerApplication.reviewedBy` | ObjectId | No | No | ref: 'Admin' | Admin who reviewed application |
| `cleanerApplication.rejectionReason` | String | No | No | - | Rejection reason if rejected |
| `cleanerApplication.bio` | String | No | No | maxlength: 500 | Cleaner bio |
| `cleanerApplication.experience` | Number | No | No | min: 0, default: 0 | Years of experience |
| `cleanerApplication.specialties` | [String] | No | No | enum array | Service specialties |
| `cleanerApplication.hourlyRate` | Number | No | No | min: 100 | Hourly rate in KSh |
| `cleanerApplication.availability.*` | Boolean | No | No | default varies by day | Day availability |
| `cleanerApplication.workingHours.start` | String | No | No | default: '08:00' | Work start time |
| `cleanerApplication.workingHours.end` | String | No | No | default: '17:00' | Work end time |
| `cleanerApplication.documents.*` | String | No | No | - | Document URLs |
| `preferences.notifications.*` | Boolean | No | No | default: true | Notification preferences |
| `preferences.language` | String | No | No | default: 'en' | Language preference |
| `createdAt` | Date | Yes | No | Auto-generated | Creation timestamp |
| `updatedAt` | Date | Yes | No | Auto-updated | Last update timestamp |

### Indexes

1. **Email Index** (Unique)
   - Field: `email`
   - Type: Single field, unique
   - Purpose: Fast email lookups, enforce uniqueness

2. **Phone Index** (Unique)
   - Field: `phone`
   - Type: Single field, unique
   - Purpose: Fast phone lookups, enforce uniqueness

3. **Role + Application Status Index** (Compound)
   - Fields: `role`, `cleanerApplication.status`
   - Type: Compound
   - Purpose: Query users by role and application status

4. **Application Status Index**
   - Field: `cleanerApplication.status`
   - Type: Single field
   - Purpose: Filter pending/approved applications

5. **Geospatial Index** (Sparse)
   - Field: `address.location`
   - Type: 2dsphere, sparse
   - Purpose: Location-based queries (near me, distance calculations)

### Validation Rules

1. **Email Format**: Must match valid email regex pattern
2. **Phone Format**: Must match phone number regex pattern
3. **Password Length**: Minimum 6 characters
4. **Name Length**: Maximum 50 characters
5. **Cleaner Application Hourly Rate**: Only allowed when status is not 'not_applied'
6. **ReviewedBy Reference**: Must reference valid Admin if provided
7. **Coordinates Range**: Latitude [-90, 90], Longitude [-180, 180]

### Methods

- `getSignedJwtToken()`: Generate JWT token for authentication
- `matchPassword(enteredPassword)`: Compare password with hash
- `applyAsCleaner(applicationData)`: Submit cleaner application
- `canApplyAsCleaner()`: Check if user can apply
- `isApprovedCleaner()`: Check if user is approved cleaner
- `getApplicationStatus()`: Get application status

### Static Methods

- `getPendingApplications()`: Get all pending applications
- `getApprovedCleaners()`: Get all approved cleaners
- `countPendingApplications()`: Count pending applications
- `countApprovedCleaners()`: Count approved cleaners

---

## Cleaner Model

### Schema Overview

The Cleaner model represents approved cleaner profiles. Each Cleaner is linked to exactly one User through a one-to-one relationship.

### Field Definitions

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `_id` | ObjectId | Yes | Yes | Auto-generated | Primary key |
| `user` | ObjectId | Yes | Yes | ref: 'User' | Reference to User (unique) |
| `bio` | String | No | No | maxlength: 500 | Cleaner bio |
| `experience` | Number | No | No | min: 0, default: 0 | Years of experience |
| `specialties` | [String] | No | No | enum array | Service specialties |
| `hourlyRate` | Number | Yes | No | min: 100 | Hourly rate in KSh |
| `availability.monday` | Boolean | No | No | default: true | Monday availability |
| `availability.tuesday` | Boolean | No | No | default: true | Tuesday availability |
| `availability.wednesday` | Boolean | No | No | default: true | Wednesday availability |
| `availability.thursday` | Boolean | No | No | default: true | Thursday availability |
| `availability.friday` | Boolean | No | No | default: true | Friday availability |
| `availability.saturday` | Boolean | No | No | default: false | Saturday availability |
| `availability.sunday` | Boolean | No | No | default: false | Sunday availability |
| `workingHours.start` | String | No | No | default: '08:00' | Work start time |
| `workingHours.end` | String | No | No | default: '17:00' | Work end time |
| `photos` | [String] | No | No | - | Photo URLs |
| `documents.idPhoto` | String | No | No | - | ID photo URL |
| `documents.certificate` | String | No | No | - | Certificate URL |
| `documents.policeClearance` | String | No | No | - | Police clearance URL |
| `rating.average` | Number | No | No | min: 0, max: 5, default: 0 | Average rating |
| `rating.count` | Number | No | No | min: 0, default: 0 | Number of ratings |
| `isVerified` | Boolean | No | No | default: false | Verification status |
| `isAvailable` | Boolean | No | No | default: true | Current availability |
| `servicesCompleted` | Number | No | No | min: 0, default: 0 | Total services completed |
| `earnings.total` | Number | No | No | min: 0, default: 0 | Total earnings |
| `earnings.pending` | Number | No | No | min: 0, default: 0 | Pending earnings |
| `createdAt` | Date | Yes | No | Auto-generated | Creation timestamp |
| `updatedAt` | Date | Yes | No | Auto-updated | Last update timestamp |

### Indexes

1. **User Index** (Unique)
   - Field: `user`
   - Type: Single field, unique
   - Purpose: Enforce one cleaner per user, fast user lookups

2. **Verified + Available + Rating Index** (Compound)
   - Fields: `isVerified`, `isAvailable`, `rating.average`
   - Type: Compound (rating descending)
   - Purpose: Find best available cleaners

3. **Specialties Index** (Multikey)
   - Field: `specialties`
   - Type: Multikey array index
   - Purpose: Filter cleaners by service type

4. **Hourly Rate Index**
   - Field: `hourlyRate`
   - Type: Single field
   - Purpose: Price range queries

5. **Search Pattern Index** (Compound)
   - Fields: `isVerified`, `isAvailable`, `hourlyRate`, `rating.average`
   - Type: Compound (rating descending)
   - Purpose: Comprehensive search queries

6. **Services Completed Index**
   - Field: `servicesCompleted`
   - Type: Single field, descending
   - Purpose: Sort by experience

### Validation Rules

1. **User Reference**: Must reference valid User
2. **Hourly Rate**: Minimum 100 KSh
3. **Rating Average**: Must be between 0 and 5
4. **Rating Count**: Cannot be negative
5. **Earnings**: Cannot be negative
6. **Services Completed**: Cannot be negative
7. **User Uniqueness**: One user can only have one cleaner profile

### Relationships

- **User**: One-to-One (via `user` field, unique constraint)

---

## Booking Model

### Schema Overview

The Booking model represents service bookings made by users for cleaners. Includes scheduling, pricing, status tracking, and payment information.

### Field Definitions

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `_id` | ObjectId | Yes | Yes | Auto-generated | Primary key |
| `user` | ObjectId | Yes | No | ref: 'User' | Booking user |
| `cleaner` | ObjectId | Yes | No | ref: 'Cleaner' | Assigned cleaner |
| `serviceType` | String | Yes | No | enum: ['regular_cleaning', 'deep_cleaning', 'move_in_out', 'office_cleaning', 'post_construction'] | Service type |
| `schedule.date` | Date | Yes | No | Must be in future (except completed/cancelled) | Booking date |
| `schedule.startTime` | String | Yes | No | - | Start time (HH:mm) |
| `schedule.duration` | Number | Yes | No | min: 1 | Duration in hours |
| `schedule.endTime` | String | No | No | Auto-calculated | End time (HH:mm) |
| `address.street` | String | Yes | No | - | Street address |
| `address.city` | String | Yes | No | - | City |
| `address.state` | String | Yes | No | - | State |
| `address.zipCode` | String | No | No | - | ZIP code |
| `address.instructions` | String | No | No | - | Delivery instructions |
| `address.coordinates.lat` | Number | No | No | min: -90, max: 90 | Latitude |
| `address.coordinates.lng` | Number | No | No | min: -180, max: 180 | Longitude |
| `address.location` | GeoJSON | No | No | 2dsphere index, sparse | GeoJSON Point |
| `details.bedrooms` | Number | No | No | min: 0, default: 0 | Number of bedrooms |
| `details.bathrooms` | Number | No | No | min: 0, default: 0 | Number of bathrooms |
| `details.livingRooms` | Number | No | No | min: 0, default: 0 | Number of living rooms |
| `details.kitchens` | Number | No | No | min: 0, default: 0 | Number of kitchens |
| `details.extraTasks` | [String] | No | No | - | Additional tasks |
| `details.specialInstructions` | String | No | No | - | Special instructions |
| `pricing.baseAmount` | Number | Yes | No | min: 0 | Base price |
| `pricing.extraCharges` | Number | No | No | min: 0, default: 0 | Extra charges |
| `pricing.discount` | Number | No | No | min: 0, default: 0 | Discount amount |
| `pricing.totalAmount` | Number | Yes | No | min: 0 | Total amount (validated = base + extra - discount) |
| `status` | String | Yes | No | enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'payment_pending'], default: 'pending' | Booking status |
| `paymentStatus` | String | Yes | No | enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' | Payment status |
| `payment` | ObjectId | No | No | ref: 'Payment' | Payment reference (optional) |
| `rating.score` | Number | No | No | min: 1, max: 5 | Rating score (1-5) |
| `rating.review` | String | No | No | - | Review text |
| `rating.createdAt` | Date | No | No | - | Rating date |
| `cancellationReason` | String | No | No | - | Reason for cancellation |
| `rescheduledFrom` | ObjectId | No | No | ref: 'Booking' | Original booking if rescheduled |
| `createdAt` | Date | Yes | No | Auto-generated | Creation timestamp |
| `updatedAt` | Date | Yes | No | Auto-updated | Last update timestamp |

### Indexes

1. **User Bookings Index** (Compound)
   - Fields: `user`, `status`, `schedule.date`
   - Type: Compound (date descending)
   - Purpose: Get user's bookings sorted by date

2. **Cleaner Bookings Index** (Compound)
   - Fields: `cleaner`, `status`, `schedule.date`
   - Type: Compound (date descending)
   - Purpose: Get cleaner's bookings sorted by date

3. **Conflict Detection Index** (Compound)
   - Fields: `cleaner`, `schedule.date`, `schedule.startTime`
   - Type: Compound
   - Purpose: Detect scheduling conflicts

4. **Admin Queries Index** (Compound)
   - Fields: `status`, `schedule.date`
   - Type: Compound
   - Purpose: Admin dashboard queries

5. **Service Type Index**
   - Field: `serviceType`
   - Type: Single field
   - Purpose: Filter by service type

6. **Payment Status Index** (Compound)
   - Fields: `paymentStatus`, `status`
   - Type: Compound
   - Purpose: Payment queries

7. **Geospatial Index** (Sparse)
   - Field: `address.location`
   - Type: 2dsphere, sparse
   - Purpose: Location-based queries

8. **Date Range Index** (Compound)
   - Fields: `schedule.date`, `status`
   - Type: Compound
   - Purpose: Date range queries

9. **Rating Index**
   - Field: `rating.score`
   - Type: Single field, descending
   - Purpose: Sort by rating

### Validation Rules

1. **Schedule Date**: Must be in future for new bookings (except completed/cancelled)
2. **Pricing Validation**: `totalAmount` must equal `baseAmount + extraCharges - discount` (±0.01 tolerance)
3. **Rating**: Only allowed when status is 'completed'
4. **Payment Status Consistency**: Status 'payment_pending' requires paymentStatus 'pending'
5. **User Reference**: Must reference valid User
6. **Cleaner Reference**: Must reference valid, verified, available Cleaner
7. **Scheduling Conflicts**: Prevents overlapping bookings for same cleaner
8. **RescheduledFrom**: Must reference valid Booking if provided

### Relationships

- **User**: Many-to-One (via `user` field)
- **Cleaner**: Many-to-One (via `cleaner` field)
- **Payment**: One-to-One (via `payment` field, optional)
- **Booking**: One-to-One (via `rescheduledFrom` field, self-reference)

---

## Admin Model

### Schema Overview

The Admin model represents system administrators with different roles and permissions.

### Field Definitions

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `_id` | ObjectId | Yes | Yes | Auto-generated | Primary key |
| `name` | String | Yes | No | trim | Admin name |
| `email` | String | Yes | Yes | lowercase, email regex | Admin email |
| `password` | String | Yes | No | minlength: 6, select: false | Hashed password |
| `role` | String | Yes | No | enum: ['admin', 'super_admin'], default: 'admin' | Admin role |
| `permissions` | [String] | No | No | enum array | Permission list |
| `isActive` | Boolean | No | No | default: true | Active status |
| `createdAt` | Date | Yes | No | Auto-generated | Creation timestamp |
| `updatedAt` | Date | Yes | No | Auto-updated | Last update timestamp |

### Indexes

1. **Email Index** (Unique)
   - Field: `email`
   - Type: Single field, unique
   - Purpose: Fast email lookups, enforce uniqueness

2. **Role Index**
   - Field: `role`
   - Type: Single field
   - Purpose: Filter by role

3. **Active + Role Index** (Compound)
   - Fields: `isActive`, `role`
   - Type: Compound
   - Purpose: Find active admins by role

### Validation Rules

1. **Email Format**: Must match valid email regex pattern
2. **Password Length**: Minimum 6 characters
3. **Role**: Must be 'admin' or 'super_admin'
4. **Permissions**: Must be from allowed enum values

### Methods

- `getSignedJwtToken()`: Generate JWT token for authentication
- `matchPassword(enteredPassword)`: Compare password with hash

### Relationships

- **User.cleanerApplication.reviewedBy**: One-to-Many (Admin can review many applications)

---

## Log Model

### Schema Overview

The Log model stores system logs for monitoring, debugging, and auditing. Includes automatic TTL-based deletion.

### Field Definitions

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `_id` | ObjectId | Yes | Yes | Auto-generated | Primary key |
| `level` | String | Yes | No | enum: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'] | Log level |
| `message` | String | Yes | No | - | Log message |
| `meta` | Mixed | No | No | default: {} | Additional metadata |
| `timestamp` | Date | No | No | default: Date.now | Log timestamp |
| `request.method` | String | No | No | - | HTTP method |
| `request.url` | String | No | No | - | Request URL |
| `request.path` | String | No | No | - | Request path |
| `request.query` | Mixed | No | No | - | Query parameters |
| `request.params` | Mixed | No | No | - | Route parameters |
| `request.headers` | Mixed | No | No | - | Request headers |
| `request.ip` | String | No | No | - | Client IP address |
| `request.userAgent` | String | No | No | - | User agent string |
| `response.statusCode` | Number | No | No | - | HTTP status code |
| `response.statusMessage` | String | No | No | - | Status message |
| `response.responseTime` | Number | No | No | - | Response time (ms) |
| `user.id` | ObjectId | No | No | - | User ID (optional) |
| `user.email` | String | No | No | - | User email (optional) |
| `user.role` | String | No | No | - | User role (optional) |
| `error.name` | String | No | No | - | Error name |
| `error.message` | String | No | No | - | Error message |
| `error.stack` | String | No | No | - | Error stack trace |
| `service` | String | No | No | default: 'madeasy-backend' | Service name |
| `createdAt` | Date | Yes | No | Auto-generated, TTL index | Creation timestamp |
| `updatedAt` | Date | Yes | No | Auto-updated | Last update timestamp |

### Indexes

1. **Level + Timestamp Index** (Compound)
   - Fields: `level`, `timestamp`
   - Type: Compound (timestamp descending)
   - Purpose: Query logs by level and time

2. **Timestamp Index**
   - Field: `timestamp`
   - Type: Single field, descending
   - Purpose: Time-based queries

3. **User Logs Index** (Compound)
   - Fields: `user.id`, `timestamp`
   - Type: Compound (timestamp descending)
   - Purpose: User-specific log queries

4. **Endpoint Index** (Compound)
   - Fields: `request.path`, `timestamp`
   - Type: Compound (timestamp descending)
   - Purpose: Endpoint-specific queries

5. **Status Code Index** (Compound)
   - Fields: `response.statusCode`, `timestamp`
   - Type: Compound (timestamp descending)
   - Purpose: HTTP status queries

6. **Level + User Index** (Compound)
   - Fields: `level`, `user.id`, `timestamp`
   - Type: Compound (timestamp descending)
   - Purpose: User-specific log level queries

7. **TTL Index**
   - Field: `createdAt`
   - Type: TTL (expireAfterSeconds: configurable, default: 90 days)
   - Purpose: Automatic log cleanup

### Validation Rules

1. **Level**: Must be from allowed enum values
2. **Message**: Required
3. **Service**: Defaults to 'madeasy-backend'

### Relationships

- **User**: Many-to-One (via `user.id` field, optional)

---

## Relationships Summary

### Primary Relationships

1. **User → Cleaner**: One-to-One
   - One User can have at most one Cleaner profile
   - Enforced by unique index on `Cleaner.user`
   - When User's `cleanerApplication.status` = 'approved', Cleaner profile is created/verified

2. **User → Booking**: One-to-Many
   - One User can create many Bookings
   - Bookings reference User via `Booking.user` (FK)

3. **Cleaner → Booking**: One-to-Many
   - One Cleaner can have many Bookings
   - Bookings reference Cleaner via `Booking.cleaner` (FK)

4. **Admin → User.cleanerApplication**: One-to-Many
   - One Admin can review many cleaner applications
   - Applications reference Admin via `User.cleanerApplication.reviewedBy` (FK)

5. **User → Log**: One-to-Many (Optional)
   - One User can have many Log entries
   - Logs optionally reference User via `Log.user.id` (FK)

### Cardinality Rules

- **User ↔ Cleaner**: 1:0..1 (User may have 0 or 1 Cleaner profile)
- **User ↔ Booking**: 1:N (User has many Bookings)
- **Cleaner ↔ Booking**: 1:N (Cleaner has many Bookings)
- **Admin ↔ User.cleanerApplication**: 1:N (Admin reviews many applications)
- **User ↔ Log**: 1:N (User has many Log entries, optional)

### Referential Integrity

- **Cascade Rules**: None (MongoDB doesn't enforce foreign keys)
- **Orphan Prevention**: Validated in pre-save hooks
- **Deletion Handling**: 
  - Deleting User: Should handle Cleaner and Bookings (application logic)
  - Deleting Cleaner: Should prevent if has active Bookings
  - Deleting Booking: Safe (no dependent records)

---

## Index Summary

### Performance Indexes

All models include indexes optimized for common query patterns:

1. **Unique Indexes**: Enforce data uniqueness (email, phone, user references)
2. **Compound Indexes**: Optimize multi-field queries (status + date, role + status)
3. **Geospatial Indexes**: Enable location-based queries (2dsphere)
4. **TTL Indexes**: Automatic cleanup (Log model)
5. **Sparse Indexes**: Index only documents with specific fields

### Index Strategy

- **Query Optimization**: Indexes created based on API endpoint query patterns
- **Write Performance**: Minimal indexes to balance read/write performance
- **Geospatial Queries**: 2dsphere indexes for "near me" and distance calculations
- **Time-Based Queries**: Descending indexes on timestamps for recent-first sorting

---

## Data Integrity Rules

### Validation Rules

1. **Required Fields**: Enforced at schema level
2. **Data Types**: Enforced by Mongoose type system
3. **Enum Values**: Restricted to predefined values
4. **Range Validation**: Min/max constraints on numeric fields
5. **Format Validation**: Regex patterns for emails, phones, etc.
6. **Custom Validators**: Business logic validation in pre-save hooks

### Referential Integrity

1. **Foreign Key Validation**: Pre-save hooks validate all FK references
2. **Orphan Prevention**: Hooks prevent invalid references
3. **Existence Checks**: All FK references validated against target collection

### Business Logic Constraints

1. **Cleaner Application**: Hourly rate only when status != 'not_applied'
2. **Booking Date**: Must be in future for new bookings
3. **Pricing Calculation**: Total amount must match calculation
4. **Rating Timing**: Ratings only allowed for completed bookings
5. **Scheduling Conflicts**: Overlapping bookings prevented
6. **Cleaner Availability**: Only verified, available cleaners can be booked
7. **Payment Status**: Consistent with booking status

### Data Consistency

1. **Automatic Calculations**: End time calculated from start time + duration
2. **GeoJSON Conversion**: Coordinates automatically converted for geospatial queries
3. **Password Hashing**: Automatic encryption before save
4. **Timestamp Management**: Automatic createdAt/updatedAt handling

---

## Notes

- All timestamps are in UTC
- All prices are in Kenyan Shillings (KES)
- Phone numbers should include country code (+254 for Kenya)
- GeoJSON coordinates format: [longitude, latitude] (NOT [lat, lng])
- Payment model is referenced but not yet implemented (field is optional)

---

**Last Updated**: December 2024
**Version**: 1.0

