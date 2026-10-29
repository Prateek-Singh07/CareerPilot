import os
import fitz


def read_resume(pdf_path: str) -> str:
    """Extract plain text from a PDF resume file.

    Raises ValueError with a helpful message if the file is invalid, corrupted,
    password-protected, or unreadable.
    """
    if not os.path.exists(pdf_path):
        raise ValueError("Resume file not found")

    if os.path.getsize(pdf_path) == 0:
        raise ValueError("The uploaded file is empty")

    # Quick check for PDF signature
    with open(pdf_path, "rb") as f:
        header = f.read(5)
        if not header.startswith(b"%PDF-"):
            raise ValueError("The uploaded file is not a valid PDF document")

    try:
        pdf = fitz.open(pdf_path)
    except Exception as e:
        raise ValueError(f"Corrupted or unreadable PDF: {e}") from e

    try:
        if pdf.is_encrypted:
            raise ValueError("Password-protected PDF files are not supported")

        text = ""
        for page in pdf:
            text += page.get_text()

        return text.strip()
    finally:
        pdf.close()
