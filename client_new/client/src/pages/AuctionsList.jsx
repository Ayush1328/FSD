import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { Search, Heart, ArrowRight, Gavel, Filter } from 'lucide-react';
import { LOT_CATEGORIES, MOCK_LOTS } from '../data/mockData';

export default function AuctionsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'All';

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('bidvault_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      const res = await API.get('/auctions', { params });
      
      const backendAuctions = (res.data?.auctions || []).map((a, i) => ({
        id: a._id,
        title: a.title,
        description: a.description,
        location: a.location || 'Dharwad, India',
        category: a.category || (LOT_CATEGORIES[(i % (LOT_CATEGORIES.length - 1)) + 1]),
        image: a.images?.[0] || MOCK_LOTS[i % MOCK_LOTS.length].image,
        currentBid: a.currentBid || a.startingPrice || 5000,
        startingPrice: a.startingPrice || 5000,
        bidCount: a.bidCount || 0,
        endsAt: a.endsAt,
        status: a.status || 'active',
        isBackend: true
      }));

      // Merge backend auctions with reference lots
      const combined = [
        ...backendAuctions,
        ...MOCK_LOTS.filter((m) => !backendAuctions.some((b) => b.title === m.title))
      ];
      setAuctions(combined);
    } catch (err) {
      console.info('Backend unavailable, displaying catalogue lots');
      setAuctions(MOCK_LOTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const toggleFavorite = (e, lotId) => {
    e.stopPropagation();
    e.preventDefault();
    setFavorites((prev) => {
      const updated = prev.includes(lotId)
        ? prev.filter((id) => id !== lotId)
        : [...prev, lotId];
      try {
        localStorage.setItem('bidvault_favorites', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }
      return updated;
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuctions();
  };

  const filteredAuctions = auctions.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.location?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-[1150px] mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* Header Banner */}
      <div className="space-y-4">
        <div className="text-[11px] font-label uppercase tracking-widest text-[#A8432A] font-semibold">
          LIVE CATALOGUE
        </div>
        <h1 className="text-4xl sm:text-5xl font-display text-[#1C1710] font-normal">
          Explore <span className="italic text-[#A8432A]">live auctions</span> in Dharwad
        </h1>
        <p className="text-sm sm:text-base text-[#1C1710]/70 max-w-2xl leading-relaxed">
          Browse verified lots from auction houses, independent collectors, and regional charity galas. Transparent increments, atomic escrow, and instant outbid notifications.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#EDE5D6] rounded-3xl p-4 sm:p-5 border border-[#1C1710]/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search brass, art, motorbikes, jewelry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF6EE] border border-[#1C1710]/15 rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#1C1710] placeholder-[#1C1710]/40 focus:outline-none focus:border-[#A8432A] transition"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#1C1710]/40" />
        </form>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {LOT_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchParams(cat === 'All' ? {} : { category: cat });
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-[#1C1710] text-white shadow-sm'
                    : 'bg-[#FAF6EE] text-[#1C1710]/70 hover:text-[#1C1710] hover:bg-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

      </div>

      {/* Grid of Auction Lots */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-[#EDE5D6]/50 animate-pulse border border-[#1C1710]/10"></div>
          ))}
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="text-center py-20 bg-[#EDE5D6]/30 rounded-3xl p-8 border border-[#1C1710]/10">
          <Gavel className="w-12 h-12 text-[#1C1710]/30 mx-auto mb-3" />
          <h3 className="text-lg font-display text-[#1C1710]">No lots found matching your filter</h3>
          <p className="text-xs sm:text-sm text-[#1C1710]/60 mt-1">Try resetting the search query or category tabs.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearch('');
            }}
            className="mt-4 px-5 py-2 rounded-full bg-[#1C1710] text-white text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((item) => {
            const isFav = favorites.includes(item.id);
            const destination = item.isBackend ? `/auctions/${item.id}` : '#';

            return (
              <div
                key={item.id}
                className="group relative bg-[#FAF6EE] rounded-[28px] overflow-hidden border border-[#1C1710]/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Header with Favorite Heart */}
                <div className="relative aspect-[16/11] overflow-hidden bg-[#EDE5D6]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 flex items-center space-x-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-wider bg-[#1C1710]/80 text-white backdrop-blur-sm shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute top-3.5 right-3.5">
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(e, item.id)}
                      aria-label="Toggle favorite"
                      className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm ${
                        isFav ? 'bg-white text-[#A8432A]' : 'bg-white/80 hover:bg-white text-[#1C1710]'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-[#A8432A]' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-[11px] text-[#A8432A] font-medium tracking-wide">
                      {item.location}
                    </div>
                    <h3 className="text-base font-semibold text-[#1C1710] group-hover:text-[#A8432A] transition-colors line-clamp-1 mt-0.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#1C1710]/60 line-clamp-2 mt-1">
                      {item.description || 'Verified authentic lot catalogued by BidVault curators with clear condition report.'}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-3 border-t border-[#1C1710]/10 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] font-label uppercase tracking-wider text-[#1C1710]/60 font-semibold">
                        Current Highest Bid
                      </div>
                      <div className="text-xl font-display font-bold text-[#1C1710]">
                        ₹{item.currentBid.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[#1C1710]/50 font-medium">
                        {item.bidCount} {item.bidCount === 1 ? 'bid' : 'bids'} placed
                      </div>
                    </div>

                    {item.isBackend ? (
                      <Link
                        to={destination}
                        className="inline-flex items-center space-x-1 px-4 py-2 rounded-full bg-[#1C1710] text-white text-xs font-semibold hover:bg-[#332a1e] transition shadow"
                      >
                        <span>Place Bid</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => alert(`This lot is part of the upcoming Karnataka Charity Gala catalogue.`)}
                        className="inline-flex items-center space-x-1 px-4 py-2 rounded-full bg-[#1C1710] text-white text-xs font-semibold hover:bg-[#332a1e] transition shadow"
                      >
                        <span>View Lot</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
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

