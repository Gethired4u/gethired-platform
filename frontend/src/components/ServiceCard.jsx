import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function ServiceCard({ icon, title, description, highlights = [], badge, linkTo, ctaLabel = "Learn More", startingPrice }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition"
    >
      {badge && (
        <p className="mb-3 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
          {badge}
        </p>
      )}
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {startingPrice && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-600">Starts at {startingPrice}</p>}
      <p className="mt-2 text-sm leading-relaxed text-slate">{description}</p>
      {highlights.length > 0 && (
        <ul className="mt-3 space-y-2 text-sm text-slate">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {linkTo && (
        <Link to={linkTo} className="mt-4 inline-flex text-sm font-semibold text-brand-600 transition hover:text-brand-700">
          {ctaLabel}
        </Link>
      )}
      <div className="mt-4 h-1 w-0 rounded-full bg-brand-500 transition-all duration-300 group-hover:w-full" />
    </motion.article>
  );
}

export default ServiceCard;
