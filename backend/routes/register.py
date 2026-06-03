from fastapi import APIRouter, status

from models.schemas import RegistrationResponse, UserRegistration
from services.db import create_user

router = APIRouter(tags=["registration"])


@router.post("/register-lead", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegistration) -> RegistrationResponse:
    user_id = create_user(payload)
    return RegistrationResponse(
        success=True,
        message="Registration received. Our team will contact you shortly.",
        user_id=user_id,
    )
