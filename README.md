# AI-Based Resume Matching & Candidate Ranking System

An explainable full-stack application that parses batches of PDF and DOCX resumes, compares them with a job description, and presents recruiters with a transparent candidate ranking. The repository and folder are named `resume-ranking-system` so this assignment remains separate from the original **AI Resume Analyzer & Career Development Platform** mini-project.

> **Role terminology:** the assignment does not establish that every role is an internship. This project therefore uses neutral terms such as *role*, *job description*, and *candidate*. It works for internships, graduate roles, and experienced positions.

## What the system includes

- Professional responsive React dashboard with a saved dark/light theme
- Batch upload of up to 25 text-based PDF or DOCX resumes
- FastAPI parsing pipeline with file type, signature, size, and empty-text validation
- Semantic similarity using `all-MiniLM-L6-v2` when the model is installed locally
- Deterministic TF-IDF similarity fallback, so the project still runs offline
- Explainable weighted score: semantic fit 45%, skills 35%, experience 15%, education 5%
- Ranked candidate table with search, match filters, skill evidence, and score details
- Candidate detail drawer explaining matched skills, missing skills, and score components
- CSV export, demo data, accessible controls, loading/error states, and mobile layouts
- Backend tests for parsing, scoring, validation, and the ranking endpoint
- PostgreSQL-backed ranking history that stores result summaries without retaining resume files or raw resume text
- Render Blueprint for an isolated full-stack service and database

The score is decision support, not an automated hiring decision. Recruiters should review the original resume, verify extracted evidence, and avoid using protected personal characteristics.

## Project structure

```text
resume-ranking-system/
├── backend/
│   ├── app/
│   │   ├── main.py          FastAPI routes and ranking orchestration
│   │   ├── database.py      PostgreSQL/SQLite ranking history
│   │   ├── matcher.py       Semantic, skill, experience, and education scoring
│   │   ├── parser.py        In-memory PDF/DOCX parsing and validation
│   │   └── schemas.py       API response models
│   ├── tests/               Matcher and API tests
│   ├── requirements.txt
│   └── requirements-dev.txt
├── frontend/
│   ├── src/
│   │   ├── components/      Dashboard, upload, ranking, and candidate views
│   │   ├── data/demo.js     Demonstration candidates
│   │   ├── App.jsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
├── Dockerfile               Reproducible React + FastAPI production image
├── render.yaml              Isolated Render service and PostgreSQL database
└── README.md
```

## Run locally

Use two VS Code terminals.

### 1. Start the FastAPI backend

Python 3.10–3.13 is recommended. Some AI libraries may not yet support Python 3.15 prereleases.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs), and the health endpoint is at `/health`.

Local development uses a small SQLite database automatically. Production uses the separate PostgreSQL database supplied through `DATABASE_URL`.

The standard installation uses the included TF-IDF similarity engine. For transformer embeddings, install the optional AI dependencies with `python -m pip install -r requirements-ai.txt`. The matcher then attempts to use `all-MiniLM-L6-v2` from the local cache and falls back safely when the model is unavailable.

### 2. Start the React frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` requests to the FastAPI service.

## Run tests and production build

```bash
cd backend
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
pytest -q

cd ../frontend
npm run build
```

## Matching method

| Component | Weight | Explanation |
| --- | ---: | --- |
| Semantic fit | 45% | Compares the meaning and vocabulary of the full resume and role description. |
| Skills coverage | 35% | Measures how many detected role skills also appear in the resume. |
| Experience | 15% | Compares stated years of experience with the role requirement. |
| Education | 5% | Checks the stated education level only when the role specifies one. |

Every component is normalized to 0–100 before applying its weight. Candidate results expose the full breakdown, detected evidence, matched skills, and skills to verify.

## Deploy on Render

The root `render.yaml` creates exactly two new resources in the Singapore region:

- `resume-ranking-system-rachit`: one FastAPI web service that also serves the compiled React dashboard
- `resume-ranking-system-db`: one private PostgreSQL database used only by this project

The service receives its internal database connection through Render's managed `DATABASE_URL` reference. Uploaded documents and raw extracted text are never written to the database. Each deployment uses a multi-stage Docker build for the React frontend and Python backend, starts FastAPI on Render's assigned port, and verifies `/health` before receiving traffic.

## Demo walkthrough

1. Open the dashboard and point out the different visual identity, responsive navigation, and light/dark toggle.
2. Select **New ranking** and show the prefilled job description.
3. Click **Run demo ranking** to demonstrate the workflow without personal documents.
4. Search or filter the ranking table, then open a candidate to explain the score breakdown.
5. Upload multiple PDF/DOCX resumes and run the live FastAPI pipeline.
6. Export the ranked shortlist as CSV.
7. Explain limitations: image-only PDFs need OCR, extracted facts must be verified, and the final decision remains human.

## Privacy and limitations

- Uploaded files and raw resume text are read in memory and are not written to disk or stored in a database. Only ranking result summaries are retained.
- Image-only/scanned PDFs are rejected because this version does not include OCR.
- Skill detection uses a transparent catalogue and cannot recognize every synonym or specialist technology.
- Resume formatting can affect PDF text extraction.
- Scores indicate textual alignment with the supplied role; they do not verify claims, predict performance, or assess culture fit.
- Names are displayed for usability but are not used as a scoring feature.

