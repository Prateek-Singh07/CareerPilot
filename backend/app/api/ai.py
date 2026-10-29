"""Interview Q&A and report download endpoints."""

import logging
import shutil
from pathlib import Path
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from fastapi.responses import FileResponse

from app.models.interview import session_manager
from app.models.user import User
from app.services.ai_service import evaluate_answer
from app.services.gemini_client import is_demo_mode_active
from app.services.pdf_service import generate_pdf
from app.auth import get_current_user

logger = logging.getLogger("careerpilot.api.ai")
router = APIRouter(prefix="/api", tags=["Interview"])


def _get_session(current_user: User):
    """Get the per-user interview session."""
    return session_manager.get_session(current_user.id)


@router.get("/next-question")
def next_question(current_user: User = Depends(get_current_user)):
    session = _get_session(current_user)
    question = session.get_next_question()
    if question is None:
        try:
            session.persist_to_db(current_user.id)
        except Exception as exc:
            logger.error("Failed to persist completed interview to DB: %s", exc)
        return {"message": "Interview completed!", "summary": session.summary(), "is_demo": session.is_demo}
    return {"question": question, "is_demo": session.is_demo}


@router.post("/answer")
def submit_answer(
    request: Request,
    answer: str = Query(..., min_length=1),
    demo: bool = Query(False),
    current_user: User = Depends(get_current_user),
):
    session = _get_session(current_user)
    if session.current_question < 1 or len(session.questions) == 0:
        raise HTTPException(status_code=400, detail="No active question. Start a new interview.")
    if session.current_question > len(session.questions):
        raise HTTPException(status_code=400, detail="Interview already completed.")

    header_demo = request.headers.get("x-demo-mode", "").lower() in ("true", "1", "yes")
    active_demo = demo or header_demo or session.is_demo or is_demo_mode_active()

    question = session.questions[session.current_question - 1]
    session.save_answer(answer)

    try:
        feedback = evaluate_answer(question, answer, demo=active_demo)
    except TypeError:
        feedback = evaluate_answer(question, answer)
    session.save_feedback(feedback)

    # Persist answer, feedback, and score into the database
    try:
        session.persist_to_db(current_user.id)
    except Exception as exc:
        logger.error("Failed to persist answer to DB: %s", exc)

    return {
        "feedback": feedback,
        "average_score": session.average_score(),
        "is_demo": active_demo,
    }


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
    if "careerpilot_report_" in parent_dir or "hirepilot_report_" in parent_dir:
        background_tasks.add_task(shutil.rmtree, parent_dir, ignore_errors=True)

    return FileResponse(
        path=pdf_path,
        filename="CareerPilot_Interview_Report.pdf",
        media_type="application/pdf",
    )
