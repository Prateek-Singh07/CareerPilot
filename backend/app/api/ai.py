from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.services.ai_service import (
    generate_interview_questions,
    evaluate_answer,
)

from app.services.pdf_service import generate_pdf

from app.models.interview import interview

router = APIRouter()


@router.get("/test-ai")
def test():

    sample_resume = """
Python
Machine Learning
TensorFlow
SQL
Flask
"""

    return {
        "response": generate_interview_questions(sample_resume)
    }


@router.get("/next-question")
def next_question():

    question = interview.get_next_question()

    if question is None:

        return {
            "message": "Interview completed!",
            "summary": interview.summary()
        }

    return {
        "question": question
    }


@router.post("/answer")
def answer(answer: str):

    question = interview.questions[
        interview.current_question - 1
    ]

    interview.save_answer(answer)

    feedback = evaluate_answer(question, answer)

    interview.save_feedback(feedback)

    return {
        "feedback": feedback,
        "average_score": interview.average_score()
    }


@router.get("/download-report")
def download_report():

    summary = interview.summary()

    pdf_path = generate_pdf(summary)

    return FileResponse(
        path=pdf_path,
        filename="Interview_Report.pdf",
        media_type="application/pdf",
    )