const NAV_LINKS = ['Products', 'Use cases', 'Intelligence', 'Pricing', 'Company'];

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Semantic Graph',
    desc: 'Proprietary knowledge maps that trace every point in your workspace to context-aware connections.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Cognitive Search',
    desc: 'Search that understands the work, not just keywords. ContextIQ looks at the context you\'re using.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Private Intelligence',
    desc: 'Generate dark signals, privately. Ensure your data stays pure, zero data leaks, zero compromise.',
  },
];

const OVERLAP_FEATURES = [
  { icon: '🔍', color: 'text-blue-500', title: 'Cross-File Signal Detection', desc: 'Interrelate data patterns across files, tabs, and databases.' },
  { icon: '⚡', color: 'text-amber-500', title: 'Automated Priority Scoring', desc: 'Machine-ranked importance from noisy data in GPUs.' },
];

export default function HeroPage({ onGetStarted, onSignIn }) {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-blue flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
              </div>
              <span className="text-base font-bold text-slate-900">ContextIQ</span>
            </a>
            <nav className="hidden lg:flex items-center gap-5">
              {NAV_LINKS.map((link, i) => (
                <a key={link} href="#" className={`text-sm font-medium transition-colors ${i === 0 ? 'text-brand-blue' : 'text-slate-500 hover:text-slate-900'}`}>
                  {link}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onSignIn} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">Login</button>
            <button onClick={onGetStarted} className="text-sm font-semibold text-white bg-brand-blue px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md shadow-brand-blue/20 hover:shadow-lg">Start Free Trial</button>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="pt-20 pb-4 text-center relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-8">
            <span className="text-[10px] font-bold tracking-[0.2em] text-brand-blue uppercase">Enterprise Intelligence</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
            Intelligence that<br />
            <span className="bg-gradient-to-r from-brand-blue to-indigo-500 bg-clip-text text-transparent italic">understands</span> context.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto mb-10">
            Move beyond raw data. ContextIQ connects the dots between your
            siloed enterprise knowledge to deliver actionable clarity in
            real-time.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={onGetStarted} className="flex items-center gap-2 px-7 py-3.5 bg-brand-blue text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
              Start Your Intelligence
            </button>
          </div>
        </div>
      </section>

      {/* ===== DASHBOARD PREVIEW ===== */}
      <section className="pb-20 pt-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/30 border border-slate-700 overflow-hidden">
            {/* Browser bar */}
            <div className="h-10 bg-slate-800 flex items-center gap-2 px-4 border-b border-slate-700/50">
              <div className="w-3 h-3 rounded-full bg-rose-400/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <div className="ml-4 h-5 bg-slate-700/60 rounded-md flex-1 max-w-xs" />
            </div>
            {/* Fake tabs */}
            <div className="flex gap-0 border-b border-slate-700/50 px-4 pt-2">
              {['Core Insights', 'Trends', 'Raw Data'].map((tab, i) => (
                <button key={tab} className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors ${i === 0 ? 'bg-slate-800 text-white border border-slate-700/50 border-b-transparent -mb-px' : 'text-slate-500'}`}>
                  {tab}
                </button>
              ))}
              <div className="ml-auto">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded">NEW INSIGHT</span>
              </div>
            </div>
            {/* Content */}
            <div className="p-6 space-y-3">
              {[
                { label: 'Pattern → User Sentiment', val: '328.3 (+100000)', highlight: true },
                { label: 'Frequency of Operation', val: '002.4 (+55000)', highlight: false },
                { label: 'Delivery Duration', val: '824.8 (+78000)', highlight: false },
                { label: 'Predictive Correlation', val: '124.8 (+88000)', highlight: false },
                { label: 'Production Confidence', val: '502.1 (+89000)', highlight: false },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${i === 0 ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'}`}>
                  <span className="text-sm text-slate-300 font-medium">{row.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400 font-mono">{row.val}</span>
                    <span className="text-[10px] font-bold text-emerald-400">BUY</span>
                  </div>
                </div>
              ))}
              {/* Bottom cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 font-medium">Departure Clusters</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 font-medium">Deliver Grid</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUSTED BY ===== */}
      <section className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase mb-8">The Infrastructure for World-Class Teams</p>
          <div className="flex justify-center items-center gap-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200" />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Designed for the<br />next era of work.
              </h2>
            </div>
            <div>
              <p className="text-slate-500 leading-relaxed">
                We built ContextIQ from the ground up to solve the
                future of data analysis problems — not just through
                visualization, but through understanding context and
                meaning.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {FEATURES.map((f, i) => (
              <div key={i} className="group p-7 rounded-2xl border border-slate-200 bg-white hover:border-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5 group-hover:bg-brand-blue group-hover:border-brand-blue transition-colors duration-300 [&>svg]:group-hover:text-white">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTEXTUAL OVERLAP ===== */}
      <section className="py-24 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-brand-blue uppercase mb-3">How It Connects</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
                Visualizing Contextual Overlap.
              </h2>
              <p className="text-slate-500 leading-relaxed mb-10">
                Our visualization engine maps the "gravity" of your enterprise data,
                showing where different threads of context converge or repel.
              </p>
              <div className="space-y-6">
                {OVERLAP_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-lg shadow-sm`}>{f.icon}</div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-0.5">{f.title}</h3>
                      <p className="text-sm text-slate-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual mockup */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Projection</p>
                    <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                  </div>
                  {/* Simplevisualization */}
                  <div className="relative h-48 bg-slate-50 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-2 border-blue-200 opacity-60" />
                        <div className="absolute top-4 left-8 w-24 h-24 rounded-full border-2 border-violet-200 opacity-60" />
                        <div className="absolute top-2 right-0 w-20 h-20 rounded-full border-2 border-emerald-200 opacity-60" />
                        <div className="absolute top-12 left-12 w-8 h-8 rounded-full bg-brand-blue/20 border-2 border-brand-blue flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-brand-blue" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS + TESTIMONIAL ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Stats */}
            <div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">Avg</p>
                  <p className="text-5xl font-extrabold text-slate-900 mb-1">84%</p>
                  <p className="text-sm text-slate-500">Reduction in search time</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">Avg</p>
                  <p className="text-5xl font-extrabold text-slate-900 mb-1">3.1x</p>
                  <p className="text-sm text-slate-500">Increase in cross-team collaboration</p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <p className="text-base text-slate-700 italic leading-relaxed mb-6">
                "ContextIQ didn't just organize our documents; it organized our thought
                process. We're moving faster than I ever thought possible for a company of
                our scale."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-sm font-bold">SO</div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Sarah Orin</p>
                  <p className="text-xs text-slate-500">CTO, Meridian Labs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative bg-brand-blue rounded-3xl px-8 py-16 md:px-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
                Ready to unlock your data's potential?
              </h2>
              <p className="text-blue-100 max-w-lg mx-auto mb-8">
                Join 600+ data-driven companies using ContextIQ to turn raw logs into strategic leverage.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={onGetStarted} className="px-7 py-3.5 bg-white text-brand-blue font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1">
              <a href="#" className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-brand-blue flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                </div>
                <span className="text-sm font-bold">ContextIQ</span>
              </a>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pioneering enterprise intelligence infrastructure
                for teams and individuals.
              </p>
            </div>
            {[
              { title: 'SOLUTIONS', links: ['Analytics', 'Security', 'API Docs'] },
              { title: 'COMPANY', links: ['About', 'Privacy Policy', 'Terms of Service'] },
              { title: 'LEGAL', links: ['Privacy', 'Terms', 'Cookies'] },
              { title: 'CONNECT', links: ['LinkedIn', 'Twitter', 'GitHub'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} ContextIQ Intelligence Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
