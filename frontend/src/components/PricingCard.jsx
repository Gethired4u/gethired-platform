function PricingCard({ name, price, subtitle, benefitsTitle, features, highlight, ctaText, bestFor }) {
  return (
    <article
      className={`rounded-2xl border p-6 shadow-card ${
        highlight ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-ink"
      }`}
    >
      <h3 className="text-xl font-bold">{name}</h3>
      <p className="mt-3 text-3xl font-display font-bold">{price}</p>
      {subtitle && <p className={`mt-2 text-sm ${highlight ? "text-brand-100" : "text-slate"}`}>{subtitle}</p>}
      {benefitsTitle && (
        <p className={`mt-4 text-xs font-bold uppercase tracking-wide ${highlight ? "text-brand-100" : "text-brand-700"}`}>
          {benefitsTitle}
        </p>
      )}
      <ul className="mt-3 space-y-2 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${highlight ? "bg-white" : "bg-brand-600"}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {bestFor && (
        <p className={`mt-4 text-xs font-semibold ${highlight ? "text-brand-100" : "text-slate"}`}>
          Best for: {bestFor}
        </p>
      )}
      <button
        type="button"
        className={`mt-6 w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
          highlight ? "bg-white text-brand-700 hover:bg-brand-50" : "bg-ink text-white hover:bg-slate-800"
        }`}
      >
        {ctaText}
      </button>
    </article>
  );
}

export default PricingCard;
