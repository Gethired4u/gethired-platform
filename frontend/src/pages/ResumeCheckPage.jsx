import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import ProcessingAnimation from "../components/ProcessingAnimation";
import { analyzeResume } from "../services/api";

const processingSteps = [
  "Analyzing keywords...",
  "Checking formatting...",
  "Evaluating bullet impact...",
  "Scoring ATS compatibility...",
];

function ResumeCheckPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const scoreClass = useMemo(() => {
    if (!result) return "text-ink";
    if (result.ats_score >= 75) return "text-emerald-600";
    if (result.ats_score >= 65) return "text-amber-600";
    return "text-rose-600";
  }, [result]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Please upload a PDF resume first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);
    setActiveStep(0);

    const progressInterval = setInterval(() => {
      setActiveStep((prev) => (prev < processingSteps.length - 1 ? prev + 1 : prev));
    }, 800);

    try {
      const startedAt = Date.now();
      const data = await analyzeResume(formData);
      const elapsed = Date.now() - startedAt;

      if (elapsed < 2500) {
        await new Promise((resolve) => setTimeout(resolve, 2500 - elapsed));
      }

      setResult(data);
      setActiveStep(processingSteps.length - 1);
    } catch (apiError) {
      setError(apiError?.response?.data?.detail || "Resume analysis failed. Please try again.");
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Resume ATS Analyzer</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Test your resume in seconds</h1>
        <p className="mt-3 text-slate">Upload a PDF and get AI-style ATS diagnostics with manual-ready recommendations.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Upload Resume (PDF)</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) => {
                setFile(event.target.files?.[0] || null);
                setError("");
              }}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {isLoading ? "Running ATS Analysis..." : "Analyze Resume"}
          </button>
        </form>

        {error && <p className="mt-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p>}
      </div>

      {isLoading && (
        <div className="mt-6">
          <ProcessingAnimation steps={processingSteps} activeStep={activeStep} />
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-ink">ATS Score</h2>
            <p className={`text-4xl font-display font-bold ${scoreClass}`}>{result.ats_score}%</p>
          </div>

          <p className="mt-2 text-sm text-slate">{result.summary}</p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Issues Found</h3>
              <ul className="mt-3 space-y-3">
                {result.issues.map((issue) => (
                  <li key={issue.title} className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                    <p className="text-sm font-semibold text-amber-900">{issue.title}</p>
                    <p className="mt-1 text-sm text-amber-800">{issue.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Suggested Keywords</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.suggested_keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                    {keyword}
                  </span>
                ))}
              </div>
              <Link
                to="/register"
                className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Fix My Resume
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeCheckPage;
