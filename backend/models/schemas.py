from pydantic import BaseModel, EmailStr, Field


class UserRegistration(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=30)
    experience: str = Field(..., min_length=1, max_length=120)
    role: str = Field(..., min_length=1, max_length=120)
    services_interested: list[str] = Field(default_factory=list)
    lead_source: str = Field(default="web", max_length=120)
    recommended_plan: str | None = Field(default=None, max_length=160)
    quiz_answers: dict[str, str] = Field(default_factory=dict)
    email_token: str | None = Field(default=None)
    resume_url: str | None = Field(default=None)


class UserRecord(BaseModel):
    id: int
    registration_id: str = ""
    name: str
    email: EmailStr
    phone: str
    experience: str
    role: str
    services_interested: list[str]
    lead_source: str = "web"
    recommended_plan: str | None = None
    quiz_answers: dict[str, str] = Field(default_factory=dict)
    created_at: str
    resume_url: str | None = None
    # CRM fields
    status: str = "new"
    notes: str | None = None
    contacted_at: str | None = None
    converted_at: str | None = None
    # Payment fields
    payment_status: str = "pending"
    payment_amount: float = 0


class RegistrationResponse(BaseModel):
    success: bool
    message: str
    registration_id: str


class ResumeIssue(BaseModel):
    title: str
    detail: str


class SuggestedKeyword(BaseModel):
    keyword: str
    relevance: float


class ResumeAnalysisResponse(BaseModel):
    ats_score: float
    summary: str
    issues: list[ResumeIssue]
    strengths: list[str] = []
    component_scores: dict[str, float] = {}
    strength_heatmap: list[dict] = []
    suggested_keywords: list[str]
    suggested_keywords_relevance: list[SuggestedKeyword] = []
    # Position-specific gap analysis
    position_requirements: list[str] = []
    missing_requirements: list[str] = []
    experience_fit: str = ""
    format_feedback: list[str] = []


class AnalysisHistory(BaseModel):
    id: int
    created_at: str
    job_description: str
    ats_score: float
    component_scores: dict[str, float]
    strengths: list[str]
    issues: list[str]
    suggested_keywords: list[str]
    suggested_keywords_relevance: list[SuggestedKeyword]
