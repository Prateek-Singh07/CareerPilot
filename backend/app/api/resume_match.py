"""Resume vs. job description matching endpoint."""

import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from app.models.user import User
from app.services.resume_match_service import analyze_resume_match
from app.services.resume_reader import read_resume
from app.auth import get_current_user

logger = logging.getLogger("skillcortex.api.resume_match")
router = APIRouter(prefix="/api", tags=["Resume Match"])


@router.post("/resume-match")
async def resume_match(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    current_user: User = Depends(get_current_user),
):
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        pdf_bytes = await file.read()
        # Write to temp file so resume_reader can process it
        import tempfile, os
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(pdf_bytes)
            tmp_path = tmp.name
        try:
            resume_text = read_resume(tmp_path)
            if not resume_text.strip():
                raise HTTPException(status_code=400, detail="Could not extract text from the PDF")
        finally:
            os.unlink(tmp_path)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to read PDF: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to read PDF file")

    try:
        result = analyze_resume_match(resume_text, job_description)
    except Exception as exc:
        logger.error("AI analysis failed: %s", exc)
        raise HTTPException(status_code=502, detail="AI analysis failed")

    return result
