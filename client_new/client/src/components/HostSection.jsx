import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { HOST_PERSONAS, HOST_BULLETS } from '../data/mockData';

export default function HostSection() {
  const [activeTab, setActiveTab] = useState(HOST_PERSONAS[0].id);

  const currentPersona = HOST_PERSONAS.find((p) => p.id === activeTab) || HOST_PERSONAS[0];

  return (
    <section id="host" className="py-20 max-w-[1150px] mx-auto px-4 sm:px-6 scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        
        {/* Left Column: Rounded Photo with 4 Bottom Pill Tabs */}
        <div className="lg:col-span-6 relative h-[420px] sm:h-[480px] rounded-[32px] overflow-hidden shadow-xl border border-[#1C1710]/10">
          <img
            src={currentPersona.image}
            alt={currentPersona.alt}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out"
          />
          {/* Subtle gradient overlay at bottom for tabs */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

          {/* Floating Pill Tabs at the Bottom */}
          <div className="absolute bottom-6 inset-x-4 sm:inset-x-6 flex items-center justify-center">
            <div className="glass-pill-dark p-1.5 rounded-full flex flex-wrap items-center justify-center gap-1 max-w-full">
              {HOST_PERSONAS.map((persona) => {
                const isActive = activeTab === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => setActiveTab(persona.id)}
                    className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-[#1C1710] shadow-md font-semibold scale-100'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {persona.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Eyebrow, Heading, 4 Checkmarks, CTA Button */}
        <div className="lg:col-span-6 space-y-6">
          <span className="text-[11px] font-label uppercase tracking-widest text-[#A8432A] font-semibold">
            HOST WITH BIDVAULT
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-[#1C1710] font-normal leading-[1.15]">
            Auction support, built for <span className="italic text-[#A8432A]">first-time sellers.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#1C1710]/70 leading-relaxed">
            {currentPersona.tagline} Whether you are coordinating a single gala lot or a 200-item estate sale, our tools ensure maximum value with minimal stress.
          </p>

          {/* 4 Bullet Points with Green Check Circles */}
          <div className="space-y-3.5 pt-2">
            {HOST_BULLETS.map((bullet, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-[#3E6140] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#1C1710]/90 font-medium leading-normal">
                  {bullet}
                </span>
              </div>
            ))}
          </div>

          {/* Dark Pill Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                const ctaSec = document.getElementById('register-cta');
                if (ctaSec) ctaSec.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#1C1710] text-white text-xs sm:text-sm font-semibold hover:bg-[#332a1e] transition-all shadow-md"
            >
              Learn more about hosting an auction
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}

