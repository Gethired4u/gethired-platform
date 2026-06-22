import { useState, useEffect, useRef } from "react";
import { registerUser, sendRegisterOtp, verifyRegisterOtp } from "../services/api";

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

const WHATSAPP_LINK = "https://wa.me/919187644559";

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

  // OTP states: idle | sending | sent | verifying | verified
  const [otpStep, setOtpStep] = useState("idle");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [emailToken, setEmailToken] = useState("");
  const [lastVerifiedEmail, setLastVerifiedEmail] = useState("");

  // Congratulations popup
  const [showCongrats, setShowCongrats] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  const congratsTimer = useRef(null);

  // Reset OTP state when user changes the email after a verify was started
  useEffect(() => {
    if (otpStep !== "idle" && form.email !== lastVerifiedEmail) {
      setOtpStep("idle");
      setOtpInput("");
      setOtpError("");
      setEmailToken("");
    }
  }, [form.email]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss congratulations popup after 2.5 s
  useEffect(() => {
    if (showCongrats) {
      congratsTimer.current = setTimeout(() => setShowCongrats(false), 2500);
    }
    return () => clearTimeout(congratsTimer.current);
  }, [showCongrats]);

  const onFieldChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleService = (service) => {
    setForm((prev) => {
      const selected = prev.services_interested.includes(service)
        ? prev.services_interested.filter((item) => item !== service)
        : [...prev.services_interested, service];
      return { ...prev, services_interested: selected };
    });
  };

  const handleSendOtp = async () => {
    if (!form.email) return;
    setOtpStep("sending");
    setOtpError("");
    try {
      await sendRegisterOtp(form.email, form.name || "there");
      setOtpStep("sent");
    } catch {
      setOtpError("Could not send OTP. Please check your email address and try again.");
      setOtpStep("idle");
    }
  };

  const handleVerifyOtp = async () => {
    if (otpInput.length < 6) return;
    setOtpStep("verifying");
    setOtpError("");
    try {
      const data = await verifyRegisterOtp(form.email, otpInput);
      setEmailToken(data.token);
      setLastVerifiedEmail(form.email);
      setOtpStep("verified");
    } catch (err) {
      setOtpError(err?.response?.data?.detail || "Wrong OTP. Please try again.");
      setOtpStep("sent");
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (otpStep !== "verified") {
      setError("Please verify your email address before submitting.");
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
        email_token: emailToken,
      });
      setRegistrationId(response.registration_id);
      setShowCongrats(true);
      setForm(initialForm);
      setOtpStep("idle");
      setOtpInput("");
      setEmailToken("");
      setLastVerifiedEmail("");
    } catch (apiError) {
      setError(apiError?.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Congratulations popup */}
      {showCongrats && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowCongrats(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCongrats(false)}
              className="absolute right-4 top-4 text-xl text-slate-400 transition hover:text-slate-700"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="mb-3 text-6xl">🎉</div>
            <h2 className="mb-2 font-display text-2xl font-bold text-ink">Congratulations!</h2>
            <p className="mb-5 text-sm text-slate">
              We received your registration. Our team will contact you within{" "}
              <strong>24 hours</strong> on WhatsApp.
            </p>
            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                Registration ID
              </p>
              <p className="font-mono text-xl font-bold text-brand-600">{registrationId}</p>
            </div>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              💬 Chat with our team on WhatsApp
            </a>
            <p className="mt-4 text-xs text-slate-400">Closes automatically in a moment&hellip;</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            Student Registration
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink">
            Start your career placement plan
          </h1>
          <p className="mt-2 text-slate">
            Share your fresher details and our team will map your resume, profile, project proof,
            and next application lane.
          </p>

          <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
            <label className="grid gap-2 text-sm font-semibold text-ink">
              Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                required
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
              />
            </label>

            {/* Email with inline OTP verification */}
            <div className="grid gap-2">
              <span className="text-sm font-semibold text-ink">Email</span>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onFieldChange("email", e.target.value)}
                  required
                  disabled={otpStep === "verified"}
                  placeholder="your@email.com"
                  className={`min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm font-normal focus:outline-none focus:ring-2 transition ${
                    otpStep === "verified"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-900 focus:ring-emerald-200"
                      : "border-slate-300 bg-white text-gray-900 placeholder:text-slate-400 focus:ring-brand-200 focus:border-brand-400"
                  }`}
                />
                {otpStep === "verified" ? (
                  <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-400 bg-emerald-50 px-4 text-sm font-bold text-emerald-700">
                    ✓ Verified
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={!form.email || otpStep === "sending" || otpStep === "verifying"}
                    className="shrink-0 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {otpStep === "sending" ? "Sending…" : otpStep === "sent" ? "Resend" : "Verify"}
                  </button>
                )}
              </div>

              {/* OTP entry */}
              {(otpStep === "sent" || otpStep === "verifying") && (
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit OTP"
                    value={otpInput}
                    onChange={(e) =>
                      setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    autoFocus
                    className="flex-1 rounded-xl border border-brand-300 bg-brand-50 px-4 py-3 text-center font-mono text-xl font-bold tracking-widest text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpInput.length < 6 || otpStep === "verifying"}
                    className="shrink-0 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {otpStep === "verifying" ? "…" : "Confirm"}
                  </button>
                </div>
              )}

              {(otpStep === "sent" || otpStep === "verifying") && (
                <p className="text-xs text-slate-500">
                  OTP sent to <strong>{form.email}</strong>. Check your inbox (and spam folder).
                </p>
              )}

              {otpStep === "idle" && form.email && (
                <p className="text-xs text-slate-500">
                  Click <strong>Verify</strong> to confirm your email address.
                </p>
              )}

              {otpError && <p className="text-xs text-rose-600">{otpError}</p>}
            </div>

            <label className="grid gap-2 text-sm font-semibold text-ink">
              Phone (WhatsApp)
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => onFieldChange("phone", e.target.value)}
                required
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
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
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
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
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
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
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
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
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                />
              </label>
            </div>

            <p className="rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-brand-700">
              Resume upload is collected in the next step. Keep your latest resume, Naukri link,
              LinkedIn link, and GitHub/project link ready.
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
              <legend className="px-2 text-sm font-bold text-slate-600">
                Individual Services{" "}
                <span className="font-normal text-muted">(Optional)</span>
              </legend>
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
              {isSubmitting ? "Submitting…" : "Submit Registration"}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p>
          )}
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
