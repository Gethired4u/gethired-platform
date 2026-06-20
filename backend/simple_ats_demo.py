#!/usr/bin/env python3
"""
Simplified ATS Resume Analyzer Demo
This version works without heavy ML dependencies for demonstration.
"""

import re
from typing import Dict, List
from pathlib import Path

class SimpleATSResumeAnalyzer:
    def __init__(self):
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

    def extract_text_from_file(self, file_path: str) -> str:
        """Extract text from various file formats (simplified version)."""
        file_extension = Path(file_path).suffix.lower()

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading file: {e}")
            return ""

    def analyze_contact_info(self, text: str) -> Dict:
        """Analyze contact information section."""
        contact_score = 0
        issues = []

        # Check for email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        if re.search(email_pattern, text):
            contact_score += 25
        else:
            issues.append({
                'title': "Missing Email",
                'detail': "No email address found in the resume."
            })

        # Check for phone number
        phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
        if re.search(phone_pattern, text):
            contact_score += 25
        else:
            issues.append({
                'title': "Missing Phone Number",
                'detail': "No phone number found in the resume."
            })

        # Check for LinkedIn/GitHub
        if 'linkedin.com' in text.lower() or 'github.com' in text.lower():
            contact_score += 25
        else:
            issues.append({
                'title': "Missing Professional Links",
                'detail': "Consider adding LinkedIn or GitHub profile links."
            })

        return {
            'score': contact_score,
            'issues': issues
        }

    def analyze_keywords(self, text: str) -> Dict:
        """Analyze keyword relevance and density."""
        text_lower = text.lower()
        keyword_score = 0
        found_keywords = []

        # Analyze keyword presence across categories
        for category, keywords in self.ats_keywords.items():
            category_keywords = [kw for kw in keywords if kw.lower() in text_lower]
            found_keywords.extend(category_keywords)

            # Score based on keyword density
            keyword_density = len(category_keywords) / len(keywords) * 100
            keyword_score += min(keyword_density, 25)  # Cap at 25 points per category

        return {
            'score': min(keyword_score, 100),
            'found_keywords': found_keywords[:10],
            'missing_keywords': [kw for kw in self.ats_keywords['technical_skills'][:5] if kw not in found_keywords]
        }

    def analyze_experience_section(self, text: str) -> Dict:
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

        if quantifiable_matches < 2:
            issues.append({
                'title': "Lack of Quantifiable Achievements",
                'detail': "Include specific metrics and numbers to show impact (e.g., 'Increased sales by 25%')."
            })

        if action_verb_count < 3:
            issues.append({
                'title': "Weak Action Verbs",
                'detail': "Use strong action verbs like 'developed', 'implemented', 'optimized' instead of 'worked on'."
            })

        return {
            'score': experience_score,
            'issues': issues
        }

    def analyze_formatting(self, text: str) -> Dict:
        """Analyze resume formatting for ATS compatibility."""
        formatting_score = 100
        issues = []

        lines = text.split('\n')

        # Check for consistent section headers
        section_headers = ['experience', 'education', 'skills', 'projects', 'summary', 'objective']
        found_headers = sum(1 for header in section_headers if header.lower() in text.lower())
        if found_headers < 3:
            formatting_score -= 20
            issues.append({
                'title': "Missing Section Headers",
                'detail': "Include clear section headers like 'Experience', 'Education', 'Skills'."
            })

        # Check for reasonable line lengths (ATS prefers shorter lines)
        long_lines = sum(1 for line in text.strip() if len(line) > 80)
        if long_lines > len(lines) * 0.3:  # More than 30% long lines
            formatting_score -= 15
            issues.append({
                'title': "Line Length Issues",
                'detail': "Keep lines under 80 characters for better ATS parsing."
            })

        return {
            'score': max(formatting_score, 0),
            'issues': issues
        }

    def analyze_resume(self, file_path: str) -> Dict:
        """Main analysis function."""
        try:
            # Extract text from file
            resume_text = self.extract_text_from_file(file_path)

            if not resume_text:
                return {
                    'ats_score': 0,
                    'summary': "Unable to extract text from resume file.",
                    'issues': [{'title': "File Error", 'detail': "Could not read resume content."}],
                    'suggested_keywords': []
                }

            # Perform individual analyses
            contact_analysis = self.analyze_contact_info(resume_text)
            keyword_analysis = self.analyze_keywords(resume_text)
            experience_analysis = self.analyze_experience_section(resume_text)
            formatting_analysis = self.analyze_formatting(resume_text)

            # Calculate weighted overall score
            overall_score = (
                contact_analysis['score'] * 0.15 +      # 15% weight
                keyword_analysis['score'] * 0.35 +      # 35% weight
                experience_analysis['score'] * 0.30 +   # 30% weight
                formatting_analysis['score'] * 0.20     # 20% weight
            )

            overall_score = min(max(overall_score, 0), 100)

            # Combine all issues
            all_issues = (
                contact_analysis.get('issues', []) +
                experience_analysis.get('issues', []) +
                formatting_analysis.get('issues', [])
            )

            # Generate summary
            if overall_score >= 85:
                summary = f"Excellent resume! Scored {overall_score:.1f}/100. "
            elif overall_score >= 70:
                summary = f"Good resume with room for improvement. Scored {overall_score:.1f}/100. "
            elif overall_score >= 55:
                summary = f"Average resume that needs significant improvements. Scored {overall_score:.1f}/100. "
            else:
                summary = f"Poor resume requiring major revisions. Scored {overall_score:.1f}/100. "

            found_keywords = len(keyword_analysis.get('found_keywords', []))
            summary += f"Found {found_keywords} relevant keywords."

            return {
                'ats_score': round(overall_score, 1),
                'summary': summary,
                'issues': all_issues,
                'suggested_keywords': keyword_analysis.get('missing_keywords', [])[:5]
            }

        except Exception as e:
            return {
                'ats_score': 0,
                'summary': f"An error occurred during analysis: {str(e)}",
                'issues': [{'title': "Analysis Error", 'detail': f"Technical error: {str(e)}"}],
                'suggested_keywords': []
            }


def demo_ats_analysis():
    """Demonstrate the ATS analyzer with sample resumes."""
    analyzer = SimpleATSResumeAnalyzer()

    # Sample resume 1: Good resume
    good_resume = '''John Doe
Software Engineer
Email: john.doe@email.com
Phone: 555-123-4567
LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years in full-stack development, specializing in Python, React, and cloud technologies.

EXPERIENCE
Senior Software Engineer, Tech Corp (2020-Present)
- Developed and deployed 15+ microservices using Python, Docker, and Kubernetes
- Led a team of 5 developers, improving code quality by 40% through code reviews
- Implemented CI/CD pipelines using Jenkins, reducing deployment time by 60%
- Built REST APIs serving 100,000+ users with 99.9% uptime

Software Engineer, StartupXYZ (2018-2020)
- Created responsive web applications using React and Node.js
- Optimized database queries, improving performance by 35%
- Collaborated with cross-functional teams on agile development cycles

SKILLS
Python, JavaScript, React, Node.js, Docker, Kubernetes, AWS, SQL, Git, CI/CD, REST APIs, Microservices

EDUCATION
Bachelor of Science in Computer Science
University of Technology, 2014-2018
'''

    # Sample resume 2: Poor resume
    poor_resume = '''Jane Smith
I am a programmer
Email: jane@gmail.com

WORK HISTORY
I worked at a company
- I did some coding
- I helped with projects
- I learned new things

SKILLS
coding, computer stuff
'''

    print("🚀 ATS Resume Analyzer Demo")
    print("=" * 50)

    for i, (resume_text, label) in enumerate([(good_resume, "Good Resume"), (poor_resume, "Poor Resume")], 1):
        print(f"\n📄 Analyzing {label}:")
        print("-" * 30)

        # Save to temporary file
        with open(f'temp_resume_{i}.txt', 'w') as f:
            f.write(resume_text)

        # Analyze
        result = analyzer.analyze_resume(f'temp_resume_{i}.txt')

        print(f"ATS Score: {result['ats_score']}/100")
        print(f"Summary: {result['summary']}")
        print(f"Issues Found: {len(result['issues'])}")
        print(f"Suggested Keywords: {', '.join(result['suggested_keywords'])}")

        if result['issues']:
            print("\nTop Issues:")
            for issue in result['issues'][:3]:
                print(f"  • {issue['title']}: {issue['detail']}")

        # Clean up
        import os
        os.remove(f'temp_resume_{i}.txt')

    print("\n" + "=" * 50)
    print("🎯 Key ATS Analysis Components:")
    print("   • Contact Information (15%): Email, phone, LinkedIn")
    print("   • Keywords (35%): Technical skills, industry terms")
    print("   • Experience Quality (30%): Quantifiable achievements, action verbs")
    print("   • Formatting (20%): ATS-friendly structure, section headers")


if __name__ == "__main__":
    demo_ats_analysis()