"""Resume upload and interview question generation."""

import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.models.interview import interview
from app.models.user import User
from app.services.resume_reader import read_resume
from app.services.ai_service import generate_interview_questions
from app.database import get_db
from app.auth import get_current_user

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

    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save uploaded file")

    try:
        resume_text = read_resume(file_path)
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the resume")
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to read resume file")

    try:
        questions = generate_interview_questions(resume_text)
        if not questions or "Gemini failed" in str(questions):
            raise HTTPException(status_code=502, detail="AI service failed to generate questions")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=502, detail="AI service error")

    interview.load_questions(questions)

    try:
        interview.persist_to_db(current_user.id)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save session")

    return {
        "filename": file.filename,
        "total_questions": len(questions),
        "message": "Resume processed and questions generated",
    }
