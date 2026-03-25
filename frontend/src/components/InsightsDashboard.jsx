import { useRef } from 'react';
import SummaryCard from './cards/SummaryCard';
import TrendsCard from './cards/TrendsCard';
import AnomaliesCard from './cards/AnomaliesCard';
import RecommendationsCard from './cards/RecommendationsCard';
import DataChart from './DataChart';
import PDFExport from './PDFExport';

export default function InsightsDashboard({ insights, chartData, filename, onNewUpload }) {
  const dashboardRef = useRef(null);

  // Use a fallback empty object for insights if undefined
  const safeInsights = insights || {};

  return (
    <div className="space-y-6 animate-slide-up" ref={dashboardRef}>
      {/* Action bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <p className="text-sm font-semibold text-slate-700">Analysis complete</p>
          </div>
          {onNewUpload && (
            <button
              onClick={onNewUpload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-brand-blue bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Analyze another file
            </button>
          )}
        </div>
        <PDFExport targetRef={dashboardRef} filename={filename} insights={safeInsights} />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Summary & Chart (Spans 8 cols on large screens) */}
        <div className="lg:col-span-8 space-y-6">
          <SummaryCard summary={safeInsights.summary} />
          {chartData && <DataChart chartData={chartData} />}
        </div>
        
        {/* Right Column: Key Trends (Spans 4 cols on large screens) */}
        <div className="lg:col-span-4">
          <div className="h-full">
            <TrendsCard trends={safeInsights.trends} />
          </div>
        </div>
      </div>

      {/* Bottom Row: Anomalies & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnomaliesCard anomalies={safeInsights.anomalies} />
        <RecommendationsCard recommendations={safeInsights.recommendations} />
      </div>
    </div>
  );
}
