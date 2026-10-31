from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import content, insights, quiz, tutor


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title="Learnora AI Service",
        version="1.0.0",
        description="RAG tutor, quiz generation, and progress insights for Learnora LMS.",
    )

    origins = [o.strip() for o in settings.client_origin.split(",") if o.strip()]
    if not origins:
        origins = ["http://localhost:3000"]

    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(content.router)
    application.include_router(tutor.router)
    application.include_router(quiz.router)
    application.include_router(insights.router)

    @application.get("/health")
    def health() -> dict:
        return {
            "status": "ok",
            "service": "learnora-ai",
            "mock": settings.mock_mode,
            "model": settings.openai_model if not settings.mock_mode else None,
        }

    return application


app = create_app()
