const STEPS = [
  { id: 'queued', label: 'UPLOADED', index: 0 },
  { id: 'processing', label: 'PARSING', index: 1 },
  { id: 'analyzing', label: 'ANALYZING', index: 2 }, // Extra mock step for visual pacing
  { id: 'done', label: 'READY', index: 3 }
];

export default function StatusBadge({ status }) {
  // Map backend status to stepper index
  let currentIndex = 0;
  if (status === 'processing') currentIndex = 1; // Or visually bounce between 1 and 2
  if (status === 'done') currentIndex = 3;
  if (status === 'failed') currentIndex = -1;

  if (status === 'failed') {
    return null; // The parent component handles the error badge rendering
  }

  return (
    <div className="w-full flex items-center justify-between relative px-8 py-4 bg-slate-50/50 rounded-xl border border-slate-100">
      {/* Background connecting line */}
      <div className="absolute left-16 right-16 top-9 h-0.5 bg-slate-200 z-0" />
      
      {/* Active connecting line (width based on status) */}
      <div 
        className="absolute left-16 top-9 h-0.5 bg-brand-blue z-0 transition-all duration-700 ease-in-out"
        style={{ width: `calc(${currentIndex * 33.33}% - 3rem)` }}
      />
      
      {STEPS.map((step, idx) => {
        const isCompleted = idx <= currentIndex && currentIndex !== 3 && idx !== currentIndex;
        const isActive = idx === currentIndex;
        const isFuture = idx > currentIndex;
        const isFinalAndDone = idx === 3 && currentIndex === 3;
        
        let circleClass = 'bg-slate-100 text-slate-400 border-slate-200';
        if (isActive) circleClass = 'bg-brand-blue text-white shadow-md shadow-brand-blue/30 scale-110';
        if (isCompleted || isFinalAndDone) circleClass = 'bg-brand-blue text-white';

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-500 ease-in-out ${circleClass}`}>
              {(isCompleted || isFinalAndDone) ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : isActive ? (
                <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <span>{step.id === 'done' ? '?' : idx + 1}</span>
              )}
            </div>
            <span className={`mt-3 text-[10px] uppercase font-bold tracking-widest transition-colors duration-500 ${
              isActive || isCompleted || isFinalAndDone ? 'text-brand-blue' : 'text-slate-400'
            }`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
