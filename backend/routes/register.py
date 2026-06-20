from fastapi import APIRouter, BackgroundTasks, status

from models.schemas import RegistrationResponse, UserRegistration
from services.db import create_user
from services.emailer import send_admin_notification, send_registration_email

router = APIRouter(tags=["registration"])


def _send_all_emails(payload: UserRegistration, user_id: int) -> None:
    send_registration_email(payload, user_id)   # confirmation → user
    send_admin_notification(payload, user_id)    # new lead alert → support@gethired4u.com


@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegistration, background_tasks: BackgroundTasks) -> RegistrationResponse:
    user_id = create_user(payload)
    background_tasks.add_task(_send_all_emails, payload, user_id)
    return RegistrationResponse(
        success=True,
        message="Registration received. Our team will contact you shortly.",
        user_id=user_id,
    )
