## Collaborative EdTech Platform (KSA) — MVP Developer Guide

This file gives you a concrete, step-by-step plan to get an MVP running locally using a simple, productive stack:
- Frontend: Next.js (React + TypeScript, App Router) with Tailwind + shadcn/ui
- Backend: NestJS (TypeScript, Fastify) with Prisma ORM
- Database/Storage: PostgreSQL + MinIO (S3-compatible)
- Auth (MVP): App-managed credentials + RBAC (Keycloak/SSO can be added later)
- AI (MVP): Simple keyword/TR L-based matching and explainable score breakdown

Production controls (Keycloak SSO, OPA, SIEM, Kafka/OpenSearch) are designed-in but optional for MVP runtime.

---

### 1) TL;DR Quickstart

Prereqs:
- Node.js LTS (>= 18), pnpm (>= 9)
- Docker Desktop
- git

Commands (from `/Users/svm648/TAAWUNAK`):

```bash
# 1) Monorepo init
pnpm init -y

# 2) Workspace layout
mkdir -p apps/web apps/api infra packages
```

Add `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Bring up infra (Postgres + MinIO):

```bash
cd infra
cat > docker-compose.yml << 'YAML'
version: "3.9"
services:
  postgres:
    image: postgres:15
    container_name: edutech-postgres
    environment:
      POSTGRES_USER: edutech
      POSTGRES_PASSWORD: edutech
      POSTGRES_DB: edutech
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
  minio:
    image: minio/minio:latest
    container_name: edutech-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: edutech
      MINIO_ROOT_PASSWORD: edutech12345
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio:/data
volumes:
  pgdata:
  minio:
YAML
docker compose up -d
cd ..
```

Scaffold apps:

```bash
# Frontend (Next.js, App Router)
pnpm dlx create-next-app@latest apps/web --ts --eslint --app --tailwind --import-alias "@/*"

# Backend (NestJS)
pnpm dlx @nestjs/cli new apps/api --package-manager pnpm
```

Install shared tooling:

```bash
pnpm add -D -w prettier eslint turbo
```

---

### 2) Environments

Create `apps/api/.env`:

```bash
DATABASE_URL="postgresql://edutech:edutech@localhost:5432/edutech?schema=public"
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="edutech"
S3_SECRET_KEY="edutech12345"
S3_BUCKET="edutech-bucket"
JWT_SECRET="change-me-in-prod"
NODE_ENV="development"
```

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
NEXT_PUBLIC_MINIO_CONSOLE_URL="http://localhost:9001"
```

Boot MinIO bucket (one-time):

```bash
aws --endpoint-url http://localhost:9000 s3 mb s3://edutech-bucket || true
```

If `aws` CLI is not available, you can create a bucket via MinIO console at http://localhost:9001 (login: edutech / edutech12345).

---

### 3) Data Model (Prisma)

Use Prisma in `apps/api`:

```bash
cd apps/api
pnpm add @prisma/client
pnpm add -D prisma
npx prisma init
```

Replace `apps/api/prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  fullName      String
  role          Role     @default(RESEARCHER)
  institutionId String?
  institution   Institution? @relation(fields: [institutionId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Institution {
  id          String  @id @default(cuid())
  name        String  @unique
  type        InstitutionType
  users       User[]
  projects    Project[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Project {
  id             String   @id @default(cuid())
  title          String
  summary        String
  ownerId        String
  owner          User     @relation(fields: [ownerId], references: [id])
  institutionId  String
  institution    Institution @relation(fields: [institutionId], references: [id])
  status         ProjectStatus @default(DRAFT)
  milestones     Milestone[]
  documents      Document[]
  proposals      Proposal[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Milestone {
  id         String   @id @default(cuid())
  title      String
  dueDate    DateTime?
  status     MilestoneStatus @default(PENDING)
  projectId  String
  project    Project @relation(fields: [projectId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Document {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  name        String
  s3Key       String
  contentType String
  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])
  createdAt   DateTime @default(now())
}

model FundingCall {
  id          String   @id @default(cuid())
  title       String
  description String
  deadline    DateTime
  applications Application[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Proposal {
  id          String   @id @default(cuid())
  projectId   String
  project     Project @relation(fields: [projectId], references: [id])
  content     String
  trl         Int
  status      ProposalStatus @default(SUBMITTED)
  reviews     Review[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Application {
  id            String   @id @default(cuid())
  fundingCallId String
  fundingCall   FundingCall @relation(fields: [fundingCallId], references: [id])
  projectId     String
  project       Project @relation(fields: [projectId], references: [id])
  status        ApplicationStatus @default(SUBMITTED)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Review {
  id         String   @id @default(cuid())
  proposalId String
  proposal   Proposal @relation(fields: [proposalId], references: [id])
  reviewerId String
  reviewer   User     @relation(fields: [reviewerId], references: [id])
  score      Int
  comments   String?
  createdAt  DateTime @default(now())
}

model Paper {
  id            String   @id @default(cuid())
  title         String
  abstract      String
  projectId     String?
  project       Project? @relation(fields: [projectId], references: [id])
  institutionId String
  institution   Institution @relation(fields: [institutionId], references: [id])
  status        PaperStatus @default(DRAFT)
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum Role {
  ADMIN
  INSTITUTION_ADMIN
  RESEARCHER
  REVIEWER
  COMPANY_USER
  STUDENT
}

enum InstitutionType {
  UNIVERSITY
  COMPANY
  SCHOOL
  RESEARCH_CENTER
}

enum ProjectStatus {
  DRAFT
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum MilestoneStatus {
  PENDING
  IN_PROGRESS
  DONE
}

enum ProposalStatus {
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
}

enum ApplicationStatus {
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
}

enum PaperStatus {
  DRAFT
  UNDER_REVIEW
  PUBLISHED
}
```

Apply migrations and generate client:

```bash
npx prisma migrate dev --name init
npx prisma generate
cd ../..
```

---

### 4) Backend (NestJS) — Modules & Endpoints

Install deps:

```bash
cd apps/api
pnpm add @nestjs/config @nestjs/jwt @fastify/multipart fastify @fastify/cors @fastify/helmet @fastify/static
pnpm add bcrypt zod
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
pnpm add @prisma/client
pnpm add -D prisma
```

Recommended modules (create folders under `src/`):
- `auth` (login/register, JWT, guards)
- `institutions` (CRUD, membership)
- `projects` (projects, milestones, documents)
- `funding` (funding-calls, applications)
- `proposals` (proposals, reviews)
- `papers` (submission, approvals, listing)
- `files` (S3 presigned URLs, uploads/metadata)
- `ai` (matchmaking v1 — keyword/TR L scoring)
- `audit` (request/audit logging)

Example key endpoints (MVP):
- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- Institutions: `POST /institutions`, `GET /institutions`, `POST /institutions/:id/members`
- Projects: `POST /projects`, `GET /projects`, `GET /projects/:id`, `POST /projects/:id/milestones`
- Documents: `POST /files/presign` (returns PUT URL), `POST /projects/:id/documents`
- Funding: `POST /funding-calls`, `GET /funding-calls`, `POST /applications`
- Proposals/Reviews: `POST /proposals`, `POST /proposals/:id/reviews`, `GET /proposals/:id`
- Papers: `POST /papers`, `GET /papers`, `PATCH /papers/:id/status`
- AI Match: `POST /ai/match` (input: `profile/project`, output: ranked list + score breakdown)

Authorization:
- Use a `RolesGuard` and `@Roles('ADMIN' | 'INSTITUTION_ADMIN' | ...)` decorator.
- Ownership checks (e.g., only project owner or institution admin can mutate).

Upload flow:
1) Web asks API `POST /files/presign {filename, contentType}`.
2) API returns presigned PUT URL for MinIO.
3) Web uploads directly to MinIO; API saves `Document` record referencing `s3Key`.

---

### 5) Frontend (Next.js) — Routes & Components (App Router)

Install UI deps:

```bash
cd apps/web
pnpm add @tanstack/react-query axios zod react-hook-form class-variance-authority clsx
pnpm add next-themes
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

Initialize Tailwind/shadcn (if not already):
- Tailwind installed via scaffold; run `pnpm dlx shadcn@latest init` to add component library when ready.

Route plan (App Router `app/`):
- `/` — Landing (value proposition, login/register CTA)
- `/login` — Auth
- `/dashboard` — Role-aware overview (projects, funding, tasks)
- `/projects` — List and create projects
- `/projects/[id]` — Project detail (milestones, documents, team, activity)
- `/funding` — Funding calls listing
- `/funding/[id]` — Call detail + apply
- `/proposals` — Proposals list (with statuses)
- `/papers` — Papers list + submit
- `/admin` — Admin home (visibility based on roles)
- `/admin/institutions` — Create/manage institutions, membership
- `/admin/quotas` — Quotas (stub in MVP if needed)
- `/settings` — Profile, institution, notifications

Core UI components:
- `NavigationShell` (sidebar/topbar with role-aware links, AR/EN toggle)
- `DataTable` (projects, funding calls, proposals, papers)
- `Form` primitives (input, select, date, file upload)
- `MilestoneCard`, `ProjectHeader`, `StatusBadge`
- `FileUpload` (uses presigned URL)
- `RBAC` wrapper component (conditionally render controls)

Data fetching:
- TanStack Query + `axios` bound to `NEXT_PUBLIC_API_BASE_URL`.
- Persist auth token in httpOnly cookie (set by API) or memory + refresh endpoint; for MVP, use bearer token in local storage only if acceptable for dev.

Accessibility/i18n:
- Arabic-first typography, `dir="rtl"` toggle, locales `ar` and `en`.
- WCAG 2.1 AA color contrast and focus management.

---

### 6) AI Matchmaking v1 (MVP-simple)

Algorithm (server-side):
- Compute score = weighted sum of keyword overlap (TF-IDF-like) + TRL proximity + institution type preference.
- Return top-k matches with explanation: `{factor: weight, contribution}` list.

Endpoint:
```http
POST /ai/match
{
  "entity": "project" | "profile",
  "keywords": ["ai","education","nlp"],
  "trl": 4,
  "target": "partners" | "funding"
}
```
Response:
```json
[
  {
    "id": "candidate-id",
    "type": "institution" | "funding-call",
    "score": 0.78,
    "explain": [
      {"factor":"keywordOverlap","weight":0.5,"value":0.8},
      {"factor":"trlProximity","weight":0.3,"value":0.7},
      {"factor":"history","weight":0.2,"value":0.75}
    ]
  }
]
```

---

### 7) Seeding & Demo Data

Add `apps/api/prisma/seed.ts` to create:
- Roles: admin, institution_admin, researcher, reviewer, company_user, student
- One university + one company + one school
- One admin user + sample researcher + reviewer
- One project with milestones + one funding call + sample proposal + paper

Run:
```bash
npx prisma db seed
```
(Configure `package.json` in `apps/api` to point `prisma.seed` to `ts-node` or compiled JS.)

---

### 8) Run the stack

Backend:
```bash
cd apps/api
pnpm start:dev
# API at http://localhost:3001 (configure main.ts to use port 3001)
```

Frontend:
```bash
cd apps/web
pnpm dev
# Web at http://localhost:3000
```

Sanity checks (manual):
- Register/login → create institution (if admin) → create project → add milestone → upload a document
- Create funding call → submit application → create proposal → submit review
- Submit paper and change status
- Call `/ai/match` from UI to see recommendations + explanations

---

### 9) Security & Governance (MVP-baseline)

- RBAC enforced in API via guards; route-level role checks.
- Basic audit: request/response audit logs (userId, route, statusCode, duration).
- Data protection: ensure `.env` and secrets are not committed; use env vars.
- Files: object names are non-guessable; access via signed URLs.
- Localization: AR/EN toggles; RTL support; basic content translation keys scaffolded.

Upgrade path after MVP:
- Replace app-managed auth with Keycloak (OIDC/SAML) and MFA (FIDO2 for admins).
- Add OPA for centralized ABAC/RBAC policy.
- Add SIEM (Elastic) + SOAR; structured audit events.
- Add OpenSearch for search; Kafka for eventing; S3 object lock; Vault for secrets.
- SAIP adapter + provenance ledger (append-only Merkle log).

---

### 10) Acceptance Criteria (MVP)

- Auth: register/login; roles applied; audit logs present
- Institutions: create + assign members; role delegation
- Projects: CRUD; milestones; document upload to MinIO via presigned URL
- Funding: create call; submit application; list/status
- Proposals/Reviews: submit; review; status transitions
- Papers: submit; approve; list and search by title/author
- AI v1: returns top-k matches with score explainability
- Frontend: Arabic–English UI toggle; RTL; accessible forms/lists

---

### 11) Backlog (Post-MVP)

- SSO (Nafath/eduGAIN) via Keycloak, adaptive MFA
- Reviewer conflict-of-interest checks; fairness metrics dashboards
- Meetings & transcripts (Janus/Jitsi integration) with role-based transcript access
- Quotas v1.1 and gender-balance reporting
- Analytics dashboards with Power BI export
- SAIP sandbox integration; provenance anchoring to external notarization
- Payments toggle (PCI DSS scope minimization; tokenization)

---

### 12) Suggested Task Breakdown (First 2 Sprints)

Sprint 1 (Setup & Core CRUD)
- Infra up (Postgres, MinIO)
- Prisma schema + migrations + seed
- Auth (register/login, JWT, roles)
- Institutions CRUD + membership
- Projects CRUD + milestones
- Presigned upload + documents

Sprint 2 (Funding, Papers, AI v1, UI polish)
- Funding calls + applications
- Proposals + reviews
- Papers submission + status
- AI /match endpoint + basic UI integration
- AR/EN toggle + RTL + accessibility passes

---

### 13) Notes

- Keep secrets local; rotate often; use Vault in next phase.
- For production, plan DB backups, object-locking, and SIEM ingestion.
- Replace any temporary plaintext passwords with bcrypt hashes (already expected in Prisma-backed users table).


