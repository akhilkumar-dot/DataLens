import React, { useState, useEffect } from 'react';
import { generateEnterpriseReport } from '../../lib/pdfGenerator';

const Icons = {
  Close: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Download: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Check: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  FileText: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
};

export default function ReportModal({ isOpen, onClose, filename }) {
  const [sections, setSections] = useState([
    { id: 'report-kpis', label: 'Key Performance Indicators (KPIs)', selected: true },
    { id: 'report-exec-summary', label: 'Executive Summary (TL;DR)', selected: true },
    { id: 'report-charts', label: 'Time-Series Charts', selected: true },
    { id: 'report-trends', label: 'Trend Analysis', selected: true },
    { id: 'report-anomalies', label: 'Anomalies & Outliers', selected: true },
    { id: 'report-quality', label: 'Data Quality & Health', selected: true }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, text: '' });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!isOpen) return null;

  const handleToggle = (id) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress({ percent: 0, text: 'Initializing...' });
    
    try {
      const selectedIds = sections.filter(s => s.selected).map(s => s.id);
      await generateEnterpriseReport(
        selectedIds, 
        { 
          title: "Enterprise Analysis Report", 
          date: new Date().toLocaleDateString(), 
          filename 
        }, 
        (percent, text) => setProgress({ percent, text })
      );
      setTimeout(() => {
        onClose();
        setIsGenerating(false);
      }, 1000);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF. See console for details.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden animate-slide-up ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <Icons.FileText className="w-4 h-4 text-brand-blue" />
            </div>
            <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Export PDF Report</h3>
          </div>
          <button onClick={!isGenerating ? onClose : undefined} className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Icons.Close className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Select the modules you want to include in your boardroom-ready PDF export.</p>
          
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {sections.map(s => (
              <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                s.selected 
                  ? darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200' 
                  : darkMode ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  s.selected 
                    ? 'bg-brand-blue border-brand-blue text-white' 
                    : darkMode ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-300'
                }`}>
                  {s.selected && <Icons.Check className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-sm font-medium ${s.selected ? (darkMode ? 'text-slate-200' : 'text-brand-blue') : (darkMode ? 'text-slate-400' : 'text-slate-600')}`}>
                  {s.label}
                </span>
              </label>
            ))}
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="mt-6 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-brand-blue">{progress.text}</span>
                <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{Math.round(progress.percent)}%</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div 
                  className="h-full bg-brand-blue transition-all duration-300 rounded-full" 
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${darkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
          <button 
            onClick={onClose} 
            disabled={isGenerating}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cancel
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !sections.some(s => s.selected)}
            className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-sm font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
            ) : (
              <Icons.Download className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>

      </div>
    </div>
  );
}
