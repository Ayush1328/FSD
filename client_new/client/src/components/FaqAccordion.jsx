import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { FAQ_ITEMS } from '../data/mockData';

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="py-20 max-w-[1150px] mx-auto px-4 sm:px-6 scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        
        {/* Left Heading */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-[11px] font-label uppercase tracking-widest text-[#A8432A] font-semibold">
            FREQUENTLY ASKED
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-[#1C1710] leading-tight font-normal">
            Questions about <span className="italic text-[#A8432A]">bidding with BidVault?</span>
          </h2>
          <p className="text-sm sm:text-base text-[#1C1710]/70 leading-relaxed pt-2">
            Everything you need to know about setting up your bidder profile, escrow balances, and participating in live auctions across Karnataka.
          </p>
        </div>

        {/* Right Accordion */}
        <div className="lg:col-span-7 divide-y divide-[#1C1710]/15 border-t border-b border-[#1C1710]/15">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="py-5 sm:py-6 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleIndex(index)}
                  className="w-full flex items-center justify-between text-left group gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className={`text-base sm:text-lg font-medium transition-colors ${
                    isOpen ? 'text-[#1C1710] font-semibold' : 'text-[#1C1710]/90 group-hover:text-[#A8432A]'
                  }`}>
                    {item.question}
                  </span>
                  
                  {/* Plus that transforms to a dark circle with X when open */}
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isOpen 
                      ? 'bg-[#1C1710] text-white rotate-90 shadow-sm' 
                      : 'bg-transparent text-[#1C1710]/70 group-hover:bg-[#1C1710]/5'
                  }`}>
                    {isOpen ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {/* Animated Answer Drawer */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm sm:text-base text-[#1C1710]/70 leading-relaxed pr-6">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

