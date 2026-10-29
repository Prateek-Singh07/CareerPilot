import logging
import os
import tempfile
from datetime import datetime
from xml.sax.saxutils import escape

from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib import colors
from reportlab.lib.units import inch

logger = logging.getLogger("careerpilot.services.pdf")


def generate_pdf(summary, output_path=None):
    """Generate a comprehensive PDF interview report.

    Escapes XML characters in dynamic user/AI text to avoid ReportLab syntax crashes.
    Includes metric breakdowns across all 7 evaluation dimensions.
    """
    if output_path is None:
        tmp_dir = tempfile.mkdtemp(prefix="careerpilot_report_")
        output_path = os.path.join(tmp_dir, "CareerPilot_Interview_Report.pdf")

    doc = SimpleDocTemplate(
        output_path,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
        title="CareerPilot AI Interview Performance Report",
        author="CareerPilot AI",
        subject="AI Interview Performance Evaluation",
    )

    styles = getSampleStyleSheet()

    story = []

    # Title
    story.append(
        Paragraph("CareerPilot AI &mdash; AI Interview Performance Report", styles["Title"])
    )
    story.append(
        Paragraph(datetime.now().strftime("%d %B %Y, %I:%M %p"), styles["Normal"])
    )
    story.append(Spacer(1, 0.2 * inch))

    # Overall Summary
    avg_score = summary.get("average_score", 0)
    questions_answered = summary.get("questions_answered", 0)
    total_questions = summary.get("total_questions", 0)

    story.append(
        Paragraph(f"<b>Overall Average Score:</b> {avg_score} / 10", styles["Heading2"])
    )
    story.append(
        Paragraph(f"<b>Questions Completed:</b> {questions_answered} of {total_questions}", styles["Heading3"])
    )
    story.append(Spacer(1, 0.25 * inch))

    # Metric dimensions mapping
    metric_labels = [
        ("communication", "Communication"),
        ("technical_knowledge", "Technical Knowledge"),
        ("confidence", "Confidence"),
        ("grammar", "Grammar"),
        ("problem_solving", "Problem Solving"),
        ("answer_completeness", "Completeness"),
        ("professionalism", "Professionalism"),
    ]

    questions = summary.get("questions", [])
    answers = summary.get("answers", [])
    feedbacks = summary.get("feedbacks", [])

    for i in range(questions_answered):
        q_text = escape(str(questions[i])) if i < len(questions) else ""
        a_text = escape(str(answers[i])) if i < len(answers) else ""
        fb = feedbacks[i] if i < len(feedbacks) else {}

        story.append(Paragraph(f"<b>Question {i+1}</b>", styles["Heading2"]))
        story.append(Paragraph(q_text, styles["BodyText"]))
        story.append(Spacer(1, 0.06 * inch))

        story.append(Paragraph("<b>Your Answer:</b>", styles["Heading3"]))
        story.append(Paragraph(a_text, styles["BodyText"]))
        story.append(Spacer(1, 0.06 * inch))

        overall_q_score = fb.get("score", "N/A")
        story.append(Paragraph(f"<b>Score:</b> {overall_q_score} / 10", styles["BodyText"]))

        # Metric breakdown table for this question
        metric_items = []
        for key, label in metric_labels:
            if key in fb:
                metric_items.append(f"{label}: <b>{fb[key]}/10</b>")

        if metric_items:
            story.append(Spacer(1, 0.04 * inch))
            story.append(Paragraph("<b>Detailed Metrics:</b> " + " &nbsp;|&nbsp; ".join(metric_items), styles["BodyText"]))

        # Strengths
        strengths = fb.get("strengths", [])
        if strengths:
            story.append(Spacer(1, 0.06 * inch))
            story.append(Paragraph("<b>Key Strengths:</b>", styles["Heading3"]))
            for item in strengths:
                story.append(Paragraph(f"&bull; {escape(str(item))}", styles["BodyText"]))

        # Weaknesses
        weaknesses = fb.get("weaknesses", [])
        if weaknesses:
            story.append(Spacer(1, 0.06 * inch))
            story.append(Paragraph("<b>Areas for Growth:</b>", styles["Heading3"]))
            for item in weaknesses:
                story.append(Paragraph(f"&bull; {escape(str(item))}", styles["BodyText"]))

        # Suggestions
        suggestions = fb.get("suggestions", [])
        if suggestions:
            story.append(Spacer(1, 0.06 * inch))
            story.append(Paragraph("<b>Suggestions to Improve:</b>", styles["Heading3"]))
            for item in suggestions:
                story.append(Paragraph(f"&bull; {escape(str(item))}", styles["BodyText"]))

        story.append(Spacer(1, 0.25 * inch))

    # Final Recommendation
    if avg_score >= 9:
        recommendation = "Outstanding Performance &mdash; High readiness for senior technical interviews."
    elif avg_score >= 8:
        recommendation = "Excellent Performance &mdash; Strong domain knowledge and clear articulation."
    elif avg_score >= 7:
        recommendation = "Good Performance &mdash; Solid foundational answers; focus on deepening technical details."
    elif avg_score >= 5:
        recommendation = "Average Performance &mdash; Good effort; refine structure, vocabulary, and conciseness."
    else:
        recommendation = "Needs Improvement &mdash; Recommend practicing targeted domain topics before interviewing."

    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph("<b>Final Recommendation</b>", styles["Heading1"]))
    story.append(Paragraph(recommendation, styles["Heading2"]))

    doc.build(story)
    logger.info("PDF report generated at: %s", output_path)
    return output_path
