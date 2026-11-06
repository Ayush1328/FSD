/**
 * BidVault Auctions - Design System Mock Data & Image Configuration
 * Royalty-free Unsplash imagery, typed structures, and copy extracted
 * directly from the reference design.
 */

export const IMAGES = {
  heroBg: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=2000&q=85',
  heroBgAlt: 'Dark dramatic auction hall with spotlight on fine art and collectibles',
  
  gavelPricing: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
  gavelPricingAlt: 'Wooden auctioneer gavel on polished stone desk',

  hostAudience: {
    charity: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    planners: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    businesses: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
    community: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  },

  featureMiddleCard: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
  featureMiddleCardAlt: 'Charity gala celebration with elegant lights and guests',

  finalCtaBg: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2000&q=80',
  finalCtaBgAlt: 'Dramatic black and white audience of engaged auction bidders',

  lots: {
    brassLamp: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    artPiece: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    charityGala: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
    classicMotorbike: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    silverJewellery: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    writingDesk: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    cameraKit: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    tanjorePainting: 'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?auto=format&fit=crop&w=800&q=80',
    goldPendant: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    vintageCar: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    schoolFundraiser: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    audioReceiver: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=800&q=80'
  },

  categories: {
    fineArt: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    charity: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
    jewellery: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    realEstate: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    silentEvents: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'
  },

  avatars: {
    ananya: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rahul: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    meera: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    ravi: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    asha: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    suresh: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
  }
};

export const BRAND_WORDMARKS = [
  { name: 'Dharwad Times', italic: true },
  { name: 'KARNATAKA CHARITY NETWORK', bold: true },
  { name: 'DECCAN HERALD', bold: true },
  { name: 'Indian Fundraisers Guild', italic: false },
  { name: 'Auction Monthly', italic: false }
];

export const LOT_CATEGORIES = [
  'All',
  'Antiques',
  'Art',
  'Jewellery',
  'Vehicles',
  'Charity',
  'Electronics'
];

export const MOCK_LOTS = [
  {
    id: 'lot-1',
    title: 'Vintage brass lamp collection',
    location: 'Dharwad, India',
    category: 'Antiques',
    image: IMAGES.lots.brassLamp,
    alt: 'Pair of antique handcrafted brass temple lamps with intricate engravings',
    currentBid: 6800,
    startingPrice: 4500,
    bidCount: 14,
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    isFavorite: false
  },
  {
    id: 'lot-2',
    title: 'Silent auction art piece',
    location: 'Hubli, India',
    category: 'Art',
    image: IMAGES.lots.artPiece,
    alt: 'Modern expressionist framed canvas painting by contemporary Karnataka artist',
    currentBid: 14500,
    startingPrice: 8000,
    bidCount: 22,
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    isFavorite: false
  },
  {
    id: 'lot-3',
    title: 'Charity gala fundraiser lot',
    location: 'Belagavi, India',
    category: 'Charity',
    image: IMAGES.lots.charityGala,
    alt: 'Grand arched palace hall filled with guests attending a charity auction gala',
    currentBid: 12000,
    startingPrice: 5000,
    bidCount: 19,
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    isFavorite: false
  },
  {
    id: 'lot-4',
    title: 'Classic motorbike live bid',
    location: 'Bengaluru, India',
    category: 'Vehicles',
    image: IMAGES.lots.classicMotorbike,
    alt: 'Restored vintage yellow BSA motorcycle with chrome engine in pristine shape',
    currentBid: 98000,
    startingPrice: 65000,
    bidCount: 31,
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    isFavorite: false
  },
  {
    id: 'lot-5',
    title: 'Handcrafted silver jewellery',
    location: 'Mysuru, India',
    category: 'Jewellery',
    image: IMAGES.lots.silverJewellery,
    alt: 'Artisan hand setting a vintage gemstone on a sterling silver heritage filigree ring',
    currentBid: 18500,
    startingPrice: 12000,
    bidCount: 16,
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    isFavorite: false
  },
  {
    id: 'lot-6',
    title: 'Antique wooden writing desk',
    location: 'Dharwad, India',
    category: 'Antiques',
    image: IMAGES.lots.writingDesk,
    alt: 'Colonial era teakwood roll-top secretary desk with carved chair and brass fittings',
    currentBid: 24000,
    startingPrice: 15000,
    bidCount: 28,
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString(),
    isFavorite: false
  },
  {
    id: 'lot-7',
    title: 'Vintage Leica film camera kit',
    location: 'Hubli, India',
    category: 'Electronics',
    image: IMAGES.lots.cameraKit,
    alt: 'Vintage 35mm rangefinder camera in leather carrying case',
    currentBid: 34000,
    startingPrice: 22000,
    bidCount: 17,
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString(),
    isFavorite: false
  },
  {
    id: 'lot-8',
    title: 'Royal Mysore Tanjore painting',
    location: 'Dharwad, India',
    category: 'Art',
    image: IMAGES.lots.tanjorePainting,
    alt: 'Gold leaf embossed traditional Tanjore framed painting',
    currentBid: 29000,
    startingPrice: 18000,
    bidCount: 25,
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 42).toISOString(),
    isFavorite: false
  },
  {
    id: 'lot-9',
    title: 'Heritage temple gold pendant',
    location: 'Belagavi, India',
    category: 'Jewellery',
    image: IMAGES.lots.goldPendant,
    alt: 'Intricate 22k temple jewellery pendant with rubies and pearls',
    currentBid: 61000,
    startingPrice: 42000,
    bidCount: 36,
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 50).toISOString(),
    isFavorite: false
  },
  {
    id: 'lot-10',
    title: '1968 Ambassador vintage car',
    location: 'Bengaluru, India',
    category: 'Vehicles',
    image: IMAGES.lots.vintageCar,
    alt: 'Classic British green vintage Ambassador Mark II sedan',
    currentBid: 210000,
    startingPrice: 150000,
    bidCount: 42,
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    isFavorite: false
  },
  {
    id: 'lot-11',
    title: 'Rural school library fundraiser lot',
    location: 'Dharwad, India',
    category: 'Charity',
    image: IMAGES.lots.schoolFundraiser,
    alt: 'Books, learning tablets, and art supplies bundle for rural Karnataka school',
    currentBid: 25000,
    startingPrice: 10000,
    bidCount: 38,
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
    isFavorite: false
  },
  {
    id: 'lot-12',
    title: 'Vintage audio receiver & turntable',
    location: 'Mysuru, India',
    category: 'Electronics',
    image: IMAGES.lots.audioReceiver,
    alt: '1970s analog stereo receiver with woodgrain cabinet and direct drive turntable',
    currentBid: 19500,
    startingPrice: 14000,
    bidCount: 12,
    status: 'active',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 16).toISOString(),
    isFavorite: false
  }
];

export const TRUST_PILLARS = [
  {
    iconType: 'register',
    title: 'Register in minutes',
    description: 'Create your bidder profile and get verified quickly. Once approved, you can join live, silent, and charity auctions across Dharwad and beyond.'
  },
  {
    iconType: 'clarity',
    title: 'Bid with full clarity',
    description: 'Track every bid in real time with clear increments, reserve status, and instant outbid alerts. Every auction runs on transparent, auditable records.'
  },
  {
    iconType: 'secure',
    title: 'Secure, supportive events',
    description: 'Our team manages each event from listing to settlement, and your payments and personal details stay protected. Every charity auction directs funds to its cause.'
  }
];

export const PRICING_RATES = {
  creditsPerLot: 10,
  platformFeePerLot: 70,
  eventSetupFee: 1200,
  traditionalCommissionRatePerLot: 560
};

export const PRICING_EVENTS = [
  'Hubli Live Art Auction',
  'Dharwad Heritage Antiques',
  'Belagavi Charity Gala',
  'Karnataka Classic Vehicles',
  'Mysuru Artisan Jewellery'
];

export const PRICING_LOT_OPTIONS = [
  { label: '20 lots', value: 20 },
  { label: '40 lots', value: 40 },
  { label: '50 lots', value: 50 },
  { label: '75 lots', value: 75 },
  { label: '100 lots', value: 100 },
  { label: '120 lots', value: 120 },
  { label: '200 lots', value: 200 }
];

export const PRICING_TESTIMONIALS = [
  {
    id: 't-1',
    name: 'Ananya',
    avatar: IMAGES.avatars.ananya,
    text: 'Ananya ran a charity silent auction in Dharwad with 120 lots and spent ₹8,500'
  },
  {
    id: 't-2',
    name: 'Rahul & team',
    avatar: IMAGES.avatars.rahul,
    text: 'Rahul & team hosted a live online auction for 75 lots — ₹12,000'
  },
  {
    id: 't-3',
    name: 'Meera',
    avatar: IMAGES.avatars.meera,
    text: "Meera's fundraising event used BidVault for 40 lots — ₹4,200"
  }
];

export const HOST_PERSONAS = [
  {
    id: 'charity',
    label: 'Charity organisers',
    image: IMAGES.hostAudience.charity,
    alt: 'Charity auction fundraising team presenting on stage',
    tagline: 'Maximize donations with transparent, zero-friction bidding.'
  },
  {
    id: 'planners',
    label: 'Event planners',
    image: IMAGES.hostAudience.planners,
    alt: 'High-end banquet hall prepared for a live gala auction event',
    tagline: 'Flawless live and silent auction coordination for prestigious events.'
  },
  {
    id: 'businesses',
    label: 'Local businesses',
    image: IMAGES.hostAudience.businesses,
    alt: 'Karnataka business owners meeting around a showroom',
    tagline: 'Liquidate valuable inventory and unique assets with verified local buyers.'
  },
  {
    id: 'community',
    label: 'Community groups',
    image: IMAGES.hostAudience.community,
    alt: 'Community members celebrating at a regional gathering',
    tagline: 'Engage local members and raise funds for grassroots community projects.'
  }
];

export const HOST_BULLETS = [
  'Approve every bidder with pre-verification before bidding opens',
  'Live bid tracking with instantaneous outbid alerts and real-time ledger',
  'Dedicated Dharwad team support from cataloging to hammer drop',
  'Secure payments and automatic escrow settlement reports'
];

export const STATS = [
  { value: 12000, suffix: 'K+', display: '12K+', label: 'Items auctioned' },
  { value: 4500, suffix: 'K+', display: '4.5K+', label: 'Registered bidders' },
  { value: 350, suffix: '+', display: '350+', label: 'Live auction events' },
  { value: 2.1, prefix: '₹', suffix: 'Cr+', display: '₹2.1Cr+', label: 'Raised for causes', isDecimal: true }
];

export const FEATURE_CARDS = {
  left: {
    quote: '"BidVault transformed how our charity gala engaged donors. Transparent real-time bidding brought genuine excitement and broke our fundraising record."',
    author: 'Ravi K.',
    role: 'Bidder at the Dharwad Charity Gala',
    avatar: IMAGES.avatars.ravi
  },
  middle: {
    headingPart1: 'Ready to ',
    headingAccent: 'raise more',
    headingPart2: ' for your cause?',
    subtext: 'Host live, silent, or hybrid fundraising auctions with ease.',
    author: 'Asha Desai',
    role: 'Organized a silent auction for 300 guests',
    avatar: IMAGES.avatars.asha,
    image: IMAGES.featureMiddleCard
  },
  right: {
    quote: '"As a local fundraiser, having verified bidders and zero unexpected fees made all the difference. BidVault is the gold standard in Karnataka."',
    author: 'Suresh P.',
    role: 'Event lead, community fundraiser',
    avatar: IMAGES.avatars.suresh
  }
};

export const HOW_IT_WORKS_STEPS = [
  {
    step: '1',
    title: 'Register',
    desc: 'Create your bidder profile in under 2 minutes with zero upfront fees.'
  },
  {
    step: '2',
    title: 'Get verified',
    desc: 'Quick identity verification to unlock full bidding limits across all events.'
  },
  {
    step: '3',
    title: 'Bid & win',
    desc: 'Place live or proxy bids with escrow protection and real-time anti-sniping.'
  },
  {
    step: '4',
    title: 'Pay & collect',
    desc: 'Secure settlement, transparent invoices, and doorstep or local pickup in Dharwad.'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'Do I need to register before I can bid?',
    answer: 'Yes. To ensure fair and authentic bidding, every bidder must create a free BidVault profile and complete quick verification before placing bids on live or silent lots.'
  },
  {
    question: 'What is the difference between live and silent auctions?',
    answer: 'Live auctions take place in real time with an active countdown, instantaneous bids, and anti-sniping protection. Silent auctions allow bids over an extended window until the closing deadline.'
  },
  {
    question: 'How do charity auctions support a good cause?',
    answer: 'Charity auctions feature lots donated by patrons, artists, and organizations. Winning bid proceeds (after minimal platform processing) are disbursed directly to the verified cause.'
  },
  {
    question: 'How does escrow and bidder payment protection work?',
    answer: 'When you place a bid, your funds are securely reserved in an atomic escrow hold. If you are outbid, your balance is released instantly. Only the winning bid is captured upon auction close.'
  },
  {
    question: 'Can I host an auction if I am an independent seller or charity?',
    answer: 'Absolutely. BidVault welcomes charity organizations, event planners, art galleries, and estate managers across Dharwad, Hubli, and Karnataka.'
  }
];

export const TRENDING_CATEGORIES = {
  hero: {
    title: 'Fine Art & Antiques',
    count: '2,140 lots',
    subtitle: 'Avg 9 bids per item',
    image: IMAGES.categories.fineArt,
    alt: 'Classic museum fine art gallery with framed heritage paintings'
  },
  items: [
    {
      title: 'Charity Auctions',
      count: '1,820 lots',
      image: IMAGES.categories.charity,
      alt: 'Community volunteers supporting a charity gala'
    },
    {
      title: 'Vintage Jewellery',
      count: '640 lots',
      image: IMAGES.categories.jewellery,
      alt: 'Artisan diamonds and gemstones on velvet display'
    },
    {
      title: 'Real Estate Auctions',
      count: '980 lots',
      image: IMAGES.categories.realEstate,
      alt: 'Modern residential villa property'
    },
    {
      title: 'Silent Auction Events',
      count: '510 lots',
      image: IMAGES.categories.silentEvents,
      alt: 'Silent auction gallery table with bidding paddles'
    }
  ]
};

export const FOOTER_LINKS = {
  social: [
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'X (Twitter)', href: 'https://x.com' },
    { label: 'Facebook', href: 'https://facebook.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' }
  ],
  company: [
    { label: 'About BidVault', href: '#trust' },
    { label: 'Upcoming auctions', href: '#browse-lots' },
    { label: 'Support', href: '#faq' },
    { label: 'Press kit', href: '#trust' },
    { label: 'Partner with us', href: '#host' }
  ],
  bidders: [
    { label: 'Register as bidder', href: '/register' },
    { label: 'Bid management', href: '/my-activity' },
    { label: 'Host a charity auction', href: '#host' },
    { label: 'Auction stories', href: '#features' }
  ]
};

