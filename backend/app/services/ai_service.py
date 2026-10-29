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
    GeminiServiceError,
)
from app.services.demo_data import (
    get_demo_interview_questions,
    get_demo_answer_evaluation,
)

logger = logging.getLogger("careerpilot.services.ai")

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

    # Extract outermost JSON structure if extra commentary exists
    start_bracket = text.find("[")
    start_brace = text.find("{")
    if start_bracket != -1 and (start_brace == -1 or start_bracket < start_brace):
        end_bracket = text.rfind("]")
        if end_bracket != -1:
            text = text[start_bracket:end_bracket + 1]
    elif start_brace != -1:
        end_brace = text.rfind("}")
        if end_brace != -1:
            text = text[start_brace:end_brace + 1]

    try:
        return json.loads(text, strict=False)
    except json.JSONDecodeError:
        # Fallback: sanitize any literal unescaped control characters
        cleaned = re.sub(r'[\r\n\t]+', ' ', text)
        return json.loads(cleaned, strict=False)


def generate_interview_questions(resume_text: str, demo: bool = False) -> list[str]:
    """Generate 10 technical interview questions tailored to resume text.

    Supports explicit demo mode or automatic fallback when demo mode is active.
    """
    if demo or is_demo_mode_active():
        logger.info("Serving demo interview questions (Demo Mode active)")
        return get_demo_interview_questions(resume_text)

    prompt = f"""You are a senior technical interviewer.

Analyze the following resume.
Generate EXACTLY 10 interview questions tailored to the candidate's skills and experience.

Return ONLY a JSON array of strings.

Example:
[
"Question 1",
"Question 2",
"Question 3",
"Question 4",
"Question 5",
"Question 6",
"Question 7",
"Question 8",
"Question 9",
"Question 10"
]

Resume:
{resume_text}
"""
    try:
        raw_text = execute_gemini_call(prompt)
        logger.debug("Gemini raw question response: %s", raw_text[:200])
        questions = _extract_json(raw_text)
        if not isinstance(questions, list) or len(questions) == 0:
            raise ValueError("Model response is not a non-empty JSON list")
        logger.info("Generated %d interview questions with Gemini AI", len(questions))
        return [str(q) for q in questions]
    except (GeminiQuotaExhaustedError, GeminiAuthError):
        raise
    except Exception as e:
        logger.error("Failed to generate interview questions: %s", str(e))
        raise RuntimeError(f"AI question generation failed: {e}") from e


def evaluate_answer(question: str, answer: str, demo: bool = False) -> dict:
    """Evaluate candidate answer using Gemini AI or demo mode."""
    if demo or is_demo_mode_active():
        logger.info("Serving demo answer evaluation (Demo Mode active)")
        return get_demo_answer_evaluation(question, answer)

    prompt = f"""You are a Senior Technical Interviewer.

Evaluate the candidate's answer professionally.

Question:
{question}

Candidate Answer:
{answer}

Return ONLY valid JSON.

Use exactly this format:
{{
    "score": 8,
    "communication": 7,
    "technical_knowledge": 8,
    "confidence": 9,
    "grammar": 8,
    "problem_solving": 7,
    "answer_completeness": 8,
    "professionalism": 9,
    "strengths": [
        "Strength 1",
        "Strength 2"
    ],
    "weaknesses": [
        "Weakness 1",
        "Weakness 2"
    ],
    "suggestions": [
        "Suggestion 1",
        "Suggestion 2"
    ]
}}

Rules:
- Every score must be between 1 and 10.
- Return ONLY JSON.
- Do NOT use markdown.
- Do NOT explain anything outside JSON.
"""
    try:
        raw_text = execute_gemini_call(prompt)
        result = _extract_json(raw_text)

        required_keys = [
            "score", "communication", "technical_knowledge", "confidence",
            "grammar", "problem_solving", "answer_completeness", "professionalism",
            "strengths", "weaknesses", "suggestions"
        ]
        for key in required_keys:
            if key not in result:
                raise ValueError(f"Missing required key in AI response: {key}")

        logger.info("Evaluated answer with Gemini AI — score: %s", result.get("score"))
        return result
    except (GeminiQuotaExhaustedError, GeminiAuthError):
        raise
    except Exception as e:
        logger.error("Gemini evaluation error: %s", str(e))
        raise RuntimeError(f"AI answer evaluation failed: {e}") from e
