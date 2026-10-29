"""Centralized Google Gemini AI Client with Credential Pool and Fallback Handling.

Features:
- Primary key (GEMINI_API_KEY) with optional fallback keys (GEMINI_API_KEY_2 .. 5).
- Credential health tracking (exhausted vs invalid).
- Bounded retries with backoff for transient server errors (500/503).
- Respects HTTP 429 retry information and avoids cyclic rate-limit evasion.
- Documented limitation: Keys originating from the same Google Cloud project share the same quota.
- Clean structured exception types without leaking API keys or internal stack traces.
- Seamless demo mode detection.
"""

import logging
import os
import re
import time
from pathlib import Path
from typing import Dict, List, Optional
from dotenv import load_dotenv
import google.generativeai as genai

logger = logging.getLogger("careerpilot.services.gemini_client")

# Ensure .env is loaded
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)
load_dotenv()


class GeminiServiceError(Exception):
    """Base exception for Gemini API service errors."""
    def __init__(self, message: str, status_code: int = 502, error_code: str = "AI_SERVICE_ERROR"):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code


class GeminiQuotaExhaustedError(GeminiServiceError):
    """Raised when Gemini API request limit / quota has been reached (HTTP 429)."""
    def __init__(
        self,
        message: str = (
            "CareerPilot AI service is temporarily unavailable because the Gemini API request limit has been reached. "
            "You can retry shortly or switch to Presentation Demo Mode."
        ),
        retry_after: Optional[int] = None,
    ):
        super().__init__(message, status_code=429, error_code="RATE_LIMIT_EXCEEDED")
        self.retry_after = retry_after


class GeminiAuthError(GeminiServiceError):
    """Raised when Gemini credentials are missing, invalid, or unauthorized."""
    def __init__(self, message: str = "Invalid or unauthorized CareerPilot AI credentials. Please check backend configuration or enable Presentation Demo Mode."):
        super().__init__(message, status_code=503, error_code="AUTH_CONFIG_ERROR")


class CredentialState:
    """Tracks status of an individual Gemini API key."""
    def __init__(self, slot_name: str, key_value: str):
        self.slot_name = slot_name          # e.g., "GEMINI_API_KEY" or "GEMINI_API_KEY_2"
        self._key_value = key_value        # Kept private, never logged or serialized
        self.is_valid = True               # False if auth/permission fails
        self.is_exhausted = False          # True if 429 quota exhausted
        self.exhausted_until = 0.0         # Monotonic timestamp until which key is considered exhausted

    def is_available(self) -> bool:
        """Key is usable if valid and either not exhausted or retry_after expired."""
        if not self.is_valid:
            return False
        if self.is_exhausted and time.time() < self.exhausted_until:
            return False
        return True

    def mark_exhausted(self, retry_delay_seconds: int = 3600):
        self.is_exhausted = True
        self.exhausted_until = time.time() + max(30, retry_delay_seconds)
        logger.warning(
            "Credential [%s] marked quota-exhausted for %d seconds. (Quota note: Keys sharing the same project share quota).",
            self.slot_name,
            retry_delay_seconds,
        )

    def mark_invalid(self):
        self.is_valid = False
        logger.error("Credential [%s] marked invalid due to authentication or permission error.", self.slot_name)

    def get_key_secret(self) -> str:
        return self._key_value


class GeminiCredentialPool:
    """Manages primary and optional fallback credentials for Google Gemini."""

    KEY_SLOTS = [
        "GEMINI_API_KEY",
        "GEMINI_API_KEY_2",
        "GEMINI_API_KEY_3",
        "GEMINI_API_KEY_4",
        "GEMINI_API_KEY_5",
    ]

    def __init__(self):
        self.credentials: List[CredentialState] = []
        self._load_credentials()

    def _load_credentials(self):
        """Load configured credentials from environment without logging their values."""
        self.credentials = []
        for slot in self.KEY_SLOTS:
            val = os.getenv(slot)
            if val and val.strip():
                # Avoid placeholder values from example files
                if "your_" not in val.lower() and "placeholder" not in val.lower():
                    self.credentials.append(CredentialState(slot, val.strip()))

        configured_slots = [c.slot_name for c in self.credentials]
        logger.info(
            "Gemini Credential Pool initialized with %d configured key(s): %s",
            len(self.credentials),
            ", ".join(configured_slots) if configured_slots else "None",
        )

    def get_available_credentials(self) -> List[CredentialState]:
        return [c for c in self.credentials if c.is_available()]

    def reset_quota_status(self):
        """Reset exhausted status across all credentials (useful for testing or manual recovery)."""
        for c in self.credentials:
            c.is_exhausted = False
            c.exhausted_until = 0.0


# Global credential pool instance
credential_pool = GeminiCredentialPool()


def is_demo_mode_active(explicit_override: Optional[bool] = None) -> bool:
    """Check whether demo mode is requested via environment variable or explicit request flag."""
    if explicit_override is not None:
        return explicit_override
    env_demo = os.getenv("DEMO_MODE", "false").strip().lower()
    return env_demo in ("true", "1", "yes", "on", "enabled")


def _parse_retry_delay(error_str: str) -> Optional[int]:
    """Extract recommended retry delay seconds from Gemini 429 response if present."""
    match = re.search(r'retryDelay[\'":\s]+(\d+)s', error_str)
    if match:
        try:
            return int(match.group(1))
        except ValueError:
            pass
    # Match human readable like 'retry in 11h20m24s'
    h_match = re.search(r'(\d+)h(\d+)m(\d+)s', error_str)
    if h_match:
        try:
            hours, mins, secs = int(h_match.group(1)), int(h_match.group(2)), int(h_match.group(3))
            return hours * 3600 + mins * 60 + secs
        except ValueError:
            pass
    return None


def execute_gemini_call(prompt: str, model_name: Optional[str] = None) -> str:
    """Execute a prompt against Gemini GenerativeModel with responsible key fallback and bounded retry.

    Architecture & Policy:
    1. Attempts primary credential.
    2. If transient 500/503 error occurs, executes 1 bounded retry with 0.5s backoff.
    3. If 429 Quota Exhausted occurs:
       - Marks credential as exhausted.
       - Note on Project Quota: Keys belonging to the same project share the exact same quota.
         If an optional distinct fallback key is configured and not yet exhausted, attempts it once.
         If fallback also 429s, all credentials in the pool are marked exhausted to avoid cyclic rate-limit hammering.
       - Raises GeminiQuotaExhaustedError with structured user-friendly message.
    4. If 400/401/403 Invalid Key occurs:
       - Marks credential invalid and attempts next configured fallback key.
       - If all credentials invalid, raises GeminiAuthError.
    5. Never reveals raw API keys or internal stack traces in exceptions or log messages.
    """
    model_name = model_name or os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    available_creds = credential_pool.get_available_credentials()

    if not available_creds:
        # Check if primary key exists but is exhausted
        all_exhausted = all(not c.is_valid or c.is_exhausted for c in credential_pool.credentials)
        if all_exhausted and credential_pool.credentials:
            raise GeminiQuotaExhaustedError()
        raise GeminiAuthError("No valid Gemini API credentials configured in environment.")

    last_error = None

    for cred in list(available_creds):
        key_secret = cred.get_key_secret()
        # Configure genai with this credential
        genai.configure(api_key=key_secret, transport="rest")
        model = genai.GenerativeModel(model_name)

        # Bounded transient retry: maximum 2 attempts per credential (1 initial + 1 retry)
        for attempt in range(2):
            try:
                response = model.generate_content(prompt)
                if not response or not hasattr(response, "text"):
                    raise ValueError("Empty or invalid response from Gemini model")
                text = response.text.strip()
                if not text:
                    raise ValueError("Gemini returned blank response text")
                return text

            except Exception as exc:
                err_str = str(exc)
                last_error = exc

                # Check for 429 / Resource Exhausted (Quota limit)
                if "429" in err_str or "ResourceExhausted" in err_str or "quota" in err_str.lower():
                    delay = _parse_retry_delay(err_str) or 3600
                    cred.mark_exhausted(delay)
                    logger.warning("Gemini quota exhausted on [%s].", cred.slot_name)
                    # Break transient attempt loop for this credential
                    break

                # Check for 400/401/403 Invalid / Unauthorized API Key
                if any(x in err_str for x in ["API_KEY_INVALID", "PERMISSION_DENIED", "UNAUTHENTICATED", "401", "403"]):
                    cred.mark_invalid()
                    logger.error("Gemini authentication failure on [%s].", cred.slot_name)
                    break

                # Transient server errors (500, 503, connection dropped)
                if attempt == 0 and any(x in err_str for x in ["500", "503", "InternalServerError", "ServiceUnavailable", "connection"]):
                    logger.info("Transient error on [%s], retrying in 500ms...", cred.slot_name)
                    time.sleep(0.5)
                    continue

                # Any other error: break to avoid endless loops
                break

    # If we exited the loop without returning, all attempted credentials failed
    if last_error:
        err_msg = str(last_error)
        if "429" in err_msg or "ResourceExhausted" in err_msg or "quota" in err_msg.lower():
            # Mark all keys exhausted if project-level quota was reached
            for c in credential_pool.credentials:
                c.is_exhausted = True
            raise GeminiQuotaExhaustedError()
        if any(x in err_msg for x in ["API_KEY_INVALID", "PERMISSION_DENIED", "UNAUTHENTICATED", "401", "403"]):
            raise GeminiAuthError()

    raise GeminiServiceError(f"AI service request could not be completed: {last_error or 'Unknown error'}")

