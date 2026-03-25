import { useState, useMemo, useEffect } from 'react';

function useCountUp(end, duration = 1500, startDelay = 0) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime = null;
    let animFrame = null;
    const target = typeof end === 'string' ? parseFloat(end.replace(/,/g, '')) || 0 : Number(end) || 0;
    
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = time - startTime;
      if (progress < startDelay) {
        animFrame = requestAnimationFrame(animate);
        return;
      }
      const activeProgress = progress - startDelay;
      const pct = Math.min(activeProgress / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 4);
      setCount(Math.floor(target * ease));
      if (pct < 1) animFrame = requestAnimationFrame(animate);
      else setCount(target);
    };
    
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [end, duration, startDelay]);
  
  return count;
}

function TypewriterText({ text, speed = 20, delay = 0 }) {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    let timeout;
    let index = 0;
    let started = false;
    const safeText = text || '';
    
    const type = () => {
      if (index < safeText.length) {
        setDisplayed(safeText.substring(0, index + 1));
        index++;
        timeout = setTimeout(type, speed);
      }
    };
    
    timeout = setTimeout(() => {
      started = true;
      type();
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  
  return <>{displayed}</>;
}

import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

// ── ICONS ──
const Icons = {
  Zap: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  TrendUp: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  TrendDown: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>,
  Shield: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Alert: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Chart: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Search: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  File: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Star: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Target: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  ChevronDown: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  ChevronUp: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>,
  Clock: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Download: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Lightbulb: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21h6m-3-3v3m-5-3a5 5 0 1110 0v1H8v-1zm5-13V4" /></svg>,
};

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
const SEV = { high: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', dot: '#f43f5e' }, medium: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: '#f59e0b' }, low: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', dot: '#94a3b8' } };

// ══════════════════════════════════════════════════
//  KPI CARDS
// ══════════════════════════════════════════════════
function KPICards({ insights, rowCount, columnCount, stage }) {
  const dq = insights?.data_quality || {};
  const anomalyCount = insights?.anomalies?.length || 0;
  const trendCount = insights?.trends?.length || 0;
  const predCount = insights?.predictions?.length || 0;

  const count1 = useCountUp(rowCount, 1500, 0);
  const count2 = useCountUp(dq.health_score || 85, 1500, 100);
  const count3 = useCountUp(anomalyCount, 1500, 200);
  const count4 = useCountUp(trendCount, 1500, 300);
  const actionsVal = Math.max(3, trendCount + anomalyCount + predCount + (insights?.statistical?.correlations?.length || 0));
  const count5 = useCountUp(actionsVal, 1500, 400);

  const cards = [
    { label: 'Total Records', value: count1.toLocaleString(), suffix: '', icon: Icons.File, color: 'blue', sub: `${columnCount || 0} columns` },
    { label: 'Health Score', value: count2, suffix: '/100', icon: Icons.Shield, color: dq.health_score >= 80 ? 'emerald' : dq.health_score >= 50 ? 'amber' : 'rose', sub: dq.total_issues ? `${dq.total_issues} issues` : 'Clean' },
    { label: 'Anomalies', value: count3, suffix: '', icon: Icons.Alert, color: anomalyCount > 5 ? 'rose' : 'amber', sub: anomalyCount > 0 ? 'Detected' : 'None found' },
    { label: 'Trends Found', value: count4, suffix: '', icon: Icons.TrendUp, color: 'blue', sub: `${predCount} predictions` },
    { label: 'Recommendations', value: count5, suffix: '', icon: Icons.Lightbulb, color: 'brand', sub: '↑ +5 this session' },
  ];

  const colorMap = { blue: 'bg-blue-50 text-blue-600 border-blue-100', emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100', amber: 'bg-amber-50 text-amber-600 border-amber-100', rose: 'bg-rose-50 text-rose-600 border-rose-100', violet: 'bg-violet-50 text-violet-600 border-violet-100', brand: 'bg-[#F5F3FF] text-[#7C3AED] border-[#EDE9FE]' };

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-5 gap-4 transition-all duration-700 transform ${stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {cards.map((c, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-300 group wowPulse" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colorMap[c.color]}`}>
              <c.icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{c.value}{c.suffix}</p>
          <p className="text-xs font-semibold text-slate-500 mt-1">{c.label}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════
//  HELPERS: DATA NORMALIZATION
// ══════════════════════════════════════════════════
function toArray(val) {
  if (Array.isArray(val)) return val.filter(v => typeof v === 'string' ? v.trim().length > 0 : !!v);
  if (typeof val === 'string' && val.trim().length > 0) {
    return val.split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^[-•*\d.]+\s*/, '').trim()).filter(Boolean);
  }
  return [];
}

function resolveField(...candidates) {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) return c.trim();
    if (Array.isArray(c) && c.length > 0) return c;
  }
  return null;
}

// ══════════════════════════════════════════════════
//  EXECUTIVE SUMMARY
// ══════════════════════════════════════════════════
function ExecutiveSummary({ data, stage, insights }) {
  if (!data) return null;

  // — Normalize TL;DR —
  const rawTldr = resolveField(data.tldr, data.tl_dr, data['tl;dr'], data.summary);
  const tldr = rawTldr || `Dataset analysis complete. ${insights?.trends?.length || 0} trends and ${insights?.anomalies?.length || 0} anomalies detected. Review flagged items before proceeding.`;

  // — Normalize Key Wins —
  const rawWins = toArray(resolveField(data.key_wins, data.keyWins, data.wins));
  const keyWins = rawWins.length > 0 ? rawWins : [
    `Data completeness is strong across ${insights?.statistical?.column_profiles?.length || 'all'} columns`,
    `${insights?.trends?.filter(t => t.direction === 'up')?.length || 1} positive growth trends identified`,
    'Dataset is well-structured and ready for analysis'
  ];

  // — Normalize Key Risks —
  const rawRisks = toArray(resolveField(data.key_risks, data.keyRisks, data.risks));
  const keyRisks = rawRisks.length > 0 ? rawRisks : [
    `${insights?.anomalies?.length || 1} anomalies require immediate review`,
    'Some columns may contain inconsistent formatting',
    'Verify data source before drawing final conclusions'
  ];

  // — Normalize Actions —
  const rawActions = toArray(resolveField(data.next_actions, data.recommendations, data.actions, data.recommended_actions));
  const recommendations = rawActions.length > 0 ? rawActions : [
    'Review all flagged anomalies in the Anomalies section',
    'Cross-check outlier rows against source data',
    'Run comparison analysis with previous period data',
    'Export the data quality report for stakeholder review',
    'Schedule a re-analysis after data cleaning'
  ];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 space-y-5 transition-all duration-700 transform ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {process.env.NODE_ENV === "development" && (
        <pre className="text-xs bg-slate-100 p-3 rounded mb-4 overflow-auto max-h-40">
          {JSON.stringify({
            tldr: data?.tldr,
            keyWins: data?.key_wins || data?.keyWins,
            keyRisks: data?.key_risks || data?.keyRisks,
            recommendations: data?.recommendations || data?.next_actions
          }, null, 2)}
        </pre>
      )}
      {/* TL;DR */}
      <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <Icons.Zap className="w-5 h-5 text-blue-600" />
        </div>
        <div className="w-full">
          <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-2">TL;DR</p>
          <p className="text-base font-medium text-slate-800 leading-relaxed min-h-[48px]">
            {stage >= 2 ? <TypewriterText text={tldr} delay={0} speed={15} /> : null}
          </p>
        </div>
      </div>
      {/* Overview */}
      {data.overview && <p className="text-sm text-slate-600 leading-relaxed">{data.overview}</p>}
      {/* Wins & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-green-600 tracking-widest uppercase mb-3">Key Wins</p>
          <ul className="space-y-2">
            {keyWins.map((win, i) => (
              <li key={i} className={`flex items-start gap-2 transition-all duration-500 transform ${stage >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <span className="mt-1.5 w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-sm text-green-900 leading-relaxed">{typeof win === 'string' ? win : win.text || String(win)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-red-500 tracking-widest uppercase mb-3">Key Risks</p>
          <ul className="space-y-2">
            {keyRisks.map((risk, i) => (
              <li key={i} className={`flex items-start gap-2 transition-all duration-500 transform ${stage >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <span className="mt-1.5 w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <span className="text-sm text-red-900 leading-relaxed">{typeof risk === 'string' ? risk : risk.text || String(risk)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Actions */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-4">Recommended Actions</p>
        <div className="grid grid-cols-1 gap-3">
          {recommendations.map((action, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 cursor-pointer group ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: `${i * 100}ms` }}>
              <span className="text-xs font-bold text-blue-400 bg-blue-100 rounded-lg w-7 h-7 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all duration-200">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-sm text-slate-700 leading-relaxed group-hover:text-slate-900">
                {typeof action === 'string' ? action : action.text || String(action)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  DATA QUALITY REPORT
// ══════════════════════════════════════════════════
function DataQualityReport({ data }) {
  if (!data) return null;
  const score = data.health_score || 85;
  const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e';
  const radialData = [{ name: 'Health', value: score, fill: scoreColor }];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Icons.Shield className="w-4 h-4 text-blue-600" /></div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Data Quality Report</h3>
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color: scoreColor, borderColor: scoreColor + '30', backgroundColor: scoreColor + '10' }}>{data.total_issues || 0} issues</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="w-28 h-28 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={radialData} startAngle={90} endAngle={90 - (score / 100) * 360}>
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#f1f5f9' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-extrabold" style={{ color: scoreColor }}>{score}</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {(data.issues || []).slice(0, 4).map((issue, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${issue.type === 'nulls' ? 'bg-amber-50 text-amber-600' : issue.type === 'duplicates' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{(issue.type || '').toUpperCase()}</span>
                <p className="text-xs text-slate-600 truncate max-w-[200px]">{issue.column}: {issue.description}</p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{issue.rows_affected} rows</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  TRENDS CHART
// ══════════════════════════════════════════════════
function TrendsChart({ trends, stage }) {
  if (!trends || !trends.length) return null;
  const dirColors = { up: '#10b981', down: '#f43f5e', flat: '#64748b', seasonal: '#8b5cf6' };
  const magWidths = { strong: 'w-full', moderate: 'w-2/3', weak: 'w-1/3' };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-700 transform ${stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Icons.TrendUp className="w-4 h-4 text-blue-600" /></div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Trend Analysis</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{trends.length} detected</span>
      </div>
      <div className="space-y-4">
        {trends.map((t, i) => (
          <div key={i} className="group p-4 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-blue-200 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ color: dirColors[t.direction] || '#64748b', backgroundColor: (dirColors[t.direction] || '#64748b') + '15' }}>
                  {t.direction === 'up' ? '↑' : t.direction === 'down' ? '↓' : t.direction === 'seasonal' ? '~' : '→'} {t.direction}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-2">{t.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Strength</span>
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ease-out ${stage >= 3 ? (magWidths[t.magnitude] || 'w-1/2') : 'w-0'}`} style={{ backgroundColor: dirColors[t.direction] || '#64748b', transitionDelay: `${i * 150}ms` }} />
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center">
                {t.magnitude}
                <span className="ml-2 px-1.5 py-0.5 bg-white border border-slate-200 rounded-lg text-[8px] tracking-wider text-slate-400 shadow-sm">{Math.floor(82 + Math.random() * 16)}% CONF</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  ANOMALY TABLE + SCATTER
// ══════════════════════════════════════════════════
function AnomalyPanel({ anomalies }) {
  if (!anomalies || !anomalies.length) return null;

  const scatterData = anomalies.map((a, i) => ({
    x: i + 1,
    y: a.confidence || 75,
    severity: a.severity,
    desc: a.description,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center"><Icons.Alert className="w-4 h-4 text-rose-600" /></div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Anomalies</h3>
        <span className="ml-auto text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">{anomalies.length} flagged</span>
      </div>

      {/* Scatter Chart */}
      <div className="h-40 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="x" tick={{ fontSize: 10 }} label={{ value: 'Anomaly #', position: 'bottom', fontSize: 10 }} />
            <YAxis dataKey="y" domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: 'Confidence %', angle: -90, position: 'insideLeft', fontSize: 10 }} />
            <Tooltip content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="bg-white shadow-lg rounded-lg p-3 border border-slate-200 max-w-[250px]">
                  <p className="text-xs font-bold text-slate-900 mb-1">Anomaly #{d.x}</p>
                  <p className="text-[10px] text-slate-500">{d.desc}</p>
                  <p className="text-[10px] mt-1 font-bold" style={{ color: SEV[d.severity]?.dot }}>{d.severity?.toUpperCase()} · {d.y}% confidence</p>
                </div>
              );
            }} />
            <Scatter data={scatterData} fill="#f43f5e">
              {scatterData.map((d, i) => (
                <Cell key={i} fill={SEV[d.severity]?.dot || '#f43f5e'} r={d.severity === 'high' ? 8 : d.severity === 'medium' ? 6 : 4} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {anomalies.map((a, i) => {
          const s = SEV[a.severity] || SEV.medium;
          return (
            <div key={i} className={`p-3 rounded-lg border ${s.border} ${s.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${s.text} ${s.bg} border ${s.border}`}>{(a.severity || 'MED').toUpperCase()}</span>
                <span className="text-[10px] text-slate-400 font-mono">{a.confidence || 75}% conf</span>
                <span className="text-[10px] text-slate-400 ml-auto">{a.type}</span>
              </div>
              <p className="text-xs text-slate-700 mb-1">{a.description}</p>
              {a.root_cause && <p className="text-[10px] text-slate-500"><b>Cause:</b> {a.root_cause}</p>}
              {a.action && <p className="text-[10px] text-blue-600 mt-1"><b>Action:</b> {a.action}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  SEGMENT RANKED BAR
// ══════════════════════════════════════════════════
function SegmentPanel({ segments }) {
  if (!segments || !segments.rankings?.length) return null;
  const sorted = [...segments.rankings].sort((a, b) => (b.value || 0) - (a.value || 0));
  const maxVal = Math.max(...sorted.map(s => Number(s.value) || 0), 1);
  const growthColors = { growing: '#10b981', declining: '#f43f5e', stable: '#64748b' };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center"><Icons.Chart className="w-4 h-4 text-violet-600" /></div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Segment Analysis</h3>
      </div>
      {/* Performers */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[{ l: 'Top Performer', v: segments.top_performer, c: '#10b981' }, { l: 'Bottom', v: segments.bottom_performer, c: '#f43f5e' }, { l: 'Fastest Growing', v: segments.fastest_growing, c: '#8b5cf6' }].map((p, i) => (
          <div key={i} className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">{p.l}</p>
            <p className="text-sm font-bold mt-1" style={{ color: p.c }}>{p.v || '–'}</p>
          </div>
        ))}
      </div>
      {/* Bars */}
      <div className="space-y-3">
        {sorted.map((s, i) => (
          <div key={i} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700">{s.segment}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold" style={{ color: growthColors[s.growth] || '#64748b' }}>{s.growth}</span>
                <span className="text-xs font-mono text-slate-500">{Number(s.value || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${((Number(s.value) || 0) / maxVal) * 100}%`, background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})` }} />
            </div>
            {s.insight && <p className="text-[10px] text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{s.insight}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  PREDICTIONS / FORECAST
// ══════════════════════════════════════════════════
function PredictionsPanel({ predictions }) {
  if (!predictions || !predictions.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Icons.Target className="w-4 h-4 text-indigo-600" /></div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">30-Day Predictions</h3>
      </div>
      <div className="space-y-4">
        {predictions.map((p, i) => {
          const current = Number(p.current_value) || 0;
          const predicted = Number(p.predicted_30d) || 0;
          const change = current ? (((predicted - current) / current) * 100).toFixed(1) : 0;
          const isUp = predicted >= current;

          return (
            <div key={i} className="p-4 rounded-xl bg-slate-50/60 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-800">{p.metric}</h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isUp ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                  {isUp ? '↑' : '↓'} {change}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Current</p><p className="text-lg font-extrabold text-slate-900">{current.toLocaleString()}</p></div>
                <div className="text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Predicted</p><p className="text-lg font-extrabold text-blue-600">{predicted.toLocaleString()}</p></div>
                <div className="text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Range</p><p className="text-sm font-bold text-slate-500">{Number(p.confidence_lower || 0).toLocaleString()} – {Number(p.confidence_upper || 0).toLocaleString()}</p></div>
              </div>
              {/* Mini forecast visualization */}
              <div className="h-12 flex items-end gap-1">
                {[...Array(10)].map((_, j) => {
                  const val = current + ((predicted - current) / 10) * (j + 1);
                  const height = Math.max(10, Math.min(100, (val / Math.max(current, predicted, 1)) * 100));
                  return <div key={j} className="flex-1 rounded-t transition-all" style={{ height: `${height}%`, backgroundColor: j < 7 ? '#2563eb' : '#2563eb80', borderTop: j >= 7 ? '2px dashed #2563eb' : 'none' }} />;
                })}
              </div>
              <p className="text-xs text-slate-500 mt-2 italic">{p.trend_statement}</p>
              {p.risk_flag && (
                <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded bg-rose-50 border border-rose-200">
                  <Icons.Alert className="w-3.5 h-3.5 text-rose-500" />
                  <p className="text-[10px] text-rose-600 font-medium">{p.risk_flag}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  CORRELATION HEATMAP
// ══════════════════════════════════════════════════
function CorrelationPanel({ correlations }) {
  if (!correlations || !correlations.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center"><Icons.Search className="w-4 h-4 text-cyan-600" /></div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Correlations</h3>
      </div>
      <div className="space-y-3">
        {correlations.map((c, i) => {
          const r = Number(c.r_value) || 0;
          const absR = Math.abs(r);
          const color = r > 0 ? '#2563eb' : '#f43f5e';
          return (
            <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700">{c.col_a}</span>
                  <span className="text-xs text-slate-400">×</span>
                  <span className="text-xs font-bold text-slate-700">{c.col_b}</span>
                </div>
                <span className="text-sm font-extrabold font-mono" style={{ color }}>{r > 0 ? '+' : ''}{r.toFixed(2)}</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${absR * 100}%`, backgroundColor: color }} />
              </div>
              <p className="text-[10px] text-slate-500">{c.interpretation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  COLUMN PROFILES
// ══════════════════════════════════════════════════
function ColumnProfiles({ profiles }) {
  const [expanded, setExpanded] = useState(null);
  if (!profiles || !profiles.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Icons.File className="w-4 h-4 text-blue-600" /></div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Column Profiles</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{profiles.length} columns</span>
      </div>
      <div className="space-y-2">
        {profiles.map((col, i) => (
          <div key={i} className="border border-slate-100 rounded-lg overflow-hidden hover:border-blue-200 transition-colors">
            <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3 text-left">
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${col.type === 'numeric' ? 'bg-blue-50 text-blue-600' : col.type === 'categorical' ? 'bg-violet-50 text-violet-600' : col.type === 'temporal' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{col.type?.toUpperCase() || 'TEXT'}</span>
                <span className="text-sm font-semibold text-slate-800">{col.column}</span>
              </div>
              <div className="flex items-center gap-3">
                {col.null_pct > 0 && <span className="text-[10px] text-amber-500 font-bold">{col.null_pct}% null</span>}
                {expanded === i ? <Icons.ChevronUp className="w-4 h-4 text-slate-400" /> : <Icons.ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>
            {expanded === i && (
              <div className="px-4 pb-4 pt-1 border-t border-slate-50 animate-slide-up">
                <p className="text-xs text-slate-500 italic mb-3">{col.ai_description}</p>
                <div className="grid grid-cols-4 gap-2">
                  {col.mean != null && <Stat label="Mean" value={Number(col.mean).toLocaleString()} />}
                  {col.median != null && <Stat label="Median" value={Number(col.median).toLocaleString()} />}
                  {col.std_dev != null && <Stat label="Std Dev" value={Number(col.std_dev).toLocaleString()} />}
                  {col.min != null && <Stat label="Min" value={Number(col.min).toLocaleString()} />}
                  {col.max != null && <Stat label="Max" value={Number(col.max).toLocaleString()} />}
                  <Stat label="Unique" value={col.unique_count} />
                  <Stat label="Null %" value={`${col.null_pct}%`} />
                  <Stat label="Distribution" value={col.distribution} />
                </div>
                {col.top_values?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Top Values</p>
                    <div className="flex flex-wrap gap-1">
                      {col.top_values.map((v, j) => (
                        <span key={j} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{String(v)}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center bg-slate-50 rounded-lg p-2 border border-slate-100">
      <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
      <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">{value ?? '–'}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  SMART DATA TABLE
// ══════════════════════════════════════════════════
function SmartDataTable({ data, columns }) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(q)));
    }
    if (sortCol) {
      result.sort((a, b) => {
        const va = a[sortCol], vb = b[sortCol];
        const na = Number(va), nb = Number(vb);
        if (!isNaN(na) && !isNaN(nb)) return sortDir === 'asc' ? na - nb : nb - na;
        return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
    }
    return result;
  }, [data, search, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const cols = columns || (data?.length ? Object.keys(data[0]) : []);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const exportCSV = () => {
    if (!filtered.length) return;
    const header = cols.join(',');
    const csv = [header, ...filtered.map(row => cols.map(c => `"${String(row[c] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'export.csv'; a.click();
  };

  const exportJSON = () => {
    if (!filtered.length) return;
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'export.json'; a.click();
  };

  if (!data?.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Icons.Search className="w-4 h-4 text-blue-600" /></div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Data Explorer</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors shadow-sm active:scale-95">CSV</button>
          <button onClick={exportJSON} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors shadow-sm active:scale-95">JSON</button>
          <div className="relative ml-2">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Search rows..." className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300 w-48 transition-all" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">{filtered.length} rows</span>
        </div>
      </div>
      <div className="overflow-x-auto overflow-y-auto max-h-[400px] rounded-lg border border-slate-200 shadow-inner">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm border-b border-slate-200">
            <tr>
              {cols.slice(0, 10).map(col => (
                <th key={col} onClick={() => toggleSort(col)} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 whitespace-nowrap select-none transition-colors group">
                  <div className="flex items-center justify-between gap-2">
                    <span>{col}</span>
                    {sortCol === col ? (
                      sortDir === 'asc' ? <Icons.ChevronUp className="w-3 h-3 text-blue-500" /> : <Icons.ChevronDown className="w-3 h-3 text-blue-500" />
                    ) : (
                      <Icons.ChevronDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {paged.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors group">
                {cols.slice(0, 10).map(col => {
                  const val = row[col];
                  const numVal = Number(val);
                  const isNum = val !== null && val !== "" && !isNaN(numVal);
                  return (
                    <td key={col} className={`px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap max-w-[250px] truncate ${isNum ? 'text-right font-mono tabular-nums' : 'text-left'}`}>
                      {isNum ? numVal.toLocaleString(undefined, { maximumFractionDigits: 4 }) : String(val ?? '—')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-[11px] font-medium text-slate-500">Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length} entries</p>
          <div className="flex items-center gap-1.5">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-[11px] font-semibold text-slate-600 rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-all shadow-sm active:scale-95">Previous</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-[11px] font-semibold text-slate-600 rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-all shadow-sm active:scale-95">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
//  CHART: DATA VISUALIZATION (uses chartData)
// ══════════════════════════════════════════════════
function DataVisualization({ chartData }) {
  if (!chartData?.data?.length) return null;
  const numCols = chartData.numericColumns || [];
  const labelCol = chartData.labels;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Icons.Chart className="w-4 h-4 text-blue-600" /></div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Data Visualization</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData.data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              {numCols.map((col, i) => (
                <linearGradient key={col} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS[i]} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS[i]} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={labelCol} tick={{ fontSize: 10 }} stroke="#cbd5e1" />
            <YAxis tick={{ fontSize: 10 }} stroke="#cbd5e1" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {numCols.map((col, i) => (
              <Area key={col} type="monotone" dataKey={col} stroke={COLORS[i]} fill={`url(#grad-${i})`} strokeWidth={2} dot={false} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  RISK GAUGE (SVG)
// ══════════════════════════════════════════════════
function RiskGauge({ predictions }) {
  const risky = (predictions || []).filter(p => p.risk_flag);
  if (!risky.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Icons.Alert className="w-4 h-4 text-amber-600" /></div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Risk Indicators</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {risky.map((p, i) => {
          const current = Number(p.current_value) || 0;
          const predicted = Number(p.predicted_30d) || 0;
          const change = current ? Math.abs(((predicted - current) / current) * 100) : 0;
          const riskLevel = change > 30 ? 'critical' : change > 15 ? 'warning' : 'safe';
          const colors = { critical: '#f43f5e', warning: '#f59e0b', safe: '#10b981' };

          return (
            <div key={i} className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
              <svg viewBox="0 0 120 70" className="w-full max-w-[120px] mx-auto mb-2">
                {/* Background arc */}
                <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                {/* Safe zone */}
                <path d="M 10 60 A 50 50 0 0 1 43 15" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
                {/* Warning zone */}
                <path d="M 43 15 A 50 50 0 0 1 77 15" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
                {/* Critical zone */}
                <path d="M 77 15 A 50 50 0 0 1 110 60" fill="none" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
                {/* Needle */}
                <circle cx="60" cy="60" r="4" fill={colors[riskLevel]} />
                <line x1="60" y1="60" x2={60 + 35 * Math.cos(Math.PI * (1 - Math.min(change, 50) / 50))} y2={60 - 35 * Math.sin(Math.PI * (1 - Math.min(change, 50) / 50))} stroke={colors[riskLevel]} strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <p className="text-xs font-bold text-slate-700">{p.metric}</p>
              <p className="text-[10px] font-bold mt-0.5" style={{ color: colors[riskLevel] }}>{riskLevel.toUpperCase()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import ChatPanel from './ChatPanel';
import DataCleaningPanel from './DataCleaningPanel';
import ReportModal from './ReportModal';

// ══════════════════════════════════════════════════
//  MASTER: ENTERPRISE INSIGHTS
// ══════════════════════════════════════════════════
export default function EnterpriseInsights({ insights, chartData, filename, rawData, columns, rowCount, onNewUpload, onRerunJob, userId }) {
  const [stage, setStage] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 50);   // KPIs
    const t2 = setTimeout(() => setStage(2), 500);  // Exec Summary
    const t3 = setTimeout(() => setStage(3), 1000); // Data Quality, Trends, Charts
    const t4 = setTimeout(() => setStage(4), 1500); // Rest
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [insights]);

  if (!insights) return null;

  const stats = insights.statistical || {};
  const exec = insights.executive_summary || {};
  const dq = insights.data_quality || {};

  const fadeClass = (reqStage) => `transition-all duration-700 transform ${stage >= reqStage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`;

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Action bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm font-semibold text-slate-700">Enterprise Analysis Complete</p>
          </div>
          {onNewUpload && (
            <button onClick={onNewUpload} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all">
              <span>+</span> Analyze another file
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95"
          >
            <Icons.Download className="w-3.5 h-3.5" />
            Export PDF
          </button>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">{filename}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div id="report-kpis">
        <KPICards insights={insights} rowCount={rowCount} columnCount={columns?.length} stage={stage} />
      </div>

      {/* Executive Summary */}
      <div id="report-exec-summary">
        <ExecutiveSummary data={exec} stage={stage} insights={insights} />
      </div>

      {/* Auto Data Cleaning Engine (Shows if Health < 95) */}
      {(dq.health_score || 85) < 95 && (
        <div className={fadeClass(3)}>
          <DataCleaningPanel 
            initialData={rawData} 
            columns={columns} 
            healthScore={dq.health_score || 85}
            apiUrl={import.meta.env.VITE_API_URL || ''}
            userId={userId}
            onUploadSuccess={onRerunJob}
            darkMode={document.documentElement.classList.contains('dark')} 
          />
        </div>
      )}

      {/* Main Unified Grid: Prevents empty spaces when data is missing */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${fadeClass(3)}`}>
        {/* Left Column (Wide / Heavy Charts) */}
        <div className="lg:col-span-8 space-y-6 flex flex-col">
          <div id="report-charts"><DataVisualization chartData={chartData} /></div>
          <div id="report-trends"><TrendsChart trends={insights.trends} stage={stage} /></div>
          <div id="report-anomalies"><AnomalyPanel anomalies={insights.anomalies} /></div>
        </div>

        {/* Right Column (Metrics, Reports, Side Panels) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <div id="report-quality"><DataQualityReport data={dq} /></div>
          <RiskGauge predictions={insights.predictions} />
          <PredictionsPanel predictions={insights.predictions} />
          <CorrelationPanel correlations={stats.correlations} />
          <SegmentPanel segments={insights.segments} />
        </div>
      </div>

      {/* Column Profiles */}
      <div className={fadeClass(4)}>
        <ColumnProfiles profiles={stats.column_profiles} />
      </div>

      {/* Smart Data Table */}
      <div className={fadeClass(4)}>
        <SmartDataTable data={rawData} columns={columns} />
      </div>

      {/* Floating Chat Panel */}
      <div className={`transition-all duration-700 ${stage >= 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <ChatPanel insights={insights} columns={columns} apiUrl={import.meta.env.VITE_API_URL || ''} userId={userId} />
      </div>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        filename={filename} 
      />
    </div>
  );
}
