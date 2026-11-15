<div align="center">

# 🎯 AI-Based Resume Matching & Candidate Ranking System

### Explainable candidate intelligence for faster, fairer resume review

[![Live Application](https://img.shields.io/badge/Live_Application-Open_Dashboard-EE5B3C?style=for-the-badge&logo=render&logoColor=white)](https://resume-ranking-system-rachit-ncj1.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Source_Code-181717?style=for-the-badge&logo=github)](https://github.com/rachit1807/resume-ranking-system)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED?style=flat-square&logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=flat-square&logo=render&logoColor=black)
![Tests](https://img.shields.io/badge/Automated_Tests-7_Passing-23846A?style=flat-square&logo=pytest&logoColor=white)

**Upload PDF or DOCX resumes → compare every candidate with one role → inspect an explainable ranked shortlist.**

</div>

---

## 🚀 Live project

> [!IMPORTANT]
> **The application is live:** [resume-ranking-system-rachit-ncj1.onrender.com](https://resume-ranking-system-rachit-ncj1.onrender.com)

The system reads batches of resumes, measures their textual alignment with a supplied job description, and presents the results in a professional evidence dashboard. Every score includes visible factors, matching skills, missing skills, and resume highlights.

> [!NOTE]
> The assignment does not establish that every role is an internship. The application therefore uses neutral terms such as **role**, **job description**, and **candidate**. It supports internships, graduate hiring, and experienced positions.

## ✨ Highlights

| | Capability | What it delivers |
| :---: | --- | --- |
| 📚 | **Batch resume parsing** | Processes up to 25 text-based PDF and DOCX files in one run |
| 🧠 | **Semantic matching** | Uses transformer embeddings when installed, with a deterministic TF-IDF fallback |
| 🔎 | **Explainable ranking** | Shows semantic, skill, experience, and education evidence separately |
| 📊 | **Professional dashboard** | Search, score filters, candidate dossiers, CSV export, and responsive layouts |
| 🌓 | **Dark and light themes** | Remembers the reviewer’s preferred visual mode |
| 🗂️ | **Ranking archive** | Stores ranking summaries without retaining uploaded files or raw resume text |
| 🛡️ | **Human-review guardrails** | Makes limitations visible and keeps the final decision with the recruiter |
| 🐳 | **Production deployment** | Multi-stage Docker image, health checks, and an isolated PostgreSQL database |

## 📊 Explainable score model

Every component is normalized to a **0–100** score before its weight is applied.

| Factor | Weight | Visual weight | Evidence used |
| --- | ---: | :--- | --- |
| **Semantic alignment** | **45%** | ██████████████████░░ | Meaning and vocabulary across the complete resume and role description |
| **Skills coverage** | **35%** | ██████████████░░░░░░ | Required capabilities detected in both documents |
| **Experience** | **15%** | ██████░░░░░░░░░░░░░░ | Stated years compared with the role requirement |
| **Education** | **5%** | ██░░░░░░░░░░░░░░░░░░ | Education level, only when the role specifies one |

~~~mermaid
xychart-beta
    title "Candidate score weights"
    x-axis [Semantic, Skills, Experience, Education]
    y-axis "Weight (%)" 0 --> 50
    bar [45, 35, 15, 5]
~~~

## 🔄 Ranking workflow

~~~mermaid
flowchart LR
    A[📝 Add job description] --> B[📄 Upload PDF/DOCX resumes]
    B --> C[🔍 Validate and extract text]
    C --> D[🧠 Calculate semantic fit]
    C --> E[🛠️ Detect skills]
    C --> F[💼 Read experience]
    C --> G[🎓 Read education]
    D --> H[⚖️ Weighted score]
    E --> H
    F --> H
    G --> H
    H --> I[🏆 Ranked shortlist]
    I --> J[🔎 Human evidence review]
    I --> K[🗂️ Save result summary]
~~~

## 🏗️ System architecture

~~~mermaid
flowchart TB
    U[👤 Recruiter] -->|HTTPS| UI[⚛️ React + Vite dashboard]
    UI -->|Same-origin API| API[⚡ FastAPI service]
    API --> PARSER[📄 PDF / DOCX parser]
    API --> MATCHER[🧠 Explainable matching engine]
    PARSER --> MATCHER
    MATCHER --> DB[(🐘 PostgreSQL archive)]
    API --> UI

    subgraph deployment[Render — Singapore]
        UI
        API
        PARSER
        MATCHER
        DB
    end
~~~

### Score contribution

~~~mermaid
pie showData
    title Score contribution
    "Semantic alignment" : 45
    "Skills coverage" : 35
    "Experience" : 15
    "Education" : 5
~~~

## 🖥️ Dashboard experience

| Workbench | Rankings | Candidate dossier | Scoring notes |
| --- | --- | --- | --- |
| Define a role and upload a batch | Search, filter, compare, and export | Inspect evidence and weighted factors | Understand the model and review guardrails |
| Drag-and-drop PDF/DOCX files | Load previous ranking runs | See matched and missing skills | Read exactly what each factor measures |

The editorial **Rankform Evidence Studio** interface intentionally uses a distinct visual identity: paper-and-ink surfaces, vermilion signals, compact evidence rows, responsive navigation, and a saved dark mode.

## 🧰 Technology stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| 🎨 Frontend | React, Vite, Lucide React | Responsive ranking dashboard and interactions |
| ⚡ API | FastAPI, Pydantic, Uvicorn | Upload handling, validation, and typed API responses |
| 📄 Parsing | pypdf, python-docx | In-memory PDF and DOCX text extraction |
| 🧠 Matching | scikit-learn, optional sentence-transformers | TF-IDF or transformer semantic comparison |
| 🗃️ Data | PostgreSQL, SQLAlchemy | Persistent ranking summaries and archive history |
| 🐳 Delivery | Docker, Render Blueprint | Reproducible production build and cloud deployment |
| ✅ Quality | Pytest, Vitest | Backend and frontend automated tests |

## 📁 Project structure

~~~text
resume-ranking-system/
├── backend/
│   ├── app/
│   │   ├── database.py      PostgreSQL/SQLite ranking history
│   │   ├── main.py          FastAPI routes and ranking orchestration
│   │   ├── matcher.py       Semantic, skill, experience, and education scoring
│   │   ├── parser.py        In-memory PDF/DOCX parsing and validation
│   │   └── schemas.py       Typed API response models
│   ├── tests/               Backend API and matching tests
│   ├── requirements.txt
│   └── requirements-dev.txt
├── frontend/
│   ├── src/
│   │   ├── components/      Candidate evidence views
│   │   ├── data/demo.js     Demonstration candidates
│   │   ├── App.jsx          Dashboard workflow
│   │   └── styles.css       Responsive light/dark design system
│   ├── package.json
│   └── vite.config.js
├── Dockerfile               Multi-stage React + FastAPI image
├── render.yaml              Isolated Render service and PostgreSQL database
└── README.md
~~~

## 🏁 Run locally

### 1. Start the FastAPI backend

Python **3.10–3.13** is recommended.

~~~bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
~~~

- API documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Local development automatically uses SQLite.

For optional transformer embeddings:

~~~bash
python -m pip install -r requirements-ai.txt
~~~

The matcher attempts to load **all-MiniLM-L6-v2** from the local cache and safely falls back to TF-IDF when the model is unavailable.

### 2. Start the React frontend

~~~bash
cd frontend
npm install
npm run dev
~~~

Open [http://localhost:5173](http://localhost:5173). Vite proxies API requests to FastAPI.

## ✅ Tests and production build

~~~bash
cd backend
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
pytest -q

cd ../frontend
npm test
npm run build
~~~

| Test area | Coverage |
| --- | --- |
| API health | Service and database readiness |
| Batch ranking | DOCX parsing, scoring, response structure, and persistence |
| Validation | Unsupported file rejection and upload safeguards |
| Matching engine | Skills, experience, education, and final score behavior |
| Frontend data | Demonstration dataset integrity |

## ☁️ Production deployment

The checked-in **render.yaml** provisions two project-specific resources in the **Singapore** region:

1. **Docker web service** — builds React, packages FastAPI, and serves both from one public origin.
2. **Private PostgreSQL database** — receives connections only through Render’s private network.

~~~mermaid
sequenceDiagram
    participant G as GitHub main
    participant R as Render Build
    participant W as Web Service
    participant P as PostgreSQL
    G->>R: Push commit
    R->>R: Build React + Python image
    R->>W: Deploy immutable image
    W->>P: Verify database connection
    W-->>R: GET /health → 200
    R-->>G: Deployment live
~~~

## 🔐 Privacy, fairness, and limitations

> [!WARNING]
> This score is **decision support**, not an automated hiring decision. Review the original resume, validate extracted facts, accommodate non-standard career paths, and never use the score as the sole basis for rejection.

- 🔒 Uploaded files and raw resume text are processed in memory and are not retained.
- 🗂️ Only ranking result summaries are stored in the archive database.
- 🖼️ Image-only or scanned PDFs require OCR and are rejected by this version.
- 🧩 The transparent skills catalogue cannot cover every synonym or specialist technology.
- 📐 Resume formatting can affect text extraction quality.
- 🚫 Names are displayed for usability but are not used as a scoring feature.
- 🧑‍⚖️ Scores measure textual alignment; they do not verify claims or predict job performance.

## 🎬 Suggested demo walkthrough

1. Open the [live dashboard](https://resume-ranking-system-rachit-ncj1.onrender.com) and switch between light and dark themes.
2. Review the prefilled role description and explain that the role type is intentionally neutral.
3. Run the built-in demo ranking without uploading personal documents.
4. Search and filter the shortlist, then open a candidate evidence dossier.
5. Explain the four-part score and matched/missing skills.
6. Upload multiple PDF/DOCX resumes to demonstrate the live FastAPI pipeline.
7. Open **Rankings** to show saved run history, then export the shortlist as CSV.
8. Finish with the privacy limitations and human-review guardrail.

## 👨‍💻 Author

<div align="center">

### Rachit Tripathi

**Full-Stack Developer · AI/ML Enthusiast**

[![GitHub](https://img.shields.io/badge/GitHub-rachit1807-181717?style=for-the-badge&logo=github)](https://github.com/rachit1807)
[![Repository](https://img.shields.io/badge/Repository-resume--ranking--system-EE5B3C?style=for-the-badge&logo=github)](https://github.com/rachit1807/resume-ranking-system)

Built as a separate assignment project while preserving the original **AI Resume Analyzer & Career Development Platform** mini-project unchanged.

</div>

---

<div align="center">

### ⭐ If this project is useful, consider starring the repository

[Live Demo](https://resume-ranking-system-rachit-ncj1.onrender.com) · [Source Code](https://github.com/rachit1807/resume-ranking-system) · [Report an Issue](https://github.com/rachit1807/resume-ranking-system/issues)

</div>
