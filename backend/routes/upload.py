import io
import logging
import os
import uuid
from pathlib import Path

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["upload"])

ALLOWED_EXT = {".pdf", ".doc", ".docx"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
LOCAL_FALLBACK_DIR = Path("uploads")  # used only when S3 is not configured

CONTENT_TYPES = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


# ── S3 helpers ─────────────────────────────────────────────────────────────────

def _s3_configured() -> bool:
    return bool(
        os.getenv("AWS_ACCESS_KEY_ID")
        and os.getenv("AWS_SECRET_ACCESS_KEY")
        and os.getenv("S3_BUCKET_NAME")
    )


def _get_s3_client():
    import sys
    # Skip SSL verify on Windows dev — Linux/EC2 production keeps it enabled.
    verify_ssl = sys.platform != "win32"
    return boto3.client(
        "s3",
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        verify=verify_ssl,
        # Force SigV4 — removes AWSAccessKeyId from the presigned URL query string
        config=Config(signature_version="s3v4"),
    )


def _upload_to_s3(content: bytes, key: str, ext: str) -> str:
    """Upload bytes to S3 and return the public HTTPS URL."""
    bucket = os.getenv("S3_BUCKET_NAME")
    region = os.getenv("AWS_REGION", "ap-south-1")

    client = _get_s3_client()
    client.upload_fileobj(
        io.BytesIO(content),
        bucket,
        key,
        ExtraArgs={
            "ContentType": CONTENT_TYPES.get(ext, "application/octet-stream"),
            # Files are private by default — use presigned URL or set ACL below
            # "ACL": "public-read",  # uncomment if bucket allows public objects
        },
    )

    # Generate a presigned URL valid for 7 days so the recruiter can download it
    presigned_url = client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=7 * 24 * 3600,  # 7 days
    )
    return presigned_url


# ── Local fallback (dev / no S3 configured) ───────────────────────────────────

def _upload_locally(content: bytes, filename: str) -> str:
    LOCAL_FALLBACK_DIR.mkdir(parents=True, exist_ok=True)
    save_path = LOCAL_FALLBACK_DIR / filename
    with open(save_path, "wb") as fp:
        fp.write(content)
    base = os.getenv("BASE_URL", "http://localhost:8000").rstrip("/")
    return f"{base}/uploads/{filename}"


# ── Route ─────────────────────────────────────────────────────────────────────

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)) -> JSONResponse:
    """
    Accept a resume upload, store it on AWS S3 (or local fallback),
    and return a download URL to embed in the WhatsApp message.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_EXT))}",
        )

    content = await file.read()

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file provided.")

    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File too large. Maximum 5 MB allowed.")

    # Build a unique S3 key: resumes/2026/06/uuid.pdf
    from datetime import datetime
    date_prefix = datetime.utcnow().strftime("%Y/%m")
    unique_name = f"{uuid.uuid4().hex}{ext}"
    s3_key = f"resumes/{date_prefix}/{unique_name}"

    try:
        if _s3_configured():
            url = _upload_to_s3(content, s3_key, ext)
            storage = "s3"
            logger.info("Resume uploaded to S3: %s", s3_key)
        else:
            # S3 not configured — save locally (dev mode)
            url = _upload_locally(content, unique_name)
            storage = "local"
            logger.warning(
                "S3 not configured. Resume saved locally: %s. "
                "Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME in .env to enable S3.",
                unique_name,
            )
    except (BotoCoreError, ClientError) as exc:
        logger.error("S3 upload failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to store resume on S3: {exc}. Check AWS credentials in .env.",
        )

    return JSONResponse(
        content={
            "url": url,
            "original_filename": file.filename,
            "size_kb": round(len(content) / 1024, 1),
            "storage": storage,
        },
        status_code=201,
    )
