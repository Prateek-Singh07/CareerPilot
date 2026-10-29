# Project Contributions & Provenance

This document details the architectural provenance of **CareerPilot AI**, distinguishing between the inherited foundation from the upstream base repository and the new capabilities, bug fixes, and enhancements implemented for CareerPilot AI.

---

## 1. Existing Functionality Inherited from the Base Repository

CareerPilot AI builds on the foundation provided by the open-source [AI-Career-Assistant](https://github.com/karthikJKST/AI-Career-Assistant) repository (authored by Karthik Shiva Teja, MIT License):

- **Backend Architecture & Framework**: Basic FastAPI application structure (`backend/app`, `backend/main.py`) with Uvicorn ASGI server.
- **Database Skeleton**: SQLite database initialization with SQLAlchemy ORM and initial `users` and `interview_sessions` tables.
- **Authentication Core**: JWT token encoding and decoding (PyJWT), bcrypt password hashing via Passlib, and initial `/signup`, `/login`, and `/me` routes.
- **Core AI Integration Pipelines**: Initial API routes and service scaffolding calling Google Generative AI for interview question generation and answer scoring.
- **PDF Resume Ingestion**: PyMuPDF (`fitz`) text extraction module (`backend/app/services/resume_reader.py`) for PDF files.
- **ATS Resume Match Scaffolding**: Initial prompt structure for comparing resume text against job description strings.
- **PDF Report Generation**: Initial ReportLab document structure (`backend/app/services/pdf_service.py`) for rendering interview summaries.
- **Frontend Scaffolding**: Initial React SPA setup using Vite, Material UI, and Framer Motion components (`UploadSection`, `InterviewSection`, `FeedbackCard`, `SummaryCard`, `ResumeMatch`, `HistoryPage`).

---

## 2. New Functionality Implemented for CareerPilot AI

The following major features and architectural components were designed, implemented, and verified specifically for CareerPilot AI:

### A. Personalized Career Profile System
- **Database Model (`CareerProfileDB`)**: Designed and implemented in `backend/app/models/profile.py` with fields for `user_id` (ForeignKey to `users.id`, unique, indexed), `target_role`, `current_skills_json`, `experience_level`, `weekly_hours`, `career_goals`, `created_at`, and `updated_at`.
- **Profile REST API**: Implemented `GET /api/profile` and `PUT` / `POST /api/profile` in `backend/app/api/profile.py` with strict Pydantic payload validation, skill tag deduplication/sanitization, and authenticated user isolation.
- **Career Profile UI**: Developed `frontend/src/components/CareerProfile.jsx` featuring target role selector with custom entry, experience level cards, skill tag/chip management with instant suggestions, weekly study hours slider, career goal notes, save feedback, and error handling.
- **Navigation Integration**: Seamlessly integrated Profile into top navigation bar and linked user badge in `frontend/src/App.jsx`.

### B. Interactive Career Roadmap Generator
- **Roadmap Data Model (`CareerRoadmapDB`)**: Created in `backend/app/models/roadmap.py` to persist generated roadmaps per user.
- **Roadmap API**: Implemented `POST /api/roadmap/generate` and `GET /api/roadmap/history` in `backend/app/api/roadmap.py`.
- **Roadmap Generation Service**: Implemented `backend/app/services/career_roadmap_service.py` to parse structured JSON milestones, timeline phases, skill competencies, and recommended learning resources from Gemini or demo fallback.
- **Roadmap UI**: Built `frontend/src/components/CareerRoadmap.jsx` with visual timeline progress, milestone completion toggles, and weekly study schedule planning.

### C. Multi-Key Gemini Credential Pool & Presentation Demo Mode
- **Credential Pool Architecture**: Built `backend/app/services/gemini_client.py` supporting a primary key (`GEMINI_API_KEY`) and up to 4 fallback keys (`GEMINI_API_KEY_2` through `GEMINI_API_KEY_5`) with quota exhaustion tracking (HTTP 429), authentication failure detection, and automatic key rotation.
- **Presentation Demo Mode Engine**: Implemented `backend/app/services/demo_data.py` with deterministic, realistic responses for all 4 AI services (interview questions, answer evaluation, resume matching, and roadmap generation) for offline or quota-limited presentations.
- **Frontend Demo Mode Support**: Implemented client-side Demo Mode toggle with `x-demo-mode` header propagation and persistent local storage state.

### D. Refined Design System & Theme Engine
- **Cohesive Color Palette**: Designed and applied a warm visual identity (ivory `#F8F6F2`, cream `#F0EBE4`, terracotta `#B96F50`, sage green `#71866B`, deep brown `#332C28`).
- **Full Light & Dark Theme**: Built `frontend/src/context/ThemeContext.jsx` with seamless switching, system preference detection, and consistent styling across all cards, dialogs, sliders, and navigation.

---

## 3. Substantial Modifications to Existing Functionality

- **Gemini Model Update & Error Hardening**:
  - Replaced the unavailable model `gemini-2.5-flash` with configurable `GEMINI_MODEL` (defaulting to verified `gemini-3.5-flash`).
  - Added robust JSON extraction and error handling across all AI services, replacing silent 0-score fallbacks with structured error responses.
- **Security & User Isolation**:
  - Enforced strict user isolation across all endpoints; prevented cross-user data leakage in interview history and profile storage.
  - Hardened JWT configuration with clear development defaults and production warnings.
  - Replaced brittle client-side login calls in test suites with token generation to prevent test rate-limiting bottlenecks.
- **ReportLab PDF Generation**:
  - Added XML escaping for dynamic LLM content to eliminate ReportLab markup parser crashes.
  - Rebranded generated PDF report header to `CareerPilot AI — AI Interview Performance Report`.
  - Added automatic background task directory cleanup to prevent orphaned temporary files.
- **Branding & Interface Modernization**:
  - Replaced all legacy user-facing branding and promotional text with CareerPilot AI.
  - Centered navigation and footer elements, polished card borders (16-20px radius), refined spacing, and added smooth transitions.

---

## 4. Testing and Evaluation Performed

All contributions are accompanied by automated tests:

- **Pytest Backend Test Suite (52 passed, 1 skipped)**:
  - `backend/tests/test_profile.py`: 10 tests covering auth enforcement, profile creation, updates, input validation, and user isolation.
  - `backend/tests/test_gemini_fallback_and_demo.py`: 10 tests covering multi-key rotation, fallback logic, quota errors, and demo mode.
  - `backend/tests/test_auth.py`: 11 tests covering signup, login, casing, whitespace trimming, and protected endpoints.
  - `backend/tests/test_interview_flow.py`: 4 tests covering complete interview lifecycle and PDF generation.
  - `backend/tests/test_resume_upload.py`: 4 tests covering resume parsing and question generation.
  - `backend/tests/test_resume_match.py`: 4 tests covering ATS matching and validation.
  - `backend/tests/test_roadmap.py`: 3 tests covering roadmap generation and history retrieval.
  - `backend/tests/test_health.py`: 2 tests covering health and status endpoints.
  - `backend/tests/test_ai_services.py`: 4 tests covering mock evaluations and services (1 live API test skipped as expected).
- **Frontend Production Build**: Verified with `vite build` (`0 errors`, fully minified and tree-shaken assets).

---

## 5. Outstanding Work

- **Skill-Gap Prioritization Engine**: Algorithmic engine comparing user skills from `CareerProfileDB` against target role benchmarks to generate prioritized learning goals (see implementation plan).
- **Profile-Driven Adaptive Interviews**: Tailoring generated mock interview questions to the target role and experience level saved in the user's career profile.
- **Cloud Database Configuration**: Automated PostgreSQL migrations for production hosting on Render/Supabase.

