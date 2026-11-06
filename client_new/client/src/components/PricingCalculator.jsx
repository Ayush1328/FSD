import { useState } from 'react';
import { Info, Coins } from 'lucide-react';
import {
  PRICING_RATES,
  PRICING_EVENTS,
  PRICING_LOT_OPTIONS,
  PRICING_TESTIMONIALS,
  IMAGES
} from '../data/mockData';

export default function PricingCalculator() {
  const [selectedEvent, setSelectedEvent] = useState(PRICING_EVENTS[0]);
  const [lotCount, setLotCount] = useState(50);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Live Calculations based on rates
  const bidCredits = lotCount * PRICING_RATES.creditsPerLot;
  const platformFee = lotCount * PRICING_RATES.platformFeePerLot;
  const eventSetup = PRICING_RATES.eventSetupFee;
  const totalRupees = platformFee + eventSetup;
  const traditionalCommission = lotCount * PRICING_RATES.traditionalCommissionRatePerLot;

  return (
    <section id="pricing" className="py-16 max-w-[1150px] mx-auto px-4 sm:px-6 scroll-mt-24">
      <div className="bg-[#EDE5D6] rounded-[32px] overflow-hidden border border-[#1C1710]/10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* Left Column: Cost Calculator */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <span className="text-[11px] font-label uppercase tracking-widest text-[#A8432A] font-semibold">
                PRICING
              </span>
              <h2 className="text-3xl sm:text-4xl font-display text-[#1C1710] font-normal leading-tight">
                No bidding fee. Just pay a platform &amp; event fee per auction.
              </h2>
            </div>

            {/* Inner Cream Card */}
            <div className="bg-[#FAF6EE] rounded-2xl p-6 sm:p-7 border border-[#1C1710]/10 shadow-sm space-y-6">
              
              {/* Dropdowns Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="auction-event" className="block text-[10px] font-label uppercase tracking-wider text-[#1C1710]/60 font-semibold">
                    WHICH AUCTION EVENT?
                  </label>
                  <select
                    id="auction-event"
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full bg-white border border-[#1C1710]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#1C1710] focus:outline-none focus:border-[#A8432A] transition"
                  >
                    {PRICING_EVENTS.map((event) => (
                      <option key={event} value={event}>
                        {event}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="lot-count" className="block text-[10px] font-label uppercase tracking-wider text-[#1C1710]/60 font-semibold">
                    HOW MANY LOTS?
                  </label>
                  <select
                    id="lot-count"
                    value={lotCount}
                    onChange={(e) => setLotCount(Number(e.target.value))}
                    className="w-full bg-white border border-[#1C1710]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#1C1710] focus:outline-none focus:border-[#A8432A] transition"
                  >
                    {PRICING_LOT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estimated Cost Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="text-[10px] font-label uppercase tracking-wider text-[#1C1710]/60 font-semibold">
                  ESTIMATED COST BREAKDOWN
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  {/* Row 1: Bid credits */}
                  <div className="flex items-center justify-between text-[#1C1710]/80 relative">
                    <div className="flex items-center space-x-1.5">
                      <span>Bid credits</span>
                      <button
                        type="button"
                        aria-label="Info about bid credits"
                        onMouseEnter={() => setActiveTooltip('credits')}
                        onMouseLeave={() => setActiveTooltip(null)}
                        onClick={() => setActiveTooltip(activeTooltip === 'credits' ? null : 'credits')}
                        className="text-[#1C1710]/40 hover:text-[#1C1710] transition"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      {activeTooltip === 'credits' && (
                        <div className="absolute left-24 top-0 z-20 w-52 bg-[#1C1710] text-white text-[11px] rounded-lg p-2 shadow-lg">
                          10 credits allocated per lot for registered bidder verification.
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-[#1C1710] font-mono">
                      {bidCredits.toLocaleString()} credits
                    </span>
                  </div>

                  {/* Row 2: Platform fee */}
                  <div className="flex items-center justify-between text-[#1C1710]/80 relative">
                    <div className="flex items-center space-x-1.5">
                      <span>Platform fee</span>
                      <button
                        type="button"
                        aria-label="Info about platform fee"
                        onMouseEnter={() => setActiveTooltip('platform')}
                        onMouseLeave={() => setActiveTooltip(null)}
                        onClick={() => setActiveTooltip(activeTooltip === 'platform' ? null : 'platform')}
                        className="text-[#1C1710]/40 hover:text-[#1C1710] transition"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      {activeTooltip === 'platform' && (
                        <div className="absolute left-24 top-0 z-20 w-52 bg-[#1C1710] text-white text-[11px] rounded-lg p-2 shadow-lg">
                          ₹70/lot covering real-time socket bidding, anti-sniping, and streaming.
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-[#1C1710] font-mono">
                      ₹{platformFee.toLocaleString()}
                    </span>
                  </div>

                  {/* Row 3: Event setup */}
                  <div className="flex items-center justify-between text-[#1C1710]/80 relative">
                    <div className="flex items-center space-x-1.5">
                      <span>Event setup</span>
                      <button
                        type="button"
                        aria-label="Info about event setup"
                        onMouseEnter={() => setActiveTooltip('setup')}
                        onMouseLeave={() => setActiveTooltip(null)}
                        onClick={() => setActiveTooltip(activeTooltip === 'setup' ? null : 'setup')}
                        className="text-[#1C1710]/40 hover:text-[#1C1710] transition"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      {activeTooltip === 'setup' && (
                        <div className="absolute left-24 top-0 z-20 w-52 bg-[#1C1710] text-white text-[11px] rounded-lg p-2 shadow-lg">
                          Flat event onboarding and lot catalog review by our Dharwad team.
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-[#1C1710] font-mono">
                      ₹{eventSetup.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Total & Comparison */}
                <div className="pt-4 border-t border-[#1C1710]/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1C1710]">Total</span>
                    <div className="inline-flex items-center space-x-2 bg-[#1C1710] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm">
                      <Coins className="w-3.5 h-3.5 text-[#F0D0B0]" />
                      <span>{bidCredits.toLocaleString()} credits + ₹{totalRupees.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#1C1710]/60 text-right">
                    Traditional auction house commission:{' '}
                    <span className="line-through font-mono">
                      ₹{traditionalCommission.toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Action */}
            <div>
              <button
                type="button"
                onClick={() => {
                  const hostSec = document.getElementById('host');
                  if (hostSec) hostSec.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-[#1C1710] text-white text-xs sm:text-sm font-semibold hover:bg-[#332a1e] transition shadow-sm"
              >
                See full pricing
              </button>
            </div>

          </div>

          {/* Right Column: Photo with Floating Glass Testimonial Chips */}
          <div className="lg:col-span-6 relative min-h-[400px] lg:min-h-full">
            <img
              src={IMAGES.gavelPricing}
              alt={IMAGES.gavelPricingAlt}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            {/* Subtle dark vignette overlay for chip readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            {/* Floating Glass Chips Stacked on Right */}
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end lg:justify-center space-y-3 pointer-events-none">
              {PRICING_TESTIMONIALS.map((item, idx) => (
                <div
                  key={item.id}
                  style={{ transform: `translateY(${idx * 4}px)` }}
                  className="pointer-events-auto max-w-sm ml-auto glass-chip-light rounded-2xl p-3.5 sm:p-4 shadow-xl flex items-center space-x-3 transition-transform hover:scale-[1.02]"
                >
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-white shadow-sm"
                  />
                  <p className="text-[11px] sm:text-xs text-[#1C1710] leading-snug font-medium">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

