import json
import os
import re
import pdfplumber
from docx import Document
from typing import Any, Dict, List, Optional, Tuple
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from pathlib import Path
import logging

from models.schemas import ResumeAnalysisResponse, ResumeIssue

try:
    from openai import OpenAI
except ImportError:  # Optional dependency; deterministic ATS scoring still works.
    OpenAI = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ATSResumeAnalyzer:
    def __init__(self):
        # Load spaCy model for NLP processing
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None

        # ATS Keywords by category
        self.ats_keywords = {
            'technical_skills': [
                'python', 'java', 'javascript', 'react', 'node.js', 'sql', 'nosql',
                'aws', 'azure', 'docker', 'kubernetes', 'git', 'ci/cd', 'agile',
                'scrum', 'linux', 'api', 'rest', 'graphql', 'microservices'
            ],
            'soft_skills': [
                'leadership', 'communication', 'problem solving', 'teamwork',
                'project management', 'stakeholder management', 'analytical thinking'
            ],
            'industry_terms': [
                'machine learning', 'data science', 'artificial intelligence',
                'cloud computing', 'devops', 'cybersecurity', 'blockchain'
            ]
        }

        # Pre-built vectorizer — reused across requests to avoid object creation overhead.
        self._tfidf_vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)

        # Common ATS formatting issues
        self.formatting_checks = [
            'contact_info_format',
            'summary_section',
            'experience_bullets',
            'education_format',
            'skills_section',
            'consistent_formatting'
        ]

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text content from PDF files."""
        try:
            with pdfplumber.open(file_path) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
        except Exception as e:
            logger.error(f"Error extracting PDF text: {e}")
            return ""

    def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text content from Word documents."""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {e}")
            return ""

    def extract_text_from_file(self, file_path: str) -> str:
        """Extract text from various file formats."""
        file_extension = Path(file_path).suffix.lower()

        if file_extension == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif file_extension in ['.docx', '.doc']:
            return self.extract_text_from_docx(file_path)
        else:
            # Assume plain text file
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            except Exception as e:
                logger.error(f"Error reading file: {e}")
                return ""

    def analyze_contact_info(self, text: str) -> Dict[str, Any]:
        """Analyze contact information section."""
        contact_score = 0
        issues = []

        # Check for email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        if re.search(email_pattern, text):
            contact_score += 25
        else:
            issues.append(ResumeIssue(
                title="Missing Email",
                detail="No email address found in the resume."
            ))

        strengths = []

        # Check for phone number
        phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
        if re.search(phone_pattern, text):
            contact_score += 25
            strengths.append("Phone number is present and readable.")
        else:
            issues.append(ResumeIssue(
                title="Missing Phone Number",
                detail="No phone number found in the resume."
            ))

        # Check for LinkedIn/GitHub
        if 'linkedin.com' in text.lower() or 'github.com' in text.lower():
            contact_score += 25
            strengths.append("Professional links found (LinkedIn/GitHub).")
        else:
            issues.append(ResumeIssue(
                title="Missing Professional Links",
                detail="Consider adding LinkedIn or GitHub profile links."
            ))

        # Check for location
        if any(word in text.lower() for word in ['location', 'address', 'city', 'state']):
            contact_score += 25
            strengths.append("Location or address information available.")

        return {
            'score': contact_score,
            'issues': issues,
            'strengths': strengths
        }

    def analyze_keywords(self, text: str, job_description: str = "") -> Dict[str, Any]:
        """Analyze keyword relevance and density."""
        text_lower = text.lower()
        keyword_score = 0
        found_keywords = []
        missing_keywords = []

        # Analyze keyword presence across categories
        for category, keywords in self.ats_keywords.items():
            category_keywords = [kw for kw in keywords if kw.lower() in text_lower]
            found_keywords.extend(category_keywords)

            # Score based on keyword density
            keyword_density = len(category_keywords) / len(keywords) * 100
            keyword_score += min(keyword_density, 25)  # Cap at 25 points per category

        # If job description provided, check for job-specific keywords
        jd_keywords = []
        if job_description:
            jd_keywords = self.extract_keywords_from_jd(job_description)
            if jd_keywords:
                jd_matches = [kw for kw in jd_keywords if kw.lower() in text_lower]
                jd_score = (len(jd_matches) / len(jd_keywords)) * 30
                keyword_score += jd_score

        # Only suggest keywords that are actually missing from the JD — no generic fallback.
        # Groq will add role-specific keywords on top of these.
        missing_keywords = []
        suggested_keywords_relevance = []

        if jd_keywords:
            missing_keywords = [kw for kw in jd_keywords if kw.lower() not in text_lower]
            suggested_keywords_relevance = [
                {'keyword': kw, 'relevance': 90.0} for kw in missing_keywords
            ]

        missing_keywords = missing_keywords[:5]
        suggested_keywords_relevance = suggested_keywords_relevance[:5]

        strengths = []
        if keyword_score >= 60:
            strengths.append("Good keyword coverage for relevant ATS terms.")

        return {
            'score': min(keyword_score, 100),
            'found_keywords': found_keywords[:10],  # Top 10 found keywords
            'missing_keywords': missing_keywords,
            'suggested_keywords_relevance': suggested_keywords_relevance,
            'strengths': strengths
        }

    def extract_keywords_from_jd(self, job_description: str) -> List[str]:
        """Extract relevant keywords from job description."""
        if not self.nlp:
            return []

        doc = self.nlp(job_description.lower())
        keywords = []

        # Extract nouns, proper nouns, and technical terms
        for token in doc:
            if token.pos_ in ['NOUN', 'PROPN'] and len(token.text) > 2:
                keywords.append(token.text)

        return list(set(keywords))[:20]  # Return top 20 unique keywords

    def analyze_experience_section(self, text: str) -> Dict[str, Any]:
        """Analyze work experience section quality."""
        experience_score = 0
        issues = []

        # Check for quantifiable achievements
        quantifiable_patterns = [
            r'\d+%',  # Percentage improvements
            r'\$\d+',  # Dollar amounts
            r'\d+\s*(?:users?|customers?|clients?)',  # User/customer counts
            r'(?:increased|decreased|improved|reduced)\s+by\s+\d+',
        ]

        quantifiable_matches = 0
        for pattern in quantifiable_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                quantifiable_matches += 1

        experience_score += min(quantifiable_matches * 15, 40)

        # Check for action verbs
        action_verbs = [
            'developed', 'created', 'implemented', 'managed', 'led', 'designed',
            'optimized', 'improved', 'increased', 'reduced', 'achieved', 'delivered'
        ]

        action_verb_count = sum(1 for verb in action_verbs if verb in text.lower())
        experience_score += min(action_verb_count * 5, 30)

        # Check for bullet points structure
        bullet_patterns = [r'^\s*[•\-\*]\s', r'^\s*\d+\.\s']
        bullet_lines = sum(1 for line in text.split('\n') if re.search('|'.join(bullet_patterns), line))
        experience_score += min(bullet_lines * 2, 30)

        strengths = []
        if quantifiable_matches >= 2:
            strengths.append("Good use of quantifiable achievements.")
        else:
            issues.append(ResumeIssue(
                title="Lack of Quantifiable Achievements",
                detail="Include specific metrics and numbers to show impact (e.g., 'Increased sales by 25%')."
            ))

        if action_verb_count >= 3:
            strengths.append("Strong use of action verbs.")
        else:
            issues.append(ResumeIssue(
                title="Weak Action Verbs",
                detail="Use strong action verbs like 'developed', 'implemented', 'optimized' instead of 'worked on'."
            ))

        if bullet_lines >= 3:
            strengths.append("Good bullet point structure in experience section.")

        return {
            'score': experience_score,
            'issues': issues,
            'strengths': strengths
        }

    def analyze_formatting(self, text: str) -> Dict[str, Any]:
        """Analyze resume formatting for ATS compatibility."""
        formatting_score = 100
        issues = []

        lines = text.split('\n')

        # Check for consistent section headers
        section_headers = ['experience', 'education', 'skills', 'projects', 'summary', 'objective']
        found_headers = sum(1 for header in section_headers if header.lower() in text.lower())
        if found_headers < 3:
            formatting_score -= 20
            issues.append(ResumeIssue(
                title="Missing Section Headers",
                detail="Include clear section headers like 'Experience', 'Education', 'Skills'."
            ))

        # Check for reasonable line lengths (ATS prefers shorter lines)
        long_lines = sum(1 for line in lines if len(line.strip()) > 80)
        if long_lines > len(lines) * 0.3:  # More than 30% long lines
            formatting_score -= 15
            issues.append(ResumeIssue(
                title="Line Length Issues",
                detail="Keep lines under 80 characters for better ATS parsing."
            ))

        # Check for special characters that might confuse ATS
        special_chars = sum(1 for char in text if ord(char) > 127)
        strengths = []

        if special_chars > 50:
            formatting_score -= 10
            issues.append(ResumeIssue(
                title="Special Characters",
                detail="Minimize special characters and symbols that might confuse ATS systems."
            ))
        else:
            strengths.append("Minimal special characters—good for ATS parsing.")

        if found_headers >= 3:
            strengths.append("Clear section headers are present.")

        if long_lines <= len(lines) * 0.3:
            strengths.append("Line lengths are within ATS-friendly limits.")

        return {
            'score': max(formatting_score, 0),
            'issues': issues,
            'strengths': strengths
        }

    def calculate_semantic_similarity(self, resume_text: str, job_description: str) -> float:
        """Calculate semantic similarity between resume and job description."""
        if not job_description:
            return 0.0

        try:
            tfidf_matrix = self._tfidf_vectorizer.fit_transform([resume_text, job_description])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity * 100)
        except Exception as e:
            logger.error(f"Error calculating similarity: {e}")
            return 0.0

    def generate_recommendations(self, analysis_results: Dict) -> List[str]:
        """Generate personalized recommendations based on analysis."""
        recommendations = []

        overall_score = analysis_results.get('overall_score', 0)

        if overall_score < 60:
            recommendations.append("Focus on adding relevant keywords and improving overall structure.")
        elif overall_score < 80:
            recommendations.append("Good foundation! Enhance with quantifiable achievements and better formatting.")
        else:
            recommendations.append("Excellent resume! Consider tailoring further for specific job applications.")

        # Add specific recommendations based on component scores
        if analysis_results.get('keyword_score', 0) < 50:
            recommendations.append("Add more industry-specific keywords relevant to your target roles.")

        if analysis_results.get('experience_score', 0) < 50:
            recommendations.append("Strengthen experience section with specific achievements and metrics.")

        if analysis_results.get('formatting_score', 0) < 70:
            recommendations.append("Improve formatting consistency and ATS-friendly structure.")

        return recommendations

    def _deterministic_format_feedback(self, text: str, experience_level: str) -> List[str]:
        """Rule-based format checks that run even without Groq."""
        feedback = []
        lower = text.lower()

        if "linkedin.com" not in lower:
            feedback.append("Add your LinkedIn profile URL — recruiters check this before calling.")
        if "github.com" not in lower and any(w in lower for w in ["software", "developer", "engineer", "data", "python", "java"]):
            feedback.append("Add a GitHub link to showcase your code and projects.")
        if not any(s in lower for s in ["summary", "objective", "profile", "about me"]):
            feedback.append("Add a 2–3 line professional summary at the top tailored to the target role.")
        if not re.search(r'\b(19|20)\d{2}\b', text):
            feedback.append("Include employment/education dates so ATS can parse your timeline.")

        # Check if bullet points have action verbs
        lines = text.split('\n')
        bullet_lines = [l.strip() for l in lines if re.match(r'^[•\-\*]', l.strip())]
        action_verbs = ['developed', 'built', 'led', 'managed', 'designed', 'implemented',
                        'created', 'achieved', 'improved', 'reduced', 'increased', 'delivered',
                        'launched', 'mentored', 'automated', 'optimised', 'analyzed', 'deployed']
        weak_bullets = [b for b in bullet_lines if not any(v in b.lower() for v in action_verbs)]
        if len(weak_bullets) > 2:
            feedback.append("Rewrite bullet points to start with strong action verbs (built, delivered, improved…).")

        # Experience-level specific checks
        exp_lower = experience_level.lower() if experience_level else ""
        is_fresher = any(w in exp_lower for w in ["fresher", "0", "student", "graduate"])
        is_senior = any(w in exp_lower for w in ["5", "6", "7", "8", "10", "senior", "lead", "manager"])

        if is_fresher:
            if "project" not in lower:
                feedback.append("Add at least 2 academic or personal projects — freshers are evaluated primarily on projects.")
            if not any(w in lower for w in ["intern", "internship", "trainee"]):
                feedback.append("Include any internship or training experience, even short ones.")
            if not any(w in lower for w in ["certification", "certificate", "certified", "course"]):
                feedback.append("List certifications or online courses (Coursera, NPTEL, etc.) to strengthen credibility.")
        if is_senior:
            if not any(w in lower for w in ["team", "led", "managed", "mentored", "supervised"]):
                feedback.append("Highlight team leadership and mentoring — senior roles expect this evidence.")
            if not re.search(r'\d+\s*(people|engineers|members|reports)', lower):
                feedback.append("Quantify team size you managed (e.g. 'Led a team of 6 engineers').")

        return feedback[:6]

    def generate_ai_insights(self, resume_text: str, job_description: str, ats_score: float, experience_level: str = "") -> Dict[str, Any]:
        """Use Groq for position-specific gap analysis, requirements, and format review."""
        api_key = os.getenv("GROQ_API_KEY", "").strip()
        if not api_key or OpenAI is None:
            return {}

        exp_guide = {
            "fresher": "Judge on: academic projects (min 2), internships, certifications, technical skills match, CGPA if strong.",
            "0–1 year": "Judge on: first-job contributions, skills applied in practice, quick learning signals, project ownership.",
            "1–3 years": "Judge on: technical depth, cross-functional contributions, measurable impact, clear role progression.",
            "3–5 years": "Judge on: ownership of deliverables, leadership hints, quantified P&L or scale impact, mentoring evidence.",
            "5–8 years": "Judge on: team leadership, architectural decisions, business impact, people management examples.",
            "8+ years": "Judge on: organizational impact, strategic decisions, talent development, P&L ownership, executive presence.",
        }
        exp_lower = experience_level.lower() if experience_level else ""
        exp_instruction = next((v for k, v in exp_guide.items() if k in exp_lower), "Judge based on stated experience level.")

        prompt = f"""You are a senior HR consultant and ATS specialist with 15 years of experience in the Indian job market. You screen resumes for companies like TCS, Infosys, Wipro, Zoho, Swiggy, Razorpay, and top MNCs.

You have 3 inputs. Evaluate the resume SPECIFICALLY for the target position at the given experience level. Be concrete — never give generic advice.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUT 1 — TARGET POSITION / JOB DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{job_description[:2500]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUT 2 — CANDIDATE EXPERIENCE LEVEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{experience_level if experience_level else "Not specified"}
Evaluation guide for this level: {exp_instruction}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUT 3 — RESUME CONTENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deterministic ATS score: {ats_score:.1f}/100

{resume_text[:5500]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR EVALUATION TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. List what THIS specific position requires (use the actual JD, not generic).
2. Find what is concretely MISSING from this resume for the role — name it precisely.
3. Give FORMAT fixes that would make this resume get past ATS and impress a recruiter.
4. State the experience fit verdict honestly — does the level match the role?
5. Flag the 5 ATS keywords from the JD that are absent from the resume.

Return ONLY valid JSON. No markdown. No explanation outside JSON:
{{
  "summary": "2 honest sentences — what this resume does well and what its main weakness is FOR THIS ROLE",
  "experience_fit": "one crisp verdict — e.g. 'Strong match: 3 years aligns with mid-level backend role' or 'Gap: applying for senior role with only 1 year experience — bridge with strong project leadership'",
  "position_requirements": [
    "5–7 specific requirements for THIS position pulled from the JD — not generic"
  ],
  "missing_requirements": [
    "concrete gaps — e.g. 'No SQL experience mentioned despite Data Analyst role requiring it', NOT 'improve technical skills'"
  ],
  "format_feedback": [
    "specific fixes — e.g. 'LinkedIn URL missing', 'No professional summary at top', 'Bullet points describe tasks not outcomes', 'Skills section mixes tools and soft skills — separate them', 'No quantified achievements in experience section'"
  ],
  "strengths": [
    "up to 3 genuine resume strengths relevant to this specific role"
  ],
  "issues": [
    {{"title": "max 6-word title", "detail": "specific fix for this role and experience level — not generic"}}
  ],
  "keywords": [
    "5 ATS keywords from the JD that are missing from the resume"
  ]
}}"""

        try:
            client = OpenAI(
                api_key=api_key,
                base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
            )
            response = client.chat.completions.create(
                model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
                messages=[
                    {
                        "role": "system",
                        "content": "You are a strict JSON responder. Return only valid JSON. No markdown fences, no explanation.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.15,
            )
            raw = (response.choices[0].message.content or "{}").strip()
            # Strip accidental markdown fences if present
            if raw.startswith("```"):
                raw = re.sub(r"^```[a-z]*\n?", "", raw)
                raw = re.sub(r"\n?```$", "", raw)
            return json.loads(raw)
        except Exception as exc:
            logger.warning("Groq resume insight generation failed: %s", exc)
            return {}

    def analyze_resume(self, file_path: str, job_description: str = "", experience_level: str = "") -> ResumeAnalysisResponse:
        """Main analysis function that orchestrates all checks."""
        try:
            # Extract text from file
            resume_text = self.extract_text_from_file(file_path)

            if not resume_text:
                return ResumeAnalysisResponse(
                    ats_score=0,
                    summary="Unable to extract text from resume file. Please check file format.",
                    issues=[ResumeIssue(
                        title="File Processing Error",
                        detail="Could not read resume content. Ensure file is PDF, DOCX, or plain text."
                    )],
                    suggested_keywords=[]
                )

            # Perform individual analyses
            contact_analysis = self.analyze_contact_info(resume_text)
            keyword_analysis = self.analyze_keywords(resume_text, job_description)
            experience_analysis = self.analyze_experience_section(resume_text)
            formatting_analysis = self.analyze_formatting(resume_text)

            # Calculate semantic similarity if job description provided
            semantic_score = self.calculate_semantic_similarity(resume_text, job_description)

            # Calculate weighted overall score
            overall_score = (
                contact_analysis['score'] * 0.15 +      # 15% weight
                keyword_analysis['score'] * 0.35 +      # 35% weight
                experience_analysis['score'] * 0.30 +   # 30% weight
                formatting_analysis['score'] * 0.20     # 20% weight
            )

            # Adjust for semantic similarity if job description provided
            if job_description:
                overall_score = (overall_score * 0.7) + (semantic_score * 0.3)

            overall_score = min(max(overall_score, 0), 100)

            # Combine all issues + strengths
            all_issues = (
                contact_analysis.get('issues', []) +
                experience_analysis.get('issues', []) +
                formatting_analysis.get('issues', [])
            )

            all_strengths = (
                contact_analysis.get('strengths', []) +
                keyword_analysis.get('strengths', []) +
                experience_analysis.get('strengths', []) +
                formatting_analysis.get('strengths', [])
            )

            # Generate summary
            summary = self._generate_summary(overall_score, keyword_analysis, semantic_score, job_description)

            # Generate recommendations
            recommendations = self.generate_recommendations({
                'overall_score': overall_score,
                'keyword_score': keyword_analysis['score'],
                'experience_score': experience_analysis['score'],
                'formatting_score': formatting_analysis['score']
            })

            # Add recommendations as additional issues with "recommendation" type
            for rec in recommendations[:3]:  # Limit to top 3 recommendations
                all_issues.append(ResumeIssue(
                    title="Recommendation",
                    detail=rec
                ))

            suggested_keywords = keyword_analysis.get('missing_keywords', [])[:5]
            suggested_keywords_relevance = keyword_analysis.get('suggested_keywords_relevance', [])[:5]

            component_scores = {
                'contact': contact_analysis.get('score', 0),
                'keywords': keyword_analysis.get('score', 0),
                'experience': experience_analysis.get('score', 0),
                'formatting': formatting_analysis.get('score', 0),
            }

            strength_heatmap = sorted(
                [
                    {'name': k.capitalize(), 'score': v}
                    for k, v in component_scores.items()
                ],
                key=lambda x: x['score'],
                reverse=True
            )[:3]

            # Deterministic format feedback (runs always)
            det_format_feedback = self._deterministic_format_feedback(resume_text, experience_level)

            ai_insights = self.generate_ai_insights(resume_text, job_description, overall_score, experience_level)
            if ai_insights:
                ai_summary = str(ai_insights.get("summary", "")).strip()
                if ai_summary:
                    summary = ai_summary  # AI summary is role-specific — use it directly

                for strength in ai_insights.get("strengths", [])[:3]:
                    if strength:
                        all_strengths.append(str(strength))

                for issue in ai_insights.get("issues", [])[:3]:
                    if isinstance(issue, dict):
                        all_issues.append(ResumeIssue(
                            title=str(issue.get("title", "AI Recommendation")),
                            detail=str(issue.get("detail", "")),
                        ))

                # Groq keywords are role-specific — use them as the primary list.
                # Any JD-extracted keywords not already there get appended after.
                groq_kws = [str(k).strip() for k in ai_insights.get("keywords", []) if str(k).strip()]
                if groq_kws:
                    # Start fresh with Groq keywords as the authoritative list
                    suggested_keywords = groq_kws[:5]
                    suggested_keywords_relevance = [
                        {"keyword": kw, "relevance": 95.0} for kw in suggested_keywords
                    ]
                else:
                    # Groq returned nothing — keep JD-extracted keywords
                    suggested_keywords = suggested_keywords[:5]
                    suggested_keywords_relevance = suggested_keywords_relevance[:5]

            # Merge AI format feedback with deterministic checks (deduplicate)
            ai_format = [str(f) for f in ai_insights.get("format_feedback", [])] if ai_insights else []
            merged_format = ai_format + [f for f in det_format_feedback if f not in ai_format]

            position_requirements = [str(r) for r in ai_insights.get("position_requirements", [])] if ai_insights else []
            missing_requirements = [str(r) for r in ai_insights.get("missing_requirements", [])] if ai_insights else []
            experience_fit = str(ai_insights.get("experience_fit", "")) if ai_insights else ""

            return ResumeAnalysisResponse(
                ats_score=round(overall_score, 1),
                summary=summary,
                issues=all_issues,
                strengths=all_strengths,
                component_scores=component_scores,
                strength_heatmap=strength_heatmap,
                suggested_keywords=suggested_keywords,
                suggested_keywords_relevance=suggested_keywords_relevance,
                position_requirements=position_requirements,
                missing_requirements=missing_requirements,
                experience_fit=experience_fit,
                format_feedback=merged_format[:8],
            )

        except Exception as e:
            logger.error(f"Error analyzing resume: {e}")
            return ResumeAnalysisResponse(
                ats_score=0,
                summary="An error occurred during analysis. Please try again.",
                issues=[ResumeIssue(
                    title="Analysis Error",
                    detail=f"Technical error: {str(e)}"
                )],
                suggested_keywords=[]
            )

    def _generate_summary(self, score: float, keyword_analysis: Dict, semantic_score: float, job_description: str) -> str:
        """Generate a human-readable summary of the analysis."""
        if score >= 85:
            summary = f"Excellent resume! Scored {score:.1f}/100. "
        elif score >= 70:
            summary = f"Good resume with room for improvement. Scored {score:.1f}/100. "
        elif score >= 55:
            summary = f"Average resume that needs significant improvements. Scored {score:.1f}/100. "
        else:
            summary = f"Poor resume requiring major revisions. Scored {score:.1f}/100. "

        found_keywords = len(keyword_analysis.get('found_keywords', []))
        summary += f"Found {found_keywords} relevant keywords. "

        if job_description and semantic_score > 0:
            summary += f"Job description match: {semantic_score:.1f}% semantic similarity."

        return summary


# Global analyzer instance
analyzer = ATSResumeAnalyzer()


def analyze_resume(file_name: str, job_description: str = "", experience_level: str = "") -> ResumeAnalysisResponse:
    return analyzer.analyze_resume(file_name, job_description, experience_level)
