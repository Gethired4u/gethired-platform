import random

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from pydantic import BaseModel, EmailStr

from models.schemas import RegistrationResponse, UserRegistration
from services.db import (
    consume_reg_otp_token,
    create_user,
    save_reg_otp,
    verify_reg_otp,
)
from services.emailer import (
    send_admin_notification,
    send_reg_otp_email,
    send_registration_email,
)

router = APIRouter(tags=["registration"])


class OtpRequest(BaseModel):
    email: EmailStr
    name: str = "there"


class OtpVerify(BaseModel):
    email: EmailStr
    otp: str


def _send_all_emails(payload: UserRegistration, registration_id: str) -> None:
    send_registration_email(payload, registration_id)
    send_admin_notification(payload, registration_id)


def _send_reg_otp_bg(email: str, name: str, otp: str) -> None:
    send_reg_otp_email(email, name, otp)


@router.post("/register/send-otp", status_code=status.HTTP_200_OK)
def send_registration_otp(payload: OtpRequest, background_tasks: BackgroundTasks):
    from datetime import datetime, timedelta, timezone

    otp = str(random.randint(100000, 999999))
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    save_reg_otp(payload.email, otp, expires_at)
    background_tasks.add_task(_send_reg_otp_bg, payload.email, payload.name, otp)
    return {"sent": True, "message": "OTP sent to your email."}


@router.post("/register/verify-otp", status_code=status.HTTP_200_OK)
def verify_registration_otp(payload: OtpVerify):
    token = verify_reg_otp(payload.email, payload.otp)
    if not token:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP. Please try again.")
    return {"verified": True, "token": token}


@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegistration, background_tasks: BackgroundTasks) -> RegistrationResponse:
    if payload.email_token:
        if not consume_reg_otp_token(payload.email, payload.email_token):
            raise HTTPException(
                status_code=400,
                detail="Email verification token is invalid or expired. Please verify your email again.",
            )

    _db_id, registration_id = create_user(payload)
    background_tasks.add_task(_send_all_emails, payload, registration_id)
    return RegistrationResponse(
        success=True,
        message="Registration received. Our team will contact you shortly.",
        registration_id=registration_id,
    )
