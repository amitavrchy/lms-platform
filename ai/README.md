# Learnora AI Service

FastAPI service for RAG tutoring, quiz generation, and instructor progress insights.

## Setup

```bash
cd ai
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Copy env (already safe for offline mock mode — leave `OPENAI_API_KEY` empty):

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

## Run

From the `ai/` directory:

```bash
uvicorn app.main:app --reload --port 8002
```

- Health: [http://127.0.0.1:8002/health](http://127.0.0.1:8002/health)
- OpenAPI: [http://127.0.0.1:8002/docs](http://127.0.0.1:8002/docs)

## Endpoints

| Method | Path | Body |
|--------|------|------|
| POST | `/v1/content/ingest` | `{ orgId, courseId, lessonId, text }` |
| POST | `/v1/tutor/chat` | `{ orgId, lessonId, message, history }` |
| POST | `/v1/quiz/generate` | `{ lessonText, count, difficulty }` |
| POST | `/v1/insights/progress` | `{ courseStats }` |

## Mock vs live

| Mode | When | Behavior |
|------|------|----------|
| **Mock / demo** | `OPENAI_API_KEY` empty or unset | In-memory chunk store; structured demo tutor answers, MCQs, and insights. Nest can integrate offline. Responses include `"mock": true`. |
| **Live** | `OPENAI_API_KEY` set | Chroma persistent store at `CHROMA_PATH`; LangChain + OpenAI for tutor / quiz / insights. |

## Env

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Enables live LLM (empty → mock) |
| `OPENAI_MODEL` | Default `gpt-4.1-mini` |
| `CHROMA_PATH` | Persistent Chroma directory (`./chroma`) |
| `CLIENT_ORIGIN` | CORS origin(s), comma-separated |
| `DATABASE_URL` | Reserved for future SQL use |

## Workspace launcher

This directory contains all AI service files, including its own environment, ignored Python cache, Chroma data, and runtime logs. Shared project documentation is in [Server/docs/PROJECT.md](../Server/docs/PROJECT.md).

After all three service environments are configured, run `npm run dev:all` from `Server/` on Windows to start the client, NestJS API, and this FastAPI service. The launcher uses `ai/.venv/Scripts/python.exe` and the `ai/` working directory, so relative `.env` and Chroma paths resolve correctly.
