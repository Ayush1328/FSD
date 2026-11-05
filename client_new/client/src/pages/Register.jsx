import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { UserPlus, AlertTriangle } from 'lucide-react';

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
    <div className="max-w-md mx-auto py-16 px-4 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#FAF6EE] border border-[#1C1710]/10 flex items-center justify-center mx-auto shadow-sm text-[#A8432A]">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-display font-normal text-[#1C1710]">
          Register as a <span className="italic text-[#A8432A]">Bidder</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#1C1710]/70 max-w-sm mx-auto">
          Create your verified profile in under 2 minutes. New accounts receive complimentary demo escrow credits to experience live bidding immediately.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-[#A8432A]/10 text-[#A8432A] border border-[#A8432A]/30 flex items-center space-x-2 text-xs font-semibold shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-[#FAF6EE] rounded-[32px] border border-[#1C1710]/10 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-[10px] font-label font-bold text-[#1C1710]/70 uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            required
            placeholder="Aarav Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-[#1C1710]/15 rounded-full px-4 py-2.5 text-sm text-[#1C1710] focus:outline-none focus:border-[#A8432A] transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-label font-bold text-[#1C1710]/70 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="aarav@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-[#1C1710]/15 rounded-full px-4 py-2.5 text-sm text-[#1C1710] focus:outline-none focus:border-[#A8432A] transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-label font-bold text-[#1C1710]/70 uppercase tracking-wider">
            Password (min 6 characters)
          </label>
          <input
            type="password"
            required
            minLength={6}
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
            <span>Creating profile...</span>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Register &amp; Activate Bidding</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-[#1C1710]/70 pt-2">
          Already registered?{' '}
          <Link to="/login" className="text-[#A8432A] hover:underline font-semibold">
            Log in here
          </Link>
        </p>
      </form>

    </div>
  );
}
