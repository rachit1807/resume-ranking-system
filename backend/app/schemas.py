from pydantic import BaseModel, Field


class ScoreBreakdown(BaseModel):
    semantic: float = Field(ge=0, le=100)
    skills: float = Field(ge=0, le=100)
    experience: float = Field(ge=0, le=100)
    education: float = Field(ge=0, le=100)


class CandidateResult(BaseModel):
    id: str
    rank: int
    name: str
    filename: str
    initials: str
    role: str
    score: float = Field(ge=0, le=100)
    recommendation: str
    summary: str
    matched_skills: list[str]
    missing_skills: list[str]
    experience_years: float
    education: str
    breakdown: ScoreBreakdown
    highlights: list[str]


class RankingResponse(BaseModel):
    job_title: str
    total_candidates: int
    processed: int
    failed: int
    average_score: float
    candidates: list[CandidateResult]
    warnings: list[str] = []

