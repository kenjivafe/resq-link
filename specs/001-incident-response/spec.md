# Feature Specification: Incident Response Coordination

**Feature Branch**: `001-incident-response`  
**Created**: 2025-10-21  
**Status**: Draft  
**Input**: Incident response coordination requirements summary (see `plan.txt`)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rapid Public Incident Submission (Priority: P1)

Citizens must be able to submit an incident report without creating an account, attaching
location, description, and optional media so dispatchers see the incident instantly.

**Why this priority**: Enables core value proposition of minimizing friction in emergencies.

**Independent Test**: Launch public incident flow on mobile, submit report, verify dispatcher
view updates in real time without other system activity.

**Acceptance Scenarios**:

1. **Given** a citizen opens the reporting interface, **When** they submit required incident
   details, **Then** the system confirms submission within 10 seconds and surfaces the
   incident ID.
2. **Given** a dispatcher dashboard is open, **When** a new public incident is submitted,
   **Then** the incident appears with pending status within 2 seconds via live update or 5
   seconds via fallback polling.

---

### User Story 2 - Dispatcher Triage & Assignment (Priority: P2)

Dispatchers must filter, inspect, and assign responders to incidents, triggering
notifications and ensuring everyone sees current status.

**Why this priority**: Ensures responders are coordinated quickly and reliably.

**Independent Test**: Seed several incidents, filter dashboard views, perform assignment,
and confirm notifications plus synchronized status updates without relying on other
stories.

**Acceptance Scenarios**:

1. **Given** a dispatcher views the command dashboard, **When** they filter incidents by
   status or map area, **Then** results refresh within 500 milliseconds and reflect the
   applied filters.
2. **Given** a dispatcher assigns a responder, **When** the assignment is saved, **Then** the
   responder receives a push notification and all connected clients display `responding`
   status within 2 seconds.

---

### User Story 3 - Responder Follow-Up & Incident Closure (Priority: P3)

Responders must acknowledge assignments, update status as progress is made, attach media
evidence, and close incidents with an auditable trail.

**Why this priority**: Provides accountability, trust, and closure data for stakeholders.

**Independent Test**: Use a responder account to accept assignments, upload media, and
transition statuses through completion while verifying audit logs and privacy safeguards.

**Acceptance Scenarios**:

1. **Given** a responder receives an assignment, **When** they acknowledge and update the
   status to `responding`, **Then** the dashboard and audit log capture the action with
   timestamp and actor information.
2. **Given** a responder records media evidence, **When** they upload an image or video,
   **Then** the system stores the file securely, links it to the incident, and exposes the
   URL only to authorized roles.

### Edge Cases

- Multiple public submissions for the same location within minutes require deduplication or
  operator review without losing any report.
- Reporter attempts to submit more than the allowed rate; request must return a friendly
  throttle message and log the attempt.
- Incident submitted without reliable location data must prompt manual location capture and
  flag the record for dispatcher attention.
- Push notification delivery fails; system retries and escalates to SMS fallback if mobile
  acknowledgement is missing.
- Mobile client is offline when status changes; queued updates must reconcile on reconnect
  without overwriting fresher data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow unauthenticated citizens to submit new incidents with
  required fields (type, description or media, approximate location) and return a unique
  incident identifier plus pending status confirmation.
- **FR-002**: System MUST capture optional citizen contact information and device
  fingerprint, storing them securely for follow-up without exposing them to unauthorized
  users.
- **FR-003**: System MUST support authenticated responders and admins creating, editing,
  and annotating incident reports tied to their user identity.
- **FR-004**: System MUST provide a dispatcher dashboard combining list, map, and timeline
  views with filters for status, geography, and recency that respond within 500
  milliseconds for typical load.
- **FR-005**: System MUST enable dispatchers to assign responders, transition incident
  status to `responding`, and trigger immediate notifications to assigned responders.
- **FR-006**: System MUST enforce role-based permissions for status transitions
  (`pending`, `assigned`, `responding`, `resolved`, `escalated`) and record all changes in
  an immutable audit log with actor, timestamp, and rationale fields.
- **FR-007**: System MUST accept media uploads (images, short videos), store assets in
  managed object storage, and persist metadata linking files to the originating incident
  and uploader.
- **FR-008**: System MUST deliver incident-created, incident-updated, and assignment events
  to connected dashboards and mobile clients within 2 seconds under normal network
  conditions, queuing events for offline clients and replaying on reconnect.
- **FR-009**: System MUST provide push notification delivery with retry logic and SMS
  fallback when a responder device token fails, capturing outcomes in a notification log.
- **FR-010**: System MUST apply rate limiting for public submissions (per device and per
  IP) and escalate repeated abuse by requiring CAPTCHA verification or temporarily
  blocking submissions.
- **FR-011**: System MUST surface analytics summarizing incident volume, response times,
  and resolution outcomes for dispatcher leadership.

### Non-Functional Requirements

- **NFR-001**: Real-time channels MUST support at least 200 concurrent active clients with
  observable latency under 2 seconds for status broadcasts.
- **NFR-002**: Standard read operations MUST complete within 300 milliseconds p95 and write
  operations within 700 milliseconds p95 under expected load.
- **NFR-003**: Platform MUST remain available during transient infrastructure failures by
  retrying push notifications and media uploads and persisting socket sessions via shared
  state.
- **NFR-004**: All APIs MUST enforce HTTPS, validate input, scan media for malware, and use
  signed JWT access plus refresh tokens with secure storage per client platform.
- **NFR-005**: System MUST enforce privacy by storing only minimum necessary personal data
  for public reports and purging anonymous incident details after the retention period
  agreed with stakeholders.
- **NFR-006**: Architecture MUST remain horizontally scalable through stateless application
  services using external databases, caches, and object storage.

### Key Entities *(include if feature involves data)*

- **User**: Represents citizens, dispatchers, responders, and admins; tracks contact
  details, role, session tokens, device tokens, and activity timestamps.
- **Incident**: Captures incident metadata including type, narrative, geolocation, status
  progression, reporter linkage, severity, and creation/update timestamps.
- **IncidentMedia**: References media assets attached to incidents, including storage URL,
  media type, uploader, and upload timestamp.
- **Assignment**: Records responder assignments, assignment source, acknowledgement
  timestamps, and completion markers for each incident.
- **NotificationLog**: Stores notification attempts, payload attributes, delivery status,
  and error context for auditability.
- **AuditLog**: Tracks privileged actions such as status changes, assignments, and edits
  with actor identity, target record, and detailed rationale.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of public incident submissions complete within 10 seconds from first
  input to confirmation on supported mobile devices.
- **SC-002**: 95% of new incidents appear on dispatcher dashboards within 2 seconds via
  live updates and within 5 seconds via polling fallback.
- **SC-003**: 90% of dispatcher filter operations return accurate results within 500
  milliseconds for datasets up to 5,000 active incidents.
- **SC-004**: 95% of responder assignment notifications are acknowledged within 30 seconds,
  with automated SMS fallback triggered for the remaining 5%.
- **SC-005**: Anonymous incident records older than the agreed retention period are purged
  or anonymized with zero policy violations recorded in monthly audits.

## Assumptions & Dependencies

- Existing authentication service issues JWT access and refresh tokens compatible with
  mobile secure credential storage and web HTTP-only cookie storage.
- Push notification gateway and SMS fallback provider are provisioned and funded to support
  delivery requirements.
- Shared session store is available for socket coordination across horizontally scaled
  instances.
- Object storage buckets are configured with lifecycle policies to support media retention
  and deletion requirements.
