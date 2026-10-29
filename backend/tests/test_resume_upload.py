import io
import fitz
import pytest


def _create_sample_pdf(content: str = "Candidate John Doe\nExperienced Python and FastAPI Engineer") -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), content)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_upload_resume_requires_auth(client):
    pdf_bytes = _create_sample_pdf()
    res = client.post(
        "/api/upload-resume",
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
    )
    assert res.status_code == 401


def test_upload_resume_rejects_non_pdf(client, auth_headers):
    res = client.post(
        "/api/upload-resume",
        headers=auth_headers,
        files={"file": ("resume.docx", b"PK\x03\x04 fake docx content", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert res.status_code == 400
    assert "only pdf files are supported" in res.json()["detail"].lower()


def test_upload_resume_rejects_corrupted_pdf(client, auth_headers):
    res = client.post(
        "/api/upload-resume",
        headers=auth_headers,
        files={"file": ("corrupt.pdf", b"Not a real PDF file header", "application/pdf")},
    )
    assert res.status_code == 400
    assert "not a valid pdf" in res.json()["detail"].lower()


def test_upload_resume_success_mocked_ai(client, auth_headers, monkeypatch):
    # Mock question generation for deterministic test
    def mock_generate_questions(text):
        assert "John Doe" in text
        return [f"Question {i+1} about Python" for i in range(10)]

    monkeypatch.setattr("app.api.resume.generate_interview_questions", mock_generate_questions)

    pdf_bytes = _create_sample_pdf("Candidate John Doe with 4 years Python and SQL experience.")
    res = client.post(
        "/api/upload-resume",
        headers=auth_headers,
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["filename"] == "resume.pdf"
    assert data["total_questions"] == 10

