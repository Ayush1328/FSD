import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import CountdownTimer from '../components/CountdownTimer';
import { useAuthStore } from '../store/useAuthStore';
import { Search, Gavel, ShieldCheck, Flame, Filter, Zap, ArrowRight, UserCheck } from 'lucide-react';

export default function Home() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user, login } = useAuthStore();

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      
      const res = await API.get('/auctions', { params });
      setAuctions(res.data.auctions || []);
    } catch (err) {
      console.error('Error fetching auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuctions();
  };

  const handleQuickDemoLogin = async (email, password) => {
    await login(email, password);
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Escrow-Protected & Anti-Sniping Enabled</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Fair-Play Live Auctions with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Real-Time Fraud Defense
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Bid with confidence. Every bid is backed by an atomic escrow hold, protected by a continuous rule-based fraud detection engine, and secured with anti-sniping extensions.
          </p>

          {/* Quick Demo Switcher if not logged in */}
          {!user && (
            <div className="pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>1-Click Demo Logins:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickDemoLogin('admin@auction.com', 'admin123')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/60 transition"
                >
                  🛡️ Admin Dashboard
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('alice@auction.com', 'password123')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-700/60 transition"
                >
                  👤 Alice ($20,000)
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('bob@auction.com', 'password123')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-700/60 transition"
                >
                  👤 Bob ($15,000)
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('seller@auction.com', 'password123')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 border border-amber-700/60 transition"
                >
                  🏷️ Seller
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('charlie@auction.com', 'password123')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  ⚠️ Charlie (Flagged)
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search items, watches, art..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </form>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'active', label: 'Live Now', icon: Flame },
            { id: 'ended', label: 'Ended' }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-amber-400" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Auction Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800/60 p-8">
          <Gavel className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No auctions match your search</h3>
          <p className="text-sm text-slate-500 mt-1">Try switching tabs or listing a new auction item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => {
            const isEnded = auction.status === 'ended' || new Date(auction.endsAt) <= new Date();
            const currentPrice = auction.currentBid > 0 ? auction.currentBid : auction.startingPrice;

            return (
              <div
                key={auction._id}
                className="group relative flex flex-col bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 overflow-hidden"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                  <img
                    src={auction.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
                    alt={auction.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Status Overlay Badge */}
                  <div className="absolute top-3 left-3">
                    {isEnded ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-slate-900/90 text-slate-400 border border-slate-700 shadow-sm">
                        Ended
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 shadow-sm backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>Live Bid</span>
                      </span>
                    )}
                  </div>

                  {/* Countdown Badge on Top Right */}
                  <div className="absolute top-3 right-3">
                    <CountdownTimer endsAt={auction.endsAt} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                      {auction.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {auction.description}
                    </p>
                  </div>

                  {/* Seller & Price Info */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-end justify-between">
                    <div>
                      <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        Current Highest Bid
                      </div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {auction.bidCount} {auction.bidCount === 1 ? 'bid' : 'bids'} placed
                      </div>
                    </div>

                    <Link
                      to={`/auctions/${auction._id}`}
                      className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/30 group-hover:translate-x-0.5"
                    >
                      <span>{isEnded ? 'View Result' : 'Place Bid'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
