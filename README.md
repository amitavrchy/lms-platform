# Learnora LMS

Production-oriented creator & cohort LMS — **Finish what you start.**

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

## Demo accounts

Password for all: `Password123!`

| Email | Role |
|-------|------|
| `learner@learnora.dev` | LEARNER |
| `instructor@learnora.dev` | INSTRUCTOR |
| `admin@learnora.dev` | ADMIN |
| `owner@learnora.dev` | OWNER |
| `ta@learnora.dev` | TA |

Org slug: `learnora`

## Product surfaces

- `/` marketing · `/courses` catalog · `/login` `/register`
- `/learn` learner home, player, quizzes, streaks, certificates
- `/studio` curriculum builder, analytics, AI tools
- `/admin` members, assign courses, reports

## Design rules

- Minimum font size **14px**
- Tokens: immersive dark learn surfaces + light studio/admin
- Motion via Framer Motion (progress rings, streak flame, tutor drawer, confetti on cert/quiz pass)

## Repo

https://github.com/amitavrchy/lms-platform
