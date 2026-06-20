import { useState } from "react";

import { registerUser } from "../services/api";

const packageOptions = [
  "₹1 Resume Check (1 Day)",
  "Job Starter Pack – ₹399 (15 Days)",
  "Placement Accelerator – ₹999 (30 Days)",
  "Premium Placement Support – ₹1499 (60 Days)",
  "Ultimate Career Transformation – ₹2499 (90 Days)",
];

const individualServiceOptions = [
  "ATS Resume Optimization",
  "Naukri Profile Optimization",
  "LinkedIn Profile Optimization",
  "Interview Preparation Kit",
  "Mock Interview Session",
  "Job Alerts on WhatsApp",
  "GitHub & Portfolio Setup",
  "Placement Readiness Score",
  "HR Interview Preparation",
  "Technical Interview Preparation",
  "Career Roadmap Planning",
  "Salary Negotiation Guidance",
];
const WHATSAPP_LINK = "https://wa.me/918328221007";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  college: "",
  graduation_year: "",
  experience: "",
  role: "",
  services_interested: [],
};

function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const onFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleService = (service) => {
    setForm((prev) => {
      const selected = prev.services_interested.includes(service)
        ? prev.services_interested.filter((item) => item !== service)
        : [...prev.services_interested, service];

      return { ...prev, services_interested: selected };
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await registerUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        experience: form.experience || `${form.graduation_year} graduate fresher`,
        role: form.role,
        services_interested: form.services_interested,
        lead_source: "register_page_student_funnel",
        quiz_answers: {
          college: form.college,
          graduation_year: form.graduation_year,
        },
      });
      setSuccessMessage(`${response.message} Registration ID: ${response.user_id}`);
      setForm(initialForm);
    } catch (apiError) {
      setError(apiError?.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Student Registration</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Start your career placement plan</h1>
        <p className="mt-2 text-slate">
          Share your fresher details and our team will map your resume, profile, project proof, and next application lane.
        </p>

        <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Name
            <input
              type="text"
              value={form.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              required
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => onFieldChange("email", e.target.value)}
              required
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Phone (WhatsApp)
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => onFieldChange("phone", e.target.value)}
              required
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-ink">
              College / City
              <input
                type="text"
                value={form.college}
                onChange={(e) => onFieldChange("college", e.target.value)}
                placeholder="e.g. Delhi University, JNTU, VTU, Mumbai University"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-ink">
              Passout Year
              <input
                type="text"
                value={form.graduation_year}
                onChange={(e) => onFieldChange("graduation_year", e.target.value)}
                placeholder="e.g. 2025 or final year"
                required
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-ink">
              Current Career Status
              <input
                type="text"
                value={form.experience}
                onChange={(e) => onFieldChange("experience", e.target.value)}
                placeholder="Student, Intern, Fresher, Experience"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-ink">
              Target Role
              <input
                type="text"
                value={form.role}
                onChange={(e) => onFieldChange("role", e.target.value)}
                placeholder="e.g. software engineer, data analyst, HR, finance analyst"
                required
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal"
              />
            </label>
          </div>

          <p className="rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-brand-700">
            Resume upload is collected in the next step. Keep your latest resume, Naukri link, LinkedIn link, and GitHub/project link ready.
          </p>

          <fieldset className="rounded-xl border border-brand-200 bg-brand-50/40 p-4">
            <legend className="px-2 text-sm font-bold text-brand-700">Services Interested</legend>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {packageOptions.map((pkg) => {
                const checked = form.services_interested.includes(pkg);
                return (
                  <label
                    key={pkg}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition ${
                      checked
                        ? "border-brand-400 bg-brand-50 font-semibold text-brand-700"
                        : "border-slate-200 bg-white text-slate hover:border-brand-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleService(pkg)}
                      className="accent-brand-600"
                    />
                    {pkg}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-slate-200 p-4">
            <legend className="px-2 text-sm font-bold text-slate-600">Individual Services <span className="font-normal text-muted">(Optional)</span></legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {individualServiceOptions.map((service) => {
                const checked = form.services_interested.includes(service);
                return (
                  <label
                    key={service}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition ${
                      checked
                        ? "border-slate-400 bg-slate-50 font-semibold text-ink"
                        : "border-slate-200 bg-white text-slate hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleService(service)}
                      className="accent-slate-600"
                    />
                    {service}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {isSubmitting ? "Submitting..." : "Submit Registration"}
          </button>
        </form>

        {error && <p className="mt-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p>}
        {successMessage && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-emerald-50 px-4 py-3">
            <p className="min-w-0 flex-1 text-sm text-emerald-700">{successMessage}</p>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700">
              Chat with team
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
