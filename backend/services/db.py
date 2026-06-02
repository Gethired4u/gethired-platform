import sqlite3
import threading
import json
from pathlib import Path

from models.schemas import UserRecord, UserRegistration

DB_FILE = Path(__file__).resolve().parent.parent / "job_platform.db"
_lock = threading.Lock()


def _connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def _ensure_user_columns(conn: sqlite3.Connection) -> None:
    existing_columns = {row["name"] for row in conn.execute("PRAGMA table_info(users)").fetchall()}

    if "lead_source" not in existing_columns:
        conn.execute("ALTER TABLE users ADD COLUMN lead_source TEXT NOT NULL DEFAULT 'web'")
    if "recommended_plan" not in existing_columns:
        conn.execute("ALTER TABLE users ADD COLUMN recommended_plan TEXT")
    if "quiz_answers" not in existing_columns:
        conn.execute("ALTER TABLE users ADD COLUMN quiz_answers TEXT NOT NULL DEFAULT '{}'")
    # CRM columns
    if "status" not in existing_columns:
        conn.execute("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'new'")
    if "notes" not in existing_columns:
        conn.execute("ALTER TABLE users ADD COLUMN notes TEXT")
    if "contacted_at" not in existing_columns:
        conn.execute("ALTER TABLE users ADD COLUMN contacted_at TEXT")
    if "converted_at" not in existing_columns:
        conn.execute("ALTER TABLE users ADD COLUMN converted_at TEXT")


def _safe_parse_quiz_answers(payload: str | None) -> dict[str, str]:
    if not payload:
        return {}

    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        return {}

    if not isinstance(data, dict):
        return {}

    normalized: dict[str, str] = {}
    for key, value in data.items():
        normalized[str(key)] = str(value)

    return normalized


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
                    lead_source TEXT NOT NULL DEFAULT 'web',
                    recommended_plan TEXT,
                    quiz_answers TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            _ensure_user_columns(conn)
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS analysis_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    job_description TEXT,
                    ats_score REAL NOT NULL,
                    component_scores TEXT,
                    strengths TEXT,
                    issues TEXT,
                    suggested_keywords TEXT,
                    suggested_keywords_relevance TEXT
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS settings (
                    key   TEXT PRIMARY KEY,
                    value TEXT NOT NULL DEFAULT '',
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.commit()


def get_setting(key: str) -> str | None:
    with _connection() as conn:
        row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
        return row["value"] if row else None


def set_setting(key: str, value: str) -> None:
    with _lock:
        with _connection() as conn:
            conn.execute(
                """
                INSERT INTO settings (key, value, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
                """,
                (key, value),
            )
            conn.commit()


def create_user(user: UserRegistration) -> int:
    services = ",".join(user.services_interested)
    quiz_answers = json.dumps(user.quiz_answers or {})

    with _lock:
        with _connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO users (
                    name,
                    email,
                    phone,
                    experience,
                    role,
                    services_interested,
                    lead_source,
                    recommended_plan,
                    quiz_answers
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user.name,
                    user.email,
                    user.phone,
                    user.experience,
                    user.role,
                    services,
                    user.lead_source,
                    user.recommended_plan,
                    quiz_answers,
                ),
            )
            conn.commit()
            return int(cursor.lastrowid)


def list_users() -> list[UserRecord]:
    with _connection() as conn:
        rows = conn.execute(
            """
            SELECT
                id,
                name,
                email,
                phone,
                experience,
                role,
                services_interested,
                lead_source,
                recommended_plan,
                quiz_answers,
                created_at
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
                lead_source=row["lead_source"] or "web",
                recommended_plan=row["recommended_plan"] or None,
                quiz_answers=_safe_parse_quiz_answers(row["quiz_answers"]),
                created_at=row["created_at"],
                status=row["status"] if "status" in row.keys() else "new",
                notes=row["notes"] if "notes" in row.keys() else None,
                contacted_at=row["contacted_at"] if "contacted_at" in row.keys() else None,
                converted_at=row["converted_at"] if "converted_at" in row.keys() else None,
            )
        )
    return users


VALID_STATUSES = {"new", "contacted", "converted", "not_interested", "closed"}


def update_lead(user_id: int, status: str | None, notes: str | None) -> bool:
    from datetime import datetime, timezone
    if status and status not in VALID_STATUSES:
        return False

    now = datetime.now(timezone.utc).isoformat()
    with _lock:
        with _connection() as conn:
            # Build dynamic SET clause based on what was provided
            updates, params = [], []
            if status:
                updates.append("status = ?")
                params.append(status)
                if status == "contacted":
                    updates.append("contacted_at = ?")
                    params.append(now)
                elif status == "converted":
                    updates.append("converted_at = ?")
                    params.append(now)
            if notes is not None:
                updates.append("notes = ?")
                params.append(notes)
            if not updates:
                return False
            params.append(user_id)
            conn.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", params)
            conn.commit()
            return conn.execute("SELECT changes()").fetchone()[0] > 0


def delete_user(user_id: int) -> bool:
    with _lock:
        with _connection() as conn:
            conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()
            return conn.execute("SELECT changes()").fetchone()[0] > 0


def create_analysis_history(
    job_description: str,
    ats_score: float,
    component_scores: dict,
    strengths: list,
    issues: list,
    suggested_keywords: list,
    suggested_keywords_relevance: list,
) -> int:
    with _lock:
        with _connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO analysis_history (
                    job_description,
                    ats_score,
                    component_scores,
                    strengths,
                    issues,
                    suggested_keywords,
                    suggested_keywords_relevance
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    job_description,
                    ats_score,
                    json.dumps(component_scores),
                    json.dumps(strengths),
                    json.dumps(issues),
                    json.dumps(suggested_keywords),
                    json.dumps(suggested_keywords_relevance),
                ),
            )
            conn.commit()
            return int(cursor.lastrowid)


def list_analysis_history() -> list[dict]:
    with _connection() as conn:
        rows = conn.execute(
            """
            SELECT id, created_at, job_description, ats_score, component_scores,
                   strengths, issues, suggested_keywords, suggested_keywords_relevance
            FROM analysis_history
            ORDER BY id DESC
            """
        ).fetchall()

    history = []
    for row in rows:
        history.append({
            "id": row["id"],
            "created_at": row["created_at"],
            "job_description": row["job_description"],
            "ats_score": row["ats_score"],
            "component_scores": json.loads(row["component_scores"] or "{}"),
            "strengths": json.loads(row["strengths"] or "[]"),
            "issues": json.loads(row["issues"] or "[]"),
            "suggested_keywords": json.loads(row["suggested_keywords"] or "[]"),
            "suggested_keywords_relevance": json.loads(row["suggested_keywords_relevance"] or "[]"),
        })

    return history
