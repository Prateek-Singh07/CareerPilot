<div align="center">

# 🧠 SkillCortex

### *AI-Powered Interview Preparation & Resume Analysis Platform*

**Master Every Interview 🎯**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)

<br />

<a href="#-features">Features</a> •
<a href="#-tech-stack">Tech Stack</a> •
<a href="#-getting-started">Getting Started</a> •
<a href="#-api-documentation">API Docs</a> •
<a href="#-project-structure">Structure</a> •
<a href="#-deployment">Deployment</a>

<br />

<img src="https://img.shields.io/badge/Version-1.1.0-blue" alt="Version 1.1.0" />
<img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
<img src="https://img.shields.io/badge/Build-Passing-brightgreen" alt="Build Passing" />

</div>

---

## 📋 Overview

**SkillCortex** is a full-stack AI application that uses Google's Gemini AI to help candidates prepare for technical interviews. Upload your resume, and the AI generates personalized interview questions. Answer them using text or voice, and get scored across 7 metrics with detailed feedback.

The app also includes a **Resume Match Analyzer** that compares your resume against any job description to identify gaps and improvement areas.

---

## ✨ Features

### 🤖 AI Mock Interviews
- **Resume-Based Questions** — Gemini AI analyzes your resume and generates 10 tailored questions
- **7-Metric Scoring** — Communication, Technical Knowledge, Confidence, Grammar, Problem Solving, Completeness, Professionalism
- **Real-Time Feedback** — Strengths, weaknesses, and actionable suggestions after each answer
- **Voice Recording** — Speech-to-text for hands-free answering
- **Text-to-Speech** — Questions read aloud for immersive practice
- **2-Minute Timer** — Real interview pressure simulation
- **PDF Reports** — Downloadable interview performance reports
- **History Tracking** — View all past interview sessions with scores

### 📄 Resume Match Analyzer
- Upload your resume and paste a job description
- Get a match percentage score
- Identify missing skills and keywords
- Receive tailored improvement recommendations

### 🔐 Authentication
- JWT-based auth with PyJWT (RFC 7519 compliant)
- Secure signup/login with bcrypt password hashing
- Rate-limited endpoints (SlowAPI)
- Persistent sessions via localStorage

### 🎨 User Experience
- Dark mode with glassmorphism UI
- Smooth animations (Framer Motion)
- Fully responsive design
- Loading states and transitions
- Gradient accents and micro-interactions

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **Material UI** | Component library (dark theme) |
| **Framer Motion** | Animations |
| **Axios** | HTTP client with JWT interceptors |
| **Web Speech API** | Voice recording & TTS |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Python 3.10+** | Runtime |
| **FastAPI** | Web framework |
| **SQLAlchemy** | ORM with SQLite |
| **PyJWT 2.13** | JWT auth tokens |
| **Passlib + bcrypt** | Password hashing |
| **Gemini AI** | Question generation & evaluation |
| **PyMuPDF** | PDF text extraction |
| **ReportLab** | PDF report generation |
| **SlowAPI** | Rate limiting |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Google Gemini API key](https://aistudio.google.com/apikey)

### 1. Clone & Install Backend

```bash
cd AI-Career-Assistant/backend

# Create virtual environment
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET_KEY=your_random_secret_key_here
JWT_EXPIRE_MINUTES=1440
```

### 3. Install & Run Frontend

```bash
cd AI-Career-Assistant/frontend
npm install
npm run dev
```

### 4. Run Backend

```bash
cd AI-Career-Assistant/backend
venv\Scripts\python main.py
```

### 5. Open in Browser

Frontend → **http://localhost:5173** (or Vite's assigned port)

---

## 📘 API Documentation

When the backend is running, interactive API docs are at:

| URL | Type |
|-----|------|
| **http://127.0.0.1:8000/docs** | Swagger UI |
| **http://127.0.0.1:8000/redoc** | ReDoc UI |

### Key Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/signup` | ❌ | Create a new account |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT token |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |
| `POST` | `/api/upload-resume` | ✅ | Upload PDF resume, generate questions |
| `GET` | `/api/next-question` | ✅ | Get next interview question |
| `POST` | `/api/answer` | ✅ | Submit answer, get AI evaluation |
| `GET` | `/api/download-report` | ✅ | Download interview PDF report |
| `GET` | `/api/history` | ✅ | View past interview sessions |
| `POST` | `/api/resume-match` | ✅ | Match resume vs job description |

---

## 📁 Project Structure

```
AI-Career-Assistant/
├── backend/
│   ├── app/
│   │   ├── api/              # API route handlers
│   │   │   ├── ai.py              # Interview Q&A endpoints
│   │   │   ├── auth_router.py     # Signup, login, /me
│   │   │   ├── history.py         # Session history
│   │   │   ├── resume.py          # Resume upload + question gen
│   │   │   └── resume_match.py    # Resume-JD matcher
│   │   ├── models/               # SQLAlchemy models
│   │   │   ├── interview.py
│   │   │   └── user.py
│   │   ├── services/             # Business logic
│   │   │   ├── ai_service.py          # Gemini AI integration
│   │   │   ├── pdf_service.py         # PDF generation
│   │   │   ├── resume_match_service.py
│   │   │   └── resume_reader.py       # PDF text extraction
│   │   ├── auth.py               # JWT utilities
│   │   ├── database.py           # DB connection
│   │   └── schemas.py            # Pydantic models
│   ├── main.py                   # FastAPI entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── AuthModal.jsx
│   │   │   ├── FeedbackCard.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   ├── InterviewSection.jsx
│   │   │   ├── LoadingScreen.jsx
│   │   │   ├── ResumeMatch.jsx
│   │   │   ├── SummaryCard.jsx
│   │   │   ├── Timer.jsx
│   │   │   └── UploadSection.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios + JWT interceptors
│   │   ├── App.jsx               # Main app with routing
│   │   └── main.jsx              # Entry point
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🔐 Authentication Flow

```
User → POST /signup → Account Created → JWT Token Returned
                                        ↓
User → POST /login  → Verify Password → JWT Token Returned
                                        ↓
User → [Protected Endpoint] → Axios Interceptor attaches Bearer token → FastAPI verifies JWT → Response
```

### Security Measures
- Passwords hashed with bcrypt
- JWT tokens signed with HS256
- 24-hour token expiry (configurable)
- Rate limiting on auth routes (SlowAPI)
- `.env` file excluded from version control
- SQLite database excluded from Git

---

## 🧪 Interview Scoring

Each answer is evaluated across 7 dimensions (scored 1–10):

| Metric | What It Measures |
|--------|-----------------|
| **Communication** | Clarity, structure, articulation |
| **Technical Knowledge** | Depth of domain expertise |
| **Confidence** | Certainty in delivery |
| **Grammar** | Language correctness |
| **Problem Solving** | Analytical approach |
| **Answer Completeness** | Coverage of the question |
| **Professionalism** | Tone and relevance |

---

## 🚢 Deployment

### Backend (Railway / Render / Fly.io)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Set environment variables:
- `GEMINI_API_KEY`
- `JWT_SECRET_KEY`
- `JWT_EXPIRE_MINUTES` (optional, defaults to 1440)

### Frontend (Vercel / Netlify)

```bash
cd frontend
npm run build
```

Set `VITE_API_URL` to your deployed backend URL (defaults to `http://127.0.0.1:8000/api`).

---

## 🤝 Contributing

1. Fork the repo
2. Create your branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**.

---

## 🙏 Acknowledgments

- **Google Gemini AI** — Question generation and answer evaluation
- **FastAPI** — Modern Python web framework
- **React** — UI library
- **Material UI** — Component library
- **Framer Motion** — Animation library
- **PyMuPDF** — PDF processing

---

<div align="center">
  <p>
    Built with ❤️
    <br />
    <a href="https://github.com/karthikJKST/AI-Career-Assistant">GitHub Repo</a> •
    <a href="https://github.com/karthikJKST/AI-Career-Assistant/issues">Report Bug</a> •
    <a href="https://github.com/karthikJKST/AI-Career-Assistant/issues">Request Feature</a>
  </p>
</div>
