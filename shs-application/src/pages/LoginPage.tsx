import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui';

export function LoginPage() {
  const navigate = useNavigate();
  const { autoLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const success = await autoLogin(identifier, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Please check your username or email and password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#00003c] flex-col items-center justify-center p-12 text-white">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#ffe088]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-16 w-80 h-80 bg-[#ffe088]/5 rounded-full blur-3xl" />
        {/* <img
          src="/logo.png"
          alt=""
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 opacity-[0.05] pointer-events-none select-none rounded-full"
        /> */}

        <div className="relative z-10 max-w-xs text-center space-y-6">
          <div className="mx-auto w-44 h-44 rounded-full bg-white/95 flex items-center justify-center shadow-2xl border-4 border-[#ffe088]/80">
            <img src="/logo.png" alt="CNHS Logo" className="w-40 h-40 rounded-full object-cover" />
          </div>

          <div>
            <p className="text-[#ffe088] text-[0.65rem] uppercase tracking-[0.22em] font-bold">Department of Education</p>
            <h1 className="text-3xl font-black tracking-[0.06em] uppercase mt-1">CNHS</h1>
            <p className="text-white/90 font-[Georgia,serif] text-xl mt-0.5">Senior High Portal</p>
          </div>

          <div className="border border-[#ffe088]/20 rounded-xl px-5 py-4 text-left bg-white/5 space-y-2.5">
            <p className="text-[#ffe088] text-[0.65rem] uppercase tracking-[0.16em] font-bold mb-1">Portal Access Levels</p>
            {[
              { label: 'Student', desc: 'Personal profile and enrollment status' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ffe088] shrink-0" />
                <p className="text-xs">
                  <span className="font-bold text-white">{label}</span>
                  <span className="text-white/55"> — {desc}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-6 text-white/35 text-[0.65rem] tracking-[0.12em] uppercase">
          © 2026 CNHS SHS Portal
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#f2f5fb] min-h-screen">
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="CNHS" className="w-10 h-10 rounded-full" />
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-[#00003c]/55">CNHS Senior High</p>
            <p className="text-base font-black text-[#00003c] leading-none">SHS Portal</p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-[#00003c]/50 hover:text-[#00003c] mb-7 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to home
          </button>

          <div className="mb-7">
            <div className="inline-flex items-center rounded-full border border-[#ffe088] bg-[#fff8dc] px-3 py-1 text-[0.65rem] uppercase tracking-[0.14em] font-black text-[#5a4a14] mb-3">
              Portal Sign In
            </div>
            <h2 className="text-2xl font-black text-[#00003c] tracking-tight">Welcome Back</h2>
            <p className="text-[#00003c]/55 text-sm mt-1">
              Your role is detected automatically — no need to choose.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username or Email"
              type="text"
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
              placeholder="Enter your username or email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              required
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`relative w-full py-3 px-4 rounded-xl bg-[#00003c] text-[#ffe088] text-sm font-black uppercase tracking-[0.12em] transition-all shadow-sm
                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#0b0b63] active:scale-[0.98]'}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Detecting role...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 p-3.5 bg-white border border-[#d7ddea] rounded-xl">
            <p className="text-[0.65rem] font-bold text-[#00003c]/55 uppercase tracking-[0.12em] mb-1.5">
              Demo credentials (Admin)
            </p>
            <div className="flex gap-4 text-xs text-[#00003c]/75">
              <span>Username: <code className="bg-[#f7f8fc] text-[#00003c] px-1.5 py-0.5 rounded font-mono border border-[#d7ddea]">admin</code></span>
              <span>Password: <code className="bg-[#f7f8fc] text-[#00003c] px-1.5 py-0.5 rounded font-mono border border-[#d7ddea]">password</code></span>
            </div>
          </div>

          <p className="text-center text-xs text-[#00003c]/35 mt-8 lg:hidden">© 2026 CNHS SHS Portal. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
