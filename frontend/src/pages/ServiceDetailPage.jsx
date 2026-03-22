import { motion } from "framer-motion";
import { Link, Navigate, useParams } from "react-router-dom";

import SectionHeading from "../components/SectionHeading";
import { allServices, getServiceBySlug } from "../data/serviceCatalog";

function ServiceDetailPage() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const relatedServices = allServices.filter((item) => item.slug !== service.slug).slice(0, 3);

  return (
    <div className="px-4 py-14 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-card sm:p-10"
      >
        <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-brand-100 blur-3xl" />
        <div className="absolute right-0 top-12 h-36 w-36 rounded-full bg-blue-100 blur-3xl" />
        <div className="premium-sheen animate-shimmer absolute inset-0 opacity-20" />
        <div className="relative">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {service.badge && (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
                {service.badge}
              </span>
            )}
            <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate">
              {service.category === "innovation" ? "Innovation Track" : "Core Track"}
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Service Detail</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">{service.title}</h1>
          <p className="mt-4 max-w-4xl text-base text-slate sm:text-lg">{service.description}</p>
          {service.startingPrice && (
            <p className="mt-4 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
              Starting at {service.startingPrice}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Activate This Service
            </Link>
            <Link
              to="/services"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-slate-400"
            >
              Explore All Services
            </Link>
          </div>
        </div>
      </motion.section>

      <section className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-2">
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-rose-100 bg-rose-50 p-6 shadow-card"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">Problem</p>
          <p className="mt-3 text-sm leading-relaxed text-rose-900">{service.problem}</p>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-card"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Solution</p>
          <p className="mt-3 text-sm leading-relaxed text-emerald-900">{service.solution}</p>
        </motion.article>
      </section>

      <section className="mx-auto mt-14 max-w-6xl">
        <SectionHeading
          eyebrow="How It Works"
          title={`Execution flow for ${service.title}`}
          description="Designed for manual quality with AI-style speed and clarity."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {service.howItWorks.map((item, index) => (
            <motion.article
              key={item.step}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Step {index + 1}</p>
              <h3 className="mt-2 text-base font-bold text-ink">{item.step}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">{item.detail}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-2">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Outputs</p>
          <ul className="mt-4 space-y-3 text-sm text-slate">
            {service.outputs.map((output) => (
              <li key={output} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-600" />
                <span>{output}</span>
              </li>
            ))}
          </ul>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Best For</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {service.idealFor.map((audience) => (
              <span key={audience} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {audience}
              </span>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-soft p-4 text-sm text-slate">
            Add this service in your registration form and our team will prioritize the implementation roadmap manually.
          </div>
        </motion.article>
      </section>

      <section className="mx-auto mt-14 max-w-6xl pb-8">
        <SectionHeading
          eyebrow="Related Services"
          title="Recommended next steps"
          description="Combine complementary services for faster outcomes."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {relatedServices.map((item) => (
            <motion.article
              key={item.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
            >
              <p className="text-sm font-semibold text-brand-600">{item.icon}</p>
              <h3 className="mt-2 text-base font-bold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm text-slate">{item.description}</p>
              <Link
                to={`/services/${item.slug}`}
                className="mt-4 inline-flex text-sm font-semibold text-brand-600 transition hover:text-brand-700"
              >
                View Service
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ServiceDetailPage;
