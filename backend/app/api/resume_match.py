"""Resume vs. job description matching endpoint."""

import logging
import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Request

from app.models.user import User
from app.services.resume_match_service import analyze_resume_match
from app.services.gemini_client import is_demo_mode_active
from app.services.resume_reader import read_resume
from app.auth import get_current_user

logger = logging.getLogger("careerpilot.api.resume_match")
router = APIRouter(prefix="/api", tags=["Resume Match"])


@router.post("/resume-match")
async def resume_match(
    request: Request,
    file: UploadFile = File(...),
    job_description: str = Form(...),
    demo: bool = Query(False),
    current_user: User = Depends(get_current_user),
):
    header_demo = request.headers.get("x-demo-mode", "").lower() in ("true", "1", "yes")
    active_demo = demo or header_demo or is_demo_mode_active()

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported. Please upload a .pdf document.",
        )

    tmp_path = None
    resume_text = ""
    try:
        pdf_bytes = await file.read()
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(pdf_bytes)
            tmp_path = tmp.name

        try:
            resume_text = read_resume(tmp_path)
            if not resume_text:
                if active_demo:
                    resume_text = "Demonstration candidate resume with Python and Cloud Engineering profile."
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
                logger.error("Failed to read PDF: %s", exc)
                raise HTTPException(status_code=400, detail=f"Failed to read PDF file: {exc}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

    try:
        result = analyze_resume_match(resume_text, job_description, demo=active_demo)
    except TypeError:
        result = analyze_resume_match(resume_text, job_description)
    result["is_demo"] = active_demo
    return result
