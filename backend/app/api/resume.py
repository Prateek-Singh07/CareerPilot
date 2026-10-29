"""Resume upload and interview question generation."""

import logging
import os
import shutil
import tempfile
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Request

from app.models.interview import session_manager
from app.models.user import User
from app.services.resume_reader import read_resume
from app.services.ai_service import generate_interview_questions
from app.services.gemini_client import is_demo_mode_active
from app.auth import get_current_user

logger = logging.getLogger("careerpilot.api.resume")
router = APIRouter(prefix="/api", tags=["Interview"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload-resume")
def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    demo: bool = Query(False),
    current_user: User = Depends(get_current_user),
):
    header_demo = request.headers.get("x-demo-mode", "").lower() in ("true", "1", "yes")
    active_demo = demo or header_demo or is_demo_mode_active()

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported. Please upload a .pdf document.",
        )

    # Use a temp directory for uploaded files to prevent orphaned files
    tmp_dir = tempfile.mkdtemp(prefix="careerpilot_upload_")
    try:
        file_path = os.path.join(tmp_dir, f"{current_user.id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        try:
            resume_text = read_resume(file_path)
            if not resume_text:
                if active_demo:
                    resume_text = "Demonstration candidate resume with full-stack engineering background."
                else:
                    raise HTTPException(
                        status_code=400,
                        detail="Could not extract any text from the PDF. Scanned images and empty documents are not supported.",
                    )
        except ValueError as ve:
            if active_demo:
                resume_text = "Demonstration candidate resume."
            else:
                raise HTTPException(status_code=400, detail=str(ve))
        except HTTPException:
            raise
        except Exception as exc:
            if active_demo:
                resume_text = "Demonstration candidate resume."
            else:
                logger.error("Failed to read resume file: %s", exc)
                raise HTTPException(status_code=400, detail=f"Failed to read resume file: {exc}")

        try:
            questions = generate_interview_questions(resume_text, demo=active_demo)
        except TypeError:
            questions = generate_interview_questions(resume_text)
        if not questions or not isinstance(questions, list):
            raise HTTPException(status_code=502, detail="AI service failed to generate valid interview questions")

        session = session_manager.get_session(current_user.id)
        session.load_questions(questions, is_demo=active_demo)

        try:
            session.persist_to_db(current_user.id)
        except Exception as exc:
            logger.error("Failed to save session to DB: %s", exc)
            raise HTTPException(status_code=500, detail="Failed to initialize session in database")

        return {
            "filename": file.filename,
            "total_questions": len(questions),
            "message": "Resume processed and questions generated",
            "is_demo": active_demo,
        }
    finally:
        # Clean up temp directory and all uploaded files
        try:
            shutil.rmtree(tmp_dir, ignore_errors=True)
        except OSError:
            pass
