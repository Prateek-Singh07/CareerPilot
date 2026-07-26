import json
import logging
import os

from dotenv import load_dotenv
import google.generativeai as genai

logger = logging.getLogger("skillcortex.services.resume_match")

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel("gemini-2.5-flash")


def analyze_resume_match(resume_text, job_description):

    prompt = f"""
You are an ATS Resume Analyzer.

Compare the resume with the job description.

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

- Match percentage must be between 0 and 100.
- Return ONLY JSON.
- No markdown.
- No explanation outside JSON.
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()
        elif text.startswith("```"):
            text = text.replace("```", "").strip()

        result = json.loads(text)
        logger.info("Resume match analysis complete — score: %s%%", result.get("match_percentage"))
        return result

    except Exception as e:
        logger.error("Resume match analysis failed: %s", e)
        return {
            "match_percentage": 0,
            "strengths": [],
            "missing_skills": [],
            "suggestions": [
                "Unable to analyze resume currently. Please try again later."
            ]
        }