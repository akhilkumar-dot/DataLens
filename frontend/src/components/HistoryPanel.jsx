import { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from './StatusBadge';

export default function HistoryPanel({ apiUrl, onSelect, userId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await axios.get(`${apiUrl}/api/history`, {
          headers: { 'x-user-id': userId || 'anonymous' },
        });
        setHistory(response.data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [apiUrl, userId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="shimmer-bg h-4 rounded w-1/3 mb-3" />
            <div className="shimmer-bg h-3 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-slate-700">No uploads yet</p>
        <p className="text-xs text-slate-500 mt-1">Your analysis history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((job) => (
        <button
          key={job.jobId}
          onClick={() => onSelect(job)}
          className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-left group hover:border-brand-blue/30 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-brand-blue transition-colors duration-300">
                <svg className="w-5 h-5 text-brand-blue group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors leading-tight">
                  {job.filename}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {job.rowCount} rows · {job.columns?.length || 0} cols
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">
                    {new Date(job.createdAt).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
            {/* The horizontal stepper might be too wide here. I need to make sure StatusBadge handles being small, or we just render text. 
                Wait, my StatusBadge rewrite is a wide horizontal stepper. Using it in HistoryPanel will break the layout. 
                Ah! Let's modify HistoryPanel to use a simple inline badge instead of StatusBadge component. */}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
              job.status === 'done' ? 'bg-emerald-50 text-accent-emerald border border-emerald-100' :
              job.status === 'failed' ? 'bg-rose-50 text-accent-rose border border-rose-100' :
              'bg-amber-50 text-accent-amber border border-amber-100'
            }`}>
              {job.status.toUpperCase()}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
