from app.models.interview import interview
from fastapi import APIRouter, UploadFile, File
from app.services.resume_reader import read_resume
from app.services.ai_service import generate_interview_questions
import shutil
import os

router = APIRouter()


@router.post("/upload-resume")
def upload_resume(file: UploadFile = File(...)):

    file_path = os.path.join("uploads", file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    resume_text = read_resume(file_path)

    questions = generate_interview_questions(resume_text)

    interview.load_questions(questions)

    return {
        "filename": file.filename,
        "interview_questions": questions
    }