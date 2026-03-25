export default function SummaryCard({ summary }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-brand-blue/30 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">Core Summary</h3>
        </div>
        <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase tracking-wider">
          Intelligence
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{summary}</p>
    </div>
  );
}
