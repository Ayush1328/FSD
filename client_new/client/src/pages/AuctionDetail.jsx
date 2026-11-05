import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { getSocket, joinAuctionRoom, leaveAuctionRoom } from '../services/socket';
import { useAuthStore } from '../store/useAuthStore';
import CountdownTimer from '../components/CountdownTimer';
import {
  Gavel,
  ShieldAlert,
  Clock,
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  User
} from 'lucide-react';

export default function AuctionDetail() {
  const { id } = useParams();
  const { user, wallet, fetchMe } = useAuthStore();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [biddingLoading, setBiddingLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isExtended, setIsExtended] = useState(false);

  // 1. Initial Data Fetch
  const fetchAuctionAndBids = async () => {
    try {
      setLoading(true);
      const [auctionRes, bidsRes] = await Promise.all([
        API.get(`/auctions/${id}`),
        API.get(`/bids/${id}`)
      ]);
      setAuction(auctionRes.data);
      setBids(bidsRes.data || []);
      
      const baseline = auctionRes.data.currentBid || auctionRes.data.startingPrice;
      const minBid = Math.ceil((baseline * 1.01) * 100) / 100;
      setBidAmount(minBid);
    } catch (err) {
      console.error('Error fetching auction detail:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load auction.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionAndBids();
  }, [id]);

  // 2. Real-Time Socket.IO Synchronization
  useEffect(() => {
    joinAuctionRoom(id);
    const socket = getSocket();

    // Event: New bid broadcasted to room
    const handleNewBid = (data) => {
      if (data.auctionId === id) {
        setAuction((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentBid: data.currentBid,
            highestBidder: data.highestBidder,
            bidCount: data.bidCount,
            endsAt: data.endsAt
          };
        });

        // Add to live bid history stream
        setBids((prev) => [
          {
            _id: 'temp-' + Date.now(),
            amount: data.currentBid,
            bidder: data.highestBidder,
            createdAt: new Date()
          },
          ...prev
        ]);

        // Auto-increment suggested next bid
        const nextMin = Math.ceil((data.currentBid * 1.01) * 100) / 100;
        setBidAmount(nextMin);

        // Update user's wallet
        fetchMe();
      }
    };

    // Event: Anti-Sniping timer extension
    const handleAuctionExtended = (data) => {
      if (data.auctionId === id) {
        setIsExtended(true);
        setAuction((prev) => prev ? { ...prev, endsAt: data.newEndsAt } : prev);
        setMessage({
          type: 'warning',
          text: '⚡ Anti-sniping activated! Auction timer extended by 30 seconds.'
        });
      }
    };

    // Event: Auction Concluded
    const handleAuctionEnded = (data) => {
      if (data.auctionId === id) {
        setAuction((prev) => prev ? { ...prev, status: 'ended' } : prev);
        setMessage({
          type: 'info',
          text: `Auction concluded! Winner: ${data.highestBidder?.name || 'Top Bidder'} for $${data.finalPrice}`
        });
        fetchMe();
      }
    };

    socket.on('bid:new', handleNewBid);
    socket.on('auction:extended', handleAuctionExtended);
    socket.on('auction:ended', handleAuctionEnded);

    return () => {
      leaveAuctionRoom(id);
      socket.off('bid:new', handleNewBid);
      socket.off('auction:extended', handleAuctionExtended);
      socket.off('auction:ended', handleAuctionEnded);
    };
  }, [id]);

  // Handle Placing Bid
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setMessage(null);

    const amount = Number(bidAmount);
    if (!amount || amount <= 0) {
      setErrorMessage('Please enter a valid bid amount.');
      return;
    }

    try {
      setBiddingLoading(true);
      const res = await API.post(`/bids/${id}`, { amount });
      
      setMessage({
        type: 'success',
        text: res.data.message || 'Bid successfully recorded and funds locked in escrow!'
      });

      // Refresh wallet balance
      fetchMe();
    } catch (err) {
      const errorText = err.response?.data?.message || 'Failed to place bid. Please try again.';
      setErrorMessage(errorText);
    } finally {
      setBiddingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 font-medium">Connecting to live auction stream...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-slate-900 rounded-3xl border border-slate-800 p-8">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Auction Not Found</h2>
        <p className="text-sm text-slate-400 mt-2">{errorMessage || 'The requested auction does not exist.'}</p>
        <Link to="/" className="inline-block mt-4 px-4 py-2 bg-indigo-600 rounded-xl text-xs font-semibold text-white">
          Back to Live Auctions
        </Link>
      </div>
    );
  }

  const baselinePrice = auction.currentBid > 0 ? auction.currentBid : auction.startingPrice;
  const minRequiredBid = Math.ceil((baselinePrice * 1.01) * 100) / 100;
  const isEnded = auction.status === 'ended' || new Date(auction.endsAt) <= new Date();
  const isSeller = user && auction.seller?._id === user.id;
  const isHighestBidder = user && auction.highestBidder?._id === user.id;
  const availableFunds = wallet?.available || 0;
  const hasEnoughFunds = availableFunds >= Number(bidAmount);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 sm:px-6 pt-6">
      
      {/* Alert Notices */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center space-x-3 text-sm font-semibold shadow-lg ${
            message.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
              : message.type === 'warning'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
              : 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/50'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/80 text-rose-300 border border-rose-500/50 flex items-center space-x-3 text-sm font-semibold shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Left Details + Right Bidding Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image Gallery, Specs, Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
            <img
              src={auction.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000'}
              alt={auction.title}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-4 left-4">
              <CountdownTimer endsAt={auction.endsAt} isExtended={isExtended} />
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Seller: {auction.seller?.name || 'Verified Member'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Risk Score: {auction.seller?.riskScore ?? 0}
              </span>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-slate-900/70 rounded-3xl border border-slate-800 p-6 space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {auction.title}
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {auction.description}
            </p>

            <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-4 text-xs font-medium text-slate-400">
              <div className="bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                Starting Bid: <span className="text-white font-mono font-bold">${auction.startingPrice.toFixed(2)}</span>
              </div>
              <div className="bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                Min Increment: <span className="text-white font-mono font-bold">1% minimum</span>
              </div>
              <div className="bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                Protection: <span className="text-emerald-400 font-bold">Atomic Escrow Hold</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bidding Action & Live Stream */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Price & Bid Box */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current Winning Bid
              </span>
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-800/60">
                {auction.bidCount} {auction.bidCount === 1 ? 'Bid' : 'Bids'} Placed
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight">
                ${baselinePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Winning status feedback */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              {isEnded ? (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>This auction has officially ended. Winner: {auction.highestBidder?.name || 'No bids'}</span>
                </div>
              ) : isHighestBidder ? (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>🎉 You are currently the highest bidder!</span>
                </div>
              ) : isSeller ? (
                <div className="p-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold flex items-center space-x-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>You are the seller of this item. Bidding is disabled for you.</span>
                </div>
              ) : null}
            </div>

            {/* Bidding Form (Only if active and not seller) */}
            {!isEnded && !isSeller && (
              <form onSubmit={handlePlaceBid} className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
                    <span>Your Bid Amount ($ USD):</span>
                    <span className="text-emerald-400 font-mono">
                      Min: ${minRequiredBid.toFixed(2)}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min={minRequiredBid}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`At least ${minRequiredBid.toFixed(2)}`}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl pl-8 pr-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-indigo-500 transition shadow-inner"
                      disabled={!user || biddingLoading}
                    />
                  </div>
                </div>

                {/* Quick Increment Shortcut Pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '+1%', value: Math.ceil(minRequiredBid) },
                    { label: '+5%', value: Math.ceil(baselinePrice * 1.05) },
                    { label: '+$50', value: Math.ceil(baselinePrice + 50) },
                    { label: '+$100', value: Math.ceil(baselinePrice + 100) }
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBidAmount(btn.value)}
                      className="px-2.5 py-1 rounded-xl text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      disabled={!user || biddingLoading}
                    >
                      {btn.label} (${btn.value})
                    </button>
                  ))}
                </div>

                {/* Wallet Balance Feedback */}
                {user && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <Wallet className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-slate-400">Available in Wallet:</span>
                      <span className="font-mono font-bold text-emerald-400">${availableFunds.toFixed(2)}</span>
                    </div>

                    {!hasEnoughFunds && (
                      <Link
                        to="/wallet"
                        className="text-amber-400 hover:underline font-semibold flex items-center space-x-0.5"
                      >
                        <span>Top Up</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                )}

                {/* Submit Bid Button */}
                {user ? (
                  <button
                    type="submit"
                    disabled={biddingLoading || !hasEnoughFunds}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide transition shadow-xl flex items-center justify-center space-x-2 ${
                      biddingLoading
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : !hasEnoughFunds
                        ? 'bg-slate-800 text-rose-400 border border-rose-500/40 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    }`}
                  >
                    {biddingLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Securing Escrow Lock...</span>
                      </>
                    ) : !hasEnoughFunds ? (
                      <span>Insufficient Available Balance</span>
                    ) : (
                      <>
                        <Gavel className="w-4 h-4" />
                        <span>Place Bid & Lock Escrow</span>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="block text-center w-full py-3.5 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
                  >
                    Log In to Place Bids
                  </Link>
                )}

                <p className="text-[11px] text-slate-500 text-center">
                  Protected by anti-sniping extension. If a bid arrives in the last 30s, the auction automatically extends.
                </p>
              </form>
            )}
          </div>

          {/* Live Bid Stream Table */}
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Live Bid Stream</span>
              </h3>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Real-Time</span>
              </span>
            </div>

            {bids.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No bids recorded yet. Be the first to bid!</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {bids.map((b, index) => {
                  const isTop = index === 0;
                  return (
                    <div
                      key={b._id || index}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                        isTop
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-semibold'
                          : 'bg-slate-800/40 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-400">
                          #{bids.length - index}
                        </span>
                        <span>{b.bidder?.name || 'Anonymous Bidder'}</span>
                        {isTop && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            Leader
                          </span>
                        )}
                      </div>

                      <div className="text-right font-mono">
                        <div className="font-bold text-white">${b.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
