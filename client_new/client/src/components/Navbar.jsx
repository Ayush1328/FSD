import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Gavel, Wallet, ShieldAlert, PlusCircle, LogOut, LogIn, User, Sparkles, Layers } from 'lucide-react';

export default function Navbar() {
  const { user, wallet, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                BidShield
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-emerald-400">
                Fraud-Proof Bidding
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
            >
              Auctions
            </Link>

            {user && (
              <>
                <Link
                  to="/create"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>List Item</span>
                </Link>

                <Link
                  to="/my-activity"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                >
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>My Activity</span>
                </Link>

                <Link
                  to="/wallet"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                >
                  <Wallet className="w-4 h-4 text-amber-400" />
                  <span>Escrow Wallet</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-300 bg-red-950/40 border border-red-800/50 hover:bg-red-900/40 transition"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                    <span>Admin Fraud Center</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action / Profile area */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Wallet Balance Pill */}
                <Link
                  to="/wallet"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-800 transition shadow-inner group"
                  title="View Escrow Wallet"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <div className="text-xs">
                    <span className="text-slate-400 font-medium">Available: </span>
                    <span className="font-bold text-emerald-400 font-mono">
                      ${(wallet?.available || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </Link>

                {/* User Pill */}
                <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-semibold text-xs text-indigo-300">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left text-xs leading-tight">
                    <div className="font-semibold text-slate-200">{user.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
