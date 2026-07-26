"""SkillCortex – Backend API

FastAPI application with:
- SQLite / configurable database (auto-created on startup)
- JWT-based user authentication
- Rate limiting on auth endpoints
- Global exception handlers
- CORS configured via environment
- Production-ready logging
"""

import logging
import os
import sys
from pathlib import Path

# ── Logging ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("skillcortex")

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

from app.database import init_db, check_db_connection
from app.api.auth_router import router as auth_router
from app.api.resume import router as resume_router
from app.api.ai import router as ai_router
from app.api.resume_match import router as resume_match_router
from app.api.history import router as history_router


# ── Environment validation at startup ─────────────────────────

REQUIRED_ENV_VARS = ["GEMINI_API_KEY"]
missing = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]
if missing:
    logger.error(
        "Missing required environment variables: %s\n"
        "   Create a .env file in the backend directory with:\n"
        "   %s",
        ", ".join(missing),
        "\n   ".join(f"{var}=your_value_here" for var in missing),
    )
    sys.exit(1)

# Crash if JWT secret is not set in production
_jwt_secret = os.getenv("JWT_SECRET_KEY")
if not _jwt_secret or _jwt_secret == "change-me-in-production-use-a-real-secret":
    logger.warning(
        "JWT_SECRET_KEY is not set or is using the insecure default. "
        "Set a strong random secret in .env for production."
    )

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
    DEFAULT_CORS_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    cors_env = os.getenv("CORS_ORIGINS")
    if cors_env:
        CORS_ORIGINS = [origin.strip() for origin in cors_env.split(",")]
    else:
        CORS_ORIGINS = DEFAULT_CORS_ORIGINS
        logger.info(
            "CORS_ORIGINS not set — using defaults: %s. "
            "Set CORS_ORIGINS (comma-separated) in .env for production.",
            DEFAULT_CORS_ORIGINS,
        )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Rate limit error handler ─────────────────────────────
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── Global Exception Handler ─────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled error on %s %s: %s", request.method, request.url.path, exc)
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

    # ── Health check endpoint ────────────────────────────────
    @app.get("/health")
    def health():
        db_ok = check_db_connection()
        return {
            "status": "UP" if db_ok else "DEGRADED",
            "database": "connected" if db_ok else "disconnected",
        }

    # ── Startup: init DB ─────────────────────────────────────
    @app.on_event("startup")
    def on_startup():
        init_db()
        logger.info("Database initialized")

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
    )
