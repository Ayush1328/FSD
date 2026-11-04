import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import CountdownTimer from '../components/CountdownTimer';
import { Layers, Gavel, Tag, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function MyActivity() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('bids'); // 'bids' or 'listings'
  const [myAuctions, setMyAuctions] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const res = await API.get('/auctions/user/activity');
        setMyAuctions(res.data.myAuctions || []);
        setMyBids(res.data.myBids || []);
      } catch (err) {
        console.error('Error fetching activity:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
          <Layers className="w-8 h-8 text-indigo-400" />
          <span>My Auction Activity</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Track all items you have active escrow bids on and view your listed auctions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('bids')}
          className={`pb-3 px-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'bids'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gavel className="w-4 h-4 text-emerald-400" />
          <span>Bids I've Placed ({myBids.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 px-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'listings'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4 text-purple-400" />
          <span>My Listed Auctions ({myAuctions.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading activity...</div>
      ) : activeTab === 'bids' ? (
        myBids.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
            <Gavel className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">You haven't placed any bids yet</h3>
            <p className="text-xs text-slate-500 mt-1">Explore live auctions and place your first bid with escrow protection.</p>
            <Link to="/" className="inline-block mt-4 px-4 py-2 bg-indigo-600 rounded-xl text-xs font-semibold text-white">
              Browse Auctions
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myBids.map((b) => {
              const a = b.auction;
              if (!a) return null;
              const isWinning = a.highestBidder?._id === user?.id;
              const isEnded = a.status === 'ended' || new Date(a.endsAt) <= new Date();

              return (
                <div
                  key={b._id}
                  className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-white text-base">{a.title}</h4>
                      {isWinning ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Winning Bidder</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>Outbid</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 flex items-center space-x-4">
                      <span>My Bid: <strong className="text-slate-200 font-mono">${b.amount.toFixed(2)}</strong></span>
                      <span>Current Top: <strong className="text-emerald-400 font-mono">${a.currentBid.toFixed(2)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                    <CountdownTimer endsAt={a.endsAt} />
                    <Link
                      to={`/auctions/${a._id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition flex items-center space-x-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        myAuctions.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
            <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">You haven't listed any auctions</h3>
            <p className="text-xs text-slate-500 mt-1">Sell luxury goods, collectibles, or items with anti-sniping protection.</p>
            <Link to="/create" className="inline-block mt-4 px-4 py-2 bg-indigo-600 rounded-xl text-xs font-semibold text-white">
              List an Item
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myAuctions.map((a) => (
              <div
                key={a._id}
                className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div>
                  <h4 className="font-bold text-white text-base">{a.title}</h4>
                  <div className="text-xs text-slate-400 mt-1 flex items-center space-x-4">
                    <span>Highest Bid: <strong className="text-emerald-400 font-mono">${a.currentBid.toFixed(2)}</strong></span>
                    <span>Total Bids: <strong>{a.bidCount}</strong></span>
                    <span className="capitalize text-slate-300">Status: {a.status}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                  <CountdownTimer endsAt={a.endsAt} />
                  <Link
                    to={`/auctions/${a._id}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition flex items-center space-x-1"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
}
