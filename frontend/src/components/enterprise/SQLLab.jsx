import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import useDuckDB from '../../hooks/useDuckDB';

// ── Icons ──
const Icons = {
  Database: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>,
  Sparkles: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Play: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Trash: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Download: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Chart: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Clear: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Bulb: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21h6m-3-3v3m-5-3a5 5 0 1110 0v1H8v-1zm5-13V4" /></svg>
};

const SUGGESTIONS = [
  { title: 'Top 10 Rows', sql: 'SELECT * FROM data\nLIMIT 10;' },
  { title: 'Find Null Values', sql: 'SELECT * FROM data\nWHERE column_name IS NULL;' },
  { title: 'Summary Statistics', sql: 'SELECT COUNT(*), AVG(numeric_col) FROM data;' },
  { title: 'Group By Category', sql: 'SELECT category, COUNT(*) as count\nFROM data\nGROUP BY category\nORDER BY count DESC;' }
];

export default function SQLLab({ rawData, columns, darkMode }) {
  const { isReady, isLoading, error: dbError, initDB, runQuery } = useDuckDB();
  const [nlQuery, setNlQuery] = useState('');
  const [sqlQuery, setSqlQuery] = useState('-- Write your SQL here or Ask AI above\nSELECT * FROM data LIMIT 10;');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [execTime, setExecTime] = useState(0);
  const [queryHistory, setQueryHistory] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  // Initialize DuckDB with CSV Data
  useEffect(() => {
    if (rawData && rawData.length > 0) {
      // Very simple JSON to CSV converter for DuckDB
      const keys = Object.keys(rawData[0]);
      const header = keys.join(',');
      const csvStr = [header, ...rawData.map(row => keys.map(k => JSON.stringify(row[k] === null ? '' : row[k])).join(','))].join('\n');
      initDB(csvStr);
    }
  }, [rawData, initDB]);

  // Load History
  useEffect(() => {
    const hist = localStorage.getItem('sqlHistory');
    if (hist) setQueryHistory(JSON.parse(hist));
  }, []);

  const saveHistory = (query) => {
    const newHist = [{ sql: query, time: new Date().toISOString() }, ...queryHistory.filter(h => h.sql !== query)].slice(0, 20);
    setQueryHistory(newHist);
    localStorage.setItem('sqlHistory', JSON.stringify(newHist));
  };

  const handleGenerateSQL = async () => {
    if (!nlQuery.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const schema = columns?.map(c => `${c.name} (${c.type})`).join(', ') || 'Unknown schema';
      
      const res = await fetch(`${apiUrl}/sql/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: nlQuery, schema })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setSqlQuery(data.sql);
      executeSQL(data.sql);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const explainSQL = async () => {
    if (!sqlQuery.trim()) return;
    setIsExplaining(true);
    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${apiUrl}/sql/explain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sql: sqlQuery })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setExplanation(data.explanation);
    } catch (err) {
        console.error("Explanation error:", err);
    } finally {
        setIsExplaining(false);
    }
  };

  const executeSQL = async (queryToRun = sqlQuery) => {
    if (!isReady) return setError("Database engine is still loading...");
    setIsExecuting(true);
    setError(null);
    setResults(null);
    setExplanation('');
    const start = performance.now();
    try {
      const res = await runQuery(queryToRun);
      setExecTime(((performance.now() - start) / 1000).toFixed(2));
      setResults(res);
      saveHistory(queryToRun);
    } catch (err) {
      setError(err.message || "Failed to execute query");
    } finally {
      setIsExecuting(false);
    }
  };

  const exportCSV = () => {
    if (!results || !results.length) return;
    const keys = Object.keys(results[0]);
    const csvStr = [keys.join(','), ...results.map(row => keys.map(k => JSON.stringify(row[k] || '')).join(','))].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.csv';
    a.click();
  };

  // Render simple auto-chart if applicable
  const renderAutoChart = () => {
    if (!results || results.length === 0 || results.length > 500) return null; // Too much data for simple auto-chart
    const keys = Object.keys(results[0]);
    const numKeys = keys.filter(k => typeof results[0][k] === 'number');
    const catKeys = keys.filter(k => typeof results[0][k] === 'string');
    
    if (numKeys.length === 0) return null;
    const xAxisKey = catKeys.length > 0 ? catKeys[0] : keys[0];
    const yAxisKey = numKeys[0];

    return (
      <div className="h-64 mt-6 border-t border-slate-100 pt-6">
        <p className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-4 flex items-center gap-2">
          <Icons.Chart className="w-4 h-4 text-blue-500" /> Auto-Generated View
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={results} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} angle={-45} textAnchor="end" />
            <YAxis tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} />
            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey={yAxisKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (!rawData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Icons.Database className="w-12 h-12 mb-4 text-slate-300" />
        <p>Upload a dataset to start querying with SQL Lab</p>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col gap-6 animate-fade-in pb-10 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      
      {/* ── TOP: NL Query Bar ── */}
      <div className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Icons.Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={nlQuery}
              onChange={e => setNlQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerateSQL()}
              placeholder="Ask in plain English... e.g. Show me the top 10 rows by revenue"
              className={`w-full py-3 px-4 pr-32 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${darkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            />
            <button 
              onClick={handleGenerateSQL}
              disabled={isGenerating || !nlQuery.trim()}
              className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Generate SQL'}
            </button>
          </div>
        </div>
        <p className={`mt-3 pl-14 text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          or write SQL directly below ↓
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* ── MAIN COL: Editor & Results ── */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Editor Container */}
          <div className={`rounded-2xl border shadow-sm overflow-hidden flex flex-col ${darkMode ? 'bg-[#0D1117] border-slate-700' : 'bg-[#F8FAFC] border-slate-200'}`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <button onClick={() => executeSQL(sqlQuery)} disabled={isExecuting} className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-all disabled:opacity-50">
                  {isExecuting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icons.Play className="w-3.5 h-3.5" />}
                  Run [⌘+Enter]
                </button>
                <button onClick={() => setSqlQuery('')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'}`}>
                  <Icons.Clear className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
              <div className="flex items-center gap-2">
                {dbError ? (
                  <span className="text-xs text-rose-500 bg-rose-500/10 px-2 py-1 rounded-md font-medium">Engine Failed: {dbError}</span>
                ) : !isReady ? (
                  <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md animate-pulse">Initializing DuckDB WASM...</span>
                ) : (
                  <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">Engine Ready</span>
                )}
              </div>
            </div>
            
            <div className="h-64 relative">
              <Editor
                height="100%"
                language="sql"
                theme={darkMode ? 'vs-dark' : 'light'}
                value={sqlQuery}
                onChange={setSqlQuery}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16 }
                }}
              />
            </div>
            
            {error && (
              <div className="p-4 bg-rose-50 border-t border-rose-200 flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded bg-rose-100 flex items-center justify-center shrink-0">
                  <span className="text-rose-600 font-bold text-xs">!</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-rose-800">SQL Error</p>
                  <p className="text-xs text-rose-600 mt-1 font-mono">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Results Container */}
          {results && (
            <div className={`rounded-2xl border shadow-sm p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className={`text-sm font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Query Results</h3>
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                    {results.length} rows returned • {execTime}s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={explainSQL} disabled={isExplaining} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-lg transition-all">
                    <Icons.Bulb className="w-3.5 h-3.5" /> Explain
                  </button>
                  <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition-all">
                    <Icons.Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                </div>
              </div>

              {explanation && (
                <div className="mb-4 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                  <Icons.Bulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900 leading-relaxed font-medium">{explanation}</p>
                </div>
              )}

              <div className={`overflow-x-auto rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                {results.length > 0 ? (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className={`text-xs uppercase font-bold sticky top-0 ${darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                      <tr>
                        {Object.keys(results[0]).map(key => (
                          <th key={key} className="px-4 py-3 border-b">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                      {results.slice(0, 100).map((row, i) => (
                        <tr key={i} className={`transition-colors ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                          {Object.keys(row).map(key => (
                            <td key={key} className="px-4 py-2.5">
                              {row[key] === null ? <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">NULL</span> : String(row[key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-sm">Query returned 0 rows.</div>
                )}
                {results.length > 100 && (
                  <div className={`text-center py-2 text-xs font-medium border-t ${darkMode ? 'border-slate-700 text-slate-400 bg-slate-800' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
                    Showing top 100 of {results.length} rows
                  </div>
                )}
              </div>

              {renderAutoChart()}
            </div>
          )}

          {/* Suggestions */}
          <div>
            <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-4">Auto-Generated Suggestions</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SUGGESTIONS.map((s, i) => (
                <div key={i} className={`p-4 rounded-xl border transition-all cursor-pointer group hover:-translate-y-0.5 hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-blue-200'}`} onClick={() => { setSqlQuery(s.sql); executeSQL(s.sql); }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{s.title}</p>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Run →</span>
                  </div>
                  <pre className={`text-xs font-mono p-2 rounded-lg truncate ${darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                    {s.sql}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COL: History ── */}
        <div className={`lg:col-span-1 rounded-2xl border flex flex-col h-[600px] overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <h3 className={`text-sm font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Query History</h3>
            <button onClick={() => { setQueryHistory([]); localStorage.removeItem('sqlHistory'); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
              <Icons.Trash className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {queryHistory.length === 0 ? (
              <p className="text-xs text-center text-slate-400 mt-10">No recent queries</p>
            ) : (
              queryHistory.map((h, i) => (
                <div key={i} onClick={() => { setSqlQuery(h.sql); setNlQuery(''); }} className={`p-3 rounded-xl border cursor-pointer transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-700 hover:border-slate-500' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-300'}`}>
                  <p className={`text-[10px] font-bold mb-1.5 uppercase tracking-wide ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <pre className={`text-xs font-mono line-clamp-3 whitespace-pre-wrap word-break ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {h.sql}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
