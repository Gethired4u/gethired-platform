import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

from routes import admin, ats_gate, dashboard, payment, register, resume, upload
from services.db import init_db

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Job Cracking Platform API",
    version="1.0.0",
    description="Manual-operations backend for Job Cracking Platform V1",
)


def _resolve_frontend_origins() -> list[str]:
    raw_origins = os.getenv("FRONTEND_ORIGINS", "").strip()
    if raw_origins:
        return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    # Safe local-development defaults if FRONTEND_ORIGINS is not provided.
    # "null" covers browsers opening the HTML file directly via file://
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "null",
    ]


frontend_origins = _resolve_frontend_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.on_event("startup")
def startup_event() -> None:
    init_db()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(resume.router)
app.include_router(ats_gate.router)
app.include_router(register.router)
app.include_router(admin.router)
app.include_router(upload.router)
app.include_router(payment.router)
app.include_router(dashboard.router)

# Serve uploaded resume files as static assets so the URL we return is accessible
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
