import { Link } from "react-router-dom";

function CheckIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.15" />
      <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PricingCard({ name, price, subtitle, benefitsTitle, features, highlight, ctaText, bestFor, linkTo = "#form" }) {
  return (
    <article
      className={`relative flex flex-col rounded-3xl border p-7 transition duration-300 ${
        highlight
          ? "border-brand-500 bg-gradient-to-br from-brand-700 to-brand-800 text-white shadow-premium"
          : "border-slate-200 bg-white text-ink shadow-card hover:-translate-y-1 hover:shadow-glow"
      }`}
    >
      {highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold uppercase tracking-wide text-ink shadow-md">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M8 1l1.85 3.75L14 5.73l-3 2.92.71 4.13L8 10.75l-3.71 1.95.71-4.13-3-2.92 4.15-.98L8 1z" />
            </svg>
            Most Popular
          </span>
        </div>
      )}

      <div>
        <h3 className={`text-xl font-bold ${highlight ? "text-white" : "text-ink"}`}>{name}</h3>
        <div className="mt-4 flex items-end gap-1">
          <span className={`font-display text-4xl font-bold ${highlight ? "text-white" : "text-ink"}`}>{price}</span>
        </div>
        {subtitle && (
          <p className={`mt-1.5 text-sm ${highlight ? "text-brand-200" : "text-slate"}`}>{subtitle}</p>
        )}
      </div>

      {benefitsTitle && (
        <p className={`mt-5 text-xs font-bold uppercase tracking-widest ${highlight ? "text-brand-200" : "text-brand-600"}`}>
          {benefitsTitle}
        </p>
      )}

      <ul className="mt-3 flex-1 space-y-2.5 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <CheckIcon
              className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? "text-brand-200" : "text-brand-600"}`}
            />
            <span className={highlight ? "text-white/90" : "text-slate"}>{feature}</span>
          </li>
        ))}
      </ul>

      {bestFor && (
        <p className={`mt-5 text-xs font-semibold ${highlight ? "text-brand-200" : "text-slate"}`}>
          Best for: {bestFor}
        </p>
      )}

      <Link
        to={linkTo}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition duration-200 ${
          highlight
            ? "bg-white text-brand-700 shadow-inner-glow hover:bg-brand-50"
            : "bg-ink text-white hover:bg-slate-800"
        }`}
      >
        {ctaText}
        <svg viewBox="0 0 20 20" fill="currentColor" className="ml-2 h-4 w-4" aria-hidden="true">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </Link>
    </article>
  );
}

export default PricingCard;
