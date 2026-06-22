import logging
import random
import string
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from services.db import email_used_for_ats, save_otp, verify_otp_db
from services.emailer import send_otp_email

logger = logging.getLogger(__name__)

router = APIRouter(tags=["ats-gate"])

# Temporary in-memory store for name/mobile while OTP is pending.
# Keyed by lowercase email. Cleared after session is consumed in resume.py.
_pending: dict[str, dict] = {}


class OtpRequestBody(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    job_role: str = ""


class OtpVerifyBody(BaseModel):
    email: EmailStr
    otp: str


def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


@router.post("/ats/request-otp")
def request_ats_otp(body: OtpRequestBody) -> dict:
    email = body.email.lower().strip()

    if email_used_for_ats(email):
        raise HTTPException(
            status_code=409,
            detail="This email has already used the free ATS check. Each email gets one free check."
        )

    otp = _generate_otp()
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    save_otp(email, otp, expires_at)

    _pending[email] = {
        "name": body.name.strip(),
        "mobile": body.mobile.strip(),
        "job_role": body.job_role.strip(),
    }

    sent = send_otp_email(body.email, body.name.strip(), otp)
    if not sent:
        logger.warning("OTP email delivery failed for %s — check SMTP config", email)

    return {"message": "OTP sent to your email. Valid for 10 minutes."}


@router.post("/ats/verify-otp")
def verify_ats_otp(body: OtpVerifyBody) -> dict:
    email = body.email.lower().strip()
    token = verify_otp_db(email, body.otp.strip())

    if not token:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP. Please check your email and try again."
        )

    return {"verified": True, "session_token": token}
