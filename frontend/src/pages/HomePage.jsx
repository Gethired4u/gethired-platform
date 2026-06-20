import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import PricingCard from "../components/PricingCard";
import { coreServices } from "../data/serviceCatalog";
import { indianStudentReviews } from "../data/studentReviews";
import { registerUser } from "../services/api";

// ─── Constants ────────────────────────────────────────────────
const WHATSAPP_LINK = "https://wa.me/918328221007";
const COUNTDOWN_SECONDS = 11 * 3600 + 47 * 60 + 23;
const OFFER_STORAGE_KEY = "gethired_offer_end";

// ─── Static data ──────────────────────────────────────────────
const trustPoints = [
  "For students, freshers, and employees",
  "WhatsApp-first guidance",
  "India-wide job support",
  "No fake placement guarantees",
];

const beforeState = [
  "Resume not getting shortlisted",
  "Applying randomly without a plan",
  "Weak Naukri and LinkedIn visibility",
  "Interviews feel confusing or stressful",
];

const afterState = [
  "Clear resume and profile positioning",
  "Role-wise job application plan",
  "Better recruiter visibility signals",
  "Interview answers built around your story",
];

const stats = [
  { value: "1.2K+", label: "Profiles reviewed", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { value: "8+", label: "Career tracks", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { value: "30 days", label: "Action roadmap", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { value: "24-72h", label: "First correction window", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { value: "India", label: "Nationwide guidance", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9" },
];

const problemCards = [
  { title: "Resume is not role-ready", detail: "Many resumes list work, projects, or skills but do not quickly prove fit for the target job.", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { title: "Applications are not focused", detail: "Freshers, employees, and switchers need different keywords, job platforms, and daily routines.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { title: "Profiles look empty to recruiters", detail: "Naukri freshness, LinkedIn headline, GitHub README, and project proof are usually incomplete or inconsistent.", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { title: "Interview answers sound weak", detail: "Candidates may know the work but struggle to explain it with structure, confidence, and examples.", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { title: "No daily job-search rhythm", detail: "Without a clear apply, revise, practice, and follow-up routine, progress slows quickly.", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
];

const systemSteps = [
  { title: "Career profile diagnosis", detail: "We identify your target role, experience level, strengths, and weak hiring signals.", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { title: "Resume plus profile repair", detail: "Resume, Naukri, LinkedIn, and portfolio links are aligned to one clear career story.", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { title: "Proof upgrade", detail: "Projects, internships, work experience, and achievements are converted into recruiter-friendly evidence.", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  { title: "India opportunity map", detail: "We help you prioritize relevant roles across job portals, company pages, referrals, and remote openings.", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { title: "Interview answer system", detail: "Technical, HR, project, experience, and communication answers are mapped to your target role.", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { title: "Weekly accountability", detail: "The plan turns into simple tasks: apply, follow up, practice, improve, and repeat.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

const serviceCards = [
  { title: "Resume ATS Repair", subtitle: "Shortlist-ready resume rewrite", price: "INR 799", cta: "Fix My Resume", accent: "border-brand-400", button: "bg-brand-600 text-white hover:bg-brand-700", features: ["ATS format correction", "Achievement bullet rewrite", "Skills and keyword mapping", "Recruiter-readable positioning"], icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { title: "Job Alert Lane", subtitle: "Relevant openings filter", price: "INR 299", cta: "Start Alerts", accent: "border-cyan-400", button: "bg-cyan-600 text-white hover:bg-cyan-700", features: ["Pan-India job roles", "Experience-fit filters", "Role-fit priority queue", "Daily WhatsApp action list"], icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  { title: "Interview Prep", subtitle: "Technical plus HR answers", price: "INR 499", cta: "Start Prep", accent: "border-amber-400", button: "bg-amber-500 text-ink hover:bg-amber-400", features: ["Tell me about yourself", "Project and experience scripts", "Role-specific questions", "Confident answer structure"], icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { title: "Mock Interview", subtitle: "Live fresher simulation", price: "INR 999", cta: "Book Mock", accent: "border-rose-400", button: "bg-rose-600 text-white hover:bg-rose-700", features: ["Technical plus HR round", "Communication scorecard", "Weakness heatmap", "7-day correction plan"], icon: "M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
  { title: "Naukri + LinkedIn Boost", subtitle: "Recruiter visibility setup", price: "INR 699", cta: "Boost Profile", accent: "border-indigo-400", button: "bg-indigo-600 text-white hover:bg-indigo-700", features: ["Naukri headline and keywords", "LinkedIn About rewrite", "GitHub link presentation", "Recruiter search readiness"], icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { title: "Project Proof Track", subtitle: "Portfolio upgrade for freshers", price: "INR 1,499", cta: "Upgrade Project", accent: "border-orange-400", button: "bg-orange-500 text-white hover:bg-orange-600", features: ["Project selection guidance", "README and demo story", "Resume project narrative", "Interview question mapping"], icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
];

const quizQuestions = [
  { id: "stage", prompt: "Where are you right now?", options: [{ value: "student", label: "Student or recent graduate" }, { value: "employee", label: "Employee planning a job switch" }, { value: "active", label: "Applying already but no calls" }, { value: "gap", label: "Career gap or restart" }] },
  { id: "challenge", prompt: "What is blocking you most?", options: [{ value: "resume", label: "Resume and profile look weak" }, { value: "interviews", label: "Interview confidence is low" }, { value: "jobs", label: "I cannot find suitable jobs" }, { value: "full", label: "I need complete job support" }] },
  { id: "domain", prompt: "Which track are you targeting?", options: [{ value: "software", label: "Software / IT roles" }, { value: "data", label: "Data / analytics roles" }, { value: "business", label: "Business, HR, finance, or operations" }, { value: "support", label: "Support, sales, or service roles" }] },
  { id: "budget", prompt: "What support level is comfortable now?", options: [{ value: "entry", label: "Start with INR 1 diagnostic" }, { value: "growth", label: "Under INR 1,000 starter plan" }, { value: "complete", label: "Complete 30-day placement plan" }] },
];

const packagePlans = [
  { name: "INR 1 Job Readiness Check", price: "INR 1", subtitle: "Low-risk entry review", benefitsTitle: "Includes", features: ["Resume weakness scan", "Profile visibility check", "Top 5 correction priorities"], ctaText: "Start at INR 1", bestFor: "Anyone unsure why calls are not coming" },
  { name: "Career Starter", price: "INR 999", subtitle: "Resume plus application sprint", benefitsTitle: "Includes", features: ["Resume optimization", "Naukri and LinkedIn fixes", "15-day job search lane", "Interview prep starter kit"], ctaText: "Choose Starter", bestFor: "Students, freshers, and job switchers" },
  { name: "30-Day Job Sprint", price: "INR 1,999", subtitle: "Complete execution plan", benefitsTitle: "Includes", features: ["Resume + profile repair", "Proof and portfolio improvement", "30-day opportunity support", "Interview prep + mock round", "WhatsApp accountability"], highlight: true, ctaText: "Activate Sprint", bestFor: "Job seekers who want daily structure" },
];

const comparisonRows = [
  { feature: "Resume diagnosis",        entry: "Yes", starter: "Yes", complete: "Yes" },
  { feature: "ATS resume rewrite",      entry: "No",  starter: "Yes", complete: "Yes" },
  { feature: "Naukri and LinkedIn",      entry: "No",  starter: "Yes", complete: "Yes" },
  { feature: "GitHub/project proof",     entry: "No",  starter: "No",  complete: "Yes" },
  { feature: "Opportunity lane", entry: "No",  starter: "15 days", complete: "30 days" },
  { feature: "Technical + HR prep",      entry: "No",  starter: "Starter", complete: "Full" },
  { feature: "Mock interview",          entry: "No",  starter: "No",  complete: "Yes" },
  { feature: "WhatsApp accountability", entry: "Basic", starter: "Yes", complete: "Priority" },
];

const timelineSteps = ["Share your role goal and current profile", "Get resume and profile diagnosis", "Receive corrected resume/profile assets", "Follow a focused India-wide application lane", "Practice role-specific interview answers weekly"];

const companies = ["TCS", "Infosys", "Wipro", "HCL", "Accenture", "Cognizant", "Capgemini", "Deloitte", "Zoho", "Freshworks", "Amazon", "PhonePe"];

const whyUs = [
  { title: "Simple career language", detail: "We explain the plan in plain terms: target role, profile gap, job platforms, and next actions.", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { title: "Manual plus AI review", detail: "AI speeds up checks, but resume, profile, and project positioning still get human review.", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { title: "One clear placement system", detail: "Resume, Naukri, LinkedIn, GitHub, applications, and interview prep are connected.", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { title: "WhatsApp execution", detail: "You get simple next actions instead of heavy dashboards you may not open daily.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { title: "Honest expectations", detail: "No placement guarantee claims. The promise is better readiness, better targeting, and better consistency.", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { title: "Shortlist-oriented work", detail: "Every task must improve one of three things: visibility, credibility, or interview conversion.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
];

const transparencyPoints = [
  "We do not guarantee placements or fake interviews. We improve readiness, targeting, and response potential.",
  "Plans are strongest for final-year students and recent graduates looking for fresher roles.",
  "Opportunity support focuses on relevance, freshness, and application discipline.",
  "Guidance is practical: resume corrections, profile fixes, project answers, and daily execution.",
];

const faqs = [
  { question: "Is this only for one degree stream?", answer: "No. The platform is designed for final-year students, recent graduates, and early-career candidates across graduation and post-graduation streams." },
  { question: "Is the INR 1 diagnostic genuine?", answer: "Yes. It is a low-risk first step to understand resume quality, ATS readiness, and the best plan before paying for bigger support." },
  { question: "Do you help students from tier-2 and tier-3 colleges?", answer: "Yes. The strategy is built for students who may not have strong campus placement support and need better off-campus execution." },
  { question: "Which locations do you focus on?", answer: "The messaging and opportunity flow prioritise Indian hiring hubs such as Bengaluru, Hyderabad, Pune, Chennai, Delhi NCR, Mumbai, Vijayawada, and remote roles." },
  { question: "Do you guarantee a job?", answer: "No. Any real team should avoid that promise. We improve profile quality, application discipline, interview readiness, and recruiter response potential." },
];

const resources = [
  { tag: "Resume", title: "Graduate fresher resume checklist", description: "Fix project bullets, skills, education, internships, and ATS structure before applying." },
  { tag: "Interview", title: "Project explanation framework", description: "Turn academic projects into clear answers for technical and HR interview rounds." },
  { tag: "Jobs", title: "30-day off-campus action plan", description: "A simple rhythm for Naukri, LinkedIn, company career pages, referrals, and follow-ups." },
];

const audienceKeywords = [
  "Students",
  "Freshers",
  "Graduates",
  "Employees",
  "Job Switchers",
  "Career Gap",
  "Resume ATS",
  "Naukri",
  "LinkedIn",
  "Interview Prep",
];

const heroSteps = [
  { title: "Check", detail: "Resume, profile, and target role gaps" },
  { title: "Fix", detail: "ATS resume, Naukri, LinkedIn, and project story" },
  { title: "Apply", detail: "Daily job plan, interview prep, and follow-up" },
];

const studentStrategy = [
  { title: "Pick one primary lane", detail: "Software, testing, data, or service-company fresher track. One lane makes resume keywords and prep sharper." },
  { title: "Make projects believable", detail: "Every project needs problem, tech stack, your contribution, result, GitHub/demo, and interview questions." },
  { title: "Win local hiring hubs first", detail: "Prioritize Bengaluru, Hyderabad, Pune, Chennai, Delhi NCR, Mumbai, Vijayawada, and remote fresher roles." },
  { title: "Run a weekly conversion loop", detail: "Apply, follow up, practice, update profile, and review responses every week instead of applying blindly." },
];


// ─── Helper utilities ──────────────────────────────────────────
function getStoredOfferEnd() {
  if (typeof window === "undefined") return Date.now() + COUNTDOWN_SECONDS * 1000;
  const existing = window.localStorage.getItem(OFFER_STORAGE_KEY);
  const parsed = existing ? Number(existing) : 0;
  if (parsed && parsed > Date.now()) return parsed;
  const nextEnd = Date.now() + COUNTDOWN_SECONDS * 1000;
  window.localStorage.setItem(OFFER_STORAGE_KEY, String(nextEnd));
  return nextEnd;
}

function splitCountdown(remainingMs) {
  const safe = Math.max(0, remainingMs);
  return {
    hours: String(Math.floor(safe / 3600000)).padStart(2, "0"),
    minutes: String(Math.floor((safe % 3600000) / 60000)).padStart(2, "0"),
    seconds: String(Math.floor((safe % 60000) / 1000)).padStart(2, "0"),
  };
}

function getQuizRecommendation(answers) {
  if (answers.budget === "complete" || answers.challenge === "full") {
    return { name: "30-Day Job Sprint", price: "INR 1,999", features: ["Resume, Naukri, and LinkedIn repair", "Proof and portfolio improvement", "30-day India-wide opportunity lane", "Interview prep plus mock simulation"] };
  }
  if (answers.budget === "growth" || answers.challenge === "resume") {
    return { name: "Career Starter", price: "INR 999", features: ["Resume optimization", "Naukri and LinkedIn fixes", "15-day job targeting", "Interview prep starter kit"] };
  }
  return { name: "INR 1 Job Readiness Check", price: "INR 1", features: ["Resume weakness scan", "ATS readiness summary", "Top correction priorities"] };
}


// ─── Small shared components ───────────────────────────────────
function WhatsAppIcon({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.862L0 24l6.335-1.524A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.928 0-3.745-.516-5.307-1.418l-.38-.225-3.76.904.936-3.653-.247-.396A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

function Icon({ path, className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function StarRating({ label }) {
  const num = parseFloat(label);
  const full = Math.floor(num);
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${label}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill={i < full ? "#f59e0b" : "#e2e8f0"} className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-semibold text-amber-700">{label}</span>
    </div>
  );
}

function CheckItem({ children, light = false }) {
  return (
    <li className="flex items-start gap-2">
      <svg viewBox="0 0 16 16" fill="none" className={`mt-0.5 h-4 w-4 shrink-0 ${light ? "text-brand-200" : "text-brand-600"}`} aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.15" />
        <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`text-sm ${light ? "text-white/90" : "text-slate"}`}>{children}</span>
    </li>
  );
}

// ─── Main component ────────────────────────────────────────────
function HomePage() {
  const [offerEnd, setOfferEnd] = useState(() => getStoredOfferEnd());
  const [countdown, setCountdown] = useState(() => splitCountdown(offerEnd - Date.now()));

  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "", college: "", graduationYear: "", experience: "", role: "", service: "" });
  const [leadError, setLeadError] = useState("");
  const [leadSuccess, setLeadSuccess] = useState("");
  const [isLeadSubmitting, setIsLeadSubmitting] = useState(false);

  const isQuizComplete = quizStep >= quizQuestions.length;
  const currentQuestion = quizQuestions[quizStep];
  const recommendedPlan = useMemo(() => getQuizRecommendation(quizAnswers), [quizAnswers]);
  const testimonials = indianStudentReviews.slice(0, 6);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const remaining = offerEnd - Date.now();
      if (remaining <= 0) {
        const resetEnd = Date.now() + COUNTDOWN_SECONDS * 1000;
        window.localStorage.setItem(OFFER_STORAGE_KEY, String(resetEnd));
        setOfferEnd(resetEnd);
        setCountdown(splitCountdown(COUNTDOWN_SECONDS * 1000));
        return;
      }
      setCountdown(splitCountdown(remaining));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [offerEnd]);

  const handleQuizSelect = (value) => setQuizAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  const goNext = () => { if (quizAnswers[currentQuestion.id]) setQuizStep((p) => p + 1); };
  const goBack = () => setQuizStep((p) => Math.max(0, p - 1));
  const restartQuiz = () => { setQuizAnswers({}); setQuizStep(0); };

  const handleLeadSubmit = async (event) => {
    event.preventDefault();
    setLeadError("");
    setLeadSuccess("");
    if (!leadForm.name || !leadForm.email || !leadForm.phone || !leadForm.graduationYear || !leadForm.role || !leadForm.service) {
      setLeadError("Please fill all required fields so we can suggest the correct job plan.");
      return;
    }
    setIsLeadSubmitting(true);
    try {
      const response = await registerUser({
        name: leadForm.name.trim(), email: leadForm.email.trim(), phone: leadForm.phone.trim(),
        experience: leadForm.experience.trim() || `${leadForm.graduationYear.trim()} graduate fresher`,
        role: leadForm.role.trim(),
        services_interested: [leadForm.service],
        lead_source: "home_page_student_funnel",
        recommended_plan: recommendedPlan.name,
        quiz_answers: {
          ...quizAnswers,
          college: leadForm.college.trim(),
          career_stage: leadForm.graduationYear.trim(),
        },
      });
      setLeadSuccess(`${response.message} Student lead ID: ${response.user_id}`);
      setLeadForm({ name: "", email: "", phone: "", college: "", graduationYear: "", experience: "", role: "", service: "" });
    } catch (apiError) {
      setLeadError(apiError?.response?.data?.detail || "Unable to submit right now. Please try again shortly.");
    } finally {
      setIsLeadSubmitting(false);
    }
  };

  return (
    <div className="gh-dark relative pb-20 sm:pb-12">
      {/* WhatsApp FAB */}
      <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
        className="fixed bottom-20 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_12px_30px_rgba(16,185,129,0.45)] ring-4 ring-emerald-200/70 transition hover:scale-105 sm:bottom-6">
        <WhatsAppIcon className="h-7 w-7" />
      </a>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section id="top" className="relative overflow-hidden px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pb-14 lg:pt-14">
        <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-8 h-80 w-80 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-brand-100 bg-gradient-to-br from-white via-white to-cyan-50/80 p-6 shadow-premium sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-cyan-100/60 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1">
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-amber-600" aria-hidden="true">
                  <path d="M8 1l1.85 3.75L14 5.73l-3 2.92.71 4.13L8 10.75l-3.71 1.95.71-4.13-3-2.92 4.15-.98L8 1z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wide text-amber-700">Resume check starts at INR 1</span>
              </div>

              <h1 className="mt-5 max-w-4xl font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
                Get job-ready.
                <br />
                <span className="gradient-text">Get more interview calls.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate sm:text-lg">
                Simple career support for students, freshers, employees, and job seekers across India. We fix your resume, profile, job search plan, and interview preparation.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {audienceKeywords.map((word) => (
                  <span key={word} className="rounded-full border border-slate-200 bg-soft px-3 py-1.5 text-xs font-bold text-slate">
                    {word}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#form"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-base font-extrabold text-ink shadow-[0_12px_28px_rgba(245,158,11,0.35)] transition hover:-translate-y-0.5 hover:bg-amber-400">
                  Start With INR 1 Check
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <Link to="/resume-check"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-ink transition hover:border-brand-400 hover:text-brand-700">
                  Free ATS Check
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Free</span>
                </Link>
              </div>

              <div className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <span className="text-sm font-semibold text-amber-900">Today&apos;s job check window</span>
                <div className="flex items-center gap-1 font-display text-xl font-bold tracking-wider text-amber-800">
                  {[countdown.hours, countdown.minutes, countdown.seconds].map((unit, i) => (
                    <span key={i} className="flex items-center">
                      <span className="inline-flex min-w-[2ch] justify-center rounded-lg bg-amber-100 px-2 py-1">{unit}</span>
                      {i < 2 && <span className="mx-0.5 opacity-60">:</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-soft p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">How GetHired4U helps</p>
              <div className="mt-5 space-y-3">
                {heroSteps.map((step, index) => (
                  <div key={step.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 font-display text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-display text-base font-bold text-ink">{step.title}</p>
                      <p className="mt-1 text-sm text-slate">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-700">Best for</p>
                <p className="mt-1 text-sm leading-6 text-slate">
                  Students, graduates, freshers, employees switching jobs, career gap candidates, and anyone applying but not getting calls.
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-8 flex flex-wrap gap-2">
            {trustPoints.map((point) => (
              <span key={point} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-soft px-3 py-1.5 text-xs font-semibold text-slate">
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 text-brand-500" aria-hidden="true">
                  <path d="M8 0l2 5h5l-4 3 1.5 5L8 10l-4.5 3L5 8 1 5h5z" />
                </svg>
                {point}
              </span>
            ))}
          </div>

          <div className="relative mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-soft p-4 sm:grid-cols-2">
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rose-700">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                Before
              </p>
              <ul className="mt-3 space-y-1.5">
                {beforeState.map((item) => <li key={item} className="flex items-start gap-2 text-sm text-rose-800"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />{item}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                After
              </p>
              <ul className="mt-3 space-y-1.5">
                {afterState.map((item) => <li key={item} className="flex items-start gap-2 text-sm text-emerald-800"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-gradient-to-r from-white via-cyan-50/60 to-blue-50/50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-5">
          {stats.map((item) => (
            <div key={item.label} className="card-hover flex flex-col items-center gap-2 p-4 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon path={item.icon} className="h-5 w-5" />
              </div>
              <p className="font-display text-2xl font-bold text-ink">{item.value}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM ──────────────────────────────────────────── */}
      <section id="problem" className="bg-gradient-to-b from-cyan-50/60 to-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">The Challenge</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Why many graduate applications do not convert</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {problemCards.map((card) => (
              <article key={card.title} className="card-hover p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                  <Icon path={card.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-base font-bold text-ink">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{card.detail}</p>
              </article>
            ))}
          </div>
          <p className="mt-7 text-base font-semibold text-brand-700">The fix is not more random applications. It is better positioning plus a repeatable placement routine.</p>
        </div>
      </section>

      {/* ── STRATEGY ────────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">Job Strategy</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">A simple job-search strategy anyone can follow</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {studentStrategy.map((item, index) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ─────────────────────────────────────────── */}
      <section id="solution" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">Career System</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">A practical workflow for Indian job seekers</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {systemSteps.map((step, index) => (
              <article key={step.title} className="card-hover p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon path={step.icon} className="h-5 w-5" />
                  </div>
                  <span className="font-display text-xs font-bold text-muted">Step {index + 1}</span>
                </div>
                <h3 className="mt-3 text-base font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-slate">{step.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── ATS CHECKER CTA ──────────────────────────────────── */}
      <section id="ats-checker" className="bg-gradient-to-b from-white to-cyan-50/50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-4xl border border-brand-100 bg-gradient-to-br from-white to-cyan-50 p-8 shadow-premium sm:p-10">
          <span className="eyebrow">AI Resume Analyzer</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Get a full AI review — resume, job description, and experience</h2>
          <p className="mt-3 text-sm text-slate">Upload your resume file, paste the job description, and select your experience level. Our AI maps what the role requires, what you have, and exactly what is missing.</p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              { step: "1", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "Upload resume", sub: "PDF or DOCX" },
              { step: "2", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", label: "Paste job description", sub: "Full JD or role name" },
              { step: "3", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", label: "Select experience level", sub: "Fresher to 8+ years" },
            ].map(({ step, icon, label, sub }) => (
              <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 font-display text-sm font-bold text-white">{step}</div>
                <div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 mb-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d={icon} /></svg>
                  </div>
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="text-xs text-muted">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <p className="text-sm font-semibold text-brand-800">What Groq AI checks for you</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                "Position requirements vs your resume",
                "What is missing for the specific role",
                "Format issues that block ATS parsing",
                "Experience-level fit verdict",
                "Role-specific missing keywords",
                "Actionable fixes with priority order",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-brand-700">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/resume-check"
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Analyse My Resume Free
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-muted">
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-success-500" aria-hidden="true"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.22 5.03a.75.75 0 00-1.06-1.06L7 8.19 5.78 6.97a.75.75 0 00-1.06 1.06l1.75 1.75a.75.75 0 001.06 0l3.69-3.75z"/></svg>
              Free · No sign-up needed · Results in seconds
            </span>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────── */}
      <section id="services" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">Services</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Focused modules for students and freshers</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {serviceCards.map((service) => (
              <article key={service.title} className={`rounded-2xl border bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-glow ${service.accent}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{service.subtitle}</p>
                    <h3 className="mt-1 text-base font-bold text-ink">{service.title}</h3>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-brand-600">
                    <Icon path={service.icon} className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-ink">{service.price}</p>
                <ul className="mt-3 space-y-1.5">
                  {service.features.map((feature) => <CheckItem key={feature}>{feature}</CheckItem>)}
                </ul>
                <a href="#form" className={`mt-5 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${service.button}`}>
                  {service.cta}
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUIZ ─────────────────────────────────────────────── */}
      <section id="quiz" className="bg-gradient-to-b from-cyan-50/60 to-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-4xl border border-brand-100 bg-gradient-to-br from-white to-brand-50/60 p-8 shadow-premium sm:p-10">
          <span className="eyebrow">Plan Advisor</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Find your job plan in under 1 minute</h2>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${isQuizComplete ? 100 : (quizStep / quizQuestions.length) * 100}%` }} />
          </div>

          {!isQuizComplete && currentQuestion && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">Question {quizStep + 1} of {quizQuestions.length}</p>
              <h3 className="mt-2 text-xl font-bold text-ink">{currentQuestion.prompt}</h3>
              <div className="mt-4 space-y-2">
                {currentQuestion.options.map((option) => {
                  const selected = quizAnswers[currentQuestion.id] === option.value;
                  return (
                    <button key={option.value} type="button" onClick={() => handleQuizSelect(option.value)}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${selected ? "border-brand-400 bg-brand-50 text-brand-700 shadow-glow-sm" : "border-slate-200 bg-white text-ink hover:border-slate-400"}`}>
                      <span className={`mr-3 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs ${selected ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300"}`}>
                        {selected && "✓"}
                      </span>
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex items-center justify-between">
                <button type="button" onClick={goBack} disabled={quizStep === 0}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate transition hover:border-slate-400 disabled:opacity-40">
                  Back
                </button>
                <button type="button" onClick={goNext} disabled={!quizAnswers[currentQuestion.id]}
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
                  Continue
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {isQuizComplete && (
            <div className="mt-6 animate-scaleIn rounded-2xl border border-success-200 bg-success-50 p-6">
              <p className="eyebrow text-success-700">Recommended Plan</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-ink">{recommendedPlan.name}</h3>
              <p className="mt-1 text-sm font-bold text-success-700">{recommendedPlan.price}</p>
              <ul className="mt-4 space-y-2">
                {recommendedPlan.features.map((f) => <CheckItem key={f}>{f}</CheckItem>)}
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="#form" className="inline-flex items-center gap-2 rounded-xl bg-success-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-success-700">
                  Continue with this plan
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <button type="button" onClick={restartQuiz} className="rounded-xl border border-success-300 px-5 py-2.5 text-sm font-semibold text-success-800 transition hover:border-success-400">
                  Retake quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── PACKAGES ─────────────────────────────────────────── */}
      <section id="packages" className="bg-gradient-to-b from-white to-cyan-50/40 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">Packages</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Choose a plan aligned to student urgency and budget</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {packagePlans.map((plan) => <PricingCard key={plan.name} {...plan} linkTo="#form" />)}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ───────────────────────────────────────── */}
      <section id="compare" className="bg-gradient-to-b from-cyan-50/50 to-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">Comparison</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Compare what each career plan covers</h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-soft">
                  <th className="px-5 py-3.5 font-semibold text-ink">Feature</th>
                  <th className="px-5 py-3.5 font-semibold text-ink">Diagnostic</th>
                  <th className="px-5 py-3.5 font-semibold text-ink">Career Starter</th>
                  <th className="px-5 py-3.5 font-semibold text-brand-700">Complete</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-slate-100 last:border-none hover:bg-soft/60">
                    <td className="px-5 py-3 font-medium text-slate">{row.feature}</td>
                    {[row.entry, row.starter, row.complete].map((val, i) => (
                      <td key={i} className={`px-5 py-3 ${i === 2 ? "font-semibold text-brand-700" : "text-ink"}`}>
                        {val === "Yes" ? (
                          <span className="inline-flex items-center gap-1 text-success-600">
                            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" /></svg>
                            Yes
                          </span>
                        ) : val === "No" ? (
                          <span className="text-muted">—</span>
                        ) : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────────── */}
      <section id="how" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <span className="eyebrow">Process</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">How delivery works after you register</h2>
          <div className="mt-8 space-y-3">
            {timelineSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 font-display text-sm font-bold text-brand-700">
                  {index + 1}
                </div>
                <p className="pt-0.5 text-sm font-medium text-slate">{step}</p>
              </div>
            ))}
            <div className="rounded-xl border border-brand-100 bg-brand-50 px-5 py-3.5 text-sm font-semibold text-brand-700">
              Most students see profile-quality movement within the first week after resume and profile corrections.
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section id="proof" className="bg-gradient-to-b from-white to-cyan-50/50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">Candidate Outcomes</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Feedback from job seekers</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((review) => (
              <article key={review.id} className="card-hover flex flex-col p-5">
                <StarRating label={review.rating} />
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate">{review.text}</p>
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display text-sm font-bold text-brand-700">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{review.name}</p>
                    <p className="text-xs text-muted">{review.role} · {review.city}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── HIRING NETWORK ───────────────────────────────────── */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">Hiring Targets</span>
          <h2 className="mt-3 font-display text-2xl font-bold text-ink">Companies and job lanes candidates usually target</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {companies.map((company) => (
              <span key={company} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate shadow-card">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-cyan-50/50 to-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">Why Us</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Why candidates choose this support model</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyUs.map((item) => (
              <article key={item.title} className="card-hover p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon path={item.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRANSPARENCY ─────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-4xl border border-slate-200 bg-white p-8 shadow-card sm:p-10">
          <span className="eyebrow">Transparency</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Clear commitments and realistic expectations</h2>
          <div className="mt-6 space-y-3">
            {transparencyPoints.map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-soft px-4 py-3">
                <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-slate">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="bg-gradient-to-b from-white to-cyan-50/50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Frequently asked questions</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <article key={faq.question} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition duration-300 hover:shadow-glow-sm">
                  <button type="button" onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                    <span className="text-sm font-semibold text-ink">{faq.question}</span>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-transform ${isOpen ? "rotate-180 border-brand-400 bg-brand-50 text-brand-700" : "border-slate-300 text-slate"}`}>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                  {isOpen && <p className="px-5 pb-5 text-sm leading-relaxed text-slate">{faq.answer}</p>}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── RESOURCES ────────────────────────────────────────── */}
      <section id="resources" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">Resources</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Practical guides job seekers actually need</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {resources.map((resource) => (
              <article key={resource.title} className="card-hover p-5">
                <span className="badge bg-brand-50 text-brand-700">{resource.tag}</span>
                <h3 className="mt-3 text-base font-bold text-ink">{resource.title}</h3>
                <p className="mt-2 text-sm text-slate">{resource.description}</p>
                <a href="#form" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-600">
                  Request this guide
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEAD FORM ────────────────────────────────────────── */}
      <section id="form" className="bg-gradient-to-b from-cyan-50/50 to-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-4xl border border-brand-100 bg-gradient-to-br from-white to-cyan-50 p-8 shadow-premium sm:p-10">
          <span className="eyebrow">Get Started</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Start your job plan today</h2>
          <p className="mt-3 text-sm text-slate">Share your details. Our team will map the next best action for your resume, profile, target role, and job search.</p>

          <form onSubmit={handleLeadSubmit} className="mt-7 grid gap-4 sm:grid-cols-2">
            {[
              { key: "name", label: "Full Name", type: "text", span: false, required: true },
              { key: "email", label: "Email", type: "email", span: false, required: true },
              { key: "phone", label: "WhatsApp Number", type: "tel", span: false, required: true },
              { key: "college", label: "College / Company / City", type: "text", span: false, placeholder: "E.g. Delhi University, TCS, Hyderabad", required: false },
              { key: "graduationYear", label: "Current Stage", type: "text", span: false, placeholder: "E.g. final year, 2025 passout, 2 years exp", required: true },
              { key: "role", label: "Target Role", type: "text", span: false, placeholder: "E.g. software engineer, data analyst, HR, finance analyst", required: true },
            ].map(({ key, label, type, span, placeholder, required }) => (
              <label key={key} className={`grid gap-2 text-sm font-semibold text-ink ${span ? "sm:col-span-2" : ""}`}>
                {label}{required && <span className="text-danger-500"> *</span>}
                <input type={type} value={leadForm[key]} onChange={(e) => setLeadForm((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder} className="input-premium font-normal" />
              </label>
            ))}

            <label className="grid gap-2 text-sm font-semibold text-ink sm:col-span-2">
              Service or Package <span className="text-danger-500">*</span>
              <select value={leadForm.service} onChange={(e) => setLeadForm((p) => ({ ...p, service: e.target.value }))} className="input-premium font-normal">
                <option value="">Select a service or package</option>
                <option value="INR 1 Job Readiness Check">INR 1 Job Readiness Check</option>
                <option value="30-Day Job Sprint (INR 1,999)">30-Day Job Sprint (INR 1,999)</option>
                <option value="Career Starter (INR 999)">Career Starter (INR 999)</option>
                {coreServices.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
              </select>
            </label>

            <button type="submit" disabled={isLeadSubmitting}
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
              {isLeadSubmitting ? (
                <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Submitting…</>
              ) : (
                <>Submit and continue <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></>
              )}
            </button>
          </form>

          {leadError && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <p className="text-sm text-danger-700">{leadError}</p>
            </div>
          )}
          {leadSuccess && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-success-100 bg-success-50 px-4 py-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <p className="min-w-0 flex-1 text-sm text-success-800">{leadSuccess}</p>
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700">
                Chat with team
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-4xl bg-ink p-8 text-white shadow-card-lg sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-8 h-48 w-48 rounded-full bg-brand-800/60 blur-3xl" />
          <h2 className="relative font-display text-3xl font-bold sm:text-4xl">Ready to stop applying blindly?</h2>
          <p className="relative mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
            Start with the INR 1 diagnostic or register for the 30-day placement sprint. We will map your resume, profile, project proof, and next application lane.
          </p>
          <div className="relative mt-7 flex flex-wrap gap-3">
            <a href="#form" className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-extrabold text-ink shadow-[0_12px_28px_rgba(245,158,11,0.35)] transition hover:bg-amber-300">
              Start INR 1 Diagnostic
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white">
              <WhatsAppIcon className="h-4 w-4" />
              Connect on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── MOBILE STICKY BAR ────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-2 border-t border-slate-200 sm:hidden">
        <a href="#form" className="flex items-center justify-center bg-amber-500 px-4 py-3.5 text-center text-sm font-extrabold text-ink">
          INR 1 Diagnostic
        </a>
        <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 bg-emerald-500 px-4 py-3.5 text-center text-sm font-semibold text-white">
          <WhatsAppIcon className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}

export default HomePage;
