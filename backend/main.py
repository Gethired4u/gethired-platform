from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import admin, register, resume
from services.db import init_db

app = FastAPI(
    title="Job Cracking Platform API",
    version="1.0.0",
    description="Manual-operations backend for Job Cracking Platform V1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    init_db()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(resume.router)
app.include_router(register.router)
app.include_router(admin.router)
