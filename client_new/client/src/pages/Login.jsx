import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogIn, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    const res = await login(demoEmail, demoPass);
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20">
          <LogIn className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Welcome Back</h1>
        <p className="text-xs text-slate-400">
          Log in to your BidShield account to place bids and manage your escrow wallet.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-950/80 text-rose-300 border border-rose-500/50 flex items-center space-x-2 text-xs font-semibold shadow-lg">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1-Click Quick Demo Switcher */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-2.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>1-Click Demo Accounts:</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleQuickDemo('admin@auction.com', 'admin123')}
            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-left transition"
          >
            <div className="font-bold">🛡️ Admin</div>
            <div className="text-[10px] text-slate-400">Fraud Center</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('alice@auction.com', 'password123')}
            className="p-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/50 text-left transition"
          >
            <div className="font-bold">👤 Alice</div>
            <div className="text-[10px] text-slate-400">$20,000 Wallet</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('bob@auction.com', 'password123')}
            className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 text-left transition"
          >
            <div className="font-bold">👤 Bob</div>
            <div className="text-[10px] text-slate-400">$15,000 Wallet</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('seller@auction.com', 'password123')}
            className="p-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 text-left transition"
          >
            <div className="font-bold">🏷️ Seller</div>
            <div className="text-[10px] text-slate-400">Listed Auctions</div>
          </button>
        </div>
      </div>

      {/* Manual Login Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-400 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </form>

    </div>
  );
}
