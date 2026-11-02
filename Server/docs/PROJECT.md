# Learnora LMS

Production-oriented academic and cohort LMS — **Finish what you start.**

## Stack

| Layer | Tech |
|-------|------|
| Client | Next.js (App Router), TypeScript, Tailwind v4, Redux Toolkit, React Query, Framer Motion |
| Server | NestJS ESM, Prisma 6, Postgres 16, JWT, Swagger |
| AI | FastAPI, LangChain/OpenAI, Chroma (mock mode without API key) |

## Workspace structure

All project files live inside these service directories. Git metadata remains at the repository root.

```text
lms-platform/
  ai/          FastAPI service, Python environment, AI documentation
  Client/      Next.js application, frontend configuration and assets
  Server/      NestJS API, Prisma, Docker Compose, scripts and project documentation
```

This guide uses commands from the repository root unless a service directory is explicitly selected. Component guides: [API](../README.md), [Client](../../Client/README.md), [AI](../../ai/README.md).

For an already configured Windows checkout, start all three services with:

```powershell
cd Server
npm run dev:all
```

The launcher resolves every service path from its own location, starts missing services in the background, and checks their HTTP endpoints. Logs are written inside each service's ignored `.logs` directory. It reuses services already listening on the expected ports.

## Quick start

### 1. Database

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or any Postgres 16), then:

```bash
docker compose -f Server/docker-compose.yml up -d
```

### 2. Server

```bash
cd Server
cp .env.example .env   # already usable defaults for local
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

API: `http://localhost:4000` · Swagger: `http://localhost:4000/docs`

### 3. Client

```bash
cd Client
cp .env.example .env.local
npm run dev
```

App: `http://localhost:3000`

### 4. AI (optional)

```bash
cd ai
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8002
```

Without `OPENAI_API_KEY`, the AI service returns structured mock responses so Nest can still integrate.

## Academic demo academy

`npx prisma db seed` creates a presentation-ready academy rather than placeholder data:

- 4 published academic courses, 1 draft workshop, 14 modules, and 42 substantive lessons.
- Academic Success Lab, Research Methods Foundations, Critical Thinking & Argument, and Study Systems & Wellbeing.
- 2 learning paths, 2 cohort runs, 5 live-session agenda entries, announcements, course Q&A, preferences, learner activity variation, and realistic analytics signals.
- Course content includes outcomes, worked examples, reflection prompts, practice exercises, checklists, transcripts, and resource links.
- 4 server-graded quizzes and multiple learner states: active, at-risk, zero-progress, and complete/certified.

## Demo accounts

Password for all: `Password123!`

| Email | Role |
|-------|------|
| `priya.nair@learnora.dev` | LEARNER |
| `dr.anya.shah@learnora.dev` | INSTRUCTOR |
| `marcus.admin@learnora.dev` | ADMIN |
| `olivia.owner@learnora.dev` | OWNER |
| `jordan.ta@learnora.dev` | TA |

Org slug: `learnora`

## Product surfaces

- `/courses/[slug]` public syllabus preview with enrollment and authentication return flow
- `/` marketing · `/courses` catalog · `/login` `/register`
- `/learn` learner home, player, quizzes, streaks, certificates, cohorts, announcements, and course Q&A
- `/studio` curriculum builder, cohorts, community moderation, analytics, and AI tools
- `/admin` members, assign courses, reports

## Commerce integration

The commerce API is intentionally safe by default. It supports entitlement status, Stripe Checkout, customer portal, and verified webhooks, but returns an explicit unavailable state until the following are configured:

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

Never enable a production webhook without its signing secret. Free/demo enrollment continues to work without Stripe.

## Design rules

- Minimum font size **14px**
- Tokens: immersive dark learn surfaces + light studio/admin
- Motion via Framer Motion (progress rings, streak flame, tutor drawer, confetti on cert/quiz pass)

## Repo

https://github.com/amitavrchy/lms-platform


## Interface and content refresh

Public pages use a warm academic palette, shared course illustrations, accessible navigation, and a 90% content container. Learner, Studio, and Admin workspaces use 90% of their available content area. The catalog supports search, category and duration filters, sorting, and shareable filter URLs.

The academic library contains 42 authored readings/checkpoints across five courses (four published, one draft). Each reading includes a concept explanation, worked example, practice activity, and reflection. The four published courses have distinct scenario-based assessments. Demo readings use article delivery rather than unrelated sample videos.

To update an existing local demo database without resetting learner records:

```powershell
cd Server
npx tsx prisma/update-academic-content.ts
```

This updates only the known Learnora demo courses. Enrollment, lesson progress, assessment attempts, certificates, and existing IDs are preserved. The full seed command remains intended for initializing/resetting demo data.

Course discussion posts and replies, announcement read states and publishing, cohort creation/editing, session scheduling, roster assignment, notification preferences, and module release schedules are connected to their API contracts. Quiz lessons require a passing attempt before completion; certificates require all lessons and assessments. Lessons can advance across available modules.

Validation: `npm run lint` and `npm run build` in Client; `npm test` and `npm run build` in Server. Live AI responses and paid checkout still depend on the AI service and Stripe configuration described above.
