import csv
import io
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.responses import Response
from jose import JWTError, jwt
from pydantic import BaseModel, Field

from services.db import delete_user, get_setting, list_analysis_history, list_ats_leads, list_users, set_setting, update_lead, VALID_STATUSES
from services.emailer import test_smtp_connection

logger = logging.getLogger(__name__)

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
ADMIN_JWT_SECRET = os.getenv("ADMIN_JWT_SECRET", "")
ADMIN_JWT_ALGORITHM = os.getenv("ADMIN_JWT_ALGORITHM", "HS256")
try:
    ADMIN_JWT_EXPIRE_MINUTES = int(os.getenv("ADMIN_JWT_EXPIRE_MINUTES", "120"))
except ValueError:
    ADMIN_JWT_EXPIRE_MINUTES = 120

if not ADMIN_USERNAME or not ADMIN_PASSWORD or not ADMIN_JWT_SECRET:
    logger.warning(
        "ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_JWT_SECRET are not set via environment variables. "
        "Falling back to insecure defaults — set these before deploying to production."
    )
    ADMIN_USERNAME = ADMIN_USERNAME or "admin"
    ADMIN_PASSWORD = ADMIN_PASSWORD or "changeme"
    ADMIN_JWT_SECRET = ADMIN_JWT_SECRET or "change-me-in-production"

router = APIRouter(tags=["admin"])


class AdminLoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=120)
    password: str = Field(..., min_length=1, max_length=200)


def _create_admin_token(username: str) -> tuple[str, int]:
    expires_in_seconds = max(60, ADMIN_JWT_EXPIRE_MINUTES * 60)
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in_seconds)
    payload = {"sub": username, "scope": "admin", "exp": expires_at}
    token = jwt.encode(payload, ADMIN_JWT_SECRET, algorithm=ADMIN_JWT_ALGORITHM)
    return token, expires_in_seconds


@router.post("/admin/login")
def login_admin(credentials: AdminLoginRequest) -> dict:
    if credentials.username != ADMIN_USERNAME or credentials.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token, expires_in = _create_admin_token(credentials.username)
    return {"token": token, "token_type": "bearer", "expires_in": expires_in}


def verify_admin_token(authorization: Optional[str] = Header(None)) -> dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization required")

    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, ADMIN_JWT_SECRET, algorithms=[ADMIN_JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid or expired token")

    if payload.get("scope") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin scope")

    return payload


@router.get("/users")
def get_users(_auth: dict[str, Any] = Depends(verify_admin_token)) -> list[dict]:
    return [user.model_dump() for user in list_users()]


@router.get("/admin/ats-leads")
def get_ats_leads(_auth: dict[str, Any] = Depends(verify_admin_token)) -> list[dict]:
    return list_ats_leads()


@router.get("/analysis-history")
def get_analysis_history(_auth: dict[str, Any] = Depends(verify_admin_token)) -> list[dict]:
    return list_analysis_history()


@router.get("/analysis-history/export")
def export_analysis_history(_auth: dict[str, Any] = Depends(verify_admin_token)) -> Response:
    history = list_analysis_history()

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
    writer.writerow([
        "id", "created_at", "job_description", "ats_score",
        "contact_score", "keywords_score", "experience_score", "formatting_score",
        "strengths", "issues", "suggested_keywords", "suggested_keywords_relevance",
    ])

    for row in history:
        scores = row.get("component_scores", {})
        writer.writerow([
            row.get("id", ""),
            row.get("created_at", ""),
            row.get("job_description", ""),
            row.get("ats_score", ""),
            scores.get("contact", ""),
            scores.get("keywords", ""),
            scores.get("experience", ""),
            scores.get("formatting", ""),
            "; ".join(row.get("strengths", [])),
            "; ".join(row.get("issues", [])),
            "; ".join(row.get("suggested_keywords", [])),
            "; ".join(
                f"{item.get('keyword')}:{item.get('relevance')}"
                for item in row.get("suggested_keywords_relevance", [])
            ),
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=analysis_history.csv"},
    )


class UpdateLeadRequest(BaseModel):
    status: Optional[str] = Field(None, description=f"One of: {', '.join(sorted(VALID_STATUSES))}")
    notes: Optional[str] = Field(None, max_length=2000)


@router.patch("/admin/users/{user_id}")
def update_lead_status(
    user_id: int,
    payload: UpdateLeadRequest,
    _auth: dict[str, Any] = Depends(verify_admin_token),
) -> dict:
    if payload.status and payload.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{payload.status}'. Valid: {', '.join(sorted(VALID_STATUSES))}",
        )
    updated = update_lead(user_id, payload.status, payload.notes)
    if not updated:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found.")
    return {"success": True, "user_id": user_id, "status": payload.status, "notes": payload.notes}


@router.delete("/admin/users/{user_id}")
def delete_lead(
    user_id: int,
    _auth: dict[str, Any] = Depends(verify_admin_token),
) -> dict:
    deleted = delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found.")
    return {"success": True, "deleted_id": user_id}


# ── Offer Timer (public read, admin write) ────────────────────────────────


def _parse_offer_status(end_time_str: str | None) -> dict:
    if not end_time_str:
        return {"status": "not_set", "end_time": None, "remaining_seconds": 0}
    try:
        end = datetime.fromisoformat(end_time_str)
        if end.tzinfo is None:
            end = end.replace(tzinfo=timezone.utc)
        remaining = (end - datetime.now(timezone.utc)).total_seconds()
        if remaining <= 0:
            return {"status": "expired", "end_time": end_time_str, "remaining_seconds": 0}
        return {"status": "active", "end_time": end_time_str, "remaining_seconds": int(remaining)}
    except Exception:
        return {"status": "not_set", "end_time": None, "remaining_seconds": 0}


@router.get("/settings/offer")
def get_offer_public() -> dict:
    """Public endpoint — any visitor fetches the current offer deadline."""
    end_time = get_setting("offer_end_time")
    label    = get_setting("offer_label") or "🔥 ₹1 Offer Ends In:"
    result   = _parse_offer_status(end_time)
    result["label"] = label
    return result


class SetOfferRequest(BaseModel):
    hours: Optional[float] = None          # hours from now (e.g. 2, 6, 24)
    end_time: Optional[str] = None         # explicit ISO datetime string
    label: Optional[str] = Field(None, max_length=80)  # custom banner label
    clear: bool = False                    # remove the offer entirely


@router.post("/admin/settings/offer")
def set_offer(
    payload: SetOfferRequest,
    _auth: dict[str, Any] = Depends(verify_admin_token),
) -> dict:
    if payload.clear:
        set_setting("offer_end_time", "")
        return {"status": "cleared"}

    if payload.label is not None:
        set_setting("offer_label", payload.label)

    if payload.end_time:
        set_setting("offer_end_time", payload.end_time)
        return _parse_offer_status(payload.end_time)

    if payload.hours and payload.hours > 0:
        end = datetime.now(timezone.utc) + timedelta(hours=payload.hours)
        end_iso = end.isoformat()
        set_setting("offer_end_time", end_iso)
        return _parse_offer_status(end_iso)

    raise HTTPException(status_code=400, detail="Provide hours, end_time, or clear=true.")


@router.get("/admin/test-email")
def test_email(_: dict[str, Any] = Depends(verify_admin_token)) -> dict:
    result = test_smtp_connection()
    if not result["ok"]:
        raise HTTPException(status_code=503, detail=result["error"])
    return result
