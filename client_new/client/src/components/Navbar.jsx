import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Menu, X, Wallet, User, LogOut, PlusCircle, ShieldAlert, Layers } from 'lucide-react';

export default function Navbar() {
  const { user, wallet, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (location.pathname !== '/') {
      navigate(`/#${targetId}`);
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 transition-all duration-300 px-4 sm:px-6 pt-3 pb-3">
      <div className={`max-w-[1150px] mx-auto rounded-full transition-all duration-300 px-4 sm:px-6 py-2.5 flex items-center justify-between ${
        isScrolled
          ? 'bg-[#1C1710]/90 backdrop-blur-md text-white shadow-xl border border-white/10'
          : isHome
            ? 'text-white'
            : 'bg-[#1C1710] text-white shadow-md'
      }`}>
        
        {/* Left: Brand Logo (Terracotta circle with white dot + "BidVault Auctions" in serif) */}
        <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
          <div className="w-5 h-5 rounded-full bg-[#A8432A] flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
          <span className="text-lg sm:text-xl font-display font-medium tracking-tight text-white">
            BidVault Auctions
          </span>
        </Link>

        {/* Center: Translucent Glass Pill Nav Menu (Desktop) */}
        <nav className="hidden md:flex items-center glass-pill rounded-full px-5 py-1.5 space-x-6 text-xs sm:text-sm font-medium">
          <a
            href="#how-it-works"
            onClick={(e) => handleNavClick(e, 'how-it-works')}
            className="text-white/85 hover:text-white transition-colors"
          >
            How it works
          </a>
          <a
            href="#browse-lots"
            onClick={(e) => handleNavClick(e, 'browse-lots')}
            className="text-white/85 hover:text-white transition-colors"
          >
            Live auctions
          </a>
          <a
            href="#pricing"
            onClick={(e) => handleNavClick(e, 'pricing')}
            className="text-white/85 hover:text-white transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faq"
            onClick={(e) => handleNavClick(e, 'faq')}
            className="text-white/85 hover:text-white transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Right: Auth & Registration Pill */}
        <div className="hidden md:flex items-center space-x-4 shrink-0">
          {user ? (
            <div className="flex items-center space-x-3">
              {/* Wallet pill link */}
              <Link
                to="/wallet"
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/15 transition"
                title="Your Escrow Wallet"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="font-mono text-emerald-300">
                  ₹{(wallet?.available || 0).toLocaleString()}
                </span>
              </Link>

              {/* User Dropdown / Direct Links */}
              <Link
                to="/my-activity"
                className="text-xs text-white/80 hover:text-white transition font-medium"
              >
                My Activity
              </Link>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-2.5 py-1 rounded-full bg-red-900/60 border border-red-700/60 text-red-200 text-xs font-medium"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="px-5 py-2 rounded-full bg-[#F5F0E8] text-[#1C1710] text-xs sm:text-sm font-semibold hover:bg-white transition-all shadow-md hover:scale-[1.02]"
              >
                Register to bid
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          {user && (
            <Link
              to="/wallet"
              className="text-xs font-mono font-bold text-emerald-300 bg-white/10 px-2.5 py-1 rounded-full"
            >
              ₹{(wallet?.available || 0).toLocaleString()}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile navigation menu"
            className="p-1.5 rounded-full text-white hover:bg-white/10 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-[#1C1710] border border-white/15 rounded-3xl p-5 shadow-2xl text-white space-y-4 animate-in fade-in duration-200">
          <nav className="flex flex-col space-y-3 text-sm font-medium">
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className="py-1 text-white/80 hover:text-white"
            >
              How it works
            </a>
            <a
              href="#browse-lots"
              onClick={(e) => handleNavClick(e, 'browse-lots')}
              className="py-1 text-white/80 hover:text-white"
            >
              Live auctions
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleNavClick(e, 'pricing')}
              className="py-1 text-white/80 hover:text-white"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={(e) => handleNavClick(e, 'faq')}
              className="py-1 text-white/80 hover:text-white"
            >
              FAQ
            </a>
            <Link
              to="/auctions"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-white/80 hover:text-white"
            >
              Browse all auctions
            </Link>
          </nav>

          <div className="pt-3 border-t border-white/10 flex flex-col space-y-2">
            {user ? (
              <>
                <Link
                  to="/wallet"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-sm text-emerald-300 py-1"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Wallet: ₹{(wallet?.available || 0).toLocaleString()}</span>
                </Link>
                <Link
                  to="/my-activity"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-sm text-white/80 py-1"
                >
                  <Layers className="w-4 h-4" />
                  <span>My Activity</span>
                </Link>
                <Link
                  to="/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-sm text-white/80 py-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List New Item</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-sm text-red-300 py-1"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Admin Center</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-left text-sm text-rose-300 py-1 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out ({user.name})</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-full text-white border border-white/20 text-sm font-semibold"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-full bg-[#F5F0E8] text-[#1C1710] text-sm font-semibold shadow"
                >
                  Register to bid
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
