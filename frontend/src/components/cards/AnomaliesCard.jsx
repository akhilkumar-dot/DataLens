const SEVERITY_CONFIG = {
  high: {
    label: 'HIGH',
    color: 'text-accent-rose',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  medium: {
    label: 'MED',
    color: 'text-accent-amber',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  low: {
    label: 'LOW',
    color: 'text-slate-500',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
};

export default function AnomaliesCard({ anomalies }) {
  if (!anomalies || anomalies.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-accent-rose/30 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-accent-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">Anomalies Detected</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          {anomalies.length} flagged
        </span>
      </div>

      <ul className="space-y-4">
        {anomalies.map((anomaly, i) => {
          const sev = SEVERITY_CONFIG[anomaly.severity] || SEVERITY_CONFIG.medium;
          return (
            <li key={i} className="flex items-start gap-3">
              <span className={`mt-0.5 shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border ${sev.color} ${sev.bg} ${sev.border}`}>
                {sev.label}
              </span>
              <p className="text-sm text-slate-600 leading-relaxed">
                {anomaly.description}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
