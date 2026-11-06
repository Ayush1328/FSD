import { Link } from 'react-router-dom';
import { FOOTER_LINKS } from '../data/mockData';

export default function Footer() {
  return (
    <footer className="bg-[#1C1710] text-white pt-20 pb-14 border-t border-white/10">
      <div className="max-w-[1150px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-white/10">
          
          {/* Left Column: Brand Info */}
          <div className="md:col-span-5 space-y-6">
            <Link to="/" className="inline-flex items-center space-x-2.5">
              <div className="w-5 h-5 rounded-full bg-[#A8432A] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
              <span className="text-2xl font-display font-medium text-white tracking-tight">
                BidVault Auctions
              </span>
            </Link>

            <p className="text-white/60 text-sm max-w-sm leading-relaxed">
              Bid smarter. Win more causes. Bringing transparent live and silent auctions to Dharwad, Hubli, and all of Karnataka.
            </p>

            <div>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#F5F0E8] text-[#1C1710] text-xs sm:text-sm font-semibold hover:bg-white transition-all shadow-md"
              >
                Register to bid
              </Link>
            </div>
          </div>

          {/* Right Columns: Three Link Columns with Mono Headings */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* SOCIAL */}
            <div className="space-y-4">
              <div className="text-[11px] font-label uppercase tracking-widest text-white/50 font-semibold">
                SOCIAL
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {FOOTER_LINKS.social.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* COMPANY */}
            <div className="space-y-4">
              <div className="text-[11px] font-label uppercase tracking-widest text-white/50 font-semibold">
                COMPANY
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* BIDDERS */}
            <div className="space-y-4">
              <div className="text-[11px] font-label uppercase tracking-widest text-white/50 font-semibold">
                BIDDERS
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {FOOTER_LINKS.bidders.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Copyright & Location Badge */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <div>
            &copy; {new Date().getFullYear()} BidVault Auctions. All rights reserved.
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Serving Dharwad, Hubli, Belagavi &amp; Karnataka</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

