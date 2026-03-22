import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import AISignalWidget from "../components/AISignalWidget";
import PricingCard from "../components/PricingCard";
import ReviewMarquee from "../components/ReviewMarquee";
import SectionHeading from "../components/SectionHeading";
import ServiceCard from "../components/ServiceCard";
import { coreServices, gameChangerServices } from "../data/serviceCatalog";
import { indianStudentReviews } from "../data/studentReviews";

const roadmapPoints = [
  "ATS-first resume optimization with role-specific and semantic keyword alignment.",
  "LinkedIn, GitHub, and Naukri profile upgrades for higher recruiter visibility.",
  "Daily curated job alerts with role, experience, and quality-based filtering.",
  "Structured interview Q&A practice across Python, Django, SQL, Selenium, and system rounds.",
  "Live mock interviews with scorecards covering communication, confidence, and technical depth.",
  "Projects accelerator to build portfolio-ready, real-world proof of skills.",
  "Vibe coding modules for practical AI prompting, debugging, and developer thinking.",
  "Referral and HR/company tie-up pipeline activation for shortlisted-ready profiles.",
  "Daily application tracker with follow-up cadence and conversion-focused execution.",
  "Continuous review loops so both students and employees stay job-ready until offer closure.",
];

const pricing = [
  {
    name: "Free",
    price: "INR 0",
    subtitle: "Try core workflow before upgrading",
    benefitsTitle: "Included Benefits",
    features: [
      "Resume ATS Analyzer demo with score + issue summary",
      "Basic keyword and formatting feedback",
      "Starter curated job alerts (limited)",
      "Preview access to service pages and roadmap",
    ],
    bestFor: "Students and first-time users",
    ctaText: "Start Free",
  },
  {
    name: "Pro",
    price: "INR 3,999 / month",
    subtitle: "Most popular plan for serious preparation",
    benefitsTitle: "Included Benefits",
    features: [
      "Resume ATS Optimization with manual expert review",
      "Job Alerts (Manual + Smart Filtering)",
      "Interview Q&A + Manual Doubt Support",
      "GitHub + LinkedIn + Naukri optimization guidance",
      "Vibe coding prompt playbooks + projects accelerator starter",
    ],
    bestFor: "Students and early professionals targeting quick interview calls",
    ctaText: "Choose Pro",
    highlight: true,
  },
  {
    name: "Premium",
    price: "INR 6,999 / month",
    subtitle: "Full execution + hiring acceleration stack",
    benefitsTitle: "Included Benefits",
    features: [
      "Everything in Pro",
      "Live Mock Interviews with scorecards and correction plan",
      "30 Days Guided roadmap execution support",
      "HR and company tie-up referral pipeline activation",
      "Referral radar + salary negotiation + interview replay support",
    ],
    bestFor: "Job switchers and offer-focused candidates",
    ctaText: "Go Premium",
  },
];

const heroMetrics = [
  { label: "Service Tracks", value: "14+" },
  { label: "Manual Expert Touchpoints", value: "30+" },
  { label: "ATS + Career Workflows", value: "AI-style" },
];

const kpiStats = [
  {
    value: "2,400+",
    label: "Placements",
    valueClass: "text-amber-100",
    labelClass: "text-amber-50",
    borderClass: "border-amber-300/70 bg-amber-500/25",
  },
  {
    value: "93%",
    label: "Success Rate",
    valueClass: "text-emerald-100",
    labelClass: "text-emerald-50",
    borderClass: "border-emerald-300/70 bg-emerald-500/25",
  },
  {
    value: "180+",
    label: "Partner Companies Tie-Ups",
    valueClass: "text-cyan-100",
    labelClass: "text-cyan-50",
    borderClass: "border-cyan-300/70 bg-cyan-500/25",
  },
  {
    value: "10,000+",
    label: "HR Contacts",
    valueClass: "text-orange-100",
    labelClass: "text-orange-50",
    borderClass: "border-orange-300/70 bg-orange-500/25",
  },
];

const partnerCompanies = ["TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "Capgemini", "HCL", "Tech Mahindra"];

const tieUpSteps = [
  {
    title: "1) Profile to shortlist",
    detail: "Only ATS-ready, role-matched profiles are pushed to partner HR teams.",
  },
  {
    title: "2) Smart role matching",
    detail: "Openings are matched by stack, experience, location, and interview readiness.",
  },
  {
    title: "3) Fast follow-up loop",
    detail: "Manual recruiter follow-ups improve callbacks, interviews, and closure speed.",
  },
];

const hiringMapRoutes = [
  { id: "delhi-mumbai", path: "M210 68 Q182 88 148 145", color: "#7dd3fc", delay: 0 },
  { id: "mumbai-bengaluru", path: "M148 145 Q160 186 180 220", color: "#fcd34d", delay: 0.2 },
  { id: "hyderabad-chennai", path: "M220 186 Q234 202 244 226", color: "#f9a8d4", delay: 0.4 },
  { id: "delhi-kolkata", path: "M210 68 Q252 84 287 139", color: "#86efac", delay: 0.6 },
  { id: "pune-hyderabad", path: "M163 167 Q192 178 220 186", color: "#c4b5fd", delay: 0.8 },
];

const hiringMapNodes = [
  { id: "Delhi NCR", x: 210, y: 68, color: "#7dd3fc", labelOffsetX: -24, labelOffsetY: -12 },
  { id: "Mumbai", x: 148, y: 145, color: "#fcd34d", labelOffsetX: -18, labelOffsetY: 18 },
  { id: "Pune", x: 163, y: 167, color: "#67e8f9", labelOffsetX: -8, labelOffsetY: 20 },
  { id: "Hyderabad", x: 220, y: 186, color: "#c4b5fd", labelOffsetX: -14, labelOffsetY: 18 },
  { id: "Bengaluru", x: 180, y: 220, color: "#86efac", labelOffsetX: -18, labelOffsetY: 18 },
  { id: "Chennai", x: 244, y: 226, color: "#f9a8d4", labelOffsetX: -10, labelOffsetY: 18 },
  { id: "Kolkata", x: 287, y: 139, color: "#fca5a5", labelOffsetX: -16, labelOffsetY: 18 },
];

const flagshipService = coreServices.find((service) => service.slug === "resume-ats-optimization");

function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        <div className="absolute left-10 top-16 h-28 w-28 rounded-full bg-brand-100 blur-2xl" />
        <div className="absolute right-10 top-10 h-32 w-32 animate-drift rounded-full bg-cyan-200/60 blur-2xl" />
        <div className="absolute -bottom-10 right-1/3 h-32 w-32 animate-float rounded-full bg-sky-100/70 blur-2xl" />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="mx-auto max-w-6xl"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>


              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Career Intelligence Platform</p>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
                AI Optimized Career Platform<span className="gradient-text"> for Students and Working Professionals</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate">
                A complete job-winning system combining AI-style analysis, expert guidance, and proven workflows to help you land interviews faster and smarter.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/services"
                  className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-slate-800"
                >
                  Explore Services
                </Link>
                <Link
                  to="/resume-check"
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-slate-400"
                >
                  Free Resume Check
                </Link>
              </div>
            </div>

            <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-glow">
              <div className="premium-sheen animate-shimmer absolute inset-0 opacity-10" />
              <p className="text-sm font-semibold text-slate">Live Conversion Snapshot</p>
              <div className="mt-4 space-y-4 rounded-2xl bg-white p-4">
                {heroMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: 0.2 + index * 0.1 }}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate">{metric.label}</p>
                    <p className="text-sm font-bold text-brand-700">{metric.value}</p>
                  </motion.div>
                ))}
              </div>
              <AISignalWidget />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[28px] border border-[#0b2e6d] bg-[#041a42] p-4 shadow-card sm:p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {kpiStats.map((item, index) => (
              <motion.article
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                whileHover={{ y: -4 }}
                className={`rounded-3xl border px-6 py-7 text-center ${item.borderClass}`}
              >
                <p className={`font-display text-4xl font-bold ${item.valueClass}`}>{item.value}</p>
                <p className={`mt-2 text-lg font-semibold ${item.labelClass ?? "text-slate-100"}`}>{item.label}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Core Services"
            title="Dedicated service pages for each core offering"
            description="Every card opens a standalone page with detailed execution flow, outputs, and outcomes."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {coreServices.map((service, index) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
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
                  ctaLabel="Open Service Page"
                />
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/services"
              className="inline-flex rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-slate-400"
            >
              View Full Services Hub
            </Link>
          </div>
        </div>
      </section>

      {/* <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Game Changer Lab"
            title="Unique service innovations for industry-level differentiation"
            description="These offerings are designed to make the platform stand out and drive viral demand."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {gameChangerServices.map((service, index) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
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
                  ctaLabel="See Innovation Page"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {flagshipService && (
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl items-start gap-10 rounded-3xl bg-white p-8 shadow-card lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Flagship Feature</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-ink">{flagshipService.title}</h2>
              <p className="mt-4 text-slate">{flagshipService.problem}</p>
              <ul className="mt-5 space-y-3 text-sm text-slate">
                {flagshipService.howItWorks.map((item) => (
                  <li key={item.step}>
                    <span className="font-semibold text-ink">{item.step}: </span>
                    {item.detail}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                {flagshipService.outputs.map((output) => (
                  <span key={output} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    {output}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/services/${flagshipService.slug}`}
                  className="inline-flex rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Open ATS Service Page
                </Link>
                <Link
                  to="/resume-check"
                  className="inline-flex rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-ink transition hover:border-slate-400"
                >
                  Try Resume Analyzer
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-soft p-5">
              <p className="text-sm font-semibold text-ink">ATS Process Animation Stages</p>
              <ul className="mt-4 space-y-3 text-sm text-slate">
                <li>1. Parse resume sections and structural readability.</li>
                <li>2. Match role-specific and semantic keywords.</li>
                <li>3. Identify weak bullets and low-impact outcomes.</li>
                <li>4. Deliver premium optimization plan and score movement.</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[30px] border border-sky-300/20 bg-gradient-to-br from-[#040e27] via-[#082252] to-[#07356f] p-6 text-white shadow-card sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="inline-flex rounded-full border border-sky-300/30 bg-sky-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-100">
                HR and Company Tie-Ups
              </p>
              <h3 className="mt-4 font-display text-2xl font-bold leading-tight sm:text-3xl">
                Clear hiring pipeline with active recruiters and partner companies
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sky-100/90 sm:text-base">
                We keep this simple: optimize profile, match the right openings, and push to recruiter channels with manual follow-up.
              </p>

              <div className="mt-6 space-y-3">
                {tieUpSteps.map((step, index) => (
                  <motion.article
                    key={step.title}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.38, delay: index * 0.08 }}
                    className="rounded-xl border border-white/20 bg-white/10 p-4"
                  >
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="mt-1 text-sm text-sky-100/90">{step.detail}</p>
                  </motion.article>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="rounded-xl border border-cyan-200/30 bg-cyan-300/10 px-4 py-3"
                >
                  <p className="text-2xl font-bold text-cyan-100">6,800+</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-cyan-50">Trained Students Recommended</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="rounded-xl border border-emerald-200/30 bg-emerald-300/10 px-4 py-3"
                >
                  <p className="text-2xl font-bold text-emerald-100">1,950+</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-50">Hiring Closures Supported</p>
                </motion.div>
              </div>

              {/* <p className="mt-5 text-sm text-sky-100/90">
                Partner companies also use our platform to hire trained, interview-ready students and professionals faster.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {partnerCompanies.map((company) => (
                  <span
                    key={company}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-sky-50"
                  >
                    {company}
                  </span>
                ))}
              </div> */}
            </div>

            <div className="rounded-2xl border border-sky-200/25 bg-[#020b1f]/45 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-cyan-100">Live Hiring Map (India)</p>
                  <p className="mt-1 text-xs text-sky-100/85">Animated recruiter flow across major hiring hubs.</p>
                </div>
                <span className="rounded-full border border-emerald-300/35 bg-emerald-300/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                  Network Active
                </span>
              </div>

              <div className="relative mt-4 h-[280px] overflow-hidden rounded-xl border border-white/10 bg-[#020918]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_15%,rgba(56,189,248,0.12),transparent_42%),radial-gradient(circle_at_78%_80%,rgba(167,243,208,0.1),transparent_40%)]" />
                <svg className="relative z-10 h-full w-full" viewBox="0 0 420 280" fill="none" aria-label="India hiring network map">
                  <path
                    d="M194 31 L228 34 L253 54 L275 76 L291 106 L300 137 L289 162 L289 187 L279 209 L258 228 L230 241 L206 249 L183 245 L168 230 L154 214 L143 195 L136 173 L126 153 L129 131 L140 108 L154 91 L164 73 L179 52 Z"
                    fill="rgba(30, 64, 175, 0.28)"
                    stroke="rgba(147, 197, 253, 0.5)"
                    strokeWidth="1.8"
                  />

                  {hiringMapRoutes.map((route) => (
                    <motion.path
                      key={route.id}
                      d={route.path}
                      stroke={route.color}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeDasharray="6 8"
                      initial={{ opacity: 0.45, strokeDashoffset: 14 }}
                      animate={{ opacity: [0.35, 1, 0.35], strokeDashoffset: [14, 0] }}
                      transition={{ duration: 2.6, delay: route.delay, repeat: Infinity, ease: "linear" }}
                    />
                  ))}

                  {hiringMapNodes.map((node, index) => (
                    <g key={node.id}>
                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r="8"
                        fill={node.color}
                        initial={{ opacity: 0.45, scale: 1 }}
                        animate={{ opacity: [0.45, 0, 0.45], scale: [1, 1.8, 1] }}
                        transition={{ duration: 2.4, delay: index * 0.15, repeat: Infinity }}
                      />
                      <circle cx={node.x} cy={node.y} r="4.4" fill={node.color} />
                      <text
                        x={node.x + node.labelOffsetX}
                        y={node.y + node.labelOffsetY}
                        fill="rgba(224, 242, 254, 0.95)"
                        fontSize="10"
                        fontWeight="700"
                      >
                        {node.id}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <div className="mt-3 grid gap-2 text-[11px] font-semibold uppercase tracking-wide text-sky-100 sm:grid-cols-3">
                <p className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-center">HR Network Active</p>
                <p className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-center">Pipeline Synced</p>
                <p className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-center">Push Queue Live</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Execution Plan"
            title="30 Days guided roadmap"
            description="Complete point-wise execution plan without week splits so nothing is missed."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {roadmapPoints.map((point, index) => (
              <motion.article
                key={point}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-slate">{point}</p>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate shadow-card">
            Daily consistency includes applications, follow-ups, interview practice, profile iteration, and recruiter pipeline tracking.
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Pricing"
            title="Start free and scale when you are ready"
            description="Clear plan structure with service-aligned benefits so you can choose based on your exact career stage."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {pricing.map((plan) => (
              <PricingCard
                key={plan.name}
                name={plan.name}
                price={plan.price}
                subtitle={plan.subtitle}
                benefitsTitle={plan.benefitsTitle}
                features={plan.features}
                bestFor={plan.bestFor}
                ctaText={plan.ctaText}
                highlight={plan.highlight}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-ink p-10 text-center text-white shadow-card">
          <h2 className="font-display text-3xl font-bold">Ready to crack your next role?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
            Start with ATS optimization, then activate alerts, mocks, and tie-up channels for end-to-end execution.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-ink hover:bg-slate-100">
              Get Started
            </Link>
            <Link
              to="/services"
              className="rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Browse Service Pages
            </Link>
          </div>
        </div>
      </section>

      <ReviewMarquee reviews={indianStudentReviews} />
    </div>
  );
}

export default HomePage;
