from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.services.chroma_store import ChromaStore, get_chroma_store
from app.services.llm import LLMService, get_llm_service

router = APIRouter(prefix="/v1/tutor", tags=["tutor"])


class HistoryTurn(BaseModel):
    role: str = "user"
    content: str = ""


class TutorChatRequest(BaseModel):
    orgId: str = Field(..., min_length=1)
    lessonId: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)
    history: list[HistoryTurn] | list[dict[str, Any]] = Field(default_factory=list)
    courseId: str | None = None


class Citation(BaseModel):
    sectionTitle: str
    lessonId: str | None = None
    excerpt: str = ""


class TutorChatResponse(BaseModel):
    answer: str
    citations: list[Citation] = Field(default_factory=list)
    mock: bool = False


@router.post("/chat", response_model=TutorChatResponse)
def tutor_chat(
    body: TutorChatRequest,
    store: ChromaStore = Depends(get_chroma_store),
    llm: LLMService = Depends(get_llm_service),
) -> TutorChatResponse:
    chunks = store.query(
        org_id=body.orgId,
        lesson_id=body.lessonId,
        course_id=body.courseId,
        query=body.message,
        n_results=5,
    )
    history = [
        t.model_dump() if isinstance(t, HistoryTurn) else dict(t) for t in body.history
    ]
    result = llm.tutor_chat(message=body.message, history=history, chunks=chunks)
    return TutorChatResponse(
        answer=result["answer"],
        citations=[Citation(**c) for c in result.get("citations", [])],
        mock=bool(result.get("mock", False)),
    )
