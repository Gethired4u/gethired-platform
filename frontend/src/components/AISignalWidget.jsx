import { motion } from "framer-motion";

const bars = [16, 24, 12, 28, 18, 22];

function AISignalWidget() {
  return (
    <div className="mt-4 rounded-2xl bg-ink p-4 text-white">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">AI Signal Engine</p>
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">Live</span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-4">
        <div className="flex items-end gap-1 rounded-xl bg-white/5 p-3">
          {bars.map((height, index) => (
            <motion.span
              key={height + index}
              className="w-2 rounded bg-cyan-300"
              animate={{ height: [height, height + 12, height - 4, height + 6, height] }}
              transition={{ duration: 1.8 + index * 0.12, repeat: Infinity, ease: "easeInOut" }}
              style={{ height }}
            />
          ))}
        </div>

        <div className="relative h-14 w-14">
          <motion.span
            className="absolute inset-0 rounded-full border border-cyan-300/70"
            animate={{ scale: [1, 1.25], opacity: [0.9, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            className="absolute inset-1 rounded-full border border-cyan-200/70"
            animate={{ scale: [1, 1.25], opacity: [0.8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
          />
          <div className="absolute inset-3 flex items-center justify-center rounded-full bg-cyan-300/20 text-xs font-bold text-cyan-100">
            AI
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-300">Analyzing profiles, matching keywords, and ranking opportunities in real time.</p>
    </div>
  );
}

export default AISignalWidget;
