import fitz
import pytest


def _create_sample_pdf(content: str = "Experienced Python, React, FastAPI developer") -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), content)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_resume_match_requires_auth(client):
    pdf_bytes = _create_sample_pdf()
    res = client.post(
        "/api/resume-match",
        data={"job_description": "We need a Python developer"},
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
    )
    assert res.status_code == 401


def test_resume_match_rejects_non_pdf(client, auth_headers):
    res = client.post(
        "/api/resume-match",
        headers=auth_headers,
        data={"job_description": "We need a Python developer"},
        files={"file": ("resume.docx", b"PK\x03\x04 fake docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert res.status_code == 400
    assert "only pdf files are supported" in res.json()["detail"].lower()


def test_resume_match_rejects_empty_job_description(client, auth_headers):
    pdf_bytes = _create_sample_pdf()
    res = client.post(
        "/api/resume-match",
        headers=auth_headers,
        data={"job_description": "   "},
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
    )
    assert res.status_code == 400
    assert "job description cannot be empty" in res.json()["detail"].lower()


def test_resume_match_success(client, auth_headers, monkeypatch):
    mock_result = {
        "match_percentage": 85,
        "strengths": ["Python expertise", "FastAPI proficiency"],
        "missing_skills": ["Kubernetes", "AWS DevOps"],
        "suggestions": ["Add cloud deployment projects", "Highlight API optimization"]
    }
    monkeypatch.setattr("app.api.resume_match.analyze_resume_match", lambda text, jd: mock_result)

    pdf_bytes = _create_sample_pdf("Senior Python Engineer with 5 years building FastAPI microservices.")
    res = client.post(
        "/api/resume-match",
        headers=auth_headers,
        data={"job_description": "Looking for senior Python developer with FastAPI and Docker experience."},
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["match_percentage"] == 85
    assert "Python expertise" in data["strengths"]
    assert "Kubernetes" in data["missing_skills"]
    assert len(data["suggestions"]) == 2
