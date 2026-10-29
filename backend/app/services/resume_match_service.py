import json
import logging
import os
import re
from pathlib import Path
from dotenv import load_dotenv

from app.services.gemini_client import (
    execute_gemini_call,
    is_demo_mode_active,
    GeminiQuotaExhaustedError,
    GeminiAuthError,
)
from app.services.demo_data import get_demo_resume_match

logger = logging.getLogger("careerpilot.services.resume_match")

# Ensure environment is loaded even if run from different working directory
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)
load_dotenv()


def _extract_json(text: str):
    """Extract valid JSON from LLM response text, handling markdown fences and raw control chars."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    start_brace = text.find("{")
    if start_brace != -1:
        end_brace = text.rfind("}")
        if end_brace != -1:
            text = text[start_brace:end_brace + 1]

    try:
        return json.loads(text, strict=False)
    except json.JSONDecodeError:
        cleaned = re.sub(r'[\r\n\t]+', ' ', text)
        return json.loads(cleaned, strict=False)


def analyze_resume_match(resume_text: str, job_description: str, demo: bool = False) -> dict:
    """Analyze resume match against target job description using Gemini AI or demo mode."""
    if demo or is_demo_mode_active():
        logger.info("Serving demo ATS resume match analysis (Demo Mode active)")
        return get_demo_resume_match(resume_text, job_description)

    prompt = f"""You are an ATS Resume Analyzer.

Compare the candidate resume with the target job description.

Resume:
{resume_text}

----------------------------------------

Job Description:
{job_description}

----------------------------------------

Return ONLY valid JSON.

Use this exact format:
{{
    "match_percentage": 85,
    "strengths": [
        "Python",
        "SQL",
        "AWS"
    ],
    "missing_skills": [
        "Docker",
        "Kubernetes"
    ],
    "suggestions": [
        "Learn Docker",
        "Improve Kubernetes knowledge",
        "Mention cloud projects"
    ]
}}

Rules:
- Match percentage must be an integer between 0 and 100.
- Return ONLY JSON.
- No markdown formatting around the output.
- No explanation outside JSON.
"""
    try:
        raw_text = execute_gemini_call(prompt)
        result = _extract_json(raw_text)

        required_keys = ["match_percentage", "strengths", "missing_skills", "suggestions"]
        for key in required_keys:
            if key not in result:
                raise ValueError(f"Missing required key in ATS analysis: {key}")

        logger.info("Resume match analysis complete with Gemini AI — score: %s%%", result.get("match_percentage"))
        return result
    except (GeminiQuotaExhaustedError, GeminiAuthError):
        raise
    except Exception as e:
        logger.error("Resume match analysis failed: %s", str(e))
        raise RuntimeError(f"Resume match analysis failed: {e}") from e
