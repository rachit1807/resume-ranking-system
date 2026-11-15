from __future__ import annotations

import io
import re
from pathlib import Path

from docx import Document
from pypdf import PdfReader

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 8 * 1024 * 1024


class ResumeParseError(ValueError):
    pass


def validate_upload(filename: str, content: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise ResumeParseError("Only PDF and DOCX resumes are supported.")
    if not content:
        raise ResumeParseError("The uploaded file is empty.")
    if len(content) > MAX_FILE_SIZE:
        raise ResumeParseError("Each resume must be smaller than 8 MB.")
    if suffix == ".pdf" and not content.startswith(b"%PDF"):
        raise ResumeParseError("The file does not contain a valid PDF signature.")
    if suffix == ".docx" and not content.startswith(b"PK"):
        raise ResumeParseError("The file does not contain a valid DOCX signature.")
    return suffix


def extract_text(filename: str, content: bytes) -> str:
    suffix = validate_upload(filename, content)
    try:
        if suffix == ".pdf":
            reader = PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        else:
            document = Document(io.BytesIO(content))
            paragraphs = [paragraph.text for paragraph in document.paragraphs]
            table_cells = [
                cell.text
                for table in document.tables
                for row in table.rows
                for cell in row.cells
            ]
            text = "\n".join(paragraphs + table_cells)
    except Exception as exc:
        raise ResumeParseError(f"Could not parse {filename}.") from exc

    cleaned = re.sub(r"[ \t]+", " ", text)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    if len(cleaned) < 40:
        raise ResumeParseError(
            "No usable text was found. Image-only PDFs require OCR and are not supported."
        )
    return cleaned


def infer_name(text: str, filename: str) -> str:
    for line in text.splitlines()[:8]:
        candidate = re.sub(r"[^A-Za-z .'-]", "", line).strip()
        words = candidate.split()
        if 2 <= len(words) <= 4 and all(len(word) > 1 for word in words):
            if not any(term in candidate.lower() for term in ("resume", "curriculum", "email")):
                return candidate.title()
    stem = Path(filename).stem.replace("_", " ").replace("-", " ")
    return re.sub(r"\s+", " ", stem).strip().title() or "Unknown candidate"

