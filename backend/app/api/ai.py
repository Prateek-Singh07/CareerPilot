"""Interview Q&A and report download endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse

from app.models.interview import interview
from app.models.user import User
from app.services.ai_service import evaluate_answer
from app.services.pdf_service import generate_pdf
from app.auth import get_current_user

router = APIRouter(prefix="/api", tags=["Interview"])


@router.get("/next-question")
def next_question(current_user: User = Depends(get_current_user)):
    question = interview.get_next_question()
    if question is None:
        return {"message": "Interview completed!", "summary": interview.summary()}
    return {"question": question}


@router.post("/answer")
def submit_answer(
    answer: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
):
    if interview.current_question < 1:
        raise HTTPException(status_code=400, detail="No active question. Start a new interview.")
    if interview.current_question > len(interview.questions):
        raise HTTPException(status_code=400, detail="Interview already completed.")

    question = interview.questions[interview.current_question - 1]
    interview.save_answer(answer)

    try:
        feedback = evaluate_answer(question, answer)
    except Exception:
        raise HTTPException(status_code=502, detail="AI evaluation failed")

    interview.save_feedback(feedback)
    return {"feedback": feedback, "average_score": interview.average_score()}


@router.get("/download-report")
def download_report(current_user: User = Depends(get_current_user)):
    summary = interview.summary()
    if summary["questions_answered"] == 0:
        raise HTTPException(status_code=400, detail="No interview data to generate a report")

    try:
        pdf_path = generate_pdf(summary)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate PDF report")

    return FileResponse(
        path=pdf_path,
        filename="Interview_Report.pdf",
        media_type="application/pdf",
    )
