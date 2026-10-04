# CivicSense architecture

## System flow

```mermaid
flowchart LR
  Citizen[Citizen web experience] --> Report[Report wizard]
  Citizen --> Track[Tracking + confirmation]
  Citizen --> Safety[Safety module]
  Report --> API[Express REST API]
  Track --> API
  Safety --> API
  API --> Domain[Routing + SLA + escalation domain services]
  Domain --> Store[Drizzle repository / seeded demo store]
  Store --> DB[(Managed MySQL-compatible database)]
  API --> Notify[In-app notifications]
  Officer[Authority officer workspace] --> API
  Head[Higher authority oversight] --> API
  Admin[System admin] --> API
  API --> Storage[Storage abstraction]
  Storage --> Media[(Durable media storage)]
```

## Lifecycle state model

```mermaid
stateDiagram-v2
  [*] --> Submitted
  Submitted --> Verified
  Verified --> Assigned
  Assigned --> InProgress: officer accepts
  InProgress --> Resolved: proof + action
  Resolved --> CitizenConfirmation
  CitizenConfirmation --> Closed: citizen confirms
  CitizenConfirmation --> InProgress: citizen reopens
  Assigned --> Escalated: SLA expires
  InProgress --> Escalated: SLA expires
  Escalated --> Assigned: higher authority reassigns
```

## Relational entities

```mermaid
erDiagram
  USERS ||--o{ COMPLAINTS : submits
  USERS ||--o{ AUTHORITIES : holds
  DEPARTMENTS ||--o{ AUTHORITIES : contains
  DEPARTMENTS ||--o{ COMPLAINTS : owns
  ISSUE_CATEGORIES ||--o{ COMPLAINTS : classifies
  ISSUE_CATEGORIES ||--o{ SLA_RULES : configures
  COMPLAINTS ||--o{ COMPLAINT_MEDIA : includes
  COMPLAINTS ||--o{ COMPLAINT_LOCATIONS : located_at
  COMPLAINTS ||--o{ COMPLAINT_STATUS_HISTORY : records
  COMPLAINTS ||--o{ COMPLAINT_ASSIGNMENTS : assigned
  COMPLAINTS ||--o{ COMPLAINT_COMMENTS : discusses
  COMPLAINTS ||--o{ ESCALATIONS : escalates
  COMPLAINTS ||--o{ NOTIFICATIONS : triggers
  USERS ||--o{ COMPLAINT_COMMENTS : writes
  USERS ||--o{ NOTIFICATIONS : receives
  USERS ||--o{ SAFETY_REPORTS : submits
  USERS ||--o{ AUDIT_LOGS : acts
```

The current demo domain store mirrors these entities in memory so the preview remains useful without a database connection. The Drizzle schema is the durable source of truth for managed database provisioning and the repository boundary is intentionally kept separate from the UI.
