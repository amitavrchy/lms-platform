from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.services.chroma_store import ChromaStore, get_chroma_store

router = APIRouter(prefix="/v1/content", tags=["content"])


class IngestRequest(BaseModel):
    orgId: str = Field(..., min_length=1)
    courseId: str = Field(..., min_length=1)
    lessonId: str = Field(..., min_length=1)
    text: str = Field(..., min_length=1)
    sectionTitle: str | None = None


class IngestResponse(BaseModel):
    ingested: int
    collection: str
    mock: bool = False


@router.post("/ingest", response_model=IngestResponse)
def ingest_content(
    body: IngestRequest,
    store: ChromaStore = Depends(get_chroma_store),
) -> IngestResponse:
    result = store.ingest(
        org_id=body.orgId,
        course_id=body.courseId,
        lesson_id=body.lessonId,
        text=body.text,
        section_title=body.sectionTitle,
    )
    return IngestResponse(**result)
