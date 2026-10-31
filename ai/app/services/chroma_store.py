"""ChromaDB store — one collection per org (`course_{orgId}`), metadata filters."""

from __future__ import annotations

import hashlib
import logging
import re
import uuid
from typing import Any

from app.config import Settings, get_settings

logger = logging.getLogger(__name__)

CHUNK_SIZE = 800
CHUNK_OVERLAP = 120


def _collection_name(org_id: str) -> str:
    safe = re.sub(r"[^a-zA-Z0-9._-]", "_", org_id)[:64]
    return f"course_{safe}"


def _chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    cleaned = re.sub(r"\s+", " ", text or "").strip()
    if not cleaned:
        return []
    if len(cleaned) <= size:
        return [cleaned]
    chunks: list[str] = []
    start = 0
    while start < len(cleaned):
        end = min(start + size, len(cleaned))
        chunks.append(cleaned[start:end].strip())
        if end >= len(cleaned):
            break
        start = max(0, end - overlap)
    return [c for c in chunks if c]


class ChromaStore:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self._client: Any = None
        self._memory: dict[str, list[dict[str, Any]]] = {}

    @property
    def mock_mode(self) -> bool:
        return self.settings.mock_mode

    def _get_client(self) -> Any:
        if self._client is not None:
            return self._client
        import chromadb
        from chromadb.config import Settings as ChromaSettings

        self._client = chromadb.PersistentClient(
            path=self.settings.chroma_path,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        return self._client

    def _get_collection(self, org_id: str) -> Any:
        client = self._get_client()
        return client.get_or_create_collection(
            name=_collection_name(org_id),
            metadata={"hnsw:space": "cosine"},
        )

    def ingest(
        self,
        *,
        org_id: str,
        course_id: str,
        lesson_id: str,
        text: str,
        section_title: str | None = None,
    ) -> dict[str, Any]:
        chunks = _chunk_text(text)
        if not chunks:
            return {"ingested": 0, "collection": _collection_name(org_id), "mock": self.mock_mode}

        title = section_title or f"Lesson {lesson_id}"

        if self.mock_mode:
            key = _collection_name(org_id)
            # Replace prior chunks for this lesson
            existing = [
                d
                for d in self._memory.get(key, [])
                if not (d["metadata"].get("lessonId") == lesson_id and d["metadata"].get("courseId") == course_id)
            ]
            for i, chunk in enumerate(chunks):
                doc_id = hashlib.sha256(f"{org_id}:{course_id}:{lesson_id}:{i}".encode()).hexdigest()[:24]
                existing.append(
                    {
                        "id": doc_id,
                        "document": chunk,
                        "metadata": {
                            "orgId": org_id,
                            "courseId": course_id,
                            "lessonId": lesson_id,
                            "sectionTitle": title,
                            "chunkIndex": i,
                        },
                    }
                )
            self._memory[key] = existing
            return {"ingested": len(chunks), "collection": key, "mock": True}

        collection = self._get_collection(org_id)

        # Delete existing docs for this lesson so re-ingest is idempotent
        try:
            collection.delete(where={"$and": [{"courseId": course_id}, {"lessonId": lesson_id}]})
        except Exception:
            logger.debug("No prior chunks to delete for lesson %s", lesson_id)

        ids: list[str] = []
        documents: list[str] = []
        metadatas: list[dict[str, Any]] = []
        for i, chunk in enumerate(chunks):
            doc_id = hashlib.sha256(f"{org_id}:{course_id}:{lesson_id}:{i}".encode()).hexdigest()[:24]
            ids.append(doc_id)
            documents.append(chunk)
            metadatas.append(
                {
                    "orgId": org_id,
                    "courseId": course_id,
                    "lessonId": lesson_id,
                    "sectionTitle": title,
                    "chunkIndex": i,
                }
            )

        collection.add(ids=ids, documents=documents, metadatas=metadatas)
        return {
            "ingested": len(chunks),
            "collection": _collection_name(org_id),
            "mock": False,
        }

    def query(
        self,
        *,
        org_id: str,
        lesson_id: str | None,
        query: str,
        n_results: int = 5,
        course_id: str | None = None,
    ) -> list[dict[str, Any]]:
        if self.mock_mode:
            key = _collection_name(org_id)
            docs = self._memory.get(key, [])
            if lesson_id:
                docs = [d for d in docs if d["metadata"].get("lessonId") == lesson_id]
            if course_id:
                docs = [d for d in docs if d["metadata"].get("courseId") == course_id]
            q = (query or "").lower()
            scored = []
            for d in docs:
                text = d["document"].lower()
                score = sum(1 for tok in q.split() if tok and tok in text)
                scored.append((score, d))
            scored.sort(key=lambda x: x[0], reverse=True)
            selected = [d for _, d in scored[:n_results]] if scored else docs[:n_results]
            return [
                {
                    "id": d["id"],
                    "text": d["document"],
                    "sectionTitle": d["metadata"].get("sectionTitle", ""),
                    "lessonId": d["metadata"].get("lessonId", ""),
                    "courseId": d["metadata"].get("courseId", ""),
                    "distance": 0.0,
                }
                for d in selected
            ]

        collection = self._get_collection(org_id)
        where: dict[str, Any] | None = None
        clauses: list[dict[str, Any]] = []
        if lesson_id:
            clauses.append({"lessonId": lesson_id})
        if course_id:
            clauses.append({"courseId": course_id})
        if len(clauses) == 1:
            where = clauses[0]
        elif len(clauses) > 1:
            where = {"$and": clauses}

        try:
            result = collection.query(
                query_texts=[query],
                n_results=n_results,
                where=where,
            )
        except Exception as exc:
            logger.warning("Chroma query failed: %s", exc)
            return []

        out: list[dict[str, Any]] = []
        ids = (result.get("ids") or [[]])[0]
        docs = (result.get("documents") or [[]])[0]
        metas = (result.get("metadatas") or [[]])[0]
        dists = (result.get("distances") or [[]])[0]
        for i, doc_id in enumerate(ids):
            meta = metas[i] if i < len(metas) else {}
            out.append(
                {
                    "id": doc_id or str(uuid.uuid4()),
                    "text": docs[i] if i < len(docs) else "",
                    "sectionTitle": (meta or {}).get("sectionTitle", ""),
                    "lessonId": (meta or {}).get("lessonId", ""),
                    "courseId": (meta or {}).get("courseId", ""),
                    "distance": dists[i] if i < len(dists) else None,
                }
            )
        return out


_store: ChromaStore | None = None


def get_chroma_store() -> ChromaStore:
    global _store
    if _store is None:
        _store = ChromaStore()
    return _store
