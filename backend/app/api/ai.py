"""Interview Q&A and report download endpoints."""

import logging
import shutil
from pathlib import Path
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from fastapi.responses import FileResponse

from app.models.interview import session_manager
from app.models.user import User
from app.services.ai_service import evaluate_answer
from app.services.pdf_service import generate_pdf
from app.auth import get_current_user

logger = logging.getLogger("skillcortex.api.ai")
router = APIRouter(prefix="/api", tags=["Interview"])


def _get_session(current_user: User):
    """Get the per-user interview session."""
    return session_manager.get_session(current_user.id)


@router.get("/next-question")
def next_question(current_user: User = Depends(get_current_user)):
    session = _get_session(current_user)
    question = session.get_next_question()
    if question is None:
        return {"message": "Interview completed!", "summary": session.summary()}
    return {"question": question}


@router.post("/answer")
def submit_answer(
    answer: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
):
    session = _get_session(current_user)
    if session.current_question < 1:
        raise HTTPException(status_code=400, detail="No active question. Start a new interview.")
    if session.current_question > len(session.questions):
        raise HTTPException(status_code=400, detail="Interview already completed.")

    question = session.questions[session.current_question - 1]
    session.save_answer(answer)

    try:
        feedback = evaluate_answer(question, answer)
    except Exception as exc:
        logger.error("AI evaluation failed: %s", exc)
        raise HTTPException(status_code=502, detail="AI evaluation failed")

    session.save_feedback(feedback)
    return {"feedback": feedback, "average_score": session.average_score()}


@router.get("/download-report")
def download_report(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    session = _get_session(current_user)
    summary = session.summary()
    if summary["questions_answered"] == 0:
        raise HTTPException(status_code=400, detail="No interview data to generate a report")

    try:
        pdf_path = generate_pdf(summary)
    except Exception as exc:
        logger.error("PDF generation failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to generate PDF report")

    # Clean up temp directory after the response is sent
    parent_dir = str(Path(pdf_path).parent)
    if "skillcortex_report_" in parent_dir:
        background_tasks.add_task(shutil.rmtree, parent_dir, ignore_errors=True)

    return FileResponse(
        path=pdf_path,
        filename="Interview_Report.pdf",
        media_type="application/pdf",
    )
