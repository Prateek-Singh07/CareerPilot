<div align="center">
  <br />
  <img src="assets/logo.svg" alt="CareerPilot AI Logo" width="80" height="80" />
  <h1 align="center">CareerPilot AI</h1>
  <p align="center">
    <strong>AI-Powered Interview Preparation &amp; Personalized Career Guidance Platform</strong>
    <br />
    Prepare for technical interviews with real-time AI evaluation, ATS resume matching, personalized career profiles, and milestone-driven learning roadmaps.
  </p>

  <p>
    <a href="#-features"><strong>Features</strong></a> ·
    <a href="#-tech-stack"><strong>Tech Stack</strong></a> ·
    <a href="#-architecture"><strong>Architecture</strong></a> ·
    <a href="#-getting-started"><strong>Getting Started</strong></a> ·
    <a href="#-presentation-demo-mode"><strong>Demo Mode</strong></a> ·
    <a href="#-testing"><strong>Testing</strong></a> ·
    <a href="#-api-overview"><strong>API</strong></a> ·
    <a href="#-acknowledgments--license"><strong>License & Attribution</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License" />
    <img src="https://img.shields.io/badge/python-3.11+-blue?style=flat-square&logo=python" alt="Python 3.11+" />
    <img src="https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/tests-52%20passed-22c55e?style=flat-square" alt="Tests 52 Passed" />
    <img src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square" alt="Build Passing" />
  </p>
</div>

<br />

---

## ✨ Features

<div align="center">
  <table>
    <tr>
      <td align="center" width="33%">
        <h3>🎯 AI Mock Interviews</h3>
        <p>Personalized interview questions generated from your uploaded resume. Answer via text or voice and receive evaluation across 7 dimensions.</p>
      </td>
      <td align="center" width="33%">
        <h3>📊 Real-Time Feedback</h3>
        <p>Instant AI scoring after every response — detailing specific strengths, constructive growth areas, and actionable improvement suggestions.</p>
      </td>
      <td align="center" width="33%">
        <h3>📄 ATS Resume Matcher</h3>
        <p>Compare your PDF resume against job descriptions to discover match percentage, identified strengths, missing keywords, and tailored recommendations.</p>
      </td>
    </tr>
    <tr>
      <td align="center" width="33%">
        <h3>👤 Personalized Career Profile</h3>
        <p>Save and edit your target role, skill tags, experience level, weekly study availability, and career objectives with persistent database synchronization.</p>
      </td>
      <td align="center" width="33%">
        <h3>🗺️ Career Roadmap Generator</h3>
        <p>Generate structured, milestone-driven learning roadmaps tailored to your career goal, weekly hours, and skill level with progress tracking.</p>
      </td>
      <td align="center" width="33%">
        <h3>🔑 Multi-Key Fallback &amp; Demo Mode</h3>
        <p>Resilient Gemini API client supporting primary + 4 fallback keys with automatic rotation and a presentation Demo Mode for reliable offline demonstration.</p>
      </td>
    </tr>
    <tr>
      <td align="center" width="33%">
        <h3>📑 PDF Performance Reports</h3>
        <p>Export branded, publication-ready PDF performance reports with complete question-by-question metrics breakdowns and overall readiness recommendations.</p>
      </td>
      <td align="center" width="33%">
        <h3>🎨 Warm Light &amp; Dark Modes</h3>
        <p>Refined visual design with warm ivory, cream, terracotta, and sage green tones, with smooth switching between light and dark themes.</p>
      </td>
      <td align="center" width="33%">
        <h3>🔐 Secure Authentication</h3>
        <p>Bcrypt password hashing, JWT stateless authentication, rate limiting, and strict per-user database isolation.</p>
      </td>
    </tr>
  </table>
</div>

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | Modern declarative UI library |
| **Vite 8** | High-performance frontend build tool |
| **Material UI 9** | Accessible component system customized with warm theme tokens |
| **Framer Motion** | Smooth page transitions and fluid micro-interactions |
| **Axios** | HTTP client with automatic JWT token attachment |
| **Recharts** | Radar and bar charts for interview metric visualization |
| **Web Speech API** | Hands-free voice answer recording and text-to-speech question reading |

### Backend

| Technology | Purpose |
|---|---|
| **Python 3.11+** | Modern Python runtime |
| **FastAPI** | High-performance asynchronous web framework |
| **SQLAlchemy** | ORM supporting SQLite and PostgreSQL |
| **Google Gemini AI** | Advanced language model integration (`gemini-3.5-flash`) |
| **PyMuPDF (fitz)** | High-accuracy text extraction from PDF resumes |
| **ReportLab** | Document generation engine for PDF interview reports |
| **PyJWT & Passlib** | Secure token handling and bcrypt password hashing |
| **SlowAPI** | Endpoint rate limiting |
| **pytest** | Automated test suite (52 unit and integration tests) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser Client (React SPA)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ Career Profile│  │ Interview QA │  │ ATS Resume Matcher    │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘  │
│         │                 │                      │               │
│  ┌──────┴─────────────────┴──────────────────────┴───────────┐  │
│  │             Career Roadmap & History Views                 │  │
│  └──────────────────────────────┬────────────────────────────┘  │
│                                 │ Axios + Bearer JWT / Demo Flag │
└─────────────────────────────────┼───────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend Service                      │
│  ┌──────────────────────────┐    ┌───────────────────────────┐  │
│  │ Auth & Profile Routers   │    │ Interview & Resume Match  │  │
│  └─────────────┬────────────┘    └─────────────┬─────────────┘  │
│                │                               │                 │
│                ▼                               ▼                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Services Layer                         │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ Central Gemini Client Pool (Primary + 4 Fallback Keys)│  │  │
│  │  │ Offline Presentation Demo Engine (Deterministic Data) │  │  │
│  │  └──────────────────────────┬───────────────────────────┘  │  │
│  │                             │                              │  │
│  │  ┌──────────────────────────┴───────────────────────────┐  │  │
│  │  │ PyMuPDF Parser · ReportLab PDF Engine · Roadmap Gen │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────┬────────────────────────────┘  │
│                                 │                                │
│                                 ▼                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               Database (SQLite / PostgreSQL)              │  │
│  │  Users · Profiles · Interview Sessions · Roadmaps         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** & npm
- **Google Gemini API Key** ([Get a key free from Google AI Studio](https://aistudio.google.com/apikey))

### 1. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Backend Environment

Copy `.env.example` to `backend/.env`:

```env
# Required primary Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional fallback keys for presentation resilience
# GEMINI_API_KEY_2=your_fallback_key_2
# GEMINI_API_KEY_3=your_fallback_key_3

# Strong random secret for JWT signing
JWT_SECRET_KEY=change-me-in-production-use-a-real-secret

# Model configuration
GEMINI_MODEL=gemini-3.5-flash

# Set to development to auto-create demo account on startup
CAREERPILOT_ENV=development

# Optional presentation demo mode (true = mock all AI calls offline)
DEMO_MODE=false
```

### 3. Setup Frontend

```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install npm dependencies
npm install
```

Configure `frontend/.env` if connecting to a custom backend URL:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### 4. Run the Application

**Start Backend (Terminal 1):**

```bash
cd backend
venv\Scripts\activate
python main.py
# Running on http://127.0.0.1:8000
# Interactive API documentation: http://127.0.0.1:8000/docs
```

**Start Frontend (Terminal 2):**

```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

### 5. Accessing the Platform

1. Open **http://localhost:5173** in your browser.
2. Sign up with a new account or sign in with default development credentials:
   - **Username:** `demo`
   - **Password:** `Demo@123`
3. Manage your **Career Profile**, practice mock interviews, analyze resumes with **Resume Match**, and generate **Career Roadmaps**.

---

## 🎭 Presentation Demo Mode

CareerPilot AI includes a built-in **Presentation Demo Mode** designed for reliable college project demonstrations:

- **Offline / Low-Quota Resilience**: Generates high-fidelity mock responses for all 4 AI services without consuming live Gemini quota or failing on rate limits.
- **Toggle Control**: Enable easily via the header toggle in the UI or by setting `DEMO_MODE=true` in `backend/.env`.
- **Multi-Key Fallback**: When live API mode is enabled, the backend automatically fails over to fallback keys if a quota limit (HTTP 429) occurs.

---

## 🧪 Testing

The platform includes a test suite covering authentication, session isolation, Gemini fallback mechanisms, resume parsing, and career profile persistence:

```bash
# Run all backend tests
cd backend
venv\Scripts\activate
python -m pytest backend/tests

# Run frontend production build test
cd ../frontend
npm run build
```

---

## 📘 API Overview

Interactive Swagger documentation is available at `/docs` when the backend is running.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | System health check and database status |
| `GET` | `/api/system/status` | No | Gemini API credential pool status and demo mode state |
| `POST` | `/api/auth/signup` | No | Register a new user account |
| `POST` | `/api/auth/login` | No | Authenticate user and receive JWT token |
| `GET` | `/api/auth/me` | Yes | Get authenticated user information |
| `GET` | `/api/profile` | Yes | Retrieve authenticated user's career profile |
| `PUT` | `/api/profile` | Yes | Create or update user's career profile |
| `POST` | `/api/upload-resume` | Yes | Upload PDF resume and generate personalized interview questions |
| `GET` | `/api/next-question` | Yes | Retrieve the next interview question |
| `POST` | `/api/answer` | Yes | Submit answer and receive 7-metric evaluation |
| `GET` | `/api/download-report` | Yes | Download comprehensive PDF performance report |
| `GET` | `/api/history` | Yes | View past interview sessions and score summaries |
| `POST` | `/api/resume-match` | Yes | Compare resume against target job description |
| `POST` | `/api/roadmap` | Yes | Generate structured step-by-step career roadmap |
| `GET` | `/api/roadmap/history` | Yes | Retrieve past generated roadmaps |

---

## 🤝 Acknowledgments & License

CareerPilot AI builds upon the open-source repository [AI-Career-Assistant](https://github.com/karthikJKST/AI-Career-Assistant) by **Karthik Shiva Teja**.

- **Upstream Author**: Karthik Shiva Teja ([@karthikJKST](https://github.com/karthikJKST))
- **Base Repository**: [karthikJKST/AI-Career-Assistant](https://github.com/karthikJKST/AI-Career-Assistant)
- **License**: MIT License (see [LICENSE](LICENSE))
- **Third-Party Notices**: See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for full licensing details of third-party libraries.
- **Architectural Provenance & Changes**: See [CONTRIBUTIONS.md](CONTRIBUTIONS.md) for a detailed breakdown of inherited vs. newly developed features.
