import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import CountdownTimer from '../components/CountdownTimer';
import {
  Layers,
  Gavel,
  Tag,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Trash2,
  CheckSquare,
  Square,
  X,
  Sparkles,
  ExternalLink,
  Clock
} from 'lucide-react';

const PRESET_ITEMS = [
  { label: 'Rolex Submariner Watch', price: 25000, img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800' },
  { label: 'Vintage Acoustic Guitar', price: 8500, img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800' },
  { label: 'Apple MacBook Pro M3', price: 45000, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800' },
  { label: 'Sony PlayStation 5 Pro', price: 18000, img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800' },
  { label: 'Original Oil Canvas Painting', price: 12000, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800' }
];

export default function MyActivity() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'bids'
  const [myAuctions, setMyAuctions] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // Multi-selection state for listings
  const [selectedAuctionIds, setSelectedAuctionIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Quick Add Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('1000');
  const [newDurationMin, setNewDurationMin] = useState('30');
  const [newImageUrl, setNewImageUrl] = useState(PRESET_ITEMS[0].img);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    fetchActivity();
  }, []);

  // Selection handlers
  const handleToggleSelect = (id) => {
    setSelectedAuctionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedAuctionIds.length === myAuctions.length) {
      setSelectedAuctionIds([]);
    } else {
      setSelectedAuctionIds(myAuctions.map((a) => a._id));
    }
  };

  // Remove single auction
  const handleDeleteSingle = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the auction?`)) {
      return;
    }
    try {
      setIsDeleting(true);
      await API.delete(`/auctions/${id}`);
      setMyAuctions((prev) => prev.filter((a) => a._id !== id));
      setSelectedAuctionIds((prev) => prev.filter((item) => item !== id));
      setFeedback({ type: 'success', message: `Removed "${title}" successfully.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to remove auction.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk remove multiple selected auctions
  const handleDeleteSelected = async () => {
    const count = selectedAuctionIds.length;
    if (count === 0) return;

    if (!window.confirm(`Are you sure you want to remove ${count} selected item(s) from auction?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const res = await API.post('/auctions/bulk-delete', {
        auctionIds: selectedAuctionIds
      });

      const deletedCount = res.data.deletedCount || count;
      setMyAuctions((prev) => prev.filter((a) => !selectedAuctionIds.includes(a._id)));
      setSelectedAuctionIds([]);
      setFeedback({
        type: 'success',
        message: `Successfully removed ${deletedCount} item(s) from your listings.`
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to remove selected items.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Add Item Submit
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Please provide an item title.');
      return;
    }

    try {
      setIsSubmitting(true);
      const endsAt = new Date(Date.now() + Number(newDurationMin) * 60 * 1000).toISOString();

      const res = await API.post('/auctions', {
        title: newTitle,
        description: newDescription || 'Authentic item listed via BidVault.',
        startingPrice: Number(newPrice),
        endsAt,
        imageUrl: newImageUrl
      });

      const created = res.data.auction;
      if (created) {
        setMyAuctions((prev) => [created, ...prev]);
      } else {
        await fetchActivity();
      }

      setFeedback({
        type: 'success',
        message: `"${newTitle}" was successfully added to live auctions!`
      });

      // Reset form & close modal
      setNewTitle('');
      setNewDescription('');
      setNewPrice('1000');
      setShowAddModal(false);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to add auction item.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4 sm:px-6 pt-8">
      
      {/* Header with Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-normal text-[#1C1710] flex items-center space-x-3">
            <Layers className="w-8 h-8 text-[#A8432A]" />
            <span>My Auction Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#1C1710]/70 mt-1">
            Manage your placed bids and oversee your listed auction lots with bulk controls.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-full bg-[#A8432A] hover:bg-[#8f3620] text-white text-xs font-semibold shadow-sm transition flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Item to Auction</span>
          </button>
          <Link
            to="/create"
            className="px-4 py-2.5 rounded-full bg-white hover:bg-[#FAF6EE] text-[#1C1710] border border-[#1C1710]/15 text-xs font-semibold shadow-xs transition"
          >
            Detailed Creator
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between space-x-3 text-xs font-semibold shadow-xs transition ${
            feedback.type === 'success'
              ? 'bg-[#3E6140]/10 text-[#3E6140] border-[#3E6140]/30'
              : 'bg-[#A8432A]/10 text-[#A8432A] border-[#A8432A]/30'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#3E6140]" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#A8432A]" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-[#1C1710]/50 hover:text-[#1C1710]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#1C1710]/10 space-x-6">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 px-1 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'listings'
              ? 'border-[#A8432A] text-[#A8432A]'
              : 'border-transparent text-[#1C1710]/60 hover:text-[#1C1710]'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>My Listed Items ({myAuctions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bids')}
          className={`pb-3 px-1 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'bids'
              ? 'border-[#A8432A] text-[#A8432A]'
              : 'border-transparent text-[#1C1710]/60 hover:text-[#1C1710]'
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>Bids I've Placed ({myBids.length})</span>
        </button>
      </div>

      {/* Listings Tab Content */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#1C1710]/50">Loading activity...</div>
      ) : activeTab === 'listings' ? (
        <div className="space-y-4">
          
          {/* Multi-Selection Control Bar */}
          {myAuctions.length > 0 && (
            <div className="bg-[#FAF6EE] rounded-2xl border border-[#1C1710]/10 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="flex items-center space-x-2 text-xs font-semibold text-[#1C1710] hover:text-[#A8432A] transition"
                >
                  {selectedAuctionIds.length === myAuctions.length ? (
                    <CheckSquare className="w-4 h-4 text-[#A8432A]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#1C1710]/50" />
                  )}
                  <span>
                    {selectedAuctionIds.length === myAuctions.length
                      ? 'Deselect All'
                      : `Select All (${myAuctions.length})`}
                  </span>
                </button>

                {selectedAuctionIds.length > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#A8432A]/10 text-[#A8432A] font-bold">
                    {selectedAuctionIds.length} selected
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {selectedAuctionIds.length > 0 && (
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDeleteSelected}
                    className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {isDeleting
                        ? 'Removing...'
                        : `Remove Selected (${selectedAuctionIds.length})`}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-[#EDE5D6] text-[#1C1710] border border-[#1C1710]/15 text-xs font-semibold transition flex items-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#3E6140]" />
                  <span>+ Add More Items</span>
                </button>
              </div>
            </div>
          )}

          {myAuctions.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF6EE] rounded-[32px] border border-[#1C1710]/10 p-8 space-y-4">
              <Tag className="w-12 h-12 text-[#1C1710]/30 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-[#1C1710]">You haven't listed any items for auction</h3>
                <p className="text-xs text-[#1C1710]/60 mt-1">
                  Start an auction with anti-sniping protection, instant escrow holds, and live bidder chats.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-full bg-[#A8432A] hover:bg-[#8f3620] text-xs font-bold text-white shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List Your First Item</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myAuctions.map((a) => {
                const isSelected = selectedAuctionIds.includes(a._id);
                const isEnded = a.status === 'ended' || new Date(a.endsAt) <= new Date();

                return (
                  <div
                    key={a._id}
                    className={`bg-[#FAF6EE] rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-xs ${
                      isSelected
                        ? 'border-[#A8432A] ring-1 ring-[#A8432A]/30 bg-[#FDFBF7]'
                        : 'border-[#1C1710]/10 hover:border-[#1C1710]/25'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      {/* Checkbox for bulk operations */}
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(a._id)}
                        className="mt-1 text-[#1C1710]/60 hover:text-[#A8432A] transition"
                        title={isSelected ? 'Deselect item' : 'Select item for removal'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[#A8432A]" />
                        ) : (
                          <Square className="w-5 h-5 text-[#1C1710]/30" />
                        )}
                      </button>

                      {/* Image Thumbnail */}
                      <img
                        src={a.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                        alt={a.title}
                        className="w-14 h-14 rounded-xl object-cover border border-[#1C1710]/10 shrink-0"
                      />

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm sm:text-base text-[#1C1710]">
                            {a.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isEnded
                                ? 'bg-[#1C1710]/10 text-[#1C1710]/70'
                                : 'bg-[#3E6140]/10 text-[#3E6140] border border-[#3E6140]/30'
                            }`}
                          >
                            {isEnded ? 'Ended' : 'Active'}
                          </span>
                        </div>

                        <div className="text-xs text-[#1C1710]/70 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span>
                            Current Bid: <strong className="text-[#3E6140] font-mono font-bold">₹{a.currentBid?.toLocaleString()}</strong>
                          </span>
                          <span>
                            Starting: <span className="font-mono">₹{a.startingPrice?.toLocaleString()}</span>
                          </span>
                          <span>
                            Bids: <strong>{a.bidCount || 0}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions on this item */}
                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-[#1C1710]/10">
                      <div className="text-xs">
                        <CountdownTimer endsAt={a.endsAt} />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <Link
                          to={`/auctions/${a._id}`}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1C1710] bg-white hover:bg-[#EDE5D6] border border-[#1C1710]/15 transition flex items-center space-x-1"
                        >
                          <span>View Lot</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDeleteSingle(a._id, a.title)}
                          className="p-1.5 rounded-full text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                          title="Remove this listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Bids Placed Tab Content */
        myBids.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF6EE] rounded-[32px] border border-[#1C1710]/10 p-8 space-y-4">
            <Gavel className="w-12 h-12 text-[#1C1710]/30 mx-auto" />
            <h3 className="text-base font-bold text-[#1C1710]">You haven't placed any bids yet</h3>
            <p className="text-xs text-[#1C1710]/60">
              Browse live auctions across the catalog and place your first bid with escrow protection.
            </p>
            <Link
              to="/auctions"
              className="inline-block px-5 py-2.5 bg-[#1C1710] rounded-full text-xs font-bold text-white shadow-xs hover:bg-[#332a1e] transition"
            >
              Browse Live Auctions
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myBids.map((b) => {
              const a = b.auction;
              if (!a) return null;
              const isWinning = a.highestBidder?._id === user?.id;

              return (
                <div
                  key={b._id}
                  className="bg-[#FAF6EE] rounded-2xl border border-[#1C1710]/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#1C1710]/25 transition shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-[#1C1710] text-sm sm:text-base">{a.title}</h4>
                      {isWinning ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3E6140]/10 text-[#3E6140] border border-[#3E6140]/30 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-[#3E6140]" />
                          <span>Winning Bidder</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A8432A]/10 text-[#A8432A] border border-[#A8432A]/30 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-[#A8432A]" />
                          <span>Outbid</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#1C1710]/70 flex items-center space-x-4">
                      <span>
                        My Bid: <strong className="text-[#1C1710] font-mono font-bold">₹{b.amount?.toLocaleString()}</strong>
                      </span>
                      <span>
                        Current Top: <strong className="text-[#3E6140] font-mono font-bold">₹{a.currentBid?.toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                    <CountdownTimer endsAt={a.endsAt} />
                    <Link
                      to={`/auctions/${a._id}`}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-[#1C1710] hover:bg-[#332a1e] transition flex items-center space-x-1"
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
      )}

      {/* Quick Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1710]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] rounded-[32px] border border-[#1C1710]/15 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-[#1C1710]/60 hover:text-[#1C1710] p-1 rounded-full hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[10px] font-label font-bold uppercase tracking-wider text-[#A8432A] flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Listing</span>
              </div>
              <h3 className="text-xl font-display font-normal text-[#1C1710] mt-0.5">
                Add an Item to Auction
              </h3>
              <p className="text-xs text-[#1C1710]/70 mt-0.5">
                Quickly add a lot to your listings with instant live bidding.
              </p>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-label font-bold uppercase tracking-wider text-[#1C1710]/70">
                Quick Template Presets:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {PRESET_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setNewTitle(item.label);
                      setNewPrice(item.price.toString());
                      setNewImageUrl(item.img);
                    }}
                    className="p-2 rounded-xl bg-white hover:bg-[#EDE5D6] border border-[#1C1710]/10 text-left text-xs transition"
                  >
                    <div className="font-bold text-[11px] truncate text-[#1C1710]">{item.label}</div>
                    <div className="text-[10px] text-[#3E6140] font-mono">₹{item.price.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-label font-bold uppercase tracking-wider text-[#1C1710]/70">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1968 Fender Stratocaster"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-[#1C1710]/15 rounded-xl px-3.5 py-2 text-xs text-[#1C1710] focus:outline-none focus:border-[#A8432A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-label font-bold uppercase tracking-wider text-[#1C1710]/70">
                    Starting Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-white border border-[#1C1710]/15 rounded-xl px-3.5 py-2 text-xs text-[#1C1710] focus:outline-none focus:border-[#A8432A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-label font-bold uppercase tracking-wider text-[#1C1710]/70">
                    Duration
                  </label>
                  <select
                    value={newDurationMin}
                    onChange={(e) => setNewDurationMin(e.target.value)}
                    className="w-full bg-white border border-[#1C1710]/15 rounded-xl px-3 py-2 text-xs text-[#1C1710] focus:outline-none focus:border-[#A8432A]"
                  >
                    <option value="15">15 Minutes (Demo)</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="1440">24 Hours</option>
                    <option value="4320">3 Days</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-label font-bold uppercase tracking-wider text-[#1C1710]/70">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-white border border-[#1C1710]/15 rounded-xl px-3.5 py-2 text-xs text-[#1C1710] focus:outline-none focus:border-[#A8432A]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#1C1710]/70 hover:text-[#1C1710]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-full bg-[#1C1710] hover:bg-[#332a1e] text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Listing...' : 'Launch Auction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
