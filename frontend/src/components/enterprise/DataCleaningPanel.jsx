import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const Icons = {
  Sparkles: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>,
  Wrench: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  CheckCircle: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Undo: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>,
  Download: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Refresh: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
};

export default function DataCleaningPanel({ initialData, columns, healthScore, apiUrl, userId, onUploadSuccess, darkMode }) {
  const [dataHistory, setDataHistory] = useState([initialData]);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  const currentData = dataHistory[currentStep] || [];

  // --- HEURISTIC ANALYSIS ENGINE ---
  const issues = useMemo(() => {
    if (!currentData.length || !columns.length) return [];
    const detected = [];

    // 1. Check for duplicates
    const stringified = currentData.map(r => JSON.stringify(r));
    const uniqueCount = new Set(stringified).size;
    const duplicates = currentData.length - uniqueCount;
    if (duplicates > 0) {
      detected.push({
        id: 'duplicates',
        type: 'Duplicates',
        severity: 'high',
        message: `Found ${duplicates} identical rows across all columns.`,
        actions: [
          { label: 'Drop Duplicates', handler: () => handleDropDuplicates() }
        ]
      });
    }

    // 2. Check for Nulls/Missing Values per column
    columns.forEach(col => {
      let nullCount = 0;
      let numericVals = [];
      let isNumericCol = col.type === 'number' || col.type === 'float' || col.type === 'integer';

      currentData.forEach(row => {
        const val = row[col.name];
        if (val === null || val === undefined || val === '') {
          nullCount++;
        } else if (isNumericCol && !isNaN(parseFloat(val))) {
          numericVals.push(parseFloat(val));
        }
      });

      if (nullCount > 0) {
        const actions = [{ label: `Drop ${nullCount} Rows`, handler: () => handleDropNulls(col.name) }];
        
        if (isNumericCol && numericVals.length > 0) {
          const avg = numericVals.reduce((a,b)=>a+b,0) / numericVals.length;
          actions.push({ label: `Fill with Mean (${avg.toFixed(2)})`, handler: () => handleFillNulls(col.name, avg) });
          actions.push({ label: 'Fill with 0', handler: () => handleFillNulls(col.name, 0) });
        } else {
          actions.push({ label: 'Fill with "Unknown"', handler: () => handleFillNulls(col.name, 'Unknown') });
        }

        detected.push({
          id: `nulls_${col.name}`,
          type: 'Missing Values',
          severity: nullCount > currentData.length * 0.2 ? 'high' : 'medium',
          message: `${nullCount} missing values in column '${col.name}'.`,
          actions
        });
      }

      // 3. Outlier Detection (Z-Score > 3) for numeric columns
      if (isNumericCol && numericVals.length > 5) {
        const mean = numericVals.reduce((a,b)=>a+b,0) / numericVals.length;
        const stdDev = Math.sqrt(numericVals.map(x => Math.pow(x - mean, 2)).reduce((a,b)=>a+b,0) / numericVals.length);
        
        let outlierCount = 0;
        currentData.forEach(row => {
          const val = row[col.name];
          if (val !== null && val !== '') {
            const num = parseFloat(val);
            if (!isNaN(num) && Math.abs(num - mean) > 3 * stdDev) {
              outlierCount++;
            }
          }
        });

        if (outlierCount > 0) {
          detected.push({
            id: `outliers_${col.name}`,
            type: 'Outliers',
            severity: 'low',
            message: `${outlierCount} statistical outliers detected in '${col.name}' (Z-Score > 3).`,
            actions: [
              { label: 'Cap at ±3 StdDev', handler: () => handleCapOutliers(col.name, mean, stdDev) },
              { label: 'Drop Outliers', handler: () => handleDropOutliers(col.name, mean, stdDev) }
            ]
          });
        }
      }
    });

    return detected.sort((a,b) => (a.severity === 'high' ? -1 : 1));
  }, [currentData, columns]);

  // --- MUTATION ACTIONS ---
  const commitChange = (newData, logMessage) => {
    const newHistory = dataHistory.slice(0, currentStep + 1);
    newHistory.push(newData);
    setDataHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
    setLogs(prev => [...prev.slice(0, currentStep), { message: logMessage, time: new Date() }]);
    
    // Notify parent if needed
    if(onDataCleaned) onDataCleaned(newData);
  };

  const handleDropDuplicates = () => {
    const seen = new Set();
    const newData = currentData.filter(row => {
      const str = JSON.stringify(row);
      if (seen.has(str)) return false;
      seen.add(str);
      return true;
    });
    commitChange(newData, `Removed ${currentData.length - newData.length} duplicate rows.`);
  };

  const handleDropNulls = (colName) => {
    const newData = currentData.filter(row => row[colName] !== null && row[colName] !== undefined && row[colName] !== '');
    commitChange(newData, `Dropped ${currentData.length - newData.length} rows with missing '${colName}'.`);
  };

  const handleFillNulls = (colName, fillValue) => {
    let count = 0;
    const newData = currentData.map(row => {
      if (row[colName] === null || row[colName] === undefined || row[colName] === '') {
        count++;
        return { ...row, [colName]: fillValue };
      }
      return row;
    });
    commitChange(newData, `Filled ${count} missing values in '${colName}' with [${fillValue}].`);
  };

  const handleCapOutliers = (colName, mean, stdDev) => {
    let count = 0;
    const maxVal = mean + 3 * stdDev;
    const minVal = mean - 3 * stdDev;
    const newData = currentData.map(row => {
      const val = row[colName];
      if (val !== null && val !== '') {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          if (num > maxVal) { count++; return { ...row, [colName]: maxVal }; }
          if (num < minVal) { count++; return { ...row, [colName]: minVal }; }
        }
      }
      return row;
    });
    commitChange(newData, `Capped ${count} outliers in '${colName}' to $\\pm$ 3 StdDev.`);
  };

  const handleDropOutliers = (colName, mean, stdDev) => {
    const maxVal = mean + 3 * stdDev;
    const minVal = mean - 3 * stdDev;
    const newData = currentData.filter(row => {
      const val = row[colName];
      if (val === null || val === '') return true;
      const num = parseFloat(val);
      if (isNaN(num)) return true;
      return num <= maxVal && num >= minVal;
    });
    commitChange(newData, `Dropped ${currentData.length - newData.length} outlier rows in '${colName}'.`);
  };

  const undo = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if(onDataCleaned) onDataCleaned(dataHistory[currentStep - 1]);
    }
  };

  const exportCleanedData = () => {
    setIsExporting(true);
    try {
      if (!currentData || !currentData.length) return;
      const keys = Object.keys(currentData[0]);
      const csvStr = [keys.join(','), ...currentData.map(row => keys.map(k => JSON.stringify(row[k] || '')).join(','))].join('\n');
      const blob = new Blob([csvStr], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cleaned_dataset.csv';
      a.click();
    } finally {
      setIsExporting(false);
    }
  };

  const triggerRerun = async () => {
    setIsExporting(true);
    try {
      if (!currentData || !currentData.length) return;
      const keys = Object.keys(currentData[0]);
      const csvStr = [keys.join(','), ...currentData.map(row => keys.map(k => JSON.stringify(row[k] || '')).join(','))].join('\n');
      const blob = new Blob([csvStr], { type: 'text/csv' });
      const file = new File([blob], 'cleaned_dataset.csv', { type: 'text/csv' });
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${apiUrl}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-user-id': userId || 'anonymous',
        },
      });

      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch(err) {
      console.error(err);
      alert("Failed to rerun analysis");
    } finally {
      setIsExporting(false);
    }
  };

  // Determine current effective health score
  const initialIssuesCount = issues.length + logs.length; // rough proxy for original
  const currentIssuesCount = issues.length;
  const effectiveHealth = Math.min(100, Math.floor(healthScore + (logs.length * (100 - healthScore) / Math.max(1, initialIssuesCount))));

  return (
    <div className={`rounded-2xl border shadow-sm flex flex-col md:flex-row overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
      
      {/* LEFT: Issue Detector */}
      <div className={`md:w-2/3 p-6 md:p-8 flex flex-col ${darkMode ? 'border-r border-slate-700' : 'border-r border-slate-100'}`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              <Icons.Wrench className="w-6 h-6 text-brand-blue" />
              Auto Data Cleaning Engine
            </h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Automatically detect and resolve structural data issues.</p>
          </div>
          <div className="flex flex-col items-end">
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Effective Health</p>
             <p className={`text-3xl font-black ${effectiveHealth >= 95 ? 'text-emerald-500' : effectiveHealth >= 80 ? 'text-amber-500' : 'text-rose-500'}`}>{effectiveHealth}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {issues.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed ${darkMode ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50'}`}>
              <Icons.CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
              <p className="text-emerald-700 font-bold">Data is structurally sound.</p>
              <p className="text-emerald-600/70 text-xs mt-1">No major issues detected.</p>
            </div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                issue.severity === 'high' 
                  ? darkMode ? 'bg-rose-950/20 border-rose-900/50' : 'bg-rose-50 border-rose-200'
                  : issue.severity === 'medium'
                    ? darkMode ? 'bg-amber-950/20 border-amber-900/50' : 'bg-amber-50 border-amber-200'
                    : darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${issue.severity === 'high' ? 'bg-rose-500 animate-pulse' : issue.severity === 'medium' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                    <p className={`text-xs font-bold uppercase tracking-wider ${
                      issue.severity === 'high' ? 'text-rose-600' : issue.severity === 'medium' ? 'text-amber-600' : 'text-slate-500'
                    }`}>{issue.type}</p>
                  </div>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{issue.message}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {issue.actions.map((act, i) => (
                    <button 
                      key={i} 
                      onClick={act.handler}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        i === 0 
                          ? 'bg-brand-blue text-white hover:bg-blue-700 shadow-sm' 
                          : darkMode ? 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Action Log & Export */}
      <div className={`md:w-1/3 p-6 md:p-8 flex flex-col bg-slate-50 dark:bg-slate-800/50`}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mutation Log</p>
          <button 
            onClick={undo} 
            disabled={currentStep === 0}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            <Icons.Undo className="w-3.5 h-3.5" /> Undo
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 relative">
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
          
          <div className="relative pl-8">
            <div className="absolute left-[9px] top-1.5 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-slate-50 dark:border-slate-800" />
            <p className="text-xs text-slate-500">Dataset Loaded ({initialData.length} rows)</p>
          </div>

          {logs.slice(0, currentStep).map((log, i) => (
            <div key={i} className="relative pl-8 animate-slide-up">
              <div className="absolute left-[9px] top-1.5 w-2 h-2 rounded-full bg-brand-blue border-2 border-slate-50 dark:border-slate-800" />
              <p className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{log.message}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{log.time.toLocaleTimeString()}</p>
            </div>
          ))}

          {currentStep > 0 && issues.length === 0 && (
            <div className="relative pl-8 pt-4 animate-fade-in">
              <div className="absolute left-[9px] top-5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-slate-50 dark:border-slate-800 ring-2 ring-emerald-500/30" />
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">All detected issues resolved</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-3">
          <button 
            onClick={triggerRerun}
            disabled={isExporting}
            className="w-full py-3 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
          >
            {isExporting ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/> : <Icons.Refresh className="w-4 h-4" />}
            Re-run Pipeline
          </button>
          <button 
            onClick={exportCleanedData}
            disabled={isExporting}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Icons.Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

    </div>
  );
}
