"""OpenAI / LangChain wrappers with graceful mock/demo mode."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from app.config import Settings, get_settings
from app.prompts import (
    INSIGHTS_SYSTEM,
    INSIGHTS_USER,
    QUIZ_GENERATE_SYSTEM,
    QUIZ_GENERATE_USER,
    TUTOR_SYSTEM,
)

logger = logging.getLogger(__name__)


def _extract_json(text: str) -> Any:
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # fenced ```json ... ```
    m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if m:
        return json.loads(m.group(1).strip())
    # array or object substring
    for open_c, close_c in (("[", "]"), ("{", "}")):
        start = text.find(open_c)
        end = text.rfind(close_c)
        if start != -1 and end > start:
            return json.loads(text[start : end + 1])
    raise ValueError("No JSON found in model response")


class LLMService:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self._chat = None

    @property
    def mock_mode(self) -> bool:
        return self.settings.mock_mode

    def _get_chat(self) -> Any:
        if self._chat is not None:
            return self._chat
        from langchain_openai import ChatOpenAI

        self._chat = ChatOpenAI(
            api_key=self.settings.openai_api_key,
            model=self.settings.openai_model,
            temperature=0.2,
        )
        return self._chat

    def _invoke(self, system: str, user: str) -> str:
        from langchain_core.messages import HumanMessage, SystemMessage

        chat = self._get_chat()
        result = chat.invoke([SystemMessage(content=system), HumanMessage(content=user)])
        content = result.content
        if isinstance(content, list):
            return "".join(
                part if isinstance(part, str) else str(part.get("text", "")) for part in content
            )
        return str(content)

    # ── Tutor ──────────────────────────────────────────────────────────────

    def tutor_chat(
        self,
        *,
        message: str,
        history: list[dict[str, str]],
        chunks: list[dict[str, Any]],
    ) -> dict[str, Any]:
        citations = [
            {
                "sectionTitle": c.get("sectionTitle") or "Lesson content",
                "lessonId": c.get("lessonId"),
                "excerpt": (c.get("text") or "")[:240],
            }
            for c in chunks
        ]

        if not chunks:
            answer = (
                "I don't have enough ingested content for this lesson yet, so I can't "
                "answer confidently. Ask your instructor to ingest the lesson notes, "
                "or try rephrasing after content is available. You've got this — keep going!"
            )
            return {"answer": answer, "citations": [], "mock": self.mock_mode}

        if self.mock_mode:
            titles = sorted({c.get("sectionTitle") or "Lesson content" for c in chunks})
            context_preview = " ".join((c.get("text") or "")[:180] for c in chunks[:2]).strip()
            cited = ", ".join(f'“{t}”' for t in titles[:3])
            answer = (
                f"(Demo mode) Based on {cited}: {context_preview or 'the lesson material'}. "
                f"Regarding “{message[:120]}” — focus on the ideas in those sections. "
                "I won't spoil quiz answers. Keep practicing; you're building real mastery!"
            )
            return {"answer": answer, "citations": citations, "mock": True}

        context_block = "\n\n".join(
            f"[Section: {c.get('sectionTitle') or 'Untitled'}]\n{c.get('text') or ''}"
            for c in chunks
        )
        hist_lines = []
        for turn in history[-8:]:
            role = turn.get("role", "user")
            content = turn.get("content") or turn.get("message") or ""
            hist_lines.append(f"{role}: {content}")
        history_block = "\n".join(hist_lines) if hist_lines else "(none)"

        user_prompt = (
            f"Context chunks:\n{context_block}\n\n"
            f"Conversation history:\n{history_block}\n\n"
            f"Learner question: {message}\n\n"
            "Reply helpfully using only the context. Cite section titles in your answer."
        )
        try:
            answer = self._invoke(TUTOR_SYSTEM, user_prompt)
        except Exception as exc:
            logger.exception("Tutor LLM failed: %s", exc)
            answer = (
                "I hit a temporary issue generating a reply. Please try again. "
                "Meanwhile, review the cited sections below."
            )
        return {"answer": answer, "citations": citations, "mock": False}

    # ── Quiz generate ──────────────────────────────────────────────────────

    def generate_quiz(
        self,
        *,
        lesson_text: str,
        count: int = 5,
        difficulty: str = "medium",
    ) -> dict[str, Any]:
        count = max(1, min(int(count or 5), 20))
        difficulty = (difficulty or "medium").lower()

        if self.mock_mode:
            questions = self._mock_quiz(lesson_text, count, difficulty)
            return {"questions": questions, "mock": True}

        user = QUIZ_GENERATE_USER.format(
            count=count,
            difficulty=difficulty,
            lesson_text=lesson_text[:12000],
        )
        try:
            raw = self._invoke(QUIZ_GENERATE_SYSTEM, user)
            parsed = _extract_json(raw)
            if isinstance(parsed, dict) and "questions" in parsed:
                questions = parsed["questions"]
            elif isinstance(parsed, list):
                questions = parsed
            else:
                questions = self._mock_quiz(lesson_text, count, difficulty)
            questions = [self._normalize_question(q, i) for i, q in enumerate(questions[:count])]
            return {"questions": questions, "mock": False}
        except Exception as exc:
            logger.exception("Quiz generate failed: %s", exc)
            return {
                "questions": self._mock_quiz(lesson_text, count, difficulty),
                "mock": True,
                "warning": "Fell back to mock questions after LLM error",
            }

    def _normalize_question(self, q: dict[str, Any], index: int) -> dict[str, Any]:
        options_in = q.get("options") or []
        option_ids = ["a", "b", "c", "d"]
        options = []
        for i, oid in enumerate(option_ids):
            src = options_in[i] if i < len(options_in) else {}
            if isinstance(src, str):
                options.append({"id": oid, "text": src, "correct": i == 0})
            else:
                options.append(
                    {
                        "id": src.get("id") or oid,
                        "text": src.get("text") or f"Option {oid}",
                        "correct": bool(src.get("correct", False)),
                    }
                )
        if not any(o["correct"] for o in options):
            options[0]["correct"] = True
        # ensure single correct
        seen = False
        for o in options:
            if o["correct"]:
                if seen:
                    o["correct"] = False
                seen = True
        return {
            "promptMd": q.get("promptMd") or q.get("prompt") or f"Question {index + 1}",
            "options": options,
            "explanationMd": q.get("explanationMd") or q.get("explanation") or "",
        }

    def _mock_quiz(self, lesson_text: str, count: int, difficulty: str) -> list[dict[str, Any]]:
        snippet = re.sub(r"\s+", " ", (lesson_text or "").strip())[:80] or "this lesson"
        questions = []
        for i in range(count):
            n = i + 1
            questions.append(
                {
                    "promptMd": (
                        f"(Demo · {difficulty}) What is a key idea from the material "
                        f"related to “{snippet}…”? (Q{n})"
                    ),
                    "options": [
                        {"id": "a", "text": "A core concept introduced in the lesson", "correct": True},
                        {"id": "b", "text": "An unrelated marketing slogan", "correct": False},
                        {"id": "c", "text": "A quiz answer key spoiler (never use)", "correct": False},
                        {"id": "d", "text": "Content from a different course entirely", "correct": False},
                    ],
                    "explanationMd": (
                        f"The correct choice reflects ideas covered in the lesson text. "
                        f"Difficulty target: {difficulty}."
                    ),
                }
            )
        return questions

    # ── Insights ───────────────────────────────────────────────────────────

    def progress_insights(self, course_stats: dict[str, Any] | list[Any]) -> dict[str, Any]:
        if self.mock_mode:
            return {**self._mock_insights(course_stats), "mock": True}

        user = INSIGHTS_USER.format(course_stats=json.dumps(course_stats, default=str)[:16000])
        try:
            raw = self._invoke(INSIGHTS_SYSTEM, user)
            parsed = _extract_json(raw)
            if not isinstance(parsed, dict):
                return {**self._mock_insights(course_stats), "mock": True}
            return {
                "narrative": parsed.get("narrative") or "",
                "dropOffPoints": parsed.get("dropOffPoints") or [],
                "tips": (parsed.get("tips") or [])[:3],
                "riskLearners": parsed.get("riskLearners") or [],
                "mock": False,
            }
        except Exception as exc:
            logger.exception("Insights LLM failed: %s", exc)
            return {
                **self._mock_insights(course_stats),
                "mock": True,
                "warning": "Fell back to mock insights after LLM error",
            }

    def _mock_insights(self, course_stats: dict[str, Any] | list[Any]) -> dict[str, Any]:
        lessons: list[dict[str, Any]] = []
        risk: list[dict[str, Any]] = []

        if isinstance(course_stats, dict):
            lessons = (
                course_stats.get("lessons")
                or course_stats.get("lessonStats")
                or course_stats.get("perLesson")
                or []
            )
            risk = course_stats.get("riskLearners") or course_stats.get("learners") or []
        elif isinstance(course_stats, list):
            lessons = course_stats

        drop_offs: list[dict[str, Any]] = []
        for lesson in lessons:
            if not isinstance(lesson, dict):
                continue
            completion = lesson.get("completionRate", lesson.get("completion", 1))
            try:
                rate = float(completion)
                if rate > 1:
                    rate = rate / 100.0
            except (TypeError, ValueError):
                rate = 1.0
            quiz_avg = lesson.get("quizAverage", lesson.get("quizAvg"))
            low_quiz = False
            if quiz_avg is not None:
                try:
                    qa = float(quiz_avg)
                    if qa > 1:
                        qa = qa / 100.0
                    low_quiz = qa < 0.6
                except (TypeError, ValueError):
                    pass
            if rate < 0.55 or low_quiz:
                drop_offs.append(
                    {
                        "lessonId": str(lesson.get("lessonId") or lesson.get("id") or ""),
                        "lessonTitle": str(lesson.get("lessonTitle") or lesson.get("title") or "Untitled"),
                        "reason": (
                            f"Completion ~{int(rate * 100)}%"
                            + ("; quiz average is weak" if low_quiz else "")
                        ),
                    }
                )

        if not drop_offs and lessons:
            first = lessons[0] if isinstance(lessons[0], dict) else {}
            drop_offs.append(
                {
                    "lessonId": str(first.get("lessonId") or first.get("id") or "unknown"),
                    "lessonTitle": str(first.get("lessonTitle") or first.get("title") or "Early lessons"),
                    "reason": "No severe drop-off detected; monitor early modules as learners onboard.",
                }
            )
        elif not drop_offs:
            drop_offs.append(
                {
                    "lessonId": "n/a",
                    "lessonTitle": "Course overview",
                    "reason": "Insufficient lesson-level stats; ingest richer courseStats for sharper drop-off detection.",
                }
            )

        risk_learners = []
        for learner in risk[:5]:
            if not isinstance(learner, dict):
                continue
            risk_learners.append(
                {
                    "userId": str(learner.get("userId") or learner.get("id") or ""),
                    "name": str(learner.get("name") or learner.get("email") or "Learner"),
                    "reason": str(
                        learner.get("reason")
                        or learner.get("status")
                        or "Low recent activity / completion"
                    ),
                }
            )

        tips = [
            "Add a short checkpoint quiz or recap video before the steepest drop-off lesson.",
            "Send a cohort nudge (email/in-app) to learners stuck >7 days on incomplete modules.",
            "Clarify learning objectives and estimated time on lessons with the lowest completion.",
        ]

        narrative = (
            "(Demo mode) Progress looks mixed. "
            f"Flagged {len(drop_offs)} drop-off point(s) and {len(risk_learners)} at-risk learner(s). "
            "Use the tips below to tighten the path and keep completion climbing."
        )

        return {
            "narrative": narrative,
            "dropOffPoints": drop_offs[:5],
            "tips": tips,
            "riskLearners": risk_learners,
        }


_llm: LLMService | None = None


def get_llm_service() -> LLMService:
    global _llm
    if _llm is None:
        _llm = LLMService()
    return _llm
