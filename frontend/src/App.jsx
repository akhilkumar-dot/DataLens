import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import HeroPage from './pages/HeroPage';
import AuthPage from './pages/AuthPage';
import UploadZone from './components/UploadZone';
import StatusBadge from './components/StatusBadge';
import EnterpriseInsights from './components/enterprise/EnterpriseInsights';
import AnalyticsView from './components/AnalyticsView';
import HistoryPanel from './components/HistoryPanel';
import CommandPalette from './components/enterprise/CommandPalette';
import ComparisonView from './components/enterprise/ComparisonView';
import SQLLab from './components/enterprise/SQLLab';
import useJobPolling from './hooks/useJobPolling';

const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const { user, loading, signOut } = useAuth();
  const [page, setPage] = useState('hero'); // 'hero' | 'auth'
  const [authMode, setAuthMode] = useState('signin');

  // If user is authenticated, show the dashboard
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading ContextIQ...</p>
        </div>
      </div>
    );
  }

  // Not authenticated: show hero or auth page
  if (!user) {
    if (page === 'auth') {
      return (
        <AuthPage
          defaultMode={authMode}
          onBack={() => setPage('hero')}
        />
      );
    }
    return (
      <HeroPage
        onGetStarted={() => { setAuthMode('signup'); setPage('auth'); }}
        onSignIn={() => { setAuthMode('signin'); setPage('auth'); }}
      />
    );
  }

  // Authenticated: show dashboard
  return <Dashboard user={user} signOut={signOut} />;
}

function Dashboard({ user, signOut }) {
  const [currentView, setCurrentView] = useState('upload');
  const [currentJob, setCurrentJob] = useState(null);
  const { status, insights, chartData, jobDetails, error, startPolling, reset } = useJobPolling(API_URL);

  // Theme & Keyboard Shortcuts State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault();
        setCurrentView('upload');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const handleUploadSuccess = useCallback((data) => {
    setCurrentJob(data);
    startPolling(data.jobId);
  }, [startPolling]);

  const handleHistorySelect = useCallback((job) => {
    setCurrentJob(job);
    startPolling(job.jobId);
    setCurrentView('upload');
  }, [startPolling]);

  const handleNewUpload = useCallback(() => {
    setCurrentJob(null);
    reset();
  }, [reset]);

  const navItems = [
    {
      id: 'upload', label: 'Insights',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" /></svg>,
    },
    {
      id: 'analytics', label: 'Analytics',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>,
    },
    {
      id: 'compare', label: 'Compare',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" /></svg>,
    },
    {
      id: 'sqllab', label: 'SQL Lab',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>,
    },
    {
      id: 'history', label: 'History',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>,
    },
  ];

  const headerNavItems = navItems.filter(n => n.id !== 'history');
  const viewTitles = {
    upload: { sub: 'Intelligence Portal', main: 'Curate Your', accent: 'Context' },
    analytics: { sub: 'Data Analytics', main: 'Visual', accent: 'Analytics' },
    compare: { sub: 'Cross-Dataset Comparison', main: 'Comparison', accent: 'Mode' },
    sqllab: { sub: 'Data Query Engine', main: 'SQL', accent: 'Lab' },
    history: { sub: 'Intelligence Portal', main: 'Analysis', accent: 'History' },
  };
  const currentTitle = viewTitles[currentView];
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans flex transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 transition-colors">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 shadow-sm rounded-lg">
              <rect width="32" height="32" rx="8" fill="#2563EB"/>
              <circle cx="12" cy="12" r="2.5" fill="white"/>
              <circle cx="20" cy="12" r="2.5" fill="white"/>
              <circle cx="12" cy="20" r="2.5" fill="white"/>
              <path d="M20 17v6m-3-3h6" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">ContextIQ</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                currentView === item.id
                  ? 'bg-white dark:bg-slate-800 text-brand-blue dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`p-1 rounded ${currentView === item.id ? 'bg-brand-blue-light dark:bg-blue-900/30' : ''}`}>
                {item.icon}
              </div>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">AI Model</h3>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            
            <div className="relative mb-4">
              <select className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue cursor-pointer transition-all active:scale-95 hover:border-slate-300 dark:hover:border-slate-600">
                <option>Llama 3 70B (Fast)</option>
                <option>GPT-4o (Reason)</option>
                <option>Claude 3.5 Sonnet</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 dark:text-slate-500">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Token Usage</p>
                <p className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">45k <span className="text-slate-400 font-normal">/ 100k</span></p>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-brand-blue rounded-full transition-all duration-1000 w-[45%]" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help Center
            </button>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors">
        {/* Top Header */}
        <header className="h-20 px-8 flex items-center justify-end gap-6">
          <div className="flex items-center gap-2 mr-auto bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">Cmd+K</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">to search</span>
          </div>

          <nav className="flex items-center gap-6 mr-4 text-sm font-medium">
            {headerNavItems.map((item) => (
              <a
                key={item.id}
                href="#"
                onClick={(e) => { e.preventDefault(); setCurrentView(item.id); }}
                className={currentView === item.id ? 'text-brand-blue dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}
              >
                {item.label}
              </a>
            ))}
          </nav>
          
          <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-6">
            <button onClick={toggleTheme} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-amber-400 transition-all active:scale-95 hover:-translate-y-0.5">
              {theme === 'light' ? (
                <svg className="w-5 h-5 hover:text-indigo-500 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
              )}
            </button>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all active:scale-95 hover:-translate-y-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.533 1.533 0 012.287-.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.948c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-slate-600 hidden xl:block">{displayName}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-12 pb-12">
          <div className="max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-10 animate-fade-in">
              <h4 className="text-[10px] font-bold tracking-widest text-brand-blue uppercase mb-2">
                {currentTitle.sub}
              </h4>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
                {currentTitle.main} <span className="text-brand-blue">{currentTitle.accent}</span>
              </h2>
            </div>

            {currentView === 'upload' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex flex-wrap gap-2 -mt-4 mb-6">
                  {['Summary', 'Trends', 'Anomalies', 'Recommendations'].map(pill => (
                    <span key={pill} className="px-4 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200">
                      {pill}
                    </span>
                  ))}
                </div>
                {!currentJob ? (
                  <UploadZone apiUrl={API_URL} onUploadSuccess={handleUploadSuccess} userId={user.id} />
                ) : (
                  <div className="space-y-8">
                    <div className="glass-card p-6">
                      <StatusBadge status={status} />
                      {status === 'failed' && (
                        <div className="mt-4 text-sm text-accent-rose text-center">
                          {error || 'An unexpected error occurred. Please try again.'}
                          <button onClick={handleNewUpload} className="block mx-auto mt-2 text-brand-blue underline">Try Again</button>
                        </div>
                      )}
                    </div>
                    {(status === 'pending' || status === 'processing' || status === 'queued') && (
                      <div className="space-y-6 animate-fade-in">
                        {/* Action Bar Skeleton */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                            <div className="shimmer-bg h-4 w-48 rounded" />
                          </div>
                          <div className="shimmer-bg h-8 w-24 rounded-lg" />
                        </div>
                        {/* KPI Skeleton */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-32 flex flex-col justify-between shadow-sm">
                              <div className="shimmer-bg w-9 h-9 rounded-xl" />
                              <div>
                                <div className="shimmer-bg h-6 w-16 mb-2 rounded" />
                                <div className="shimmer-bg h-3 w-24 rounded" />
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Exec Summary Skeleton */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
                          <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
                            <div className="shimmer-bg w-10 h-10 rounded-xl shrink-0" />
                            <div className="space-y-2 w-full mt-1">
                              <div className="shimmer-bg h-3 w-16 rounded mb-2" />
                              <div className="shimmer-bg h-4 w-full rounded" />
                              <div className="shimmer-bg h-4 w-5/6 rounded" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="shimmer-bg h-24 rounded-xl" />
                            <div className="shimmer-bg h-24 rounded-xl" />
                          </div>
                        </div>
                        {/* Main Grid Skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-8 shimmer-bg h-[400px] rounded-2xl shadow-sm" />
                          <div className="lg:col-span-4 shimmer-bg h-[400px] rounded-2xl shadow-sm" />
                        </div>
                      </div>
                    )}
                    {status === 'done' && insights && (
                        <EnterpriseInsights 
                          insights={insights} 
                          chartData={chartData} 
                          filename={jobDetails?.filename || currentJob?.filename} 
                          rawData={jobDetails?.preview} 
                          columns={jobDetails?.columns} 
                          rowCount={jobDetails?.rowCount} 
                          onNewUpload={handleNewUpload} 
                          onRerunJob={handleUploadSuccess}
                          userId={user.id} 
                        />
                    )}
                  </div>
                )}
              </div>
            )}

            {currentView === 'analytics' && (
              <div className="animate-fade-in">
                <AnalyticsView insights={insights} chartData={chartData} />
              </div>
            )}

            {currentView === 'compare' && (
              <div className="animate-fade-in">
                <ComparisonView apiUrl={API_URL} userId={user.id} />
              </div>
            )}

            {currentView === 'sqllab' && (
              <div className="animate-fade-in h-[calc(100vh-12rem)] pb-8">
                <SQLLab 
                  rawData={jobDetails?.preview || currentJob?.preview} 
                  columns={jobDetails?.columns || currentJob?.columns} 
                  darkMode={theme === 'dark'} 
                />
              </div>
            )}

            {currentView === 'history' && (
              <div className="animate-fade-in">
                <HistoryPanel apiUrl={API_URL} onSelect={handleHistorySelect} userId={user.id} />
              </div>
            )}
          </div>
        </div>
      </main>

      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
        onNavigate={(view) => setCurrentView(view)}
        onThemeToggle={toggleTheme}
      />
    </div>
  );
}

export default App;
