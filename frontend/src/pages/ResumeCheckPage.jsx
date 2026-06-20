import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import ProcessingAnimation from "../components/ProcessingAnimation";
import { analyzeResume } from "../services/api";

const processingSteps = [
  "Extracting resume content…",
  "Matching position requirements…",
  "Checking ATS formatting…",
  "Running AI role analysis…",
];

const EXPERIENCE_OPTIONS = [
  { value: "", label: "Select experience level" },
  { value: "Fresher (0 years)", label: "Fresher — 0 years" },
  { value: "0–1 year", label: "0–1 year" },
  { value: "1–3 years", label: "1–3 years" },
  { value: "3–5 years", label: "3–5 years" },
  { value: "5–8 years", label: "5–8 years" },
  { value: "8+ years", label: "8+ years (Senior / Lead)" },
];

// ─── Score ring (SVG-based, CSS-animated) ─────────────────────
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 339.3

function scoreColor(score) {
  if (score >= 75) return "#16a34a";
  if (score >= 55) return "#d97706";
  return "#e11d48";
}

function ScoreRing({ score }) {
  const [displayed, setDisplayed] = useState(0);
  const color = scoreColor(score);
  const offset = CIRCUMFERENCE - (displayed / 100) * CIRCUMFERENCE;

  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 1400;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="140" height="140"
        viewBox="0 0 140 140"
        className="-rotate-90"
        aria-label={`ATS score: ${score} out of 100`}
      >
        <circle cx="70" cy="70" r={RADIUS} className="score-ring-track" />
        <circle
          cx="70" cy="70" r={RADIUS}
          className="score-ring-fill"
          stroke={color}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-3xl font-bold leading-none" style={{ color }}>
          {displayed}
        </span>
        <span className="mt-0.5 text-xs font-semibold text-muted">/ 100</span>
      </div>
    </div>
  );
}

// ─── Drag-and-drop file zone ───────────────────────────────────
const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
const ALLOWED_EXT = [".pdf", ".docx", ".txt"];

function FileDropZone({ file, onFileChange, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  }, [disabled, onFileChange]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) onFileChange(selected);
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload resume file"
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !disabled && inputRef.current?.click()}
      className={`drop-zone ${isDragging ? "dragging" : ""} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_EXT.join(",")}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
      />

      {file ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-ink">{file.name}</p>
            <p className="mt-0.5 text-xs text-muted">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.878 11.095H6.75z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-ink">Drop your resume here</p>
            <p className="mt-1 text-xs text-muted">or click to browse — PDF, DOCX, TXT · max 10 MB</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────
function ScoreLabel({ score }) {
  if (score >= 75) return <span className="badge bg-success-100 text-success-700">Strong Profile</span>;
  if (score >= 55) return <span className="badge bg-warning-100 text-warning-600">Needs Work</span>;
  return <span className="badge bg-danger-100 text-danger-600">Needs Major Revision</span>;
}

function ResumeCheckPage() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleFileChange = (f) => {
    setFile(f);
    setError("");
    setResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Please upload your resume first.");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXT.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setError("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please provide a job description or target role for an accurate analysis.");
      return;
    }

    if (!experienceLevel) {
      setError("Please select your experience level.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription.trim());
    formData.append("experience_level", experienceLevel);

    setIsLoading(true);
    setActiveStep(0);

    const progressInterval = setInterval(() => {
      setActiveStep((prev) => (prev < processingSteps.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      const startedAt = Date.now();
      const data = await analyzeResume(formData);
      const elapsed = Date.now() - startedAt;
      if (elapsed < 2800) await new Promise((r) => setTimeout(r, 2800 - elapsed));
      setResult(data);
    } catch (apiError) {
      setError(apiError?.response?.data?.detail || "Analysis failed. Please try again.");
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Upload card */}
      <div className="card p-8 sm:p-10">
        <span className="eyebrow">Resume ATS Analyzer</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
          See exactly how ATS reads your resume
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate">
          Upload your resume and paste the job description. Get a detailed score breakdown, keyword gaps, and actionable fixes in seconds.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">
              Resume File <span className="text-danger-500">*</span>
            </label>
            <FileDropZone file={file} onFileChange={handleFileChange} disabled={isLoading} />
          </div>

          <div>
            <label htmlFor="jd-input" className="mb-2 block text-sm font-semibold text-ink">
              Job Description / Target Role <span className="text-danger-500">*</span>
            </label>
            <textarea
              id="jd-input"
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full JD or type your target role (e.g. Senior Software Engineer, Data Analyst)…"
              disabled={isLoading}
              className="input-premium resize-none"
            />
          </div>

          <div>
            <label htmlFor="exp-select" className="mb-2 block text-sm font-semibold text-ink">
              Experience Level <span className="text-danger-500">*</span>
            </label>
            <select
              id="exp-select"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              disabled={isLoading}
              className="input-premium"
            >
              {EXPERIENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted">The analyzer adjusts expectations based on your level — fresher vs senior get different feedback.</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Running ATS Analysis…
              </>
            ) : (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Analyse Resume
              </>
            )}
          </button>
        </form>
      </div>

      {/* Processing steps */}
      {isLoading && (
        <div className="mt-6 animate-fadeIn">
          <ProcessingAnimation steps={processingSteps} activeStep={activeStep} />
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 animate-fadeUp space-y-5">
          {/* Score overview */}
          <div className="card p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <ScoreRing score={result.ats_score} />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h2 className="font-display text-2xl font-bold text-ink">ATS Score</h2>
                  <ScoreLabel score={result.ats_score} />
                  {result.experience_fit && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 border border-brand-200">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 4a.75.75 0 00-1.5 0v3.25l2.25 2.25a.75.75 0 001.06-1.06L8.75 7.69V5z"/></svg>
                      {result.experience_fit}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate">{result.summary}</p>

                {/* Component score bars */}
                {result.component_scores && (
                  <div className="mt-5 space-y-3">
                    {Object.entries(result.component_scores).map(([key, val]) => (
                      <div key={key}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-semibold capitalize text-ink">{key}</span>
                          <span className="text-muted">{Math.round(val)}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min(val, 100)}%`,
                              background: `linear-gradient(90deg, ${scoreColor(val)}, ${scoreColor(val)}aa)`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Position Requirements vs What You're Missing */}
          {(result.position_requirements?.length > 0 || result.missing_requirements?.length > 0) && (
            <div className="grid gap-5 sm:grid-cols-2">
              {result.position_requirements?.length > 0 && (
                <div className="card p-6">
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-700">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Position Requires
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {result.position_requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-ink">
                        <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-[10px]">{i + 1}</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.missing_requirements?.length > 0 && (
                <div className="card p-6">
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-danger-600">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Missing from Your Resume
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {result.missing_requirements.map((miss, i) => (
                      <li key={i} className="flex items-start gap-2.5 rounded-xl bg-danger-50 border border-danger-100 px-3 py-2.5 text-sm text-danger-800">
                        <svg viewBox="0 0 16 16" fill="currentColor" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger-500" aria-hidden="true">
                          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM6.53 6.47a.75.75 0 00-1.06 1.06L6.94 9 5.47 10.47a.75.75 0 101.06 1.06L8 10.06l1.47 1.47a.75.75 0 101.06-1.06L9.06 9l1.47-1.47a.75.75 0 00-1.06-1.06L8 7.94 6.53 6.47z" />
                        </svg>
                        {miss}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Format Feedback */}
          {result.format_feedback?.length > 0 && (
            <div className="card p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-700">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Format Fixes Needed
              </h3>
              <p className="mt-1 text-xs text-muted">These are structural changes that improve how ATS and recruiters read your resume.</p>
              <ul className="mt-4 space-y-2">
                {result.format_feedback.map((fb, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5 text-sm text-amber-900">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true">
                      <circle cx="8" cy="8" r="7" /><path d="M8 5v3.5M8 11v.5" strokeLinecap="round" />
                    </svg>
                    {fb}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths + Issues */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Strengths */}
            <div className="card p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-success-700">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Strengths ({(result.strengths || []).length})
              </h3>
              <ul className="mt-4 space-y-2.5">
                {(result.strengths || []).length === 0 && (
                  <p className="text-sm text-slate">No notable strengths detected. There is room to improve.</p>
                )}
                {(result.strengths || []).map((strength, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-xl bg-success-50 px-3 py-2.5 text-sm text-success-800">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-600" aria-hidden="true">
                      <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                    </svg>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Issues */}
            <div className="card p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-warning-600">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Issues ({(result.issues || []).length})
              </h3>
              <ul className="mt-4 space-y-2.5">
                {(result.issues || []).map((issue, i) => (
                  <li key={i} className="rounded-xl border border-warning-100 bg-warning-50 px-3 py-2.5">
                    <p className="text-sm font-semibold text-warning-800">{issue.title}</p>
                    <p className="mt-0.5 text-xs text-warning-700">{issue.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested keywords */}
          {(result.suggested_keywords_relevance || result.suggested_keywords || []).length > 0 && (
            <div className="card p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-700">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z" clipRule="evenodd" />
                </svg>
                Add These Keywords to Your Resume
              </h3>
              <p className="mt-1 text-xs text-muted">These terms appear in the job description but are missing from your resume.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(result.suggested_keywords_relevance || result.suggested_keywords || []).map((entry) => {
                  const keyword = entry.keyword || entry;
                  const relevance = entry.relevance || 0;
                  return (
                    <span key={keyword} className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
                      {keyword}
                      {relevance > 0 && (
                        <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-600">
                          {Math.round(relevance)}%
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="overflow-hidden rounded-3xl bg-ink p-8 text-white">
            <h3 className="font-display text-xl font-bold">Want expert eyes on your resume?</h3>
            <p className="mt-2 text-sm text-slate-300">
              Our team manually reviews and rewrites resumes to maximise ATS pass rates and recruiter response.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-amber-300"
              >
                Fix My Resume — from INR 199
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => { setResult(null); setFile(null); setJobDescription(""); setExperienceLevel(""); }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/60"
              >
                Analyse Another Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeCheckPage;
