"""Career Roadmap Generation Service using Google Gemini AI or Demo Mode."""

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
from app.services.demo_data import get_demo_career_roadmap

logger = logging.getLogger("careerpilot.services.roadmap")

# Ensure backend .env is loaded
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)
load_dotenv()


def _extract_json(text: str):
    """Extract valid JSON from LLM response text, stripping markdown and unescaped control chars."""
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


def generate_career_roadmap(
    target_role: str,
    skill_level: str = "Beginner",
    existing_skills: str = "",
    hours_per_week: int = 10,
    demo: bool = False,
) -> dict:
    """Generate a structured, actionable career roadmap tailored to user skills and available time."""
    if demo or is_demo_mode_active():
        logger.info("Serving demo career roadmap (Demo Mode active)")
        return get_demo_career_roadmap(
            target_role=target_role,
            skill_level=skill_level,
            existing_skills=existing_skills,
            hours_per_week=hours_per_week,
        )

    skills_context = existing_skills.strip() if existing_skills else "None specified (starting fresh)"

    prompt = f"""You are a Principal Engineering Career Mentor and Tech Lead.
Create a comprehensive, realistic, and highly practical Career Learning Roadmap for an aspiring professional.

User Profile:
- Target Role: {target_role}
- Current Skill Level: {skill_level}
- Existing Skills & Interests: {skills_context}
- Dedicated Study Time: {hours_per_week} hours per week

Instructions:
1. Provide a realistic timeline calculation based on {hours_per_week} hours/week.
2. Structure the path into 3 to 4 sequential, progressive learning stages.
3. For each stage, list:
   - stage_number (integer)
   - title (concise, professional stage name)
   - duration (e.g., "Weeks 1-4 (40 Hours total)")
   - description (overview of what the candidate will achieve)
   - skills (list of 4-6 specific technical skills/tools/concepts)
   - projects (list of 1-2 realistic portfolio project ideas with name and description)
   - milestones (list of 2-3 measurable checkpoints or proof-of-work achievements)
4. Provide a clear 'recommended_next_action' describing the exact first step to take this week.

Return ONLY a valid JSON object with NO surrounding markdown or conversational commentary.

Expected JSON Structure:
{{
  "target_role": "{target_role}",
  "skill_level": "{skill_level}",
  "timeline": "Estimated X-Y Weeks ({hours_per_week} hrs/week)",
  "overview": "Short 2-sentence executive summary of the learning trajectory.",
  "recommended_next_action": "Actionable first step to start immediately.",
  "stages": [
    {{
      "stage_number": 1,
      "title": "Stage Name",
      "duration": "Weeks 1-4",
      "description": "Stage objective and focus area",
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
      "projects": [
        {{
          "name": "Project Name",
          "description": "Specific project to build and deploy"
        }}
      ],
      "milestones": ["Milestone 1", "Milestone 2"]
    }}
  ]
}}
"""

    try:
        raw_text = execute_gemini_call(prompt)
        data = _extract_json(raw_text)

        # Validate essential keys
        if not isinstance(data, dict) or "stages" not in data or not isinstance(data["stages"], list):
            raise ValueError(f"AI response missing required 'stages' list. Received: {data}")

        # Clean fallback values
        data.setdefault("target_role", target_role)
        data.setdefault("skill_level", skill_level)
        data.setdefault("timeline", f"{max(8, int(200 / max(hours_per_week, 1)))} Weeks")
        data.setdefault("overview", f"Actionable career roadmap for {target_role}.")
        data.setdefault("recommended_next_action", "Begin Stage 1 foundations.")

        logger.info("Generated roadmap for %s with %d stages via Gemini AI", target_role, len(data["stages"]))
        return data

    except (GeminiQuotaExhaustedError, GeminiAuthError):
        raise
    except Exception as exc:
        logger.error("Career roadmap generation failed: %s", exc)
        raise RuntimeError(f"Failed to generate career roadmap with Gemini AI: {exc}")
