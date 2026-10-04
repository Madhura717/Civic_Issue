# CivicSense complaint lifecycle reference

This document describes the implemented complaint workflow, REST API, database entities, indexes, and persistence behavior.

## 1. Lifecycle model

```text
Submitted → Verified → Assigned → In Progress → Resolved
                                            ↓
                              Citizen Confirmation → Closed
                                            ↓
                                         Reopened

Assigned or In Progress --SLA expiry--> Escalated
Escalated --higher-authority reassignment--> Assigned
```

The deterministic routing service maps the selected category and priority to a department and SLA. Current default priority targets are:

| Priority | Default SLA |
|---|---:|
| Low | 120 hours / 5 days |
| Medium | 72 hours / 3 days |
| High | 48 hours |
| Critical | 24 hours |

The complaint ID format is `CIV-YYYY-######`, for example `CIV-2026-000125`.

## 2. API conventions

The API is mounted under `/api` by the Express server. Requests and responses use JSON. Mutation failures use a friendly `{ "error": "..." }` response rather than exposing raw database errors.

For local development:

```text
http://localhost:3000/api
```

The application uses the platform’s Manus OAuth flow for real authentication. The `/api/auth/*` endpoints communicate that provider choice; complaint demo operations remain usable in Preview with seeded data.

## 3. Complaint endpoints

### `GET /api/complaints`

Lists complaints. Optional filters:

- `q` — searches complaint ID, title, and location.
- `status` — exact lifecycle status, such as `In Progress` or `Escalated`.
- `category` — exact issue category.

Example:

```bash
curl 'http://localhost:3000/api/complaints?status=Escalated'
```

Response shape:

```json
{
  "complaints": [
    {
      "id": "CIV-2026-000108",
      "title": "Blocked storm drain after rain",
      "category": "Water & Drainage",
      "priority": "Critical",
      "status": "Escalated",
      "department": "Water & Drainage Department",
      "location": "Riverside Lane",
      "deadline": "2026-09-27T11:00:00.000Z",
      "history": [],
      "comments": [],
      "escalations": []
    }
  ]
}
```

### `POST /api/complaints`

Creates a complaint, classifies it deterministically, routes it to a department, computes the SLA deadline, creates the initial `Submitted` history event, and persists the complaint through the Drizzle adapter when `DATABASE_URL` is available.

Required fields: `title`, `description`.

Common fields:

| Field | Type | Description |
|---|---|---|
| `title` | string | Short issue title, max 140 characters |
| `description` | string | Issue context, max 4,000 characters |
| `category` | string | Category such as `Roads & Potholes` |
| `severity` | enum | `Low`, `Medium`, `High`, or `Critical` |
| `location` | string | Location label |
| `address` | string | Readable address or area |
| `media` | string | Storage filename/key metadata |
| `dangerous` | boolean | Whether the issue is dangerous |
| `atRisk` | boolean | Whether someone is currently at risk |
| `lat`, `lng` | number | Optional coordinates |

Example:

```bash
curl -X POST http://localhost:3000/api/complaints \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Pothole near school entrance",
    "description": "A deep pothole has formed beside the school entrance.",
    "category": "Roads & Potholes",
    "severity": "High",
    "location": "12 Park View Road",
    "address": "Ward 14 · North Quarter",
    "lat": 28.6314,
    "lng": 77.2167,
    "dangerous": true
  }'
```

The response is `201 Created` with `{ "complaint": { ... } }`.

### `GET /api/complaints/:id`

Retrieves one complaint, including its current state, assigned department/officer, SLA deadline, full status history, comments, and escalation records.

Returns `404` with `Complaint not found.` when the public ID does not exist.

### `PATCH /api/complaints/:id`

Applies a lifecycle or assignment update. Supported practical fields include:

```json
{
  "status": "In Progress",
  "assignedOfficer": "A. Mehta",
  "action": "Site inspection scheduled",
  "note": "Temporary barricade requested."
}
```

A changed status appends a `complaint_status_history` event and creates an in-app notification. Assignment changes persist the assigned officer and move an unstarted complaint into `Assigned`.

### `POST /api/complaints/:id/assign`

Assigns a complaint to an officer. Optional body:

```json
{ "assignedOfficer": "A. Mehta" }
```

The assignment is persisted through the complaint assignment/lifecycle boundary and the response returns the updated complaint.

### `POST /api/complaints/:id/comments`

Adds a citizen/officer note and persists it in `complaint_comments`.

```json
{ "comment": "The temporary barricade is still in place." }
```

Empty comments return `400`.

### `POST /api/complaints/:id/resolve`

Marks the complaint `Resolved`, appends a resolution history event, and accepts an optional note representing resolution proof or the action taken.

```json
{ "note": "Road patching completed and photo proof uploaded." }
```

### `POST /api/complaints/:id/escalate`

Creates an escalation record, changes the complaint to `Escalated`, appends an escalation history event, and persists the escalation.

```json
{ "reason": "SLA expired without resolution." }
```

The current default authority transition is:

```text
Responsible department → Department Head Office
```

The relational model supports configurable escalation rules and higher-authority reassignment.

## 4. Supporting endpoints

| Method | Endpoint | Behavior |
|---|---|---|
| `GET` | `/api/categories` | Returns category, department, and SLA routing rules |
| `GET` | `/api/departments` | Returns active responsible departments |
| `GET` | `/api/notifications` | Returns recent in-app notifications |
| `GET` | `/api/analytics/dashboard` | Returns complaint totals, seeded complaints, departments, categories, and notifications |
| `POST` | `/api/safety-reports` | Creates a private safety report; description is not exposed by the public list endpoint |
| `GET` | `/api/safety-reports` | Returns privacy-safe safety report summaries |

## 5. Complaint lifecycle database schema

The schema is implemented in [`drizzle/schema.ts`](../drizzle/schema.ts) and uses the managed MySQL-compatible database.

### Core identity and routing

| Table | Purpose | Key fields |
|---|---|---|
| `users` | Manus OAuth identities and application roles | `id`, `openId`, `email`, `role`, `isActive` |
| `departments` | Responsible civic teams | `id`, `name`, `code`, `isActive` |
| `authorities` | Officer, department-head, higher-authority, and admin assignments | `userId`, `departmentId`, `level`, `title` |
| `issue_categories` | Configurable category taxonomy and default routing | `slug`, `name`, `defaultDepartmentId`, `isActive` |
| `sla_rules` | Category/priority resolution targets | `categoryId`, `priority`, `resolutionHours`, `isActive` |
| `escalation_rules` | Authority handoff rules | `categoryId`, `fromAuthority`, `toAuthority`, `escalationHours`, `isActive` |

### Complaint record and supporting evidence

| Table | Purpose | Key fields |
|---|---|---|
| `complaints` | Current complaint state and searchable public ID | `publicId`, `citizenId`, `categoryId`, `departmentId`, `title`, `description`, `priority`, `status`, coordinates, `slaDeadline`, `resolvedAt`, timestamps |
| `complaint_media` | Image/video/document storage metadata | `complaintId`, `storageKey`, `mediaType`, `contentType`, `isPrivate` |
| `complaint_locations` | Location history and source | `complaintId`, `latitude`, `longitude`, `readableAddress`, `source` |
| `complaint_assignments` | Officer/department assignment history | `complaintId`, `departmentId`, `officerId`, `assignedById`, assignment timestamps |
| `complaint_status_history` | Immutable lifecycle events | `complaintId`, `status`, `departmentId`, `actorUserId`, `action`, `note`, `createdAt` |
| `complaint_comments` | Citizen/officer communication | `complaintId`, `authorId`, `body`, `isInternal`, `createdAt` |

### Escalation, notifications, and governance

| Table | Purpose | Key fields |
|---|---|---|
| `escalations` | SLA violations and authority handoffs | `complaintId`, `ruleId`, `fromAuthority`, `toAuthority`, `reason`, `status`, timestamps |
| `notifications` | In-app lifecycle notifications | `userId`, `complaintId`, `kind`, `title`, `body`, `readAt`, `createdAt` |
| `audit_logs` | Administrative and operational accountability | `actorUserId`, `action`, `entityType`, `entityId`, `metadata`, `createdAt` |

### Important indexes

The schema indexes:

- Complaint public ID, status, category, department, citizen, and SLA deadline.
- Status-history complaint and creation time.
- Assignment complaint and officer.
- Comment and media complaint IDs.
- Escalation complaint and status.
- Notification recipient and creation time.
- Safety-report status and location.
- User email and role.

These indexes support the main dashboard filters, citizen tracking lookup, overdue queues, escalation views, and operational reporting.

## 6. Persistence behavior

`server/civicDb.ts` is the database adapter. It:

1. Ensures the routed department and issue category exist.
2. Inserts or updates the normalized `complaints` row.
3. Inserts the latest status event into `complaint_status_history`.
4. Inserts comments into `complaint_comments`.
5. Inserts escalation records into `escalations`.
6. Inserts private safety reports into `safety_reports`.

The seeded `server/civicStore.ts` remains the deterministic domain layer and fallback for a local process without a database connection. The managed migration is committed at `drizzle/0001_dizzy_psylocke.sql` and was applied with `pnpm db:push`.

## 7. Related references

- [Full CivicSense README](../README.md)
- [Architecture and Mermaid diagrams](./architecture.md)
- [Implementation outcomes](../TODO.md)
