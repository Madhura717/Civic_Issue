# CivicSense

CivicSense is a civic-tech platform that turns public reports into accountable operational work. Residents can report potholes, lighting failures, sanitation issues, drainage, unsafe public infrastructure, and safety concerns; CivicSense classifies the report deterministically, routes it to a responsible department, tracks the full lifecycle, and escalates unresolved work when the SLA expires.

> **Demo message:** Every update matters when the outcome belongs to everyone.

## Product workflow

CivicSense makes the lifecycle visible: **Report → Validate → Classify → Route → Assign → Investigate → Resolve → Verify → Close**. The demo includes a seeded overdue complaint that has a real escalation record and appears in the higher-authority oversight console.

The application includes:

- A public landing page with civic issue categories, transparent workflow, and nearby issue signals.
- A multi-step complaint report flow for issue details, severity, evidence, location, risk context, review, and submission receipt.
- Complaint tracking with a visual timeline, SLA deadline, comments, citizen confirmation, and reopen path.
- Citizen, officer, higher-authority, and admin workspaces with operational metrics and meaningful actions.
- Configurable deterministic classification/routing and SLA rules in the server domain layer.
- In-app notification architecture for lifecycle events.
- Nearby issue and safety map boards with privacy-safe marker previews.
- A responsible Women’s Safety section with protected report semantics, emergency placeholders, and a clearly labeled safe-route prototype.
- A relational Drizzle/MySQL schema covering users, authorities, departments, categories, complaints, media, locations, histories, assignments, comments, SLA rules, escalations, notifications, safety reports, and audit logs.

## Technical architecture

The initialized `web-db-user` stack is retained:

- **Frontend:** React, TypeScript, Tailwind CSS, Wouter, Lucide icons, reusable shell/components.
- **Backend:** Node.js, Express, TypeScript. The starter’s Manus OAuth and tRPC infrastructure is preserved; CivicSense REST routes are mounted under `/api`.
- **Database:** Drizzle ORM with the managed MySQL-compatible database. The schema is in `drizzle/schema.ts`; `server/civicDb.ts` persists complaint, lifecycle, comment, escalation, and safety writes when the managed connection is available, while the server-side domain store keeps a deterministic seeded fallback for local resilience.
- **Authentication:** Manus OAuth with the starter’s `webdev_app_session` application cookie and database-backed user identity. The app does not invent a password flow or development bypass.
- **Maps/storage:** A privacy-safe interactive issue board is used in the MVP without a paid map key; the storage abstraction in `server/storage.ts` is ready for durable image/video uploads through Manus storage.

See [`docs/architecture.md`](docs/architecture.md) for the system diagram and entity relationships.

## Run locally in the managed environment

```bash
pnpm install
pnpm check
pnpm dev
```

The server listens on `PORT` (default `3000`) and serves the React app through Vite in development. Verify:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/manus-routes.json
```

Build and serve production assets:

```bash
pnpm build
pnpm start
```

Database commands:

```bash
pnpm db:migrate  # apply committed migrations
pnpm db:push     # generate and apply intentional schema changes
```

The managed database is MySQL-compatible. This is an intentional platform-compatible choice instead of PostgreSQL-specific SQL; the logical model remains portable.

## Demo experience

Use the public site without an account to explore the product. The main review path is:

1. Open **Report an Issue** and create a pothole report.
2. Add severity, location, optional evidence filename, risk context, and review the routing preview.
3. Submit to receive a `CIV-YYYY-######` complaint ID.
4. Open **Track this complaint** to see the status timeline.
5. Open `/authority` to assign, start, resolve, or escalate seeded work. These buttons call the REST API and update the server domain record.
6. Open `/oversight` to see the seeded `CIV-2026-000108` SLA escalation.
7. Use `/dashboard` for citizen metrics and `/admin` for control-center surfaces.

### Demo identities

The intended demo identities are:

- `citizen@demo.com`
- `officer@demo.com`
- `admin@demo.com`

They are role fixtures for the product walkthrough. Application access uses configured Manus OAuth; no demo password is stored in source code. Configure the corresponding Manus identities in the environment when testing authenticated callbacks.

## REST API

For the complete complaint lifecycle endpoint reference and relational schema details, see [`docs/complaint-lifecycle.md`](docs/complaint-lifecycle.md).

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Unauthenticated readiness check |
| POST | `/api/auth/register` | Validate an email and explain the Manus OAuth completion path |
| POST | `/api/auth/login` | Return the configured OAuth login guidance |
| POST | `/api/auth/logout` | Logout acknowledgement |
| GET | `/api/complaints` | List/filter complaints by `q`, `status`, or `category` |
| POST | `/api/complaints` | Create and route a complaint; returns a complaint ID |
| GET | `/api/complaints/:id` | Retrieve a complaint and lifecycle history |
| PATCH | `/api/complaints/:id` | Apply a status/assignment update and create history/notification records |
| POST | `/api/complaints/:id/comments` | Store a complaint comment |
| POST | `/api/complaints/:id/assign` | Assign a complaint to an officer |
| POST | `/api/complaints/:id/resolve` | Mark a complaint resolved with optional resolution note |
| POST | `/api/complaints/:id/escalate` | Create an escalation record and move the complaint to Escalated |
| GET | `/api/categories` | Configurable category/routing rules |
| GET | `/api/departments` | Active responsible departments |
| GET | `/api/notifications` | In-app notification feed |
| POST | `/api/safety-reports` | Create a private safety report |
| GET | `/api/safety-reports` | List privacy-safe safety report summaries |
| GET | `/api/analytics/dashboard` | Dashboard totals, seeded complaints, categories, departments, notifications |

## Security and privacy

The platform’s OAuth/session implementation validates the project JWT and uses the fixed `webdev_app_session` cookie for Preview compatibility. Input validation and friendly error envelopes are applied at API boundaries. Media is represented by validated metadata and a storage abstraction; safety descriptions are not returned by the public safety listing endpoint, and the UI explicitly avoids collecting unnecessary personal details. Emergency resources are labeled placeholders and the product never claims to dispatch live services.

For production hardening, enable strict role middleware on mutations, add upload size/MIME enforcement at the storage endpoint, and run rate limiting at the gateway. Durable complaint writes are already connected through the Drizzle adapter; the seeded domain store remains a resilience fallback when no database DSN is available. These are deliberate operational boundaries, not claimed future AI functionality.

## Future AI interfaces

No AI classification is claimed in the MVP. The routing service is deterministic and can later receive optional adapters for image classification, duplicate detection, priority prediction, natural-language complaint classification, trend/hotspot analysis, and resolution-time prediction. Each adapter should return a typed explanation and confidence record before it can influence routing.

## Project structure

- `client/src/pages/` — public, citizen, authority, oversight, admin, and safety pages.
- `client/src/components/` — public/operations shells, wordmark, map board, and reusable UI patterns.
- `client/src/lib/` — shared demo types/data and REST client.
- `server/civicStore.ts` — deterministic routing, SLA, lifecycle, notifications, and escalation domain service with seeded demo records.
- `server/civicDb.ts` — optional durable Drizzle persistence adapter for domain mutations.
- `server/civic-api.ts` — REST API controllers and validation.
- `server/_core/` — platform server, OAuth, storage, tRPC, and Vite integration.
- `drizzle/schema.ts` — relational application schema and indexes.
- `client/public/manus-routes.json` — complete page route manifest.
- `TODO.md` — concrete implementation outcomes from the product specification.

## License

MIT. CivicSense is intended as a portfolio-quality civic technology demonstration and should be connected to local authority data, verified emergency resources, geocoding, object storage, and production identity governance before public deployment.
