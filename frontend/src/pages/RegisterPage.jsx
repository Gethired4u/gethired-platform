import { useState } from "react";

import { registerUser } from "../services/api";
import { allServices } from "../data/serviceCatalog";
import { limitedServices } from "../data/serviceCatalog";

const serviceOptions = limitedServices.map((service) => service.title);

const initialForm = {
  name: "",
  email: "",
  phone: "",
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
      const response = await registerUser(form);
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
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">User Registration</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Start your job cracking plan</h1>
        <p className="mt-2 text-slate">
          Fill this form and our team will manually reach out with your next-step roadmap and service recommendations.
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
            Phone
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
              Experience
              <input
                type="text"
                value={form.experience}
                onChange={(e) => onFieldChange("experience", e.target.value)}
                placeholder="e.g. 3 years"
                required
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-ink">
              Target Role
              <input
                type="text"
                value={form.role}
                onChange={(e) => onFieldChange("role", e.target.value)}
                placeholder="e.g. Backend Engineer"
                required
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal"
              />
            </label>
          </div>

          <fieldset className="rounded-xl border border-slate-200 p-4">
            <legend className="px-2 text-sm font-semibold text-ink">Services Interested</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {serviceOptions.map((service) => (
                <label key={service} className="flex items-center gap-2 text-sm text-slate">
                  <input
                    type="checkbox"
                    checked={form.services_interested.includes(service)}
                    onChange={() => toggleService(service)}
                  />
                  {service}
                </label>
              ))}
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
        {successMessage && <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{successMessage}</p>}
      </div>
    </div>
  );
}

export default RegisterPage;
