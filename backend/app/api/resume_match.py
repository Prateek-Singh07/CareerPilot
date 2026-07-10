"""Resume vs. job description matching endpoint."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse

from app.models.user import User
from app.services.resume_match_service import analyze_resume_match
from app.auth import get_current_user

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
        import fitz
        pdf_bytes = await file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        resume_text = "".join(page.get_text() for page in doc)
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to read PDF file")

    try:
        result = analyze_resume_match(resume_text, job_description)
    except Exception:
        raise HTTPException(status_code=502, detail="AI analysis failed")

    return result
