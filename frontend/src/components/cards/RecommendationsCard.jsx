export default function RecommendationsCard({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-brand-blue/30 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">Strategic Recommendations</h3>
      </div>

      <ol className="space-y-4">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 w-5 h-5 rounded bg-blue-50 text-brand-blue border border-blue-100 text-[10px] font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <p className="text-sm text-slate-600 leading-relaxed">
              {rec}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
