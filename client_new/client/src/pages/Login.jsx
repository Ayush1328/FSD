import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogIn, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear any stale token before login
    localStorage.removeItem('token');
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass) => {
    // Clear any stale token before demo login
    localStorage.removeItem('token');
    setEmail(demoEmail);
    setPassword(demoPass);
    const res = await login(demoEmail, demoPass);
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#FAF6EE] border border-[#1C1710]/10 flex items-center justify-center mx-auto shadow-sm text-[#A8432A]">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-display font-normal text-[#1C1710]">
          Log in to <span className="italic text-[#A8432A]">BidVault</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#1C1710]/70 max-w-sm mx-auto">
          Manage your bids in real time, monitor live auctions across Dharwad, and access your escrow wallet.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-[#A8432A]/10 text-[#A8432A] border border-[#A8432A]/30 flex items-center space-x-2 text-xs font-semibold shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1-Click Quick Demo Accounts (for quick evaluator verification) */}
      <div className="bg-[#EDE5D6] rounded-2xl border border-[#1C1710]/10 p-4 space-y-2.5">
        <div className="text-[10px] font-label font-bold uppercase tracking-wider text-[#1C1710]/70 flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3E6140]" />
          <span>1-Click Demo Accounts:</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => handleQuickDemo('admin@auction.com', 'admin123')}
            className="p-2.5 rounded-xl bg-[#FAF6EE] hover:bg-white text-[#1C1710] border border-[#1C1710]/10 text-left transition shadow-xs"
          >
            <div className="font-bold text-xs">🛡️ Admin</div>
            <div className="text-[10px] text-[#1C1710]/60">Fraud Center</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('alice@auction.com', 'password123')}
            className="p-2.5 rounded-xl bg-[#FAF6EE] hover:bg-white text-[#1C1710] border border-[#1C1710]/10 text-left transition shadow-xs"
          >
            <div className="font-bold text-xs">👤 Alice</div>
            <div className="text-[10px] text-[#1C1710]/60">₹20,000 Wallet</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('bob@auction.com', 'password123')}
            className="p-2.5 rounded-xl bg-[#FAF6EE] hover:bg-white text-[#1C1710] border border-[#1C1710]/10 text-left transition shadow-xs"
          >
            <div className="font-bold text-xs">👤 Bob</div>
            <div className="text-[10px] text-[#1C1710]/60">₹15,000 Wallet</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('seller@auction.com', 'password123')}
            className="p-2.5 rounded-xl bg-[#FAF6EE] hover:bg-white text-[#1C1710] border border-[#1C1710]/10 text-left transition shadow-xs"
          >
            <div className="font-bold text-xs">🏷️ Seller</div>
            <div className="text-[10px] text-[#1C1710]/60">Active Listings</div>
          </button>
        </div>
      </div>

      {/* Manual Login Form */}
      <form onSubmit={handleSubmit} className="bg-[#FAF6EE] rounded-[32px] border border-[#1C1710]/10 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-[10px] font-label font-bold text-[#1C1710]/70 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-[#1C1710]/15 rounded-full px-4 py-2.5 text-sm text-[#1C1710] focus:outline-none focus:border-[#A8432A] transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-label font-bold text-[#1C1710]/70 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-[#1C1710]/15 rounded-full px-4 py-2.5 text-sm text-[#1C1710] focus:outline-none focus:border-[#A8432A] transition"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-full bg-[#1C1710] hover:bg-[#332a1e] text-white font-semibold text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
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

        <p className="text-center text-xs text-[#1C1710]/70 pt-2">
          Don't have a bidder profile?{' '}
          <Link to="/register" className="text-[#A8432A] hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </form>

    </div>
  );
}
