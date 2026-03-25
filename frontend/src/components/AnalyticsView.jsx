import { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, LabelList,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, Brush
} from 'recharts';

const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#ec4899', '#14b8a6'];

const formatNumber = (num) => {
  if (typeof num !== 'number') return num;
  if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  if (num > 0 && num < 1) return (num * 100).toFixed(1).replace(/\.0$/, '') + '%';
  return parseFloat(num.toFixed(2));
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-[#1E293B] dark:bg-[#0F172A] p-3 rounded-lg shadow-xl border border-slate-700/50 text-white z-50">
      <p className="text-xs font-bold text-slate-300 mb-2 border-b border-slate-700 pb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-3 text-xs my-1">
          <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color || entry.fill }} />
          <span className="text-slate-400 font-medium">{entry.name}:</span>
          <span className="text-white font-bold tracking-wide">
            {entry.color === '#10b981' && String(entry.value).includes('%') ? entry.value : formatNumber(entry.value)}
            {entry.payload && entry.payload.deviation && entry.dataKey !== 'deviation' && (
              <span className="ml-2 text-slate-500 text-[10px]">({entry.payload.deviation > 0 ? '+' : ''}{formatNumber(entry.payload.deviation)} from avg)</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsView({ insights, chartData }) {
  const safeInsights = insights || {};
  const trends = safeInsights.trends || [];
  const anomalies = safeInsights.anomalies || [];

  // Data Vis Component State
  const numericColumns = chartData?.numericColumns || [];
  const [selectedCol, setSelectedCol] = useState(numericColumns[0] || '');
  const [chartType, setChartType] = useState('Area');

  // Time/X-Axis Detection
  const xColumn = useMemo(() => {
    if (!chartData?.headers) return 'index';
    const dateCol = chartData.headers.find(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('time') || h.toLowerCase().includes('month') || h.toLowerCase().includes('year'));
    return dateCol || 'index';
  }, [chartData]);

  const mainChartData = useMemo(() => {
    if (!chartData?.data || !selectedCol) return [];
    
    let sum = 0;
    let count = 0;
    const mapped = chartData.data.map((item, idx) => {
      const val = Number(item[selectedCol]) || 0;
      sum += val;
      count++;
      return {
        ...item,
        index: `Record #${idx + 1}`,
        [selectedCol]: val
      };
    });
    
    const avg = count > 0 ? sum / count : 0;
    
    return {
      data: mapped.map(item => ({...item, deviation: item[selectedCol] - avg})),
      avg
    };
  }, [chartData, selectedCol]);

  // Main Chart dynamic slicing for rotation
  const xDataKey = xColumn === 'index' ? 'index' : xColumn;
  const rotateX = mainChartData.data && mainChartData.data.length > 10;

  // Pie chart: Severity distribution
  const severityStats = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    anomalies.forEach(a => {
      const sev = (a.severity || 'medium').toLowerCase();
      if (counts[sev] !== undefined) counts[sev]++;
    });
    const total = counts.high + counts.medium + counts.low;
    return {
      counts,
      total,
      data: [
        { name: 'High', value: counts.high, fill: '#ef4444' },
        { name: 'Medium', value: counts.medium, fill: '#f59e0b' },
        { name: 'Low', value: counts.low, fill: '#10b981' },
      ].filter(d => d.value > 0)
    };
  }, [anomalies]);

  // Category distribution
  const categoryData = useMemo(() => {
    if (!chartData?.data || !numericColumns.length) return [];
    const col = numericColumns[0];
    const categoryCol = chartData.labels || Object.keys(chartData.data[0])[0];
    
    // Sort highest to lowest, take top 8, then reverse for Recharts vertical layout so highest is at top
    const sorted = [...chartData.data].sort((a, b) => (b[col] || 0) - (a[col] || 0));
    return sorted.slice(0, 8).map(d => ({
      name: String(d[categoryCol] || 'Unknown'),
      [col]: Number(d[col]) || 0
    })).reverse();
  }, [chartData, numericColumns]);

  // Radar chart
  const radarData = useMemo(() => {
    const score = (val, max) => Math.min(Math.max(Math.round(val), 0), max);
    const trendScore = score(40 + (trends.length * 15), 100);
    const anomalyScore = score(100 - (anomalies.length * 10), 100);
    const actionScore = score((safeInsights.executive_summary?.next_actions?.length || 0) * 20, 100);
    const compScore = score(chartData?.data?.length > 50 ? 95 : 70, 100);
    const qualScore = score(anomalies.filter(a => a.severity === 'high').length > 0 ? 60 : 90, 100);
    const consScore = score(85, 100); // Mock consistency score based on std dev ideally

    return [
      { subject: `Trends ${trendScore}`, value: trendScore, fullMark: 100 },
      { subject: `Anomalies ${anomalyScore}`, value: anomalyScore, fullMark: 100 },
      { subject: `Actionability ${actionScore}`, value: actionScore, fullMark: 100 },
      { subject: `Completeness ${compScore}`, value: compScore, fullMark: 100 },
      { subject: `Data Quality ${qualScore}`, value: qualScore, fullMark: 100 },
      { subject: `Consistency ${consScore}`, value: consScore, fullMark: 100 },
    ];
  }, [trends, anomalies, chartData, safeInsights]);

  const overallScore = Math.round(radarData.reduce((acc, curr) => acc + curr.value, 0) / 6);

  const hasData = chartData?.data?.length > 0;

  if (!insights) {
    return (
      <div className="text-center py-32">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
          <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-extrabold text-slate-400 dark:text-slate-500 mb-2">Awaiting Context Data</h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mx-auto">Upload and analyze a file in the workspace to automatically generate high-fidelity visualizations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. MAIN DATA VISUALIZATION CHART (FIX 5) */}
      {hasData && selectedCol && (
        <div className="glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Trend: {selectedCol} over {xColumn === 'index' ? 'Records' : 'Time'}</h3>
              <p className="text-xs text-slate-500 mt-1">Real-time metric visualization with average baselining.</p>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={selectedCol} 
                onChange={(e) => setSelectedCol(e.target.value)}
                className="input-base py-2 !w-auto text-xs font-semibold cursor-pointer"
              >
                {numericColumns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                {['Line', 'Bar', 'Area'].map(type => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${chartType === type ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-blue dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'Area' ? (
                <AreaChart data={mainChartData.data} margin={{ top: 10, right: 30, left: 20, bottom: rotateX ? 60 : 20 }}>
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey={xDataKey} tick={{ fill: '#64748b', fontSize: 11 }} angle={rotateX ? -45 : 0} textAnchor={rotateX ? 'end' : 'middle'} tickMargin={10} stroke="rgba(148, 163, 184, 0.3)" />
                  <YAxis tickFormatter={formatNumber} tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: selectedCol, angle: -90, position: 'insideLeft', offset: -10, style: { fontSize: 12, fill: '#64748b', fontWeight: 600 } }} stroke="rgba(148, 163, 184, 0.3)" />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={mainChartData.avg} stroke="#64748b" strokeDasharray="4 4" opacity={0.5} label={{ position: 'insideTopLeft', value: `Avg: ${formatNumber(mainChartData.avg)}`, fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey={selectedCol} stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorArea)" animationDuration={1000} />
                  <Brush dataKey={xDataKey} height={30} stroke="#3B82F6" fill="rgba(59, 130, 246, 0.05)" />
                </AreaChart>
              ) : chartType === 'Bar' ? (
                <BarChart data={mainChartData.data} margin={{ top: 10, right: 30, left: 20, bottom: rotateX ? 60 : 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey={xDataKey} tick={{ fill: '#64748b', fontSize: 11 }} angle={rotateX ? -45 : 0} textAnchor={rotateX ? 'end' : 'middle'} tickMargin={10} stroke="rgba(148, 163, 184, 0.3)" />
                  <YAxis tickFormatter={formatNumber} tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: selectedCol, angle: -90, position: 'insideLeft', offset: -10, style: { fontSize: 12, fill: '#64748b', fontWeight: 600 } }} stroke="rgba(148, 163, 184, 0.3)" />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={mainChartData.avg} stroke="#64748b" strokeDasharray="4 4" opacity={0.5} />
                  <Bar dataKey={selectedCol} fill="#3B82F6" radius={[4, 4, 0, 0]} animationDuration={1000} />
                  <Brush dataKey={xDataKey} height={30} stroke="#3B82F6" fill="rgba(59, 130, 246, 0.05)" />
                </BarChart>
              ) : (
                <LineChart data={mainChartData.data} margin={{ top: 10, right: 30, left: 20, bottom: rotateX ? 60 : 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey={xDataKey} tick={{ fill: '#64748b', fontSize: 11 }} angle={rotateX ? -45 : 0} textAnchor={rotateX ? 'end' : 'middle'} tickMargin={10} stroke="rgba(148, 163, 184, 0.3)" />
                  <YAxis tickFormatter={formatNumber} tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: selectedCol, angle: -90, position: 'insideLeft', offset: -10, style: { fontSize: 12, fill: '#64748b', fontWeight: 600 } }} stroke="rgba(148, 163, 184, 0.3)" />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={mainChartData.avg} stroke="#64748b" strokeDasharray="4 4" opacity={0.5} />
                  <Line type="monotone" dataKey={selectedCol} stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} animationDuration={1000} />
                  <Brush dataKey={xDataKey} height={30} stroke="#3B82F6" fill="rgba(59, 130, 246, 0.05)" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. TOP VALUES CHART (FIX 1) */}
        {hasData && numericColumns.length > 0 && categoryData.length > 0 && (
          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Top Categories</h3>
            <p className="text-xs text-slate-500 mb-6">Top categories by volume for '{numericColumns[0]}'</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 40, left: 140, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradientBar" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis type="number" tickFormatter={formatNumber} tick={{ fill: '#64748b', fontSize: 11 }} stroke="rgba(148, 163, 184, 0.3)" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tickFormatter={(val) => val.length > 18 ? val.substring(0, 18) + '...' : val}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                  <Bar dataKey={numericColumns[0]} radius={[0, 4, 4, 0]} animationDuration={800}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="url(#gradientBar)" />
                    ))}
                    <LabelList dataKey={numericColumns[0]} position="right" formatter={formatNumber} style={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. QUALITY SCORECARD RADAR CHART (FIX 2) */}
        <div className="glass-card p-6 relative">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Quality Scorecard</h3>
          <p className="text-xs text-slate-500 mb-2">Multidimensional dataset evaluation</p>
          
          <div className="h-[300px] w-full group">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <defs>
                  <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="rgba(148, 163, 184, 0.2)" gridType="polygon" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} />
                {/* Outer Dashed Ring Reference */}
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={{ stroke: '#E2E8F0', strokeDasharray: '5 5' }} />
                <Radar name="Score" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#radarFill)" animationDuration={1000} />
              </RadarChart>
            </ResponsiveContainer>
            
            {/* Center Absolute Label */}
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none transform transition-transform group-hover:scale-110">
              <span className="block text-4xl font-black text-slate-800 dark:text-white leading-none">{overallScore}</span>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">SCORE</span>
            </div>
          </div>
        </div>

        {/* 4. ANOMALY SEVERITY DONUT CHART (FIX 4) */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Anomaly Severity</h3>
          <p className="text-xs text-slate-500 mb-4">Distribution by risk level</p>
          
          <div className="flex-1 relative min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityStats.data}
                  cx="50%" cy="50%"
                  innerRadius="65%" outerRadius="85%"
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={600}
                >
                  {severityStats.data.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} className="transition-transform duration-300 hover:scale-105 origin-center" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Total Count */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-slate-800 dark:text-white">{severityStats.total}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total<br/>Anomalies</span>
            </div>
          </div>

          {/* Custom HTML Legend */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {[
              { label: 'High', count: severityStats.counts.high, color: '#ef4444' },
              { label: 'Medium', count: severityStats.counts.medium, color: '#f59e0b' },
              { label: 'Low', count: severityStats.counts.low, color: '#10b981' }
            ].map(sev => (
              <div key={sev.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sev.color === '#ef4444' && sev.count === 0 ? '#cbd5e1' : sev.color }} />
                  <span className={`font-medium ${sev.count === 0 ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{sev.label} Severity</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900 dark:text-white">{sev.count}</span>
                  <span className="text-xs font-semibold text-slate-400 w-8 text-right">
                    {severityStats.total > 0 ? Math.round((sev.count / severityStats.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
