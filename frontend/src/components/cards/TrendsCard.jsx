export default function TrendsCard({ trends }) {
  if (!trends || trends.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-accent-emerald/30 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">Key Trends</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          {trends.length} found
        </span>
      </div>

      <ul className="space-y-4">
        {trends.map((trend, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-emerald shrink-0" />
            <p className="text-sm text-slate-600 leading-relaxed">
              {trend}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
