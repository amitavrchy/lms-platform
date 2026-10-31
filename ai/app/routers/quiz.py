from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.services.llm import LLMService, get_llm_service

router = APIRouter(prefix="/v1/quiz", tags=["quiz"])


class QuizGenerateRequest(BaseModel):
    lessonText: str = Field(..., min_length=1)
    count: int = Field(default=5, ge=1, le=20)
    difficulty: str = Field(default="medium")


class QuizOption(BaseModel):
    id: str
    text: str
    correct: bool = False


class QuizQuestion(BaseModel):
    promptMd: str
    options: list[QuizOption]
    explanationMd: str = ""


class QuizGenerateResponse(BaseModel):
    questions: list[QuizQuestion]
    mock: bool = False
    warning: str | None = None


@router.post("/generate", response_model=QuizGenerateResponse)
def generate_quiz(
    body: QuizGenerateRequest,
    llm: LLMService = Depends(get_llm_service),
) -> QuizGenerateResponse:
    result = llm.generate_quiz(
        lesson_text=body.lessonText,
        count=body.count,
        difficulty=body.difficulty,
    )
    return QuizGenerateResponse(
        questions=[QuizQuestion(**q) for q in result["questions"]],
        mock=bool(result.get("mock", False)),
        warning=result.get("warning"),
    )
