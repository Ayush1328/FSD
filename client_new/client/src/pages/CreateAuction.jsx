import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { PlusCircle, Image, DollarSign, Clock, AlertTriangle, Sparkles } from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Rolex Watch', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800' },
  { label: 'Vintage Guitar', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800' },
  { label: 'MacBook Pro', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800' },
  { label: 'Gaming Console', url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800' },
  { label: 'Fine Art Oil Painting', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800' }
];

export default function CreateAuction() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('100');
  const [endsAt, setEndsAt] = useState(() => {
    // Default to 15 minutes in the future for quick demo testing
    const d = new Date(Date.now() + 15 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setDuration = (minutes) => {
    const d = new Date(Date.now() + minutes * 60 * 1000);
    setEndsAt(d.toISOString().slice(0, 16));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title || !description || !startingPrice || !endsAt) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await API.post('/auctions', {
        title,
        description,
        startingPrice: Number(startingPrice),
        endsAt: new Date(endsAt).toISOString(),
        imageUrl
      });

      const newId = res.data.auction?._id;
      if (newId) {
        navigate(`/auctions/${newId}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list auction item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 px-4 sm:px-6 pt-6">
      
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
          <PlusCircle className="w-8 h-8 text-emerald-400" />
          <span>List a New Auction</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Create a fair-play auction listing. Bids will trigger atomic holds, anti-sniping timers, and continuous fraud detection.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/80 text-rose-300 border border-rose-500/50 flex items-center space-x-3 text-sm font-semibold shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Item Title</label>
          <input
            type="text"
            required
            placeholder="e.g. 2024 Rolex Submariner Date"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Item Description</label>
          <textarea
            required
            rows={4}
            placeholder="Provide item specs, condition, authenticity details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm resize-none"
          />
        </div>

        {/* Starting Price & Expiration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Starting Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Starting Price ($ USD)</span>
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              required
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          {/* End Date & Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Auction Expiration Time</span>
            </label>
            <input
              type="datetime-local"
              required
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm font-mono"
            />

            {/* Quick Duration Preset Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '2 Mins (Demo)', mins: 2 },
                { label: '15 Mins', mins: 15 },
                { label: '2 Hours', mins: 120 },
                { label: '24 Hours', mins: 1440 }
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setDuration(p.mins)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Image Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Image className="w-3.5 h-3.5 text-purple-400" />
            <span>Product Image (URL or Demo Preset)</span>
          </label>

          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste image URL..."
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
          />

          {/* Preset image buttons */}
          <div className="flex flex-wrap gap-2">
            {PRESET_IMAGES.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setImageUrl(preset.url)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                  imageUrl === preset.url
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Image preview */}
          {imageUrl && (
            <div className="mt-3 relative aspect-[16/9] w-full max-w-sm rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
        >
          {loading ? (
            <span>Publishing Live Auction...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Launch Live Auction</span>
            </>
          )}
        </button>

      </form>

    </div>
  );
}
