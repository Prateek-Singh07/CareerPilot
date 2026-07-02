from datetime import datetime

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
)
from reportlab.lib.units import inch


def generate_pdf(summary, output_path="Interview_Report.pdf"):

    doc = SimpleDocTemplate(output_path)

    styles = getSampleStyleSheet()

    story = []

    story.append(
        Paragraph(
            "AI Interview Report",
            styles["Title"]
        )
    )

    story.append(
        Paragraph(
            datetime.now().strftime("%d %B %Y"),
            styles["Normal"]
        )
    )

    story.append(Spacer(1, 0.25 * inch))

    story.append(
        Paragraph(
            f"<b>Average Score :</b> {summary['average_score']}/10",
            styles["Heading2"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Questions Answered :</b> {summary['questions_answered']} / {summary['total_questions']}",
            styles["Heading2"]
        )
    )

    story.append(Spacer(1, 0.35 * inch))

    for i in range(summary["questions_answered"]):

        story.append(
            Paragraph(
                f"<b>Question {i+1}</b>",
                styles["Heading2"]
            )
        )

        story.append(
            Paragraph(
                summary["questions"][i],
                styles["BodyText"]
            )
        )

        story.append(Spacer(1, 0.08 * inch))

        story.append(
            Paragraph(
                "<b>Your Answer</b>",
                styles["Heading3"]
            )
        )

        story.append(
            Paragraph(
                summary["answers"][i],
                styles["BodyText"]
            )
        )

        story.append(Spacer(1, 0.08 * inch))

        feedback = summary["feedbacks"][i]

        story.append(
            Paragraph(
                f"<b>Score :</b> {feedback['score']}/10",
                styles["BodyText"]
            )
        )

        story.append(
            Paragraph(
                "<b>Strengths</b>",
                styles["Heading3"]
            )
        )

        for item in feedback["strengths"]:
            story.append(
                Paragraph(
                    "• " + item,
                    styles["BodyText"]
                )
            )

        story.append(
            Paragraph(
                "<b>Weaknesses</b>",
                styles["Heading3"]
            )
        )

        for item in feedback["weaknesses"]:
            story.append(
                Paragraph(
                    "• " + item,
                    styles["BodyText"]
                )
            )

        story.append(
            Paragraph(
                "<b>Suggestions</b>",
                styles["Heading3"]
            )
        )

        for item in feedback["suggestions"]:
            story.append(
                Paragraph(
                    "• " + item,
                    styles["BodyText"]
                )
            )

        story.append(
            Spacer(1, 0.3 * inch)
        )

    avg = summary["average_score"]

    if avg >= 9:
        recommendation = "Outstanding Interview Performance"

    elif avg >= 8:
        recommendation = "Excellent Interview Performance"

    elif avg >= 7:
        recommendation = "Good Performance"

    elif avg >= 6:
        recommendation = "Average Performance"

    else:
        recommendation = "Needs Improvement"

    story.append(
        Paragraph(
            "Final Recommendation",
            styles["Heading1"]
        )
    )

    story.append(
        Paragraph(
            recommendation,
            styles["Heading2"]
        )
    )

    doc.build(story)

    return output_path