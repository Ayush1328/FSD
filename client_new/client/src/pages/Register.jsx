import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Sparkles, AlertTriangle, UserPlus } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(name, email, password);
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Create an Account</h1>
        <p className="text-xs text-slate-400">
          Join BidShield. New accounts receive a complimentary $1,000 demo wallet balance.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-950/80 text-rose-300 border border-rose-500/50 flex items-center space-x-2 text-xs font-semibold shadow-lg">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            required
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

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
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password (min 6 chars)</label>
          <input
            type="password"
            required
            minLength={6}
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
            <span>Creating account...</span>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Register & Provision Wallet</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-400 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
            Log in
          </Link>
        </p>
      </form>

    </div>
  );
}
