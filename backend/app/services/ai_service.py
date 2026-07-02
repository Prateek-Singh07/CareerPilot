import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

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

        print("\n========== GEMINI RAW RESPONSE ==========")
        print(text)
        print("=========================================\n")

        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()
        elif text.startswith("```"):
            text = text.replace("```", "").strip()

        questions = json.loads(text)

        print("Questions:", len(questions))

        return questions

    except Exception as e:

        print(e)

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

        return json.loads(text)

    except Exception as e:
        print("Gemini Error:", e)

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