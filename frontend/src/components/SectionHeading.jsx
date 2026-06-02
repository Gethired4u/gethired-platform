import { memo } from "react";

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{eyebrow}</p>}
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base text-slate sm:text-lg">{description}</p>}
    </div>
  );
}

export default memo(SectionHeading);
