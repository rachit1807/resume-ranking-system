from __future__ import annotations

import asyncio
import re
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .matcher import match_resume
from .parser import ResumeParseError, extract_text, infer_name
from .schemas import CandidateResult, RankingResponse, ScoreBreakdown

app = FastAPI(
    title="Resume Ranking API",
    description="Explainable candidate matching for PDF and DOCX resumes.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "resume-ranking-api"}


def _job_title(description: str) -> str:
    first_line = description.strip().splitlines()[0][:80]
    title = re.sub(r"^(job title|role|position)\s*[:\-]\s*", "", first_line, flags=re.I)
    return title if 2 <= len(title.split()) <= 10 else "Open role"


def _recommendation(score: float) -> str:
    if score >= 80:
        return "Strong match"
    if score >= 65:
        return "Good match"
    if score >= 50:
        return "Potential match"
    return "Low match"


@app.post("/api/rank", response_model=RankingResponse)
async def rank_candidates(
    job_description: str = Form(min_length=40, max_length=20_000),
    resumes: list[UploadFile] = File(min_length=1, max_length=25),
) -> RankingResponse:
    if len(resumes) > 25:
        raise HTTPException(status_code=400, detail="Upload no more than 25 resumes per batch.")

    candidates: list[CandidateResult] = []
    warnings: list[str] = []
    for upload in resumes:
        content = await upload.read()
        try:
            text = await asyncio.to_thread(extract_text, upload.filename or "resume", content)
            result = await asyncio.to_thread(match_resume, text, job_description)
            name = infer_name(text, upload.filename or "resume")
            initials = "".join(part[0] for part in name.split()[:2]).upper()
            candidates.append(
                CandidateResult(
                    id=str(uuid4()),
                    rank=0,
                    name=name,
                    filename=upload.filename or "resume",
                    initials=initials,
                    role=_job_title(job_description),
                    score=result.score,
                    recommendation=_recommendation(result.score),
                    summary=(
                        f"{name} has {len(result.matched_skills)} matched skills and an "
                        f"overall evidence-based fit score of {result.score}%."
                    ),
                    matched_skills=result.matched_skills,
                    missing_skills=result.missing_skills,
                    experience_years=result.experience_years,
                    education=result.education_label,
                    breakdown=ScoreBreakdown(
                        semantic=result.semantic,
                        skills=result.skills,
                        experience=result.experience,
                        education=result.education,
                    ),
                    highlights=result.highlights,
                )
            )
        except ResumeParseError as exc:
            warnings.append(f"{upload.filename}: {exc}")
        finally:
            await upload.close()

    candidates.sort(key=lambda candidate: candidate.score, reverse=True)
    for index, candidate in enumerate(candidates, start=1):
        candidate.rank = index

    if not candidates:
        raise HTTPException(status_code=422, detail={"message": "No resumes could be parsed.", "warnings": warnings})

    average = round(sum(candidate.score for candidate in candidates) / len(candidates), 1)
    return RankingResponse(
        job_title=_job_title(job_description),
        total_candidates=len(resumes),
        processed=len(candidates),
        failed=len(warnings),
        average_score=average,
        candidates=candidates,
        warnings=warnings,
    )

