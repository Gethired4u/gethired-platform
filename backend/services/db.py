import sqlite3
import threading
from pathlib import Path

from models.schemas import UserRecord, UserRegistration

DB_FILE = Path(__file__).resolve().parent.parent / "job_platform.db"
_lock = threading.Lock()


def _connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _lock:
        with _connection() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    experience TEXT NOT NULL,
                    role TEXT NOT NULL,
                    services_interested TEXT NOT NULL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.commit()


def create_user(user: UserRegistration) -> int:
    services = ",".join(user.services_interested)
    with _lock:
        with _connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO users (name, email, phone, experience, role, services_interested)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (user.name, user.email, user.phone, user.experience, user.role, services),
            )
            conn.commit()
            return int(cursor.lastrowid)


def list_users() -> list[UserRecord]:
    with _connection() as conn:
        rows = conn.execute(
            """
            SELECT id, name, email, phone, experience, role, services_interested, created_at
            FROM users
            ORDER BY id DESC
            """
        ).fetchall()

    users: list[UserRecord] = []
    for row in rows:
        users.append(
            UserRecord(
                id=row["id"],
                name=row["name"],
                email=row["email"],
                phone=row["phone"],
                experience=row["experience"],
                role=row["role"],
                services_interested=[s for s in row["services_interested"].split(",") if s],
                created_at=row["created_at"],
            )
        )
    return users
