# Data Model: Incident Response Coordination

## Entity Overview

- **User**: Represents any authenticated participant (admin, dispatcher, responder, citizen account).
- **Incident**: Captures emergency report lifecycle from submission through resolution.
- **IncidentMedia**: Stores metadata for media files associated with incidents.
- **Assignment**: Tracks responder engagement on incidents.
- **NotificationLog**: Records notification attempts and delivery outcomes.
- **AuditLog**: Maintains immutable trail of privileged actions.
- **RateLimitRecord**: Persists throttling counters and challenge states for anonymous submissions.

## User

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| id | UUID | Unique identifier | Generated via Prisma UUID default |
| email | String | Login email for authenticated users | Nullable for anonymous citizens |
| name | String | Display name | |
| role | Enum(admin, dispatcher, responder, citizen) | Access and permissions tier | |
| hashed_password | String | Credential hash | Bcrypt/Argon2 stored server-side |
| metadata | JSON | Device info, preferences | Optional |
| created_at | DateTime | Creation timestamp | Default now |
| updated_at | DateTime | Last update timestamp | Auto-updated |
| last_seen | DateTime | Last active heartbeat | Optional |
| device_tokens | String[] | Expo push tokens or device identifiers | Validated before insert |

### Relationships
- One-to-many with `Incident` (reporter).
- One-to-many with `Assignment` (responder or assigner).
- One-to-many with `NotificationLog` and `AuditLog` (actor_id).

## Incident

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| id | UUID | Unique incident identifier | Primary key |
| type | String | Incident category | Controlled vocabulary maintained in config |
| description | String | Narrative description | Optional when media provided |
| latitude | Decimal(9,6) | Latitude coordinate | Optional; cross-validated with geocoder |
| longitude | Decimal(9,6) | Longitude coordinate | Optional |
| address | String | Resolved address text | Derived from geocoding |
| status | Enum(pending, assigned, responding, resolved, escalated) | Lifecycle state | Default pending |
| severity | Enum(low, medium, high, critical) | Dispatcher-assigned severity | Default medium |
| reporter_id | UUID | Foreign key to `User` | Nullable for anonymous |
| device_fingerprint | String | Hashed fingerprint for anonymous submissions | Optional |
| created_at | DateTime | Submission timestamp | |
| updated_at | DateTime | Last update timestamp | |

### Relationships
- One-to-many with `IncidentMedia` and `Assignment`.
- One-to-many with `NotificationLog` (incident context).
- One-to-many with `AuditLog` for tracking transitions.

### State Transitions
- `pending` → `assigned` (dispatcher assigns responder).
- `assigned` → `responding` (responder acknowledges assignment).
- `responding` → `resolved` (responder completes incident).
- Any state → `escalated` (dispatcher escalates severity/event).
- Transitions recorded in `AuditLog` with actor and rationale.

## IncidentMedia

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| id | UUID | Unique media identifier | |
| incident_id | UUID | Foreign key to `Incident` | |
| url | String | Signed URL to object storage | Rotated via presigned URL |
| type | Enum(image, video) | Media format | Validation for file type |
| uploaded_by | UUID | References `User` | Nullable for anonymous |
| uploaded_at | DateTime | Upload timestamp | |
| status | Enum(pending_scan, approved, rejected) | Malware scan state | |

## Assignment

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| id | UUID | Unique assignment identifier | |
| incident_id | UUID | Linked incident | |
| responder_id | UUID | References `User` with responder role | |
| assigned_by | UUID | Dispatcher who created assignment | |
| assigned_at | DateTime | Creation timestamp | |
| accepted_at | DateTime | Responder acknowledgement | Nullable |
| completed_at | DateTime | Incident completion time | Nullable |

## NotificationLog

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| id | UUID | Identifier for notification attempt | |
| user_id | UUID | Target user | |
| incident_id | UUID | Related incident | Nullable |
| channel | Enum(push, sms) | Delivery mechanism | |
| payload | JSON | Title/body/data metadata | |
| status | Enum(pending, delivered, failed, retried) | Delivery outcome | |
| error_message | String | Error description if failed | Optional |
| sent_at | DateTime | Timestamp of send attempt | |

## AuditLog

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| id | UUID | Log entry identifier | |
| actor_id | UUID | User performing action | Nullable for automated jobs |
| action | String | Action code (status_change, assignment_create, etc.) | |
| target_type | String | Entity impacted (incident, assignment, notification) | |
| target_id | UUID | Identifier of impacted entity | |
| details | JSON | Structured payload capturing before/after | |
| timestamp | DateTime | Event time | |

## RateLimitRecord

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| id | UUID | Record identifier | |
| device_fingerprint | String | Hashed device ID | Unique constraint where available |
| ip_hash | String | Hashed IP value | |
| window_start | DateTime | Start of rate limit window | |
| request_count | Integer | Requests within window | |
| captcha_required | Boolean | Whether CAPTCHA is currently enforced | |
| last_attempt_at | DateTime | Last request timestamp | |

## Derived Views & Indexes

- **Incident search index**: Composite index on `(status, updated_at)` and geospatial index on
  `(latitude, longitude)` for bounding box queries.
- **Notification retry queue**: Filter `NotificationLog` where `status = failed` to schedule
  retries.
- **AuditLog compliance view**: Materialized view summarizing status transitions by actor for
  governance audits.
