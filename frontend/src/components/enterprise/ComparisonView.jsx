import { useState, useEffect } from 'react';
import axios from 'axios';
import UploadZone from '../UploadZone';
import useJobPolling from '../../hooks/useJobPolling';
import StatusBadge from '../StatusBadge';

const Icons = {
  Scale: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
  ArrowRight: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Refresh: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
};

export default function ComparisonView({ apiUrl, userId }) {
  const jobA = useJobPolling(apiUrl);
  const jobB = useJobPolling(apiUrl);
  
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Generate Comparative AI Summary when both are done
  useEffect(() => {
    if (jobA.status === 'done' && jobB.status === 'done' && jobA.insights && jobB.insights && !aiSummary && !isGeneratingSummary) {
      generateComparison();
    }
  }, [jobA.status, jobB.status, jobA.insights, jobB.insights]);

  const generateComparison = async () => {
    setIsGeneratingSummary(true);
    try {
      const response = await axios.post(`${apiUrl}/api/ai/chat`, {
        messages: [{
          role: 'user',
          content: `Compare these two datasets structurally. Dataset A (${jobA.jobDetails.filename}) vs Dataset B (${jobB.jobDetails.filename}).\nInsights A: ${JSON.stringify(jobA.insights.executive_summary)}\nInsights B: ${JSON.stringify(jobB.insights.executive_summary)}\nProvide a 2-paragraph comparative summary focusing on key shifts and delta risks. Do not use markdown headers. Respond ONLY with the 2 paragraphs.`
        }]
      });
      setAiSummary(response.data.response);
    } catch (e) {
      console.error(e);
      setAiSummary("Failed to generate comparative AI summary. Please check your AI service connection.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const kpisA = getKPIs(jobA.jobDetails, jobA.insights);
  const kpisB = getKPIs(jobB.jobDetails, jobB.insights);

  const renderUploadState = (job, title, colorClass, borderClass, bgClass) => {
    if (!job.status) {
      return (
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-2xl border ${borderClass} p-6 shadow-sm transition-all hover:shadow-md`}>
          <p className={`text-[10px] font-bold tracking-widest ${colorClass} uppercase mb-4`}>{title}</p>
          <UploadZone apiUrl={apiUrl} onUploadSuccess={(data) => job.startPolling(data.jobId)} userId={userId} />
        </div>
      );
    }

    return (
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-2xl border ${borderClass} p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px]`}>
        <p className={`text-[10px] font-bold tracking-widest ${colorClass} uppercase w-full text-left`}>{title}</p>
        <div className="flex-1 flex flex-col items-center justify-center w-full mt-4">
          <StatusBadge status={job.status} />
          {job.jobDetails?.filename && <p className="mt-4 text-lg font-bold text-slate-700 dark:text-slate-300">{job.jobDetails.filename}</p>}
          {job.status === 'failed' && (
            <p className="mt-2 text-xs text-rose-500">{job.error}</p>
          )}
          {job.status === 'done' && (
            <button onClick={() => { job.reset(); setAiSummary(''); }} className={`mt-6 text-xs font-bold px-4 py-2 rounded-lg transition-all ${colorClass} bg-slate-50 dark:bg-slate-800 border ${borderClass} hover:opacity-80`}>
              Replace Dataset
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 pt-2">
      {/* Upload / Status Zones */}
      <div className="flex flex-col md:flex-row items-stretch gap-8 relative">
        {renderUploadState(jobA, "Baseline Dataset (A)", "text-brand-blue dark:text-blue-400", "border-blue-200 dark:border-blue-900", "bg-brand-blue")}
        
        {/* VS Badge */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center border-4 border-white dark:border-slate-950 shadow-sm z-10">
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500">VS</span>
        </div>

        {renderUploadState(jobB, "Comparison Dataset (B)", "text-violet-600 dark:text-violet-400", "border-violet-200 dark:border-violet-900", "bg-violet-600")}
      </div>

      {jobA.status === 'done' && jobB.status === 'done' && (
        <div className="space-y-6 animate-slide-up mt-8">
          {/* Smart Diff Summary */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-800 dark:border-slate-700 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 bg-gradient-to-b from-brand-blue to-violet-500 h-full"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Icons.Scale className="w-4 h-4 text-brand-blue" />
                AI Comparative Strategy & Delta Summary
              </h3>
              {isGeneratingSummary && <span className="text-xs text-brand-blue animate-pulse font-bold">Analyzing delta patterns...</span>}
            </div>
            
            <p className="text-sm md:text-base leading-relaxed text-slate-300 font-medium whitespace-pre-line">
              {aiSummary || "Generating comparative insights..."}
            </p>
          </div>

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Total Records" valA={kpisA.rows} valB={kpisB.rows} />
            <MetricCard title="Health Score / 100" valA={kpisA.health} valB={kpisB.health} />
            <MetricCard title="Anomalies Found" valA={kpisA.anomalies} valB={kpisB.anomalies} reverseColor={true} />
            <MetricCard title="Trends Detected" valA={kpisA.trends} valB={kpisB.trends} />
            <MetricCard title="Columns Assessed" valA={kpisA.columns} valB={kpisB.columns} neutral={true} />
            <MetricCard title="Predictions Made" valA={kpisA.predictions} valB={kpisB.predictions} />
          </div>

          {/* Side-by-Side Reference Summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
              <h4 className="text-[10px] font-bold text-brand-blue dark:text-blue-400 uppercase mb-4 tracking-widest break-all">Baseline: {jobA.jobDetails.filename || 'File A'}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                {jobA.insights?.executive_summary?.overview || jobA.insights?.executive_summary?.tldr || 'No summary available.'}
              </p>
              
              <div className="mt-auto space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Identified Trends</p>
                {jobA.insights?.trends?.slice(0, 3).map((t, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <span className="w-5 h-5 rounded bg-brand-blue/10 text-brand-blue flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">{idx + 1}</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{t.description || t}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
              <h4 className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase mb-4 tracking-widest break-all">Comparison: {jobB.jobDetails.filename || 'File B'}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                {jobB.insights?.executive_summary?.overview || jobB.insights?.executive_summary?.tldr || 'No summary available.'}
              </p>
              
              <div className="mt-auto space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Identified Trends</p>
                {jobB.insights?.trends?.slice(0, 3).map((t, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100/50 dark:border-violet-900/50">
                    <span className="w-5 h-5 rounded bg-violet-600/10 text-violet-600 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">{idx + 1}</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{t.description || t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Raw Data Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Structure Preview</p>
                <p className="text-sm font-bold text-brand-blue dark:text-blue-400 truncate">{jobA.jobDetails.filename}</p>
              </div>
              <div className="overflow-x-auto p-0">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      {jobA.jobDetails.columns?.slice(0, 5).map(col => (
                        <th key={col.name} className="px-4 py-3">{col.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {jobA.jobDetails.preview?.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        {jobA.jobDetails.columns?.slice(0, 5).map(col => (
                          <td key={col.name} className="px-4 py-2 opacity-90 truncate max-w-[150px]">{String(row[col.name] ?? 'NULL')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-violet-50/50 dark:bg-violet-900/10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Structure Preview</p>
                <p className="text-sm font-bold text-violet-600 dark:text-violet-400 truncate">{jobB.jobDetails.filename}</p>
              </div>
              <div className="overflow-x-auto p-0">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      {jobB.jobDetails.columns?.slice(0, 5).map(col => (
                        <th key={col.name} className="px-4 py-3">{col.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {jobB.jobDetails.preview?.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        {jobB.jobDetails.columns?.slice(0, 5).map(col => (
                          <td key={col.name} className="px-4 py-2 opacity-90 truncate max-w-[150px]">{String(row[col.name] ?? 'NULL')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getKPIs(details, insights) {
  if (!details || !insights) return { rows: 0, health: 0, anomalies: 0, trends: 0, columns: 0, predictions: 0 };
  return {
    rows: details.rowCount || 0,
    health: insights.data_quality?.health_score || 0,
    anomalies: insights.anomalies?.length || 0,
    trends: insights.trends?.length || 0,
    columns: details.columns?.length || 0,
    predictions: insights.predictions?.length || 0,
  };
}

function MetricCard({ title, valA, valB, reverseColor = false, neutral = false }) {
  const diff = valB - valA;
  let color = 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
  let diffText = '0 (Flat)';

  if (diff > 0) {
    color = neutral ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : reverseColor ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/40' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40';
    diffText = `+${diff}`;
  } else if (diff < 0) {
    color = neutral ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : reverseColor ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/40';
    diffText = diff.toString();
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{title}</p>
      
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold text-brand-blue dark:text-blue-400 uppercase mb-1">Dataset A</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{typeof valA === 'number' ? valA.toLocaleString() : valA}</p>
        </div>
        <div className="flex flex-col items-center">
          <Icons.ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 mb-1" />
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold ${color}`}>
            {diffText}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase mb-1">Dataset B</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{typeof valB === 'number' ? valB.toLocaleString() : valB}</p>
        </div>
      </div>
    </div>
  );
}
