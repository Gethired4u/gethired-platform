import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import SectionHeading from "../components/SectionHeading";
import ServiceCard from "../components/ServiceCard";
import { coreServices, gameChangerServices } from "../data/serviceCatalog";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function ServicesPage() {
  return (
    <div className="px-4 py-14 sm:px-6 lg:px-8">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-card sm:p-10"
      >
        <div className="absolute -left-14 top-8 h-44 w-44 rounded-full bg-brand-100 blur-3xl" />
        <div className="absolute -right-10 bottom-8 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />
        <div className="premium-sheen animate-shimmer absolute inset-0 opacity-25" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Services Hub</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Dedicated pages for every service in your job-cracking stack
          </h1>
          <p className="mt-4 max-w-3xl text-base text-slate sm:text-lg">
            Explore exactly how each program works, what outcomes you receive, and which track fits students, early
            professionals, or experienced employees.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Book My Plan
            </Link>
            <Link
              to="/resume-check"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-slate-400"
            >
              Free ATS Check
            </Link>
          </div>
        </div>
      </motion.section>

      <section className="mx-auto mt-16 max-w-6xl">
        <SectionHeading
          eyebrow="Core Engine"
          title="Career conversion services"
          description="Execution-focused services designed to improve shortlist rates, interview depth, and offer outcomes."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {coreServices.map((service, index) => (
            <motion.div
              key={service.slug}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
            >
              <ServiceCard
                icon={service.icon}
                title={service.title}
                description={service.description}
                highlights={service.highlights}
                badge={service.badge}
                startingPrice={service.startingPrice}
                linkTo={`/services/${service.slug}`}
                ctaLabel="View Service Page"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* <section className="mx-auto mt-16 max-w-6xl">
        <SectionHeading
          eyebrow="Game Changer"
          title="Unique differentiator services"
          description="Industry-forward offerings designed to make the platform stand out for students and employees."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {gameChangerServices.map((service, index) => (
            <motion.div
              key={service.slug}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <ServiceCard
                icon={service.icon}
                title={service.title}
                description={service.description}
                highlights={service.highlights}
                badge={service.badge}
                startingPrice={service.startingPrice}
                linkTo={`/services/${service.slug}`}
                ctaLabel="Explore Details"
              />
            </motion.div>
          ))}
        </div>
      </section> */}

      <section className="mx-auto mt-16 max-w-6xl pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="rounded-3xl bg-ink p-8 text-white shadow-card sm:p-10"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-100">HR + Company Tie-Ups</p>
          <h2 className="mt-3 font-display text-3xl font-bold">Recruiter channels powered by manual partner network</h2>
          <p className="mt-4 max-w-4xl text-sm text-slate-200 sm:text-base">
            Once your profile clears ATS and mock readiness milestones, our team activates partner HR and company
            referral channels for higher response visibility.
          </p>
        </motion.div>
      </section>
    </div>
  );
}

export default ServicesPage;
