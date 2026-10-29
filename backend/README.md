# CareerPilot AI Backend (`careerpilot-api`)

Asynchronous backend service for **CareerPilot AI**, an AI-powered interview preparation and personalized career guidance platform.

Built with **FastAPI**, **SQLAlchemy**, **Google Gemini AI**, **PyMuPDF**, and **ReportLab**.

---

## 📋 Service Metadata

- **Product**: CareerPilot AI
- **API Title**: CareerPilot AI API
- **Service Identifier**: `careerpilot-api`
- **Default Port**: `8000`
- **Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`
- **Health Check**: `http://127.0.0.1:8000/health`

---

## 🛠️ Architecture & Modules

```
backend/
├── app/
│   ├── api/                      # REST endpoint routers
│   │   ├── ai.py                 # Interview question retrieval, answer evaluation, PDF export
│   │   ├── auth_router.py        # User registration, login, JWT validation
│   │   ├── history.py            # User interview session history
│   │   ├── profile.py            # Career profile retrieval and upsert
│   │   ├── resume.py             # Resume upload and initial question generation
│   │   ├── resume_match.py       # ATS resume vs. job description matching
│   │   └── roadmap.py            # Structured career roadmap generation and persistence
│   ├── models/                   # SQLAlchemy database models
│   │   ├── interview.py          # Interview sessions and answers
│   │   ├── profile.py            # Personalized career profiles
│   │   ├── roadmap.py            # Career milestones and learning roadmaps
│   │   └── user.py               # User credentials and authentication
│   ├── services/                 # Core business logic and AI integrations
│   │   ├── ai_service.py         # Gemini prompt engineering for questions & evaluations
│   │   ├── career_roadmap_service.py # Gemini roadmap synthesis
│   │   ├── demo_data.py          # High-fidelity mock data for presentation demo mode
│   │   ├── gemini_client.py      # Resilient multi-key credential pool and retry logic
│   │   ├── pdf_service.py        # ReportLab branded PDF generation
│   │   ├── resume_match_service.py # ATS resume matching engine
│   │   └── resume_reader.py      # PyMuPDF (fitz) text extraction
│   ├── auth.py                   # JWT encoding/decoding and password hashing
│   ├── database.py               # SQLite / PostgreSQL connection management
│   └── schemas.py                # Pydantic request and response schemas
├── data/                         # Local SQLite database (ai_career.db)
├── tests/                        # Pytest automated test suite (52+ tests)
├── main.py                       # FastAPI application factory and startup entry point
├── requirements.txt              # Production and development dependencies
└── .env.example                  # Environment configuration template
```

---

## ⚙️ Environment Variables

Create `backend/.env` based on `backend/.env.example`:

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | **Yes** | — | Primary Google Gemini API key from Google AI Studio |
| `GEMINI_API_KEY_2` .. `_5` | No | — | Optional fallback keys cycled automatically on HTTP 429 quota exhaustion |
| `JWT_SECRET_KEY` | **Yes** (Prod) | `change-me-...` | Secret used to sign HS256 JWT tokens |
| `JWT_EXPIRE_MINUTES` | No | `1440` (24h) | JWT access token validity period |
| `GEMINI_MODEL` | No | `gemini-3.5-flash` | Configured Gemini LLM model |
| `CAREERPILOT_ENV` | No | `development` | Environment mode (`development` auto-seeds demo account; supports legacy `HIREPILOT_ENV`) |
| `DEMO_MODE` | No | `false` | When `true`, serves offline mock data for all AI features without using API quota |
| `DATABASE_URL` | No | SQLite (`data/ai_career.db`) | Database connection string (supports PostgreSQL in production) |
| `CORS_ORIGINS` | No | All localhost | Comma-separated list of allowed frontend origins |

---

## 🚀 Local Development

### 1. Prerequisites
- Python 3.11+
- Virtual environment (`venv`)

### 2. Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Run the Server
```bash
python main.py
```
The server will start on `http://127.0.0.1:8000`.

- API Root: `http://127.0.0.1:8000/`
- Health check: `http://127.0.0.1:8000/health`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`

---

## 🧪 Testing

Run the automated test suite using `pytest`:

```bash
# Run all tests
python -m pytest tests/

# Run with verbose output
python -m pytest tests/ -v
```

All AI calls in the test suite are mocked and execute against an isolated in-memory SQLite database (`sqlite:///:memory:`) without consuming live Gemini quota or hitting network rate limits.

---

## 🚢 Deployment (Render)

The backend is configured as `careerpilot-api` via [`render.yaml`](../render.yaml):
- **Runtime**: Python 3.11+
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`

---

## 📄 License & Attribution

CareerPilot AI builds upon the open-source repository [AI-Career-Assistant](https://github.com/karthikJKST/AI-Career-Assistant) by **Karthik Shiva Teja** under the **MIT License**. See [`THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md) and [`CONTRIBUTIONS.md`](../CONTRIBUTIONS.md) for full attribution.

