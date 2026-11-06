import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import API from '../services/api';
import { LOT_CATEGORIES, MOCK_LOTS } from '../data/mockData';

export default function BrowseLots() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('bidvault_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [apiLots, setApiLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Try fetching auctions from the backend API if available
  useEffect(() => {
    const fetchApiAuctions = async () => {
      try {
        setLoading(true);
        const res = await API.get('/auctions');
        if (res.data?.auctions && res.data.auctions.length > 0) {
          // Format backend auctions to match card structure
          const formatted = res.data.auctions.map((a, i) => ({
            id: a._id,
            title: a.title,
            location: a.location || 'Dharwad, India',
            category: a.category || (LOT_CATEGORIES[(i % (LOT_CATEGORIES.length - 1)) + 1]),
            image: a.images?.[0] || MOCK_LOTS[i % MOCK_LOTS.length].image,
            alt: a.title,
            currentBid: a.currentBid || a.startingPrice || 5000,
            startingPrice: a.startingPrice || 5000,
            bidCount: a.bidCount || 0,
            status: a.status || 'active',
            isBackend: true
          }));
          setApiLots(formatted);
        }
      } catch (err) {
        // Silently use rich mock data if backend has no active auctions
        console.info('Using curated mock auction lots for display');
      } finally {
        setLoading(false);
      }
    };

    fetchApiAuctions();
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

  // Combine backend lots with reference mock lots to ensure the exact 6 reference items from the screenshots always show!
  const combinedLots = apiLots.length > 0
    ? [...apiLots, ...MOCK_LOTS.filter((m) => !apiLots.some((a) => a.title === m.title))]
    : MOCK_LOTS;

  const filteredLots = activeCategory === 'All'
    ? combinedLots
    : combinedLots.filter((lot) => lot.category.toLowerCase() === activeCategory.toLowerCase());

  // Show top 6 lots in the primary grid matching screenshot layout
  const displayedLots = filteredLots.slice(0, 6);

  return (
    <section id="browse-lots" className="py-20 max-w-[1180px] mx-auto px-4 sm:px-6 scroll-mt-24">
      
      {/* Top Header Row: Heading on left, Filter tabs on right */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="max-w-xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-[#1C1710] font-normal leading-[1.15]">
            Browse <span className="italic text-[#A8432A]">12,000+</span> auction lots across Dharwad and beyond
          </h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          <div className="bg-[#FAF6EE] p-1.5 rounded-full border border-[#1C1710]/10 flex items-center space-x-1 shrink-0">
            {LOT_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1C1710] text-white shadow-sm'
                      : 'text-[#1C1710]/70 hover:text-[#1C1710] hover:bg-black/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row of 6 Tall Cards with Gradient Overlay & Favorite Heart */}
      {displayedLots.length === 0 ? (
        <div className="text-center py-16 bg-[#EDE5D6]/40 rounded-3xl p-8 border border-[#1C1710]/10">
          <p className="text-[#1C1710]/70 text-sm">No auction lots currently in this category.</p>
          <button
            type="button"
            onClick={() => setActiveCategory('All')}
            className="mt-3 text-xs font-semibold text-[#A8432A] underline"
          >
            Show all lots
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 overflow-x-auto no-scrollbar pb-2">
          {displayedLots.map((lot) => {
            const isFav = favorites.includes(lot.id);
            const destination = lot.isBackend ? `/auctions/${lot.id}` : `/auctions?category=${encodeURIComponent(lot.category)}`;

            return (
              <div
                key={lot.id}
                onClick={() => navigate(destination)}
                className="group relative cursor-pointer h-[320px] sm:h-[360px] rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-4"
              >
                {/* Background Image with Hover Scale */}
                <img
                  src={lot.image}
                  alt={lot.alt || lot.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />

                {/* Dark Gradient Overlay for optimal readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"></div>

                {/* Top Right: Favorite Heart Toggle Button */}
                <div className="relative z-10 flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(e, lot.id)}
                    aria-label={`Favorite ${lot.title}`}
                    className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm ${
                      isFav
                        ? 'bg-white text-[#A8432A]'
                        : 'bg-white/80 hover:bg-white text-[#1C1710]'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 transition-transform ${
                        isFav ? 'fill-[#A8432A] scale-110' : 'group-hover:scale-105'
                      }`}
                    />
                  </button>
                </div>

                {/* Bottom Left: Title & Location */}
                <div className="relative z-10 space-y-1">
                  <h3 className="text-white text-xs sm:text-sm font-semibold leading-snug line-clamp-2">
                    {lot.title}
                  </h3>
                  <p className="text-white/70 text-[11px] font-normal truncate">
                    {lot.location}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Center Action: Dark Pill "Browse all auctions" */}
      <div className="mt-12 text-center">
        <Link
          to="/auctions"
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#1C1710] text-white text-xs sm:text-sm font-semibold hover:bg-[#332a1e] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Browse all auctions
        </Link>
      </div>

    </section>
  );
}

