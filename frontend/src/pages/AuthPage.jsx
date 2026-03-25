import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const TESTIMONIAL = {
  quote: '"ContextIQ has fundamentally shifted how we parse complex datasets. The speed of insight generation is unparalleled in the current market."',
  name: 'Dr. Elena Vance',
  role: 'LEAD DATA SCIENTIST, NEUROSYSTEMS',
};

const FEATURES = [
  { icon: '✦', title: 'Instant Summaries', desc: 'Distill complex datasets into actionable narratives instantly.' },
  { icon: '⚡', title: 'Anomaly Detection', desc: 'Proactive monitoring that catches patterns before they shift.' },
  { icon: '📈', title: 'Trend Visualization', desc: 'Dynamic charting that evolves with your business intelligence.' },
];

function PasswordStrength({ password }) {
  const getStrength = () => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 5);
  };
  const strength = getStrength();
  const labels = ['', 'WEAK', 'FAIR', 'GOOD', 'STRONG', 'STRONG'];
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#2563eb', '#2563eb'];

  if (!password) return null;
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ backgroundColor: i <= strength ? colors[strength] : '#e2e8f0' }} />
        ))}
      </div>
      <span className="text-[10px] font-bold tracking-wider" style={{ color: colors[strength] }}>{labels[strength]}</span>
    </div>
  );
}

export default function AuthPage({ defaultMode = 'signin', onBack }) {
  const [mode, setMode] = useState(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSigned, setKeepSigned] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!agreeTerms) { setError('Please agree to the Terms of Service.'); setLoading(false); return; }
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        setSuccessMsg('Account created! Check your email to confirm, then sign in.');
        setMode('signin');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => { setMode(m); setError(''); setSuccessMsg(''); };

  // ===== LOGIN LEFT PANEL =====
  const LoginLeftPanel = () => (
    <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-16 lg:px-20 relative overflow-hidden" style={{ background: 'linear-gradient(165deg, #1e293b 0%, #0f172a 50%, #1a1f36 100%)' }}>
      {/* Subtle glow */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

      <div>
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="flex items-center gap-2.5 mb-1">
          <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l4 2v6l6 3 6-3V9l2-1V7L12 2zm0 13l-4-2V9l4 2 4-2v4l-4 2z"/><path d="M12 2l5 2.5L12 7 7 4.5 12 2z" opacity="0.5"/></svg>
          <span className="text-lg font-bold text-white tracking-tight">ContextIQ</span>
        </a>
        <p className="text-sm text-slate-400 ml-8">Intelligence Simplified</p>
      </div>

      {/* Testimonial Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-7 border border-slate-700/50">
        <div className="text-3xl text-blue-400 mb-4 leading-none font-serif">"</div>
        <p className="text-base text-slate-200 italic leading-relaxed mb-6">{TESTIMONIAL.quote}</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center text-white text-sm font-bold">EV</div>
          <div>
            <p className="text-sm font-bold text-white">{TESTIMONIAL.name}</p>
            <p className="text-[10px] font-bold tracking-wider text-blue-400">{TESTIMONIAL.role}</p>
          </div>
        </div>
      </div>

      {/* Carousel dots */}
      <div className="flex items-center gap-2 mt-6">
        <div className="w-6 h-1.5 rounded-full bg-blue-500" />
        <div className="w-4 h-1.5 rounded-full bg-slate-600" />
        <div className="w-4 h-1.5 rounded-full bg-slate-600" />
      </div>
    </div>
  );

  // ===== SIGNUP LEFT PANEL =====
  const SignupLeftPanel = () => (
    <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-16 lg:px-20 relative overflow-hidden bg-brand-blue">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1), transparent 40%)' }} />

      <div className="relative z-10">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
          <h2 className="text-xl font-bold text-white tracking-tight">ContextIQ</h2>
        </a>
        <p className="text-sm text-blue-200 mt-1">Arctic Intelligence Ecosystem</p>
      </div>

      {/* Dashboard mockup */}
      <div className="relative z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 shadow-2xl">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-2.5 bg-white/30 rounded-full w-28" />
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20" />
              <div className="w-7 h-7 rounded-full bg-white/20" />
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-extrabold text-white">99.8%</p>
              <p className="text-[10px] text-blue-200 font-medium tracking-wider">ACCURACY RATE</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-extrabold text-white">1.2s</p>
              <p className="text-[10px] text-blue-200 font-medium tracking-wider">LATENCY</p>
            </div>
          </div>
          {/* Live Data Flow */}
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-emerald-300 font-semibold">Live Data Flow</p>
            </div>
            <div className="flex items-end gap-1.5 h-14">
              {[40, 55, 35, 65, 80, 50, 70].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-white/20" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Feature list */}
        <div className="mt-6 space-y-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 text-sm">{f.icon}</div>
              <div>
                <p className="text-sm font-bold text-white">{f.title}</p>
                <p className="text-xs text-blue-100/70">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div /> {/* spacer */}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-white flex font-sans">
      {mode === 'signin' ? <LoginLeftPanel /> : <SignupLeftPanel />}

      {/* RIGHT: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-20 xl:px-32 relative">
        {/* Mobile back */}
        <button onClick={onBack} className="lg:hidden absolute top-6 left-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>

        <div className="w-full max-w-[340px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
              {mode === 'signin' ? 'Welcome Back' : 'Begin your journey'}
            </h1>
            <p className="text-xs text-slate-500">
              {mode === 'signin'
                ? 'Please enter your credentials to access your curator dashboard.'
                : 'Access the next generation of curatorial data intelligence.'}
            </p>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-600">{error}</div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-600">{successMsg}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label className="block text-[9px] font-bold tracking-widest text-slate-500 uppercase mb-1.5">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Elias Thorne"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 transition-all" required />
              </div>
            )}

            <div>
              <label className="block text-[9px] font-bold tracking-widest text-slate-500 uppercase mb-1.5">
                {mode === 'signup' ? 'Work Email' : 'Email Address'}
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'signup' ? 'elias@company.ai' : 'name@company.com'}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 transition-all" required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                  {mode === 'signup' ? 'Create Password' : 'Password'}
                </label>
                {mode === 'signin' && (
                  <button type="button" className="text-[9px] font-bold tracking-wider text-brand-blue hover:underline">FORGOT PASSWORD?</button>
                )}
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 transition-all pr-10" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {mode === 'signup' && <PasswordStrength password={password} />}
            </div>

            {/* Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none mt-2">
              <input
                type="checkbox"
                checked={mode === 'signin' ? keepSigned : agreeTerms}
                onChange={(e) => mode === 'signin' ? setKeepSigned(e.target.checked) : setAgreeTerms(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/20"
              />
              <span className="text-xs text-slate-600">
                {mode === 'signin'
                  ? 'Keep me signed in for 30 days'
                  : <>I agree to the <a href="#" className="text-brand-blue font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-brand-blue font-semibold hover:underline">Privacy Policy</a>.</>
                }
              </span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-brand-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                mode === 'signin' ? 'Login to Dashboard' : 'Create Free Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 border-t border-slate-200" />

          {/* Switch mode */}
          <p className="text-sm text-slate-500 text-center">
            {mode === 'signin' ? (
              <>Don't have an account?{' '}<button onClick={() => switchMode('signup')} className="text-brand-blue font-semibold hover:underline">Sign Up</button></>
            ) : (
              <>Already have an account?{' '}<button onClick={() => switchMode('signin')} className="text-brand-blue font-semibold hover:underline">Login</button></>
            )}
          </p>

          {/* Footer */}
          <div className="mt-8">
            {mode === 'signin' ? (
              <div className="flex items-center justify-center gap-6">
                {['PRIVACY POLICY', 'TERMS OF SERVICE', 'SECURITY'].map(link => (
                  <a key={link} href="#" className="text-[10px] font-bold tracking-wider text-slate-400 hover:text-slate-600 transition-colors">{link}</a>
                ))}
              </div>
            ) : (
              <div className="text-center border-t border-slate-100 pt-6">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">The Curator's Standard</p>
                <p className="text-sm text-slate-500 italic">"Precision is the only true mark of intelligence in a world of noise."</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
