# Learnora LMS

Production-oriented academic and cohort LMS — **Finish what you start.**

## Stack

| Layer | Tech |
|-------|------|
| Client | Next.js (App Router), TypeScript, Tailwind v4, Redux Toolkit, React Query, Framer Motion |
| Server | NestJS ESM, Prisma 6, Postgres 16, JWT, Swagger |
| AI | FastAPI, LangChain/OpenAI, Chroma (mock mode without API key) |

## Quick start

### 1. Database

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or any Postgres 16), then:

```bash
docker compose up -d
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
