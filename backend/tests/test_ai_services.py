import os
import pytest
from app.services.ai_service import _extract_json, generate_interview_questions, evaluate_answer
from app.services.resume_match_service import analyze_resume_match


def test_extract_json_markdown_fences():
    raw_markdown = '```json\n{"score": 9, "message": "Good"}\n```'
    data = _extract_json(raw_markdown)
    assert data["score"] == 9
    assert data["message"] == "Good"


def test_extract_json_with_extra_commentary():
    raw_text = 'Here is your evaluation result:\n```json\n{"score": 8}\n```\nHope this helps!'
    data = _extract_json(raw_text)
    assert data["score"] == 8


def test_ai_service_raises_on_invalid_output(monkeypatch):
    monkeypatch.setattr("app.services.ai_service.execute_gemini_call", lambda prompt: "Not valid json at all!")

    with pytest.raises(RuntimeError) as exc_info:
        generate_interview_questions("Some resume text")
    assert "AI question generation failed" in str(exc_info.value)


def test_resume_match_raises_on_invalid_output(monkeypatch):
    monkeypatch.setattr("app.services.resume_match_service.execute_gemini_call", lambda prompt: "I am an AI and I cannot compare these.")

    with pytest.raises(RuntimeError) as exc_info:
        analyze_resume_match("Resume text", "Job description")
    assert "Resume match analysis failed" in str(exc_info.value)


@pytest.mark.skipif(
    os.getenv("RUN_LIVE_GEMINI") != "true",
    reason="Live Gemini API calls disabled to preserve user quota. Set RUN_LIVE_GEMINI=true to run."
)
def test_live_gemini_integration_safe():
    """Live integration check against verified model without exposing credentials."""
    model_name = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    assert model_name is not None
    try:
        res = analyze_resume_match(
            "Candidate with Python, FastAPI, and Docker experience.",
            "Looking for a Python backend engineer."
        )
        assert "match_percentage" in res
        assert isinstance(res["match_percentage"], int)
        assert 0 <= res["match_percentage"] <= 100
    except Exception as e:
        if "429" in str(e) or "ResourceExhausted" in str(e) or "quota" in str(e).lower():
            pytest.skip("Gemini API free-tier quota reached (20 req/day)")
        raise
    assert "strengths" in res

