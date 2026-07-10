"""SkillCortex – Backend API

FastAPI application with:
- SQLite database (auto-created on startup)
- JWT-based user authentication
- Rate limiting on auth endpoints
- Global exception handlers
- CORS for local frontend dev
"""

import os
import sys
from pathlib import Path

# Add the backend directory to sys.path for imports
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.database import init_db
from app.api.auth_router import router as auth_router
from app.api.resume import router as resume_router
from app.api.ai import router as ai_router
from app.api.resume_match import router as resume_match_router
from app.api.history import router as history_router


# ── Environment validation at startup ─────────────────────────

REQUIRED_ENV_VARS = ["GEMINI_API_KEY"]
missing = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]
if missing:
    print(f"Missing required environment variables: {', '.join(missing)}")
    print("   Create a .env file in the backend directory with:")
    for var in missing:
        print(f"   {var}=your_value_here")
    sys.exit(1)

# Warn if JWT secret is default
if os.getenv("JWT_SECRET_KEY") is None:
    print("WARNING: JWT_SECRET_KEY not set. Using insecure dev default. Set it in .env for production.")


# ── Rate Limiter ─────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address)


# ── App Factory ──────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title="SkillCortex API",
        description="Backend for AI-powered interview coaching and resume analysis",
        version="1.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── State ────────────────────────────────────────────────
    app.state.limiter = limiter

    # ── CORS ─────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins in development
        allow_credentials=False,  # JWT sent via Authorization header, not cookies
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Rate limit error handler ─────────────────────────────
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── Global Exception Handler ─────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        print(f"Unhandled error: {exc}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error. Please try again later."},
        )

    # ── Routers ──────────────────────────────────────────────
    app.include_router(auth_router)
    app.include_router(resume_router)
    app.include_router(ai_router)
    app.include_router(resume_match_router)
    app.include_router(history_router)

    # ── Root health check ────────────────────────────────────
    @app.get("/")
    def root():
        return {
            "app": "SkillCortex API",
            "version": "1.1.0",
            "status": "running",
        }

    # ── Startup: init DB ─────────────────────────────────────
    @app.on_event("startup")
    def on_startup():
        init_db()
        print("Database initialized")

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
