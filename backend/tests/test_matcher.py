from app.matcher import extract_experience, extract_skills, match_resume


def test_extracts_normalized_skills():
    skills = extract_skills("Built RESTful services with Python, React.js and PostgreSQL.")
    assert {"Python", "React", "SQL", "REST APIs"}.issubset(skills)


def test_extracts_experience_years():
    assert extract_experience("5+ years of experience building web services") == 5


def test_match_is_explainable_and_bounded():
    resume = """Aarav Mehta
    Python engineer with 4 years of experience. FastAPI, React, SQL, Git and Docker.
    Bachelor of Technology in Computer Science.
    """
    job = """Software Engineer. 3+ years. Python, FastAPI, React, SQL, Docker.
    Bachelor's degree required. Build reliable REST APIs.
    """
    result = match_resume(resume, job)
    assert 0 <= result.score <= 100
    assert {"Python", "FastAPI", "React", "SQL", "Docker"}.issubset(result.matched_skills)
    assert result.experience == 100
    assert result.education == 100

