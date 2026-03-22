import random

from models.schemas import ResumeAnalysisResponse, ResumeIssue

KEYWORD_BANK = [
    "Leadership",
    "Stakeholder management",
    "System design",
    "Cloud",
    "CI/CD",
    "Data-driven decisions",
    "Problem solving",
    "Cross-functional collaboration",
]

ISSUE_TEMPLATES = [
    ResumeIssue(
        title="Missing keywords",
        detail="Core role-specific terms are missing in skills and project sections.",
    ),
    ResumeIssue(
        title="Weak bullet points",
        detail="Bullet points mention tasks but not impact metrics or outcomes.",
    ),
    ResumeIssue(
        title="Formatting issues",
        detail="Section spacing and heading consistency may reduce ATS readability.",
    ),
]


def analyze_resume(file_name: str) -> ResumeAnalysisResponse:
    score = random.randint(55, 85)
    keyword_count = random.randint(3, 5)
    suggested_keywords = random.sample(KEYWORD_BANK, keyword_count)

    return ResumeAnalysisResponse(
        ats_score=score,
        summary=f"Automated demo analysis completed for {file_name}.",
        issues=ISSUE_TEMPLATES,
        suggested_keywords=suggested_keywords,
    )
