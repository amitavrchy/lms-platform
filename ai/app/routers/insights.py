from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.services.llm import LLMService, get_llm_service

router = APIRouter(prefix="/v1/insights", tags=["insights"])


class ProgressInsightsRequest(BaseModel):
    courseStats: dict[str, Any] | list[Any] = Field(...)


class DropOffPoint(BaseModel):
    lessonId: str
    lessonTitle: str
    reason: str


class RiskLearner(BaseModel):
    userId: str
    name: str
    reason: str


class ProgressInsightsResponse(BaseModel):
    narrative: str
    dropOffPoints: list[DropOffPoint] = Field(default_factory=list)
    tips: list[str] = Field(default_factory=list)
    riskLearners: list[RiskLearner] = Field(default_factory=list)
    mock: bool = False
    warning: str | None = None


@router.post("/progress", response_model=ProgressInsightsResponse)
def progress_insights(
    body: ProgressInsightsRequest,
    llm: LLMService = Depends(get_llm_service),
) -> ProgressInsightsResponse:
    result = llm.progress_insights(body.courseStats)
    return ProgressInsightsResponse(
        narrative=result.get("narrative") or "",
        dropOffPoints=[DropOffPoint(**d) for d in result.get("dropOffPoints", [])],
        tips=list(result.get("tips") or [])[:3],
        riskLearners=[RiskLearner(**r) for r in result.get("riskLearners", [])],
        mock=bool(result.get("mock", False)),
        warning=result.get("warning"),
    )
