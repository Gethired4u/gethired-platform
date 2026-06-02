import asyncio
import logging
import os
import tempfile
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from fastapi import APIRouter, File, HTTPException, UploadFile, Form

from services.db import create_analysis_history
from services.resume_analyzer import analyze_resume

logger = logging.getLogger(__name__)

router = APIRouter(tags=["resume"])


def _resolve_worker_count() -> int:
    try:
        configured = int(os.getenv("RESUME_ANALYSIS_WORKERS", "4"))
    except ValueError:
        configured = 4

    return max(2, configured)


ANALYSIS_EXECUTOR = ThreadPoolExecutor(
    max_workers=_resolve_worker_count(),
    thread_name_prefix="resume-analysis",
)


def _analyze_and_persist(temp_file_path: str, target_context: str, experience_level: str = "") -> dict:
    result = analyze_resume(temp_file_path, target_context, experience_level)

    # Persist analysis history for admin monitoring (best effort).
    try:
        create_analysis_history(
            job_description=target_context,
            ats_score=result.ats_score,
            component_scores=result.component_scores,
            strengths=result.strengths,
            issues=[issue.title + ": " + issue.detail for issue in result.issues],
            suggested_keywords=result.suggested_keywords,
            suggested_keywords_relevance=[
                {"keyword": sk.keyword, "relevance": sk.relevance}
                for sk in result.suggested_keywords_relevance
            ],
        )
    except Exception as exc:
        logger.warning("Failed to persist analysis history: %s", exc)

    return result.model_dump()


@router.post("/analyze-resume")
async def analyze_resume_endpoint(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    position: Optional[str] = Form(None),
    experience_level: Optional[str] = Form(None),
) -> dict:
    """
    Analyze a resume file for ATS compatibility.

    Supports PDF, DOCX, and plain text files.
    Requires a job description or the target position for contextual analysis.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    if not (job_description and job_description.strip()) and not (position and position.strip()):
        raise HTTPException(
            status_code=400,
            detail="Please provide a job description or target position for a focused ATS analysis."
        )

    # Prefer explicit job_description; fallback to position text for analysis context
    target_context = job_description.strip() if job_description and job_description.strip() else f"Target position: {position.strip()}"

    # Validate file extension
    allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
    file_extension = os.path.splitext(file.filename.lower())[1]

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Validate file size (max 10MB)
    content = await file.read()
    file_size = len(content)

    if file_size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum size: 10MB")

    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty file provided.")

    temp_file_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name

        exp_level = experience_level.strip() if experience_level and experience_level.strip() else ""
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(
            ANALYSIS_EXECUTOR,
            _analyze_and_persist,
            temp_file_path,
            target_context,
            exp_level,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        if temp_file_path:
            try:
                os.unlink(temp_file_path)
            except OSError:
                pass
