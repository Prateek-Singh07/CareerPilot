import json
import logging
import os
from dotenv import load_dotenv
import google.generativeai as genai

logger = logging.getLogger("skillcortex.services.ai")

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def generate_interview_questions(resume_text):

    prompt = f"""
You are a senior technical interviewer.

Analyze the following resume.

Generate EXACTLY 10 interview questions.

Return ONLY a JSON array.

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
        response = model.generate_content(prompt)
        text = response.text.strip()

        logger.debug("Gemini raw response: %s", text[:200])

        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()
        elif text.startswith("```"):
            text = text.replace("```", "").strip()

        questions = json.loads(text)
        logger.info("Generated %d interview questions", len(questions))
        return questions

    except Exception as e:
        logger.error("Failed to generate interview questions: %s", e)
        return [
            "Gemini failed to generate questions."
        ]


def evaluate_answer(question, answer):

    prompt = f"""
You are a Senior Technical Interviewer.

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
        response = model.generate_content(prompt)
        text = response.text.strip()

        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()
        elif text.startswith("```"):
            text = text.replace("```", "").strip()

        result = json.loads(text)
        logger.info("Evaluated answer — score: %s", result.get("score"))
        return result

    except Exception as e:
        logger.error("Gemini evaluation error: %s", e)
        return {
            "score": 0,
            "communication": 0,
            "technical_knowledge": 0,
            "confidence": 0,
            "grammar": 0,
            "problem_solving": 0,
            "answer_completeness": 0,
            "professionalism": 0,
            "strengths": [
                "Unable to evaluate answer."
            ],
            "weaknesses": [
                "Gemini API failed."
            ],
            "suggestions": [
                "Please try again in a few moments."
            ]
        }