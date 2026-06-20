from fastapi import APIRouter, status

from models.schemas import RegistrationResponse, UserRegistration
from services.db import create_user
from services.emailer import send_registration_email

router = APIRouter(tags=["registration"])


@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegistration) -> RegistrationResponse:
    user_id = create_user(payload)
    send_registration_email(payload, user_id)
    return RegistrationResponse(
        success=True,
        message="Registration received. Our team will contact you shortly.",
        user_id=user_id,
    )
