import io

from docx import Document
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def make_docx(text: str) -> bytes:
    document = Document()
    document.add_paragraph(text)
    buffer = io.BytesIO()
    document.save(buffer)
    return buffer.getvalue()


def test_health():
    assert client.get("/health").json()["status"] == "ok"


def test_rank_docx_candidates():
    files = [
        (
            "resumes",
            ("aarav.docx", make_docx("Aarav Mehta\nPython developer with 4 years of experience. FastAPI React SQL Docker. Bachelor's degree."), "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
        )
    ]
    response = client.post(
        "/api/rank",
        data={"job_description": "Backend Engineer role requiring 3 years of experience with Python FastAPI SQL Docker and a Bachelor's degree."},
        files=files,
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["processed"] == 1
    assert payload["candidates"][0]["rank"] == 1
    assert "Python" in payload["candidates"][0]["matched_skills"]


def test_rejects_unsupported_file():
    response = client.post(
        "/api/rank",
        data={"job_description": "A sufficiently detailed job description requiring Python and SQL development skills."},
        files={"resumes": ("resume.txt", b"plain text resume", "text/plain")},
    )
    assert response.status_code == 422

