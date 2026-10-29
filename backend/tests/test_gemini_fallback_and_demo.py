"""Focused automated tests for Gemini API fallback, credential management, and demo mode.

Ensures:
- Primary key only startup / missing fallback keys handled safely.
- Safe handling of invalid credentials without key leakage.
- Rate-limit 429 handling, bounded retry, and structured exception responses.
- Presentation Demo Mode operation for all 4 AI features with 0 live API calls.
"""

import os
import pytest
from unittest.mock import patch, MagicMock

from app.services.gemini_client import (
    GeminiCredentialPool,
    CredentialState,
    execute_gemini_call,
    is_demo_mode_active,
    GeminiQuotaExhaustedError,
    GeminiAuthError,
    GeminiServiceError,
)
from app.services.demo_data import (
    get_demo_interview_questions,
    get_demo_answer_evaluation,
    get_demo_resume_match,
    get_demo_career_roadmap,
)
from app.services.ai_service import generate_interview_questions, evaluate_answer
from app.services.resume_match_service import analyze_resume_match
from app.services.career_roadmap_service import generate_career_roadmap


# ── Credential Pool & Startup Tests ─────────────────────────

def test_credential_pool_primary_only(monkeypatch):
    """Test startup with only the primary key configured; fallback keys missing."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-primary-secret-key-1234")
    monkeypatch.delenv("GEMINI_API_KEY_2", raising=False)
    monkeypatch.delenv("GEMINI_API_KEY_3", raising=False)
    monkeypatch.delenv("GEMINI_API_KEY_4", raising=False)
    monkeypatch.delenv("GEMINI_API_KEY_5", raising=False)

    pool = GeminiCredentialPool()
    assert len(pool.credentials) == 1
    assert pool.credentials[0].slot_name == "GEMINI_API_KEY"
    assert pool.credentials[0].is_available() is True
    # Verify secret is never exposed in repr or slot
    assert "test-primary-secret-key-1234" not in pool.credentials[0].slot_name


def test_credential_pool_with_fallbacks(monkeypatch):
    """Test startup with primary and multiple fallback keys configured."""
    monkeypatch.setenv("GEMINI_API_KEY", "key-1")
    monkeypatch.setenv("GEMINI_API_KEY_2", "key-2")
    monkeypatch.setenv("GEMINI_API_KEY_3", "key-3")
    monkeypatch.delenv("GEMINI_API_KEY_4", raising=False)
    monkeypatch.delenv("GEMINI_API_KEY_5", raising=False)

    pool = GeminiCredentialPool()
    assert len(pool.credentials) == 3
    slots = [c.slot_name for c in pool.credentials]
    assert slots == ["GEMINI_API_KEY", "GEMINI_API_KEY_2", "GEMINI_API_KEY_3"]


def test_safe_handling_of_invalid_credentials(monkeypatch):
    """Test that invalid credentials (401/403/API_KEY_INVALID) are marked invalid and tried safely."""
    monkeypatch.setenv("GEMINI_API_KEY", "bad-key-1")
    monkeypatch.setenv("GEMINI_API_KEY_2", "good-key-2")

    class MockBadModel:
        def generate_content(self, prompt):
            raise Exception("API_KEY_INVALID: The provided API key is invalid.")

    class MockGoodModel:
        def generate_content(self, prompt):
            class Resp:
                text = '["Question 1", "Question 2"]'
            return Resp()

    pool = GeminiCredentialPool()
    monkeypatch.setattr("app.services.gemini_client.credential_pool", pool)

    def mock_generative_model(model_name):
        # First key fails with invalid key; second key succeeds
        current_avail = pool.get_available_credentials()
        if current_avail and current_avail[0].slot_name == "GEMINI_API_KEY":
            return MockBadModel()
        return MockGoodModel()

    monkeypatch.setattr("google.generativeai.GenerativeModel", mock_generative_model)

    res = execute_gemini_call("Sample prompt")
    assert res == '["Question 1", "Question 2"]'
    # Primary key should be marked invalid
    assert pool.credentials[0].is_valid is False
    # Fallback key remained valid
    assert pool.credentials[1].is_valid is True


def test_rate_limit_quota_exhausted_handling(monkeypatch):
    """Test 429 quota exhaustion raises GeminiQuotaExhaustedError with proper message."""
    monkeypatch.setenv("GEMINI_API_KEY", "key-exhausted")
    monkeypatch.delenv("GEMINI_API_KEY_2", raising=False)

    class MockQuotaModel:
        def generate_content(self, prompt):
            raise Exception("429 ResourceExhausted: Generate content requests per day limit exceeded. retryDelay: 60s")

    pool = GeminiCredentialPool()
    monkeypatch.setattr("app.services.gemini_client.credential_pool", pool)
    monkeypatch.setattr("google.generativeai.GenerativeModel", lambda name: MockQuotaModel())

    with pytest.raises(GeminiQuotaExhaustedError) as exc_info:
        execute_gemini_call("Sample prompt")

    err = exc_info.value
    assert "request limit has been reached" in err.message
    assert "Demo Mode" in err.message
    assert err.status_code == 429
    assert err.error_code == "RATE_LIMIT_EXCEEDED"


# ── Presentation Demo Mode Tests for All 4 Features ─────────

def test_demo_mode_interview_questions():
    """Feature 1: Demo interview questions return realistic list of 10 questions."""
    questions = get_demo_interview_questions("Candidate resume text")
    assert isinstance(questions, list)
    assert len(questions) == 10
    assert any("asynchronous" in q.lower() or "database" in q.lower() for q in questions)


def test_demo_mode_answer_evaluation():
    """Feature 1: Demo answer evaluation returns structured score & constructive feedback."""
    eval_res = get_demo_answer_evaluation(
        "Explain async programming",
        "Asynchronous programming uses an event loop to execute I/O without blocking threads."
    )
    assert isinstance(eval_res, dict)
    assert eval_res.get("is_demo") is True
    assert 1 <= eval_res["score"] <= 10
    assert isinstance(eval_res["strengths"], list) and len(eval_res["strengths"]) > 0
    assert isinstance(eval_res["weaknesses"], list) and len(eval_res["weaknesses"]) > 0
    assert isinstance(eval_res["suggestions"], list) and len(eval_res["suggestions"]) > 0


def test_demo_mode_resume_match():
    """Feature 2: Demo ATS resume match returns match percentage, strengths, missing skills, suggestions."""
    match_res = get_demo_resume_match("Python engineer resume", "Senior backend role")
    assert isinstance(match_res, dict)
    assert match_res.get("is_demo") is True
    assert 0 <= match_res["match_percentage"] <= 100
    assert isinstance(match_res["strengths"], list) and len(match_res["strengths"]) > 0
    assert isinstance(match_res["missing_skills"], list) and len(match_res["missing_skills"]) > 0
    assert isinstance(match_res["suggestions"], list) and len(match_res["suggestions"]) > 0


def test_demo_mode_career_roadmap():
    """Feature 3: Demo career roadmap returns structured stages, milestones, projects."""
    roadmap = get_demo_career_roadmap(
        target_role="Full Stack Developer",
        skill_level="Beginner",
        hours_per_week=12,
    )
    assert isinstance(roadmap, dict)
    assert roadmap.get("is_demo") is True
    assert roadmap["target_role"] == "Full Stack Developer"
    assert "timeline" in roadmap
    assert "recommended_next_action" in roadmap
    assert isinstance(roadmap["stages"], list)
    assert len(roadmap["stages"]) == 4

    stage1 = roadmap["stages"][0]
    assert "title" in stage1
    assert "duration" in stage1
    assert "skills" in stage1 and len(stage1["skills"]) > 0
    assert "projects" in stage1 and len(stage1["projects"]) > 0
    assert "milestones" in stage1 and len(stage1["milestones"]) > 0


# ── Integration with Services in Demo Mode (Zero Live API Calls) ──

def test_services_respect_demo_mode_flag(monkeypatch):
    """Verify that calling services with demo=True bypasses external calls completely."""
    # Mock execute_gemini_call so if it's called, it raises AssertionError
    def forbidden_call(prompt, model_name=None):
        raise AssertionError("execute_gemini_call should NOT be called in demo mode!")

    monkeypatch.setattr("app.services.ai_service.execute_gemini_call", forbidden_call)
    monkeypatch.setattr("app.services.resume_match_service.execute_gemini_call", forbidden_call)
    monkeypatch.setattr("app.services.career_roadmap_service.execute_gemini_call", forbidden_call)

    # 1. Questions
    q = generate_interview_questions("Sample resume", demo=True)
    assert len(q) == 10

    # 2. Evaluation
    ev = evaluate_answer("Q?", "A", demo=True)
    assert ev["is_demo"] is True

    # 3. Resume Match
    rm = analyze_resume_match("Resume", "Job", demo=True)
    assert rm["is_demo"] is True

    # 4. Roadmap
    rd = generate_career_roadmap("DevOps Engineer", demo=True)
    assert rd["is_demo"] is True


def test_services_respect_env_demo_mode(monkeypatch):
    """Verify DEMO_MODE=true environment variable automatically activates demo mode."""
    monkeypatch.setenv("DEMO_MODE", "true")

    def forbidden_call(prompt, model_name=None):
        raise AssertionError("Live API call attempted while DEMO_MODE=true!")

    monkeypatch.setattr("app.services.ai_service.execute_gemini_call", forbidden_call)

    q = generate_interview_questions("Sample resume")
    assert len(q) == 10
