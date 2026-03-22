function ProcessingAnimation({ steps, activeStep }) {
  return (
    <div className="glass rounded-2xl p-5 shadow-card">
      <p className="text-sm font-bold text-ink">AI processing in progress</p>
      <div className="mt-4 space-y-3">
        {steps.map((step, index) => {
          const isComplete = index < activeStep;
          const isActive = index === activeStep;

          return (
            <div key={step} className="flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  isComplete
                    ? "bg-emerald-500"
                    : isActive
                    ? "animate-pulseSoft bg-brand-600"
                    : "bg-slate-300"
                }`}
              />
              <p className={`text-sm ${isActive ? "text-ink" : "text-slate"}`}>{step}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProcessingAnimation;
