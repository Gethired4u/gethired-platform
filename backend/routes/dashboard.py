import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from pydantic import BaseModel

from services.db import (
    get_registrations_by_email,
    save_dashboard_otp,
    verify_dashboard_otp,
)
from services.emailer import send_dashboard_otp_email

router = APIRouter(tags=["dashboard"])


class DashboardOtpRequest(BaseModel):
    email: str


class DashboardVerifyRequest(BaseModel):
    email: str
    otp: str


def _send_otp_bg(email: str, name: str, otp: str) -> None:
    send_dashboard_otp_email(email, name, otp)


# Map internal CRM status → user-friendly label
_STATUS_LABEL = {
    "new": "received",
    "contacted": "inprogress",
    "converted": "completed",
    "not_interested": "closed",
    "closed": "closed",
}


@router.post("/dashboard/send-otp", status_code=status.HTTP_200_OK)
def dashboard_send_otp(payload: DashboardOtpRequest, background_tasks: BackgroundTasks):
    registrations = get_registrations_by_email(payload.email)
    if not registrations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address.",
        )

    name = registrations[0]["name"]
    otp = str(random.randint(100000, 999999))
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    save_dashboard_otp(payload.email, otp, expires_at)
    background_tasks.add_task(_send_otp_bg, payload.email, name, otp)
    return {"sent": True, "message": "OTP sent to your email."}


@router.post("/dashboard/verify-otp", status_code=status.HTTP_200_OK)
def dashboard_verify_otp(payload: DashboardVerifyRequest):
    token = verify_dashboard_otp(payload.email, payload.otp)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP. Please try again.",
        )

    registrations = get_registrations_by_email(payload.email)
    if not registrations:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found.")

    name = registrations[0]["name"]
    plans = []
    for reg in registrations:
        services = [s.strip() for s in (reg["services_interested"] or "").split(",") if s.strip()]
        raw_status = reg["status"] or "new"
        plans.append({
            "reg_id": reg["registration_id"],
            "date": reg["created_at"],
            "services": services,
            "recommended_plan": reg["recommended_plan"],
            "status": _STATUS_LABEL.get(raw_status, "received"),
            "notes": reg["notes"],
            "payment_status": reg.get("payment_status", "pending"),
            "payment_amount": reg.get("payment_amount", 0),
        })

    return {
        "token": token,
        "user": {
            "name": name,
            "email": payload.email.lower(),
            "plans": plans,
        },
    }
