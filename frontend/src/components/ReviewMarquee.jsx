import { motion } from "framer-motion";

function ReviewCard({ review }) {
  return (
    <article className="w-[310px] shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:w-[340px]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ink">{review.name}</p>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{review.rating}</span>
      </div>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate">
        {review.city} | {review.role}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate">{review.text}</p>
    </article>
  );
}

function ReviewMarquee({ reviews }) {
  const rowOne = reviews.slice(0, Math.ceil(reviews.length / 2));
  const rowTwo = reviews.slice(Math.ceil(reviews.length / 2));
  const rowOneLoop = [...rowOne, ...rowOne];
  const rowTwoLoop = [...rowTwo, ...rowTwo];

  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
          className="mb-8 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Reviews</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Stories Behind the Success</h2>
          <p className="mt-3 text-sm text-slate sm:text-base">
            Real outcomes from students and early-career professionals across India.
          </p>
        </motion.div>

        <div className="relative space-y-4 overflow-hidden rounded-3xl border border-slate-200 bg-soft/80 p-4 shadow-card">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-soft to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-soft to-transparent" />

          <div className="review-marquee flex gap-4">
            {rowOneLoop.map((review, index) => (
              <ReviewCard key={`${review.id}-row1-${index}`} review={review} />
            ))}
          </div>

          <div className="review-marquee review-marquee-reverse flex gap-4">
            {rowTwoLoop.map((review, index) => (
              <ReviewCard key={`${review.id}-row2-${index}`} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReviewMarquee;