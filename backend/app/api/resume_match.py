from fastapi import APIRouter, UploadFile, File, Form
import fitz

from app.services.resume_match_service import (
    analyze_resume_match
)

router = APIRouter()


@router.post("/resume-match")
async def resume_match(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):

    pdf_bytes = await file.read()

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    resume_text = ""

    for page in doc:
        resume_text += page.get_text()

    result = analyze_resume_match(
        resume_text,
        job_description
    )

    return result