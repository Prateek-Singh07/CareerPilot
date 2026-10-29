"""CareerPilot AI – Backend API

FastAPI application with:
- SQLite / configurable database (auto-created on startup)
- JWT-based user authentication
- Centralized Gemini client with primary + 4 fallback credentials
- Presentation Demo Mode support
- Global exception handlers for AI quotas, auth, and unexpected errors
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
logger = logging.getLogger("careerpilot")

# Add the backend directory to sys.path for imports
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
# Explicitly load backend .env regardless of working directory
load_dotenv(dotenv_path=backend_dir / ".env")
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
from app.api.roadmap import router as roadmap_router
from app.api.profile import router as profile_router
from app.services.gemini_client import (
    credential_pool,
    is_demo_mode_active,
    GeminiQuotaExhaustedError,
    GeminiAuthError,
    GeminiServiceError,
)


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

# Log configured credentials safely without exposing key values
fallback_keys = [slot for slot in ["GEMINI_API_KEY_2", "GEMINI_API_KEY_3", "GEMINI_API_KEY_4", "GEMINI_API_KEY_5"] if os.getenv(slot)]
logger.info(
    "Gemini credentials configured: primary + %d optional fallback key(s) [%s]",
    len(fallback_keys),
    ", ".join(fallback_keys) if fallback_keys else "none",
)

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
        title="CareerPilot AI API",
        description="AI-powered interview preparation and personalized career guidance platform",
        version="1.2.0",
        docs_url="/docs",
        redoc_url="/redoc",
        contact={
            "name": "CareerPilot AI",
            "url": "https://github.com/karthikJKST/AI-Career-Assistant",
        },
        license_info={
            "name": "MIT License",
            "url": "https://opensource.org/licenses/MIT",
        },
    )

    # ── State ────────────────────────────────────────────────
    app.state.limiter = limiter

    # ── CORS ─────────────────────────────────────────────────
    cors_kwargs: dict = {
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
    cors_env = os.getenv("CORS_ORIGINS")
    if cors_env:
        cors_kwargs["allow_origins"] = [
            origin.strip() for origin in cors_env.split(",")
        ]
    else:
        logger.info(
            "CORS_ORIGINS not set — allowing all localhost origins. "
            "Set CORS_ORIGINS (comma-separated) in .env for production."
        )
        cors_kwargs["allow_origin_regex"] = (
            r"https?://(localhost|127\.0\.0\.1)(:[0-9]+)?"
        )
    app.add_middleware(CORSMiddleware, **cors_kwargs)

    # ── Rate limit error handler ─────────────────────────────
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── AI Exception Handlers ────────────────────────────────
    @app.exception_handler(GeminiQuotaExhaustedError)
    async def quota_exhausted_handler(request: Request, exc: GeminiQuotaExhaustedError):
        logger.warning("Gemini quota exhausted on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=429,
            content={
                "detail": exc.message,
                "error_code": exc.error_code,
                "suggest_demo": True,
                "retry_after": exc.retry_after or 60,
            },
        )

    @app.exception_handler(GeminiAuthError)
    async def auth_error_handler(request: Request, exc: GeminiAuthError):
        logger.error("Gemini auth error on %s %s: %s", request.method, request.url.path, exc.message)
        return JSONResponse(
            status_code=503,
            content={
                "detail": exc.message,
                "error_code": exc.error_code,
                "suggest_demo": True,
            },
        )

    @app.exception_handler(GeminiServiceError)
    async def gemini_service_error_handler(request: Request, exc: GeminiServiceError):
        logger.error("Gemini service error on %s %s: %s", request.method, request.url.path, exc.message)
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "detail": exc.message,
                "error_code": exc.error_code,
                "suggest_demo": True,
            },
        )

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
    app.include_router(roadmap_router)
    app.include_router(profile_router)

    # ── System status and demo mode ──────────────────────────
    @app.get("/api/system/status")
    def system_status():
        return {
            "demo_mode": is_demo_mode_active(),
            "keys_configured": len(credential_pool.credentials),
            "model": os.getenv("GEMINI_MODEL", "gemini-3.5-flash"),
        }

    # ── Root health check ────────────────────────────────────
    @app.get("/")
    def root():
        return {
            "app": "CareerPilot AI API",
            "version": "1.2.0",
            "status": "running",
            "service": "careerpilot-api",
        }

    # ── Health check endpoint ────────────────────────────────
    @app.get("/health")
    def health():
        db_ok = check_db_connection()
        return {
            "status": "UP" if db_ok else "DEGRADED",
            "database": "connected" if db_ok else "disconnected",
            "service": "careerpilot-api",
        }

    # ── Startup: init DB ─────────────────────────────────────
    @app.on_event("startup")
    def on_startup():
        logger.info("Initializing CareerPilot AI API [service=careerpilot-api]")
        init_db()
        logger.info("CareerPilot AI database initialized")

        # Create demo account in development mode (CAREERPILOT_ENV or HIREPILOT_ENV = development)
        env_mode = os.getenv("CAREERPILOT_ENV", os.getenv("HIREPILOT_ENV", "development")).lower()
        if env_mode == "development":
            try:
                from app.database import SessionLocal
                from app.models.user import User
                from app.auth import get_password_hash
                from sqlalchemy import func, or_
                db = SessionLocal()
                try:
                    existing = db.query(User).filter(
                        or_(
                            func.lower(User.username) == "demo",
                            func.lower(User.email) == "demo@careerpilot.ai",
                            func.lower(User.email) == "demo@hirepilot.app",
                        )
                    ).first()
                    if not existing:
                        demo_user = User(
                            email="demo@careerpilot.ai",
                            username="demo",
                            hashed_password=get_password_hash("Demo@123"),
                        )
                        db.add(demo_user)
                        db.commit()
                        logger.info("Demo account created: demo / Demo@123 (demo@careerpilot.ai)")
                    else:
                        logger.info("Demo account already present: %s", existing.username)
                finally:
                    db.close()
            except Exception as exc:
                logger.warning("Could not create demo account: %s", exc)

    @app.on_event("shutdown")
    def on_shutdown():
        logger.info("Shutting down CareerPilot AI API [service=careerpilot-api]")

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
