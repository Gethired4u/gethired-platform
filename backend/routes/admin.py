from fastapi import APIRouter

from services.db import list_users

router = APIRouter(tags=["admin"])


@router.get("/users")
def get_users() -> list[dict]:
    users = list_users()
    return [user.model_dump() for user in users]
