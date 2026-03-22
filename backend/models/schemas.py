from pydantic import BaseModel, EmailStr, Field


class UserRegistration(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=30)
    experience: str = Field(..., min_length=1, max_length=120)
    role: str = Field(..., min_length=1, max_length=120)
    services_interested: list[str] = Field(default_factory=list)


class UserRecord(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    experience: str
    role: str
    services_interested: list[str]
    created_at: str


class RegistrationResponse(BaseModel):
    success: bool
    message: str
    user_id: int


class ResumeIssue(BaseModel):
    title: str
    detail: str


class ResumeAnalysisResponse(BaseModel):
    ats_score: int
    summary: str
    issues: list[ResumeIssue]
    suggested_keywords: list[str]
