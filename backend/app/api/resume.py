"""Resume upload and interview question generation."""

import logging
import os
import shutil
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.models.interview import session_manager
from app.models.user import User
from app.services.resume_reader import read_resume
from app.services.ai_service import generate_interview_questions
from app.auth import get_current_user

logger = logging.getLogger("skillcortex.api.resume")
router = APIRouter(prefix="/api", tags=["Interview"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload-resume")
def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not file.filename or not file.filename.lower().endswith((".pdf", ".docx", ".doc")):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and DOC files are supported")

    # Use a temp directory for uploaded files to prevent orphaned files
    tmp_dir = tempfile.mkdtemp(prefix="skillcortex_upload_")
    try:
        file_path = os.path.join(tmp_dir, f"{current_user.id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        try:
            resume_text = read_resume(file_path)
            if not resume_text.strip():
                raise HTTPException(status_code=400, detail="Could not extract text from the resume")
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("Failed to read resume file: %s", exc)
            raise HTTPException(status_code=500, detail="Failed to read resume file")

        try:
            questions = generate_interview_questions(resume_text)
            if not questions or "Gemini failed" in str(questions):
                raise HTTPException(status_code=502, detail="AI service failed to generate questions")
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("AI service error: %s", exc)
            raise HTTPException(status_code=502, detail="AI service error")

        session = session_manager.get_session(current_user.id)
        session.load_questions(questions)

        try:
            session.persist_to_db(current_user.id)
        except Exception as exc:
            logger.error("Failed to save session: %s", exc)
            raise HTTPException(status_code=500, detail="Failed to save session")

        return {
            "filename": file.filename,
            "total_questions": len(questions),
            "message": "Resume processed and questions generated",
        }
    finally:
        # Clean up temp directory and all uploaded files
        try:
            shutil.rmtree(tmp_dir, ignore_errors=True)
        except OSError:
            pass
