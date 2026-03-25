import { useState, useRef, useEffect } from 'react';

const Icons = {
  Message: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  X: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Send: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
};

export default function ChatPanel({ insights, columns, apiUrl, userId }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [deepMemory, setDeepMemory] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am ContextIQ, your AI data analyst. Ask me anything about your dataset, columns, or the generated insights.' }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          schema: columns,
          insights: insights,
          deepMemory: deepMemory,
          userId: userId,
        })
      });

      if (!res.ok) throw new Error('Failed to chat');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error while analyzing your data.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 px-6 py-3 bg-brand-blue text-white font-bold text-sm rounded-full shadow-xl shadow-brand-blue/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        Chat
      </button>

      {/* Slide-in Panel */}
      <div className={`fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl border-l border-slate-200 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
              <Icons.Message className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">ContextIQ Chat</h3>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`max-w-[85%] rounded-2xl p-4 text-sm border shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-50 text-slate-800 border-slate-200 rounded-br-sm' 
                  : 'bg-blue-50 text-blue-900 border-blue-100 rounded-bl-sm'
              }`}>
                {msg.content.split('\n').map((line, j) => (
                  <p key={j} className="mb-2 last:mb-0 leading-relaxed break-words">{line}</p>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-bl-sm px-4 py-5 shadow-sm flex items-center gap-1.5 w-16 h-12">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-100 shrink-0 p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => setInput("Analyze sales by region")} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-medium text-slate-600 hover:border-brand-blue hover:text-brand-blue transition-colors shadow-sm active:scale-95">Analyze sales by region</button>
              <button onClick={() => setInput("What are the key risks?")} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-medium text-slate-600 hover:border-brand-blue hover:text-brand-blue transition-colors shadow-sm active:scale-95">What are the key risks?</button>
              <button onClick={() => setInput("Show top anomalies")} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-medium text-slate-600 hover:border-brand-blue hover:text-brand-blue transition-colors shadow-sm active:scale-95">Show top anomalies</button>
            </div>
          )}
          
          <div className="relative flex items-end bg-slate-50 border border-slate-200 rounded-xl focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all p-1 shadow-inner">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask ContextIQ..."
              className="flex-1 bg-transparent border-none text-sm text-slate-800 px-3 py-2 focus:ring-0 resize-none min-h-[40px] leading-relaxed overflow-y-auto"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2 m-1 rounded-lg text-white bg-brand-blue hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-brand-blue transition-all active:scale-95 shadow-md flex-shrink-0"
            >
              <Icons.Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeepMemory(!deepMemory)}
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${deepMemory ? 'bg-brand-blue' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm ${deepMemory ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deep Memory</span>
            </div>
            <p className="text-[10px] text-slate-400">ContextIQ may make mistakes.</p>
          </div>
        </div>
      </div>

      {/* Backdrop (mobile) */}
      {open && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
