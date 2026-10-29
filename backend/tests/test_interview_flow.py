import fitz
from app.models.interview import session_manager, InterviewSessionDB


def _create_sample_pdf(content: str = "Software Engineer with Python skills") -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), content)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_interview_flow_persistence_and_history(client, auth_headers, db, demo_user, monkeypatch):
    # Mock AI calls for deterministic execution
    monkeypatch.setattr(
        "app.api.resume.generate_interview_questions",
        lambda text: ["What is FastAPI?", "Explain async/await in Python."]
    )

    mock_feedback_1 = {
        "score": 8, "communication": 8, "technical_knowledge": 8,
        "confidence": 8, "grammar": 9, "problem_solving": 8,
        "answer_completeness": 8, "professionalism": 9,
        "strengths": ["Clear explanation"], "weaknesses": ["None"],
        "suggestions": ["Keep practicing"]
    }
    monkeypatch.setattr("app.api.ai.evaluate_answer", lambda q, a: mock_feedback_1)

    # 1. Upload resume
    pdf_bytes = _create_sample_pdf()
    res = client.post(
        "/api/upload-resume",
        headers=auth_headers,
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
    )
    assert res.status_code == 200

    # 2. Get first question
    res_q1 = client.get("/api/next-question", headers=auth_headers)
    assert res_q1.status_code == 200
    assert res_q1.json()["question"] == "What is FastAPI?"

    # 3. Submit first answer
    res_a1 = client.post(
        "/api/answer?answer=FastAPI+is+a+modern+async+web+framework",
        headers=auth_headers,
    )
    assert res_a1.status_code == 200
    data_a1 = res_a1.json()
    assert data_a1["feedback"]["score"] == 8
    assert data_a1["average_score"] == 8.0

    # 4. Check DB directly: verify answers, scores, and questions were persisted
    db_session = (
        db.query(InterviewSessionDB)
        .filter(InterviewSessionDB.user_id == demo_user.id)
        .first()
    )
    assert db_session is not None
    assert len(db_session.get_answers()) == 1
    assert db_session.get_answers()[0] == "FastAPI is a modern async web framework"
    assert db_session.get_scores() == [8]
    assert db_session.completed == 0

    # 5. Check /api/history endpoint
    res_hist = client.get("/api/history", headers=auth_headers)
    assert res_hist.status_code == 200
    hist_data = res_hist.json()
    assert hist_data["total"] == 1
    session_rec = hist_data["sessions"][0]
    assert session_rec["questions_answered"] == 1
    assert session_rec["average_score"] == 8.0
    assert session_rec["completed"] is False

    # 6. Retry answer on same question: verify it updates without duplicating
    res_a1_retry = client.post(
        "/api/answer?answer=Updated+answer+with+more+detail",
        headers=auth_headers,
    )
    assert res_a1_retry.status_code == 200
    db.refresh(db_session)
    assert len(db_session.get_answers()) == 1
    assert db_session.get_answers()[0] == "Updated answer with more detail"


def test_session_restoration_after_memory_cleared(client, auth_headers, demo_user, monkeypatch):
    """Simulates a backend restart by wiping in-memory sessions and verifying state is restored from DB."""
    monkeypatch.setattr(
        "app.api.resume.generate_interview_questions",
        lambda text: ["Question 1", "Question 2"]
    )
    monkeypatch.setattr("app.api.ai.evaluate_answer", lambda q, a: {"score": 9})

    # Upload resume and answer question 1
    pdf_bytes = _create_sample_pdf()
    client.post("/api/upload-resume", headers=auth_headers, files={"file": ("resume.pdf", pdf_bytes, "application/pdf")})
    client.get("/api/next-question", headers=auth_headers)
    client.post("/api/answer?answer=My+answer+one", headers=auth_headers)

    # WIPE in-memory session (simulate backend reboot)
    session_manager._sessions.clear()

    # Request next question: should seamlessly restore from DB and give Question 2
    res_q2 = client.get("/api/next-question", headers=auth_headers)
    assert res_q2.status_code == 200
    assert res_q2.json()["question"] == "Question 2"



def test_interview_completion_and_pdf_download(client, auth_headers, demo_user, monkeypatch):
    monkeypatch.setattr(
        "app.api.resume.generate_interview_questions",
        lambda text: ["What is Python?"]
    )
    mock_feedback = {
        "score": 9, "communication": 9, "technical_knowledge": 9,
        "confidence": 8, "grammar": 9, "problem_solving": 9,
        "answer_completeness": 9, "professionalism": 9,
        "strengths": ["Excellent response"], "weaknesses": ["None"],
        "suggestions": ["Ready for production"]
    }
    monkeypatch.setattr("app.api.ai.evaluate_answer", lambda q, a: mock_feedback)

    # 1. Upload
    pdf_bytes = _create_sample_pdf("Software Developer Resume")
    client.post("/api/upload-resume", headers=auth_headers, files={"file": ("resume.pdf", pdf_bytes, "application/pdf")})

    # 2. Next question (Question 1)
    q_res = client.get("/api/next-question", headers=auth_headers)
    assert q_res.status_code == 200
    assert q_res.json()["question"] == "What is Python?"

    # 3. Answer
    ans_res = client.post("/api/answer?answer=Python+is+a+high+level+programming+language", headers=auth_headers)
    assert ans_res.status_code == 200

    # 4. Finish by asking for next question when no more questions
    fin_res = client.get("/api/next-question", headers=auth_headers)
    assert fin_res.status_code == 200
    data = fin_res.json()
    assert data["message"] == "Interview completed!"
    assert data["summary"]["average_score"] == 9.0
    assert data["summary"]["questions_answered"] == 1

    # 5. Download report
    rep_res = client.get("/api/download-report", headers=auth_headers)
    assert rep_res.status_code == 200
    assert rep_res.headers["content-type"] == "application/pdf"
    assert rep_res.content.startswith(b"%PDF-")


def test_empty_history_for_new_user(client):
    reg = client.post(
        "/api/auth/signup",
        json={"email": "fresh_history_user@careerpilot.ai", "username": "fresh_user", "password": "Password123!"}
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/history", headers=headers)
    assert res.status_code == 200
    assert res.json() == {"sessions": [], "total": 0}
