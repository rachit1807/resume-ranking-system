from __future__ import annotations

import re
from dataclasses import dataclass
from functools import lru_cache

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

SKILL_ALIASES: dict[str, tuple[str, ...]] = {
    "Python": ("python",),
    "JavaScript": ("javascript", "js"),
    "TypeScript": ("typescript",),
    "React": ("react", "react.js", "reactjs"),
    "FastAPI": ("fastapi",),
    "Flask": ("flask",),
    "Django": ("django",),
    "Node.js": ("node.js", "nodejs"),
    "SQL": ("sql", "postgresql", "mysql", "sqlite"),
    "MongoDB": ("mongodb", "mongo"),
    "AWS": ("aws", "amazon web services"),
    "Azure": ("azure",),
    "Docker": ("docker", "containerization"),
    "Kubernetes": ("kubernetes", "k8s"),
    "Git": ("git", "github", "gitlab"),
    "REST APIs": ("rest api", "restful", "api development"),
    "Machine Learning": ("machine learning", "ml"),
    "NLP": ("nlp", "natural language processing"),
    "Data Analysis": ("data analysis", "data analytics"),
    "Power BI": ("power bi", "powerbi"),
    "Tableau": ("tableau",),
    "Figma": ("figma",),
    "Agile": ("agile", "scrum"),
    "Communication": ("communication", "stakeholder management"),
    "Leadership": ("leadership", "team lead", "mentoring"),
}


@dataclass(frozen=True)
class MatchResult:
    score: float
    semantic: float
    skills: float
    experience: float
    education: float
    matched_skills: list[str]
    missing_skills: list[str]
    experience_years: float
    education_label: str
    highlights: list[str]


def _contains(text: str, phrase: str) -> bool:
    return bool(re.search(rf"(?<!\w){re.escape(phrase.lower())}(?!\w)", text.lower()))


def extract_skills(text: str) -> list[str]:
    return [
        canonical
        for canonical, aliases in SKILL_ALIASES.items()
        if any(_contains(text, alias) for alias in aliases)
    ]


def extract_experience(text: str) -> float:
    patterns = (
        r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience",
        r"experience\s*(?:of|:)\s*(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)",
    )
    values = [float(value) for pattern in patterns for value in re.findall(pattern, text, re.I)]
    return min(max(values, default=0.0), 30.0)


def required_experience(text: str) -> float:
    values = [
        float(value)
        for value in re.findall(r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)", text, re.I)
    ]
    return min(values[0], 30.0) if values else 0.0


def education_level(text: str) -> tuple[int, str]:
    lowered = text.lower()
    if re.search(r"\b(ph\.?d|doctorate)\b", lowered):
        return 4, "Doctorate"
    if re.search(r"\b(master'?s?|m\.?tech|m\.?s\.?|mba)\b", lowered):
        return 3, "Master's"
    if re.search(r"\b(bachelor'?s?|b\.?tech|b\.?e\.?|b\.?s\.?)\b", lowered):
        return 2, "Bachelor's"
    if "diploma" in lowered:
        return 1, "Diploma"
    return 0, "Not specified"


@lru_cache(maxsize=1)
def _sentence_model():
    try:
        from sentence_transformers import SentenceTransformer

        return SentenceTransformer("all-MiniLM-L6-v2", local_files_only=True)
    except Exception:
        return None


def semantic_similarity(resume: str, job: str) -> float:
    model = _sentence_model()
    if model is not None:
        vectors = model.encode([resume, job], normalize_embeddings=True)
        return max(0.0, min(100.0, float(vectors[0] @ vectors[1]) * 100))
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=5000)
    matrix = vectorizer.fit_transform([resume, job])
    return max(0.0, min(100.0, float(cosine_similarity(matrix[0], matrix[1])[0][0]) * 100))


def match_resume(resume: str, job: str) -> MatchResult:
    job_skills = extract_skills(job)
    resume_skills = extract_skills(resume)
    matched = [skill for skill in job_skills if skill in resume_skills]
    missing = [skill for skill in job_skills if skill not in resume_skills]
    skill_score = (len(matched) / len(job_skills) * 100) if job_skills else 70.0

    years = extract_experience(resume)
    required_years = required_experience(job)
    experience_score = min(100.0, years / required_years * 100) if required_years else 75.0

    resume_education, education_label = education_level(resume)
    job_education, _ = education_level(job)
    education_score = 100.0 if not job_education or resume_education >= job_education else 45.0
    semantic_score = semantic_similarity(resume, job)

    total = (
        semantic_score * 0.45
        + skill_score * 0.35
        + experience_score * 0.15
        + education_score * 0.05
    )
    highlights = []
    if matched:
        highlights.append(f"Matches {len(matched)} of {len(job_skills)} detected role skills")
    if years:
        highlights.append(f"Mentions {years:g} years of relevant experience")
    if education_label != "Not specified":
        highlights.append(f"Education detected: {education_label}")
    if not highlights:
        highlights.append("Profile similarity is based on the resume's overall language")

    return MatchResult(
        score=round(total, 1),
        semantic=round(semantic_score, 1),
        skills=round(skill_score, 1),
        experience=round(experience_score, 1),
        education=round(education_score, 1),
        matched_skills=matched,
        missing_skills=missing,
        experience_years=years,
        education_label=education_label,
        highlights=highlights,
    )

