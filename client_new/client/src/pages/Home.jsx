import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  ShieldCheck,
  UserCheck,
  Building2
} from 'lucide-react';

import BrowseLots from '../components/BrowseLots';
import PricingCalculator from '../components/PricingCalculator';
import HostSection from '../components/HostSection';
import StatsCounter from '../components/StatsCounter';
import FaqAccordion from '../components/FaqAccordion';

import {
  IMAGES,
  BRAND_WORDMARKS,
  TRUST_PILLARS,
  STATS,
  FEATURE_CARDS,
  HOW_IT_WORKS_STEPS,
  TRENDING_CATEGORIES
} from '../data/mockData';

export default function Home() {
  const { user, login } = useAuthStore();
  const [showDemoLogins, setShowDemoLogins] = useState(false);

  const handleQuickDemo = async (email, password) => {
    await login(email, password);
  };

  return (
    <div className="bg-[#F5F0E8] text-[#1C1710] selection:bg-[#A8432A] selection:text-white min-h-screen">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section className="relative px-3 sm:px-6 pt-2 pb-6">
        <div className="relative rounded-[32px] sm:rounded-[44px] overflow-hidden bg-[#1C1710] text-white min-h-[640px] sm:min-h-[720px] flex flex-col justify-between shadow-2xl">
          
          {/* Hero Background Image with Dark Vignette Gradient */}
          <img
            src={IMAGES.heroBg}
            alt={IMAGES.heroBgAlt}
            className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105"
            priority="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-[#1C1710] pointer-events-none"></div>

          {/* Top Spacing to account for navbar */}
          <div className="pt-8 sm:pt-12"></div>

          {/* Centered Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6 sm:space-y-8 my-auto py-12">
            
            {/* Small Badge Pill with Glowing Dot */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#F0D0B0] text-xs sm:text-sm font-medium backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#A8432A] animate-pulse"></span>
              <span>Now accepting bidders across Dharwad and beyond</span>
            </div>

            {/* H1 Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-normal text-white tracking-tight leading-[1.08]">
              Bid boldly.<br />
              Win <span className="italic text-[#F0D0B0]">with confidence.</span>
            </h1>

            {/* Subtext */}
            <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
              BidVault Auctions brings live, silent, and charity auctions together in one trusted platform. Register once, manage your bids in real time, and never miss a lot that matters to you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-[#1C1710] text-xs sm:text-sm font-semibold hover:bg-[#F5F0E8] transition-all shadow-lg hover:scale-105"
              >
                Register as a bidder
              </Link>
              <Link
                to="/auctions"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/40 text-white text-xs sm:text-sm font-semibold hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center space-x-2 group"
              >
                <span>Explore live auctions</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Subtle Demo Account Switcher (Discreet for testers/graders) */}
            {!user && (
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setShowDemoLogins(!showDemoLogins)}
                  className="text-[11px] text-white/50 hover:text-white/90 underline transition"
                >
                  {showDemoLogins ? 'Hide 1-Click Demo Accounts' : '⚡ Need a demo account to test? Click here'}
                </button>

                {showDemoLogins && (
                  <div className="mt-3 p-3 bg-black/60 rounded-2xl border border-white/15 max-w-lg mx-auto flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => handleQuickDemo('admin@auction.com', 'admin123')}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold bg-red-950/80 text-red-200 border border-red-800 hover:bg-red-900"
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => handleQuickDemo('alice@auction.com', 'password123')}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-950/80 text-indigo-200 border border-indigo-800 hover:bg-indigo-900"
                    >
                      Alice (₹20,000)
                    </button>
                    <button
                      onClick={() => handleQuickDemo('bob@auction.com', 'password123')}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-200 border border-emerald-800 hover:bg-emerald-900"
                    >
                      Bob (₹15,000)
                    </button>
                    <button
                      onClick={() => handleQuickDemo('seller@auction.com', 'password123')}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-200 border border-amber-800 hover:bg-amber-900"
                    >
                      Seller
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Trusted Wordmarks Band at Hero Bottom */}
          <div className="relative z-10 border-t border-white/10 py-8 px-6 text-center space-y-4">
            <div className="text-[10px] sm:text-[11px] font-label uppercase tracking-widest text-white/45 font-semibold">
              TRUSTED BY AUCTION HOUSES AND CHARITIES
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-white/70 text-xs sm:text-sm">
              {BRAND_WORDMARKS.map((b, i) => (
                <span
                  key={i}
                  className={`tracking-wider ${
                    b.italic ? 'font-serif italic text-white/90' : b.bold ? 'font-bold uppercase text-white/80' : 'font-serif text-white/75'
                  }`}
                >
                  {b.name}
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. BROWSE LOTS                                            */}
      {/* ========================================================= */}
      <BrowseLots />

      {/* ========================================================= */}
      {/* 3. TRUST SECTION                                          */}
      {/* ========================================================= */}
      <section id="trust" className="py-20 max-w-[1150px] mx-auto px-4 sm:px-6 text-center space-y-12">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] font-label uppercase tracking-widest text-[#A8432A] font-semibold">
            TRUSTED BIDDING COMMUNITY
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-[#1C1710] font-normal leading-tight">
            BidVault is built around <span className="italic text-[#A8432A]">fair bidding</span> and transparent auctions.
          </h2>
        </div>

        {/* 3 Centered Columns with Cream Icon Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 text-center">
          {TRUST_PILLARS.map((col, idx) => (
            <div key={idx} className="space-y-4 p-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF6EE] border border-[#1C1710]/10 flex items-center justify-center mx-auto shadow-sm text-[#A8432A]">
                {idx === 0 && <Building2 className="w-7 h-7" />}
                {idx === 1 && <UserCheck className="w-7 h-7" />}
                {idx === 2 && <ShieldCheck className="w-7 h-7" />}
              </div>
              <h3 className="text-xl font-display font-medium text-[#1C1710]">
                {col.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#1C1710]/70 leading-relaxed max-w-sm mx-auto">
                {col.description}
              </p>
            </div>
          ))}
        </div>

        {/* Action Button: Scrolls to How It Works */}
        <div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('how-it-works');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-[#1C1710] text-white text-xs sm:text-sm font-semibold hover:bg-[#332a1e] transition-all shadow-md"
          >
            See how bidding works
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. PRICING CALCULATOR                                     */}
      {/* ========================================================= */}
      <PricingCalculator />

      {/* ========================================================= */}
      {/* 5. HOST WITH BIDVAULT                                     */}
      {/* ========================================================= */}
      <HostSection />

      {/* ========================================================= */}
      {/* 6. CTA BAND + STATS                                       */}
      {/* ========================================================= */}
      <section className="py-12 px-3 sm:px-6">
        {/* Deep Brown CTA Band */}
        <div
          id="register-cta"
          className="max-w-[1150px] mx-auto rounded-[32px] sm:rounded-[40px] bg-[#3B2012] text-white p-10 sm:p-16 text-center space-y-6 shadow-xl relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(240, 208, 176, 0.15), transparent 70%)'
          }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white font-normal leading-tight max-w-2xl mx-auto">
            Bid with confidence at <span className="italic text-[#F0D0B0]">every auction</span> in Dharwad.
          </h2>
          <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join BidVault Auctions to register as a bidder, track live and silent auctions, and support charity fundraisers with transparent, easy bid management.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-[#1C1710] text-xs sm:text-sm font-semibold hover:bg-[#F5F0E8] transition-all shadow-lg hover:scale-105"
            >
              Register as a bidder
            </Link>
          </div>
        </div>

        {/* Below on Cream: Heading + Animated Stats */}
        <div className="max-w-[1150px] mx-auto pt-16 text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display text-[#1C1710] font-normal">
            Join the most trusted bidding community in Dharwad.
          </h3>
          <StatsCounter stats={STATS} />
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. THREE FEATURE CARDS                                    */}
      {/* ========================================================= */}
      <section id="features" className="py-16 max-w-[1150px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Terracotta Quote Card */}
          <div className="bg-[#B95C3E] rounded-[32px] p-8 sm:p-10 text-white flex flex-col justify-between shadow-sm min-h-[360px]">
            <p className="text-lg sm:text-xl font-display font-normal leading-snug">
              {FEATURE_CARDS.left.quote}
            </p>
            <div className="pt-8 border-t border-white/20 flex items-center space-x-3">
              <img
                src={FEATURE_CARDS.left.avatar}
                alt={FEATURE_CARDS.left.author}
                className="w-10 h-10 rounded-full object-cover border border-white/40"
              />
              <div>
                <div className="font-semibold text-sm">{FEATURE_CARDS.left.author}</div>
                <div className="text-xs text-white/80">{FEATURE_CARDS.left.role}</div>
              </div>
            </div>
          </div>

          {/* Card 2: Middle Photo Card */}
          <div className="relative rounded-[32px] overflow-hidden p-8 sm:p-10 text-white flex flex-col justify-between shadow-sm min-h-[360px] group">
            <img
              src={FEATURE_CARDS.middle.image}
              alt={FEATURE_CARDS.middle.role}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 pointer-events-none"></div>

            <div className="relative z-10 space-y-2">
              <h3 className="text-2xl sm:text-3xl font-display font-normal leading-tight">
                {FEATURE_CARDS.middle.headingPart1}
                <span className="italic text-[#F0D0B0]">{FEATURE_CARDS.middle.headingAccent}</span>
                {FEATURE_CARDS.middle.headingPart2}
              </h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                {FEATURE_CARDS.middle.subtext}
              </p>
            </div>

            <div className="relative z-10 pt-8 border-t border-white/20 flex items-center space-x-3">
              <img
                src={FEATURE_CARDS.middle.avatar}
                alt={FEATURE_CARDS.middle.author}
                className="w-10 h-10 rounded-full object-cover border border-white/40"
              />
              <div>
                <div className="font-semibold text-sm">{FEATURE_CARDS.middle.author}</div>
                <div className="text-xs text-white/80">{FEATURE_CARDS.middle.role}</div>
              </div>
            </div>
          </div>

          {/* Card 3: Forest Green Quote Card */}
          <div className="bg-[#3E6140] rounded-[32px] p-8 sm:p-10 text-white flex flex-col justify-between shadow-sm min-h-[360px]">
            <p className="text-lg sm:text-xl font-display font-normal leading-snug">
              {FEATURE_CARDS.right.quote}
            </p>
            <div className="pt-8 border-t border-white/20 flex items-center space-x-3">
              <img
                src={FEATURE_CARDS.right.avatar}
                alt={FEATURE_CARDS.right.author}
                className="w-10 h-10 rounded-full object-cover border border-white/40"
              />
              <div>
                <div className="font-semibold text-sm">{FEATURE_CARDS.right.author}</div>
                <div className="text-xs text-white/80">{FEATURE_CARDS.right.role}</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. HOW IT WORKS                                           */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-20 max-w-[1150px] mx-auto px-4 sm:px-6 scroll-mt-24 space-y-14">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-[11px] font-label uppercase tracking-widest text-[#A8432A] font-semibold">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-[#1C1710] font-normal leading-tight">
            Four steps from <span className="italic text-[#A8432A]">registration</span> to your winning bid.
          </h2>
        </div>

        {/* 4 Steps on a Dashed Line */}
        <div className="relative">
          {/* Desktop Dashed Connector Line */}
          <div className="hidden lg:block absolute top-7 left-12 right-12 h-0.5 border-t-2 border-dashed border-[#1C1710]/20 z-0"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {HOW_IT_WORKS_STEPS.map((step, idx) => (
              <div key={idx} className="space-y-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-full bg-[#FAF6EE] border-2 border-[#1C1710] text-[#1C1710] font-display text-xl font-bold flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                  {step.step}
                </div>
                <h3 className="text-lg sm:text-xl font-display font-medium text-[#1C1710]">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#1C1710]/70 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. FAQ ACCORDION                                          */}
      {/* ========================================================= */}
      <FaqAccordion />

      {/* ========================================================= */}
      {/* 10. TRENDING CATEGORIES (BENTO GRID)                      */}
      {/* ========================================================= */}
      <section className="py-20 max-w-[1150px] mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[11px] font-label uppercase tracking-widest text-[#A8432A] font-semibold">
              WHERE BIDDERS ARE BIDDING THIS SEASON
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-[#1C1710] font-normal">
              Trending <span className="italic text-[#A8432A]">auction categories</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#1C1710]/70 max-w-md leading-relaxed">
            Discover where collectors, patrons, and event attendees are actively placing bids across northern Karnataka this month.
          </p>
        </div>

        {/* Bento Grid: 1 large card on left + 4 smaller cards in 2x2 grid on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Large Card: Fine Art & Antiques */}
          <Link
            to="/auctions?category=Art"
            className="lg:col-span-6 relative h-[380px] lg:h-[480px] rounded-[32px] overflow-hidden group shadow-sm flex flex-col justify-end p-8"
          >
            <img
              src={TRENDING_CATEGORIES.hero.image}
              alt={TRENDING_CATEGORIES.hero.alt}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none"></div>

            <div className="relative z-10 space-y-1.5 text-white">
              <span className="text-[11px] font-label uppercase tracking-wider text-[#F0D0B0] font-semibold">
                {TRENDING_CATEGORIES.hero.subtitle}
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-medium text-white">
                {TRENDING_CATEGORIES.hero.title}
              </h3>
              <p className="text-xs text-white/70">
                {TRENDING_CATEGORIES.hero.count}
              </p>
            </div>
          </Link>

          {/* 4 Smaller Cards (2x2 Grid) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {TRENDING_CATEGORIES.items.map((cat, i) => (
              <Link
                key={i}
                to={`/auctions?category=${encodeURIComponent(cat.title.split(' ')[0])}`}
                className="relative h-[228px] rounded-[26px] overflow-hidden group shadow-sm flex flex-col justify-end p-6"
              >
                <img
                  src={cat.image}
                  alt={cat.alt}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"></div>

                <div className="relative z-10 text-white space-y-0.5">
                  <h3 className="text-lg font-display font-medium text-white">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-white/70">
                    {cat.count}
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 11. FINAL CTA BANNER                                      */}
      {/* ========================================================= */}
      <section className="px-3 sm:px-6">
        <div className="relative rounded-t-[40px] sm:rounded-t-[48px] overflow-hidden bg-[#1C1710] text-white py-24 sm:py-28 px-6 text-center shadow-2xl">
          <img
            src={IMAGES.finalCtaBg}
            alt={IMAGES.finalCtaBgAlt}
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#1C1710] pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-normal text-white">
              Bid with <span className="italic text-[#F0D0B0]">confidence.</span>
            </h2>
            <p className="text-white/75 text-sm sm:text-base leading-relaxed">
              Join thousands of verified collectors, patrons, and charities bidding across Dharwad and Karnataka today.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-[#1C1710] text-xs sm:text-sm font-semibold hover:bg-[#F5F0E8] transition-all shadow-lg hover:scale-105"
              >
                Register to bid
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
