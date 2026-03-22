from fastapi import APIRouter, File, HTTPException, UploadFile

from services.resume_analyzer import analyze_resume

router = APIRouter(tags=["resume"])


@router.post("/analyze-resume")
async def analyze_resume_endpoint(file: UploadFile = File(...)) -> dict:
    filename = file.filename or "resume.pdf"
    is_pdf_type = (file.content_type or "").lower() == "application/pdf"
    is_pdf_name = filename.lower().endswith(".pdf")

    if not (is_pdf_type or is_pdf_name):
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported.")

    # Read upload bytes to ensure full request consumption in demo workflow.
    await file.read()

    result = analyze_resume(filename)
    return result.model_dump()
