import React, { useState } from 'react';
import { Product, GraphicItem } from '../types';
import {
  ArrowRight,
  ShieldCheck,
  Layers,
  Printer,
  Search,
  Compass,
  Phone,
  Instagram,
  ChevronDown,
  Check,
  Star,
  Type,
  Image as ImageIcon,
  Sparkles,
  Zap,
  CheckCircle2,
  Scissors,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { formatBHD } from '../lib/store';
import { getHoodiePhoto, SALAPEED_BRAND, COLOR_OPTIONS } from '../data/mockData';

interface HomeViewProps {
  products: Product[];
  graphics: GraphicItem[];
  onStartCustomizing: (product?: Product, color?: string) => void;
  onBrowseCatalogue: () => void;
  onOpenTracker: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  graphics,
  onStartCustomizing,
  onBrowseCatalogue,
  onOpenTracker,
  onSelectProduct,
}) => {
  // Filter out the 3rd model ('fleece-jacket') as explicitly requested by user
  const validHoodies = products.filter(
    (p) => p.id !== 'fleece-jacket' && p.imageType !== 'jacket'
  );

  // Default featured hoodie: signature zipper or pullover
  const heroHoodie = validHoodies[0] || products[0];

  // Interactive Hero & Studio States
  const [heroColor, setHeroColor] = useState<string>('Navy');

  // Interactive "Design Hoodies in Minutes" Studio widget state
  const [studioHoodieType, setStudioHoodieType] = useState<'zipper' | 'pullover'>('pullover');
  const [studioColor, setStudioColor] = useState<string>('Charcoal');
  const [studioSide, setStudioSide] = useState<'front' | 'back'>('front');
  const [studioText, setStudioText] = useState<string>('SALAPEED');
  const [studioFont, setStudioFont] = useState<'condensed' | 'slab' | 'grotesque'>('condensed');
  const [studioTextCurve, setStudioTextCurve] = useState<boolean>(true);
  const [selectedGraphicIndex, setSelectedGraphicIndex] = useState<number>(0);
  const [showGraphic, setShowGraphic] = useState<boolean>(true);

  // Stacked FAQ Accordion State - by default, 1st item (index 0) is OPEN
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  // Curated demo graphics for the interactive studio preview
  const demoGraphics = graphics.length > 0 ? graphics.slice(0, 4) : [];

  const faqItems = [
    {
      q: 'What is the difference between DTF digital printing, screen printing, and embroidery?',
      a: 'Digital DTF (Direct-to-Film) printing produces ultra-high definition, full-color prints with continuous gradients and zero minimum order quantity—perfect for individual custom pieces or complex artwork. Screen printing uses custom mesh stencils and premium plastisol inks, offering supreme wash durability and unbeatable bulk volume pricing for orders of 20+ pieces. High-density embroidery provides a raised, tactile 3D thread stitch directly into the heavy 380 GSM fleece fibers for an executive, luxury streetwear finish.',
    },
    {
      q: 'Is there any minimum order quantity (MOQ)?',
      a: 'No! There are absolutely no minimums. You can design and order just 1 single custom hoodie for yourself, a friend, or a gift. If you are ordering for a brand collection, esports team, university club, or corporate company, our volume discount tiers automatically apply in your cart as quantities increase.',
    },
    {
      q: 'What hoodie fabric and GSM weight do you use?',
      a: 'All Salapeed hoodies are crafted with our signature 380 GSM (grams per square meter) heavyweight cotton-rich fleece. They feature a soft brushed interior for all-day comfort, double-lined hoods with matching thick drawstrings, heavy-duty ribbed cuffs and hem, and reinforced double-needle stitching throughout.',
    },
    {
      q: 'How do I get started designing my own custom hoodie?',
      a: 'Simply click "Create Your Hoodie" or "Go to Design Studio". Choose your preferred silhouette (Full-Zip, Pullover, or Kids) and base color. From there, you can drag and drop curated graphics, upload high-resolution logos, or type custom curved lettering. You can customize the Front, Back, and Sleeves with real-time 3D placement previews.',
    },
    {
      q: 'How long does production and delivery take in Bahrain?',
      a: 'Standard production takes 2 to 4 business days in our local Bahrain workshop. Once inspected and packed, our courier delivers directly to your doorstep anywhere in Bahrain within 24 hours. We offer live SMS/order status tracking from the moment your hoodie enters production until delivery.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept BenefitPay transfers exclusively for immediate zero-fee verification and express dispatch in Bahrain. Cash on delivery is not accepted.',
    },
    {
      q: 'What artwork format should I upload for best results?',
      a: 'For best print clarity, we recommend transparent PNG or vector SVG files at 300 DPI. If you upload a lower-resolution file, our live studio will gently flag it with an alert, and our Bahrain prepress workshop team will manually review and upscale your artwork before it goes onto the press.',
    },
    {
      q: 'Can I order a physical sample before placing a large team order?',
      a: 'Yes! Because we have no minimum order quantities, you can easily order a single prototype piece with your exact graphics and embroidery specifications to test the sizing, fabric weight, and print finish before initiating a bulk team run.',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Official Salapeed Brand Ribbon */}
      <div className="p-3 bg-gradient-to-r from-[#14171f] via-[#0f1116] to-[#14171f] rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-heading font-black text-white text-sm tracking-wide">
            Salapeed
          </span>
          <span className="text-neutral-600 hidden sm:inline">|</span>
          <span className="text-neutral-400 text-[11px] hidden sm:inline">
            Print . Stitch . Deliver · Bahrain Workshop
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${SALAPEED_BRAND.phone.replace(/[^0-9+]/g, '')}`}
            className="flex items-center gap-1.5 text-neutral-300 hover:text-white font-bold transition"
          >
            <Phone className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>{SALAPEED_BRAND.phone}</span>
          </a>
          <a
            href={SALAPEED_BRAND.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 font-bold transition"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>{SALAPEED_BRAND.instagram}</span>
          </a>
        </div>
      </div>

      {/* =========================================================================
          1. HERO SECTION (CUSTOM HOODIES & APPAREL)
          Inspired by UberPrints hero layout with Salapeed dark streetwear aesthetic
      ========================================================================= */}
      <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-[#12151c] via-[#0d0f14] to-[#0a0c0f] p-6 sm:p-10 shadow-2xl">
        {/* Subtle background blueprint grid */}
        <div className="absolute inset-0 sp-stripes opacity-15 pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Bold Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-xs font-mono text-[#39FF14] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
              <span>LIVE CUSTOM HOODIE STUDIO · BAHRAIN</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase text-white leading-[1.05]">
                CUSTOM <span className="text-[#39FF14]">HOODIES</span> & APPAREL.
              </h1>
              <p className="text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed">
                Design your own custom heavyweight 380 GSM hoodies, fleece, and streetwear in our live online studio. No minimums. High-density screen printing, vibrant DTF, and premium 3D embroidery crafted right here in Bahrain.
              </p>
            </div>

            {/* CTA Button & Value Checklist */}
            <div className="space-y-4 pt-1">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => onStartCustomizing(heroHoodie, heroColor)}
                  className="py-4 px-8 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-base uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(57,255,20,0.35)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>Start Designing Hoodies</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>

                <button
                  onClick={onBrowseCatalogue}
                  className="py-3.5 px-6 bg-neutral-900/90 hover:bg-neutral-800 text-white font-heading font-bold text-sm uppercase tracking-wider rounded-xl border border-neutral-700 hover:border-neutral-500 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-neutral-400" />
                  <span>Browse Hoodies ({validHoodies.length})</span>
                </button>
              </div>

              {/* 3 Core Value Points (matching UberPrints checklist) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-neutral-800/80 text-xs text-neutral-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <span>Free Delivery over BD 25</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <span>No Minimums · Order 1+</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <span>380 GSM Heavyweight Fleece</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Hoodie Visual with Live Color Swatches */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full relative rounded-2xl bg-gradient-to-b from-[#161a22] to-[#0d0f14] border border-neutral-800/90 p-5 shadow-inner group">
              {/* Badge */}
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pb-3 border-b border-neutral-800/60">
                <span className="text-white font-bold uppercase tracking-wider">
                  {heroHoodie?.brochureTitle || heroHoodie?.name}
                </span>
                <span className="text-[#39FF14] font-bold">
                  from {formatBHD(heroHoodie?.basePrice || 11.5)}
                </span>
              </div>

              {/* Center Hoodie Visual */}
              <div
                onClick={() => onStartCustomizing(heroHoodie, heroColor)}
                className="w-full h-64 sm:h-72 relative flex items-center justify-center cursor-pointer my-2 transition-transform duration-300 group-hover:scale-105"
              >
                <img
                  src={getHoodiePhoto(heroHoodie?.imageType || 'zipper', heroColor, 'front', heroHoodie)}
                  alt={`${heroColor} Hoodie`}
                  className="w-full h-full max-h-64 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
                />

                {/* Interactive Placement Preview Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border border-dashed border-[#39FF14]/50 bg-[#39FF14]/5 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-mono text-[#39FF14] shadow-sm">
                    <Sparkles className="w-3 h-3 text-[#39FF14]" />
                    <span>Print Zone Ready</span>
                  </div>
                </div>
              </div>

              {/* Live Color Swatch Selector for Hero Hoodie */}
              <div className="pt-3 border-t border-neutral-800/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-neutral-400">
                  Color: <strong className="text-white">{heroColor}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  {['Navy', 'Black', 'Heather Grey', 'Red', 'Charcoal'].map((cName) => {
                    const cOpt = COLOR_OPTIONS[cName];
                    if (!cOpt) return null;
                    const isActive = heroColor === cName;
                    return (
                      <button
                        key={cName}
                        onClick={(e) => {
                          e.stopPropagation();
                          setHeroColor(cName);
                        }}
                        title={cName}
                        className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                          isActive
                            ? 'border-[#39FF14] scale-110 shadow-[0_0_8px_rgba(57,255,20,0.6)]'
                            : 'border-neutral-700 hover:border-neutral-400 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: cOpt.hex }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TRUSTED BY STRIP (UberPrints Style Social Proof)
      ========================================================================= */}
      <div className="p-4 rounded-xl bg-[#0f1217] border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
            ))}
          </div>
          <span className="text-xs font-bold text-white">4.9 / 5.0</span>
          <span className="text-xs text-neutral-400">
            from 1,200+ Bahrain Creators, Brands & Teams
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-neutral-400 text-xs font-mono tracking-wider uppercase">
          <span className="text-neutral-500">TRUSTED BY:</span>
          <span className="text-neutral-300 font-bold">F1 FAN CLUBS</span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-300 font-bold">ESPORTS LEAGUES</span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-300 font-bold">UOB SOCIETIES</span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-300 font-bold">STREETWEAR BRANDS</span>
        </div>
      </div>

      {/* =========================================================================
          2. OUR BEST-SELLING HOODIES. JUMP RIGHT IN.
          Featuring only real hoodies (zipper, pullover, kids) and NO 3rd model!
      ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-neutral-800 pb-4">
          <div>
            <div className="text-[11px] font-mono text-[#39FF14] uppercase tracking-wider font-semibold">
              Curated Heavyweight Fleece Blanks
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white tracking-tight">
              OUR BEST-SELLING HOODIES. JUMP RIGHT IN.
            </h2>
          </div>
          <button
            onClick={onBrowseCatalogue}
            className="text-xs font-bold text-neutral-400 hover:text-[#39FF14] transition flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>View All Garments</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Hoodie Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {validHoodies.map((hoodie) => (
            <div
              key={hoodie.id}
              className="group relative rounded-xl bg-[#11141a] border border-neutral-800 hover:border-[#39FF14]/70 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.7)]"
            >
              {/* Garment Image Showcase */}
              <div
                onClick={() => onStartCustomizing(hoodie)}
                className="relative w-full h-56 bg-gradient-to-b from-[#151922] to-[#0e1015] p-4 flex items-center justify-center cursor-pointer overflow-hidden"
              >
                {/* 380 GSM Tag */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 border border-neutral-700/80 text-[10px] font-mono text-neutral-300">
                  380 GSM
                </div>

                {hoodie.photoUrl ? (
                  <img
                    src={hoodie.photoUrl}
                    alt={hoodie.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={getHoodiePhoto(hoodie.imageType, hoodie.colors[0] || 'Navy', 'front', hoodie)}
                      alt={hoodie.name}
                      className="w-full h-full max-h-48 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Hoodie Content Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading font-black text-sm uppercase text-white group-hover:text-[#39FF14] transition">
                      {hoodie.brochureTitle || hoodie.name}
                    </h3>
                    <span className="font-mono text-xs font-bold text-[#39FF14] whitespace-nowrap">
                      from {formatBHD(hoodie.basePrice)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {hoodie.desc}
                  </p>
                </div>

                {/* Available Color Dots */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    {hoodie.colors.slice(0, 5).map((col) => {
                      const cHex = COLOR_OPTIONS[col]?.hex || '#1a1a1a';
                      return (
                        <span
                          key={col}
                          className="w-3.5 h-3.5 rounded-full border border-neutral-700"
                          style={{ backgroundColor: cHex }}
                          title={col}
                        />
                      );
                    })}
                    {hoodie.colors.length > 5 && (
                      <span className="text-[10px] text-neutral-500">
                        +{hoodie.colors.length - 5}
                      </span>
                    )}
                  </div>
                  <span className="text-neutral-500">{hoodie.sizes.length} Sizes</span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => onStartCustomizing(hoodie)}
                    className="flex-1 py-2.5 px-3 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Customize</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {onSelectProduct && (
                    <button
                      onClick={() => onSelectProduct(hoodie)}
                      className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs uppercase rounded-lg border border-neutral-800 hover:border-neutral-700 transition cursor-pointer"
                    >
                      Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          3. DESIGN HOODIES IN MINUTES. NO EXPERIENCE NEEDED.
          Interactive studio preview widget featuring our actual Salapeed hoodies!
      ========================================================================= */}
      <section className="rounded-2xl border border-neutral-800 bg-[#0e1117] p-6 sm:p-9 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono text-[#39FF14] uppercase tracking-wider font-semibold">
            Live Placement Studio
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black uppercase text-white tracking-tight">
            DESIGN HOODIES IN MINUTES. NO EXPERIENCE NEEDED.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            With just a few clicks, our live studio lets you fine-tune and add personality to your hoodies with custom fonts, curves, and uploaded artwork.
          </p>
        </div>

        {/* Interactive Studio Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left / Center: Interactive Hoodie Canvas with Live Controls */}
          <div className="lg:col-span-7 bg-[#090b0e] border border-neutral-800 rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
            {/* Studio Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
              {/* Silhouette Switcher */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStudioHoodieType('pullover')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    studioHoodieType === 'pullover'
                      ? 'bg-[#39FF14] text-black font-heading font-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  Street Pullover
                </button>
                <button
                  onClick={() => setStudioHoodieType('zipper')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    studioHoodieType === 'zipper'
                      ? 'bg-[#39FF14] text-black font-heading font-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  Full-Zip Hoodie
                </button>
              </div>

              {/* Front / Back Toggle */}
              <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setStudioSide('front')}
                  className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                    studioSide === 'front'
                      ? 'bg-[#1a1d26] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Front
                </button>
                <button
                  onClick={() => setStudioSide('back')}
                  className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                    studioSide === 'back'
                      ? 'bg-[#1a1d26] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Back
                </button>
              </div>
            </div>

            {/* Interactive Garment Display Area */}
            <div className="relative w-full h-72 sm:h-80 bg-gradient-to-b from-[#11131a] to-[#07090c] rounded-xl flex items-center justify-center overflow-hidden border border-neutral-800/60 p-2">
              <img
                src={getHoodiePhoto(studioHoodieType, studioColor, studioSide)}
                alt={`${studioColor} Hoodie - ${studioSide} view`}
                className="w-full h-full max-h-72 object-contain filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.9)] transition-all duration-300 pointer-events-none select-none"
              />

              {/* Live Interactive Design Placement on Hoodie */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-36 h-36 border-2 border-dashed border-[#39FF14] bg-[#39FF14]/10 rounded-lg flex flex-col items-center justify-center p-2 relative shadow-lg">
                  {/* Active Transform Corner Handles */}
                  <span className="w-2.5 h-2.5 bg-[#39FF14] rounded-full absolute -top-1.5 -left-1.5 border border-black shadow" />
                  <span className="w-2.5 h-2.5 bg-[#39FF14] rounded-full absolute -top-1.5 -right-1.5 border border-black shadow" />
                  <span className="w-2.5 h-2.5 bg-[#39FF14] rounded-full absolute -bottom-1.5 -left-1.5 border border-black shadow" />
                  <span className="w-2.5 h-2.5 bg-[#39FF14] rounded-full absolute -bottom-1.5 -right-1.5 border border-black shadow" />

                  {/* Placed Graphic Icon */}
                  {showGraphic && demoGraphics[selectedGraphicIndex] && (
                    <div className="w-14 h-14 mb-1 flex items-center justify-center">
                      {demoGraphics[selectedGraphicIndex].svgContent ? (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{
                            __html: demoGraphics[selectedGraphicIndex].svgContent || '',
                          }}
                        />
                      ) : (
                        <img
                          src={demoGraphics[selectedGraphicIndex].previewUrl}
                          alt="Graphic"
                          className="w-full h-full object-contain filter drop-shadow"
                        />
                      )}
                    </div>
                  )}

                  {/* Placed Text */}
                  {studioText && (
                    <div
                      className={`text-center font-black tracking-wider text-[#39FF14] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase transition-all ${
                        studioFont === 'condensed'
                          ? 'font-sans scale-y-110 text-sm'
                          : studioFont === 'slab'
                          ? 'font-serif text-xs'
                          : 'font-mono text-xs'
                      } ${studioTextCurve ? 'scale-x-110 rotate-[-1deg]' : ''}`}
                    >
                      {studioText}
                    </div>
                  )}
                </div>
              </div>

              {/* Watermark in bottom right */}
              <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-neutral-500 bg-black/60 px-2 py-0.5 rounded border border-neutral-800">
                Interactive Preview
              </div>
            </div>

            {/* Interactive Customization Controls Panel */}
            <div className="space-y-3 pt-1">
              {/* Color Swatches */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-neutral-400 font-mono">
                  Garment Color: <strong className="text-white">{studioColor}</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  {['Charcoal', 'Navy', 'Black', 'Heather Grey', 'Red'].map((c) => {
                    const cOpt = COLOR_OPTIONS[c];
                    if (!cOpt) return null;
                    const isSel = studioColor === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setStudioColor(c)}
                        title={c}
                        className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                          isSel
                            ? 'border-[#39FF14] scale-110 shadow-[0_0_8px_rgba(57,255,20,0.5)]'
                            : 'border-neutral-700 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: cOpt.hex }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Text Input & Font Styling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-mono text-[11px]">
                    Custom Text:
                  </label>
                  <input
                    type="text"
                    value={studioText}
                    onChange={(e) => setStudioText(e.target.value)}
                    maxLength={18}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#141720] border border-neutral-700 text-white font-bold focus:border-[#39FF14] focus:outline-none"
                    placeholder="Type hoodie text..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 font-mono text-[11px]">
                    Font & Curve:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={studioFont}
                      onChange={(e) => setStudioFont(e.target.value as any)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#141720] border border-neutral-700 text-neutral-200 text-xs focus:border-[#39FF14] focus:outline-none"
                    >
                      <option value="condensed">League Heavy</option>
                      <option value="slab">Collegiate Slab</option>
                      <option value="grotesque">Monospace Street</option>
                    </select>

                    <button
                      onClick={() => setStudioTextCurve(!studioTextCurve)}
                      className={`px-2.5 py-1.5 rounded-lg border font-mono text-[11px] transition cursor-pointer ${
                        studioTextCurve
                          ? 'border-[#39FF14] bg-[#39FF14]/15 text-[#39FF14] font-bold'
                          : 'border-neutral-700 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Arc
                    </button>
                  </div>
                </div>
              </div>

              {/* Graphics Picker */}
              {demoGraphics.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span>Artwork Badges:</span>
                    <button
                      onClick={() => setShowGraphic(!showGraphic)}
                      className="text-neutral-400 hover:text-[#39FF14] transition cursor-pointer"
                    >
                      {showGraphic ? 'Hide Graphic' : 'Show Graphic'}
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {demoGraphics.map((g, idx) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          setSelectedGraphicIndex(idx);
                          setShowGraphic(true);
                        }}
                        className={`p-2 rounded-lg border flex flex-col items-center justify-center transition cursor-pointer ${
                          selectedGraphicIndex === idx && showGraphic
                            ? 'border-[#39FF14] bg-[#39FF14]/10 shadow-sm'
                            : 'border-neutral-800 bg-[#12151d] hover:border-neutral-700'
                        }`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center">
                          {g.svgContent ? (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              dangerouslySetInnerHTML={{ __html: g.svgContent }}
                            />
                          ) : (
                            <img
                              src={g.previewUrl}
                              alt={g.name}
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-300 font-bold truncate w-full text-center mt-1">
                          {g.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Feature Highlights matching UberPrints */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-[#39FF14] flex items-center justify-center shrink-0">
                  <Type className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-heading font-black uppercase text-white">
                    Add and Manipulate Text
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    With just a few clicks, our live studio lets you fine-tune and add personality to your hoodies with custom fonts, curves, arc angles, and sizing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-[#39FF14] flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-heading font-black uppercase text-white">
                    Free Images or Upload Your Own
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Our studio gives you free access to curated artist-made Bahrain F1, racing, and streetwear graphics. And when you need to drop in your own logo or photo, you can do that in seconds.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-[#39FF14] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-heading font-black uppercase text-white">
                    Design Amazing Color Schemes
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Pick from authentic heavyweight street colors in our collection, or let our design engine match inks directly to your brand palette.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Studio CTA */}
            <div className="pt-2">
              <button
                onClick={() => {
                  const targetProd = validHoodies.find(
                    (p) => p.imageType === studioHoodieType
                  ) || validHoodies[0];
                  onStartCustomizing(targetProd, studioColor);
                }}
                className="w-full py-4 px-6 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Go to the Design Studio</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. HOW IT WORKS
          3 Simple Visual Steps with UberPrints clarity
      ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="text-xs font-mono text-[#39FF14] uppercase tracking-wider font-semibold">
            Seamless Ordering
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white tracking-tight">
            HOW IT WORKS
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Easily create custom hoodies, fleece, and apparel online in 3 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="rounded-xl bg-[#11141b] border border-neutral-800 p-6 space-y-4 hover:border-[#39FF14]/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] flex items-center justify-center font-heading font-black text-lg group-hover:scale-105 transition">
              01
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-heading font-black uppercase text-white group-hover:text-[#39FF14] transition">
                Design Online
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Choose your hoodie style and authentic fleece color. Upload your logo or artwork, or create graphics in minutes with our drag & drop placement studio.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl bg-[#11141b] border border-neutral-800 p-6 space-y-4 hover:border-[#39FF14]/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] flex items-center justify-center font-heading font-black text-lg group-hover:scale-105 transition">
              02
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-heading font-black uppercase text-white group-hover:text-[#39FF14] transition">
                Expertly Printed & Stitched
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Once you’ve designed your hoodie, leave the rest to our Bahrain workshop. High-density screen printing, vibrant DTF, and embroidery with strict quality checks.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl bg-[#11141b] border border-neutral-800 p-6 space-y-4 hover:border-[#39FF14]/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] flex items-center justify-center font-heading font-black text-lg group-hover:scale-105 transition">
              03
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-heading font-black uppercase text-white group-hover:text-[#39FF14] transition">
                Delivered To You
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                You’ve got too much to do to worry about your hoodies. We ship directly to your door anywhere in Bahrain with instant BenefitPay processing and live production tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center pt-2">
          <button
            onClick={() => onStartCustomizing(heroHoodie)}
            className="py-3.5 px-8 bg-neutral-900 hover:bg-[#39FF14] text-white hover:text-black font-heading font-black text-xs uppercase tracking-wider rounded-xl border border-neutral-700 hover:border-[#39FF14] transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          5. WHAT WE DO
          Learn about our print & craft methods (Screen Printing, DTF, Embroidery)
      ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono text-[#39FF14] uppercase tracking-wider font-semibold">
            Craftsmanship & Production
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white tracking-tight">
            WHAT WE DO
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Learn about our different print and decoration methods from traditional screen printing to state-of-the-art digital printing and embroidery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Method 1: Screen Printing */}
          <div className="rounded-xl bg-[#10131a] border border-neutral-800 p-6 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 text-[#39FF14] flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#39FF14] uppercase tracking-wider font-bold">
                  Volume Discounts · 20+ Pieces
                </span>
                <h3 className="text-lg font-heading font-black uppercase text-white">
                  Screen Printing
                </h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Traditional multi-color press technique pushing premium plastisol and discharge inks through custom fine-mesh screens. Exceptional durability, sharp edges, and the most cost-effective solution for bulk drops and company uniforms.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Unrivaled wash durability</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Exact Pantone color matching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Lowest unit cost on bulk runs</span>
              </div>
            </div>
          </div>

          {/* Method 2: Digital DTF Printing */}
          <div className="rounded-xl bg-[#10131a] border border-[#39FF14]/40 p-6 flex flex-col justify-between space-y-4 relative shadow-[0_0_20px_rgba(57,255,20,0.1)]">
            <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded bg-[#39FF14] text-black text-[9px] font-mono font-black uppercase tracking-wider">
              Most Popular
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#39FF14] uppercase tracking-wider font-bold">
                  No Minimums · 1 to 500+ Pieces
                </span>
                <h3 className="text-lg font-heading font-black uppercase text-white">
                  Digital DTF Printing
                </h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                State-of-the-art Direct-To-Film technology spraying micro-pigment inks with specialized adhesive backings. Produces full-spectrum photographic detail, smooth gradients, and vibrant colors with a soft, flexible hand-feel on dark fleece.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Single-piece custom orders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Photographic 300+ DPI detail</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Rapid 2–3 day turnaround</span>
              </div>
            </div>
          </div>

          {/* Method 3: Premium Embroidery */}
          <div className="rounded-xl bg-[#10131a] border border-neutral-800 p-6 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 text-[#39FF14] flex items-center justify-center">
                <Scissors className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#39FF14] uppercase tracking-wider font-bold">
                  Luxury Streetwear Finish
                </span>
                <h3 className="text-lg font-heading font-black uppercase text-white">
                  Premium Embroidery
                </h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                High-density industrial stitching directly into heavyweight 380 GSM fleece fibers. Provides a raised, textured 3D finish that elevates your hoodie into a retail-grade luxury garment that will never wash out.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>3D Puff embroidery available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Fade-proof Madeira threads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Permanent lifetime durability</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FREQUENTLY ASKED QUESTIONS (STACKED ACCORDION)
          1st item (index 0) open by default as required by user!
      ========================================================================= */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <div className="text-xs font-mono text-[#39FF14] uppercase tracking-wider font-semibold">
            Common Questions
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white tracking-tight">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Everything you need to know about designing, printing, and ordering custom hoodies in Bahrain.
          </p>
        </div>

        {/* Stacked Accordion List */}
        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[#39FF14]/60 bg-[#12151c] shadow-lg'
                    : 'border-neutral-800/90 bg-[#0e1015] hover:border-neutral-700'
                }`}
              >
                {/* Accordion Question Header */}
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer transition select-none"
                >
                  <span
                    className={`text-sm sm:text-base font-heading font-bold transition ${
                      isOpen ? 'text-[#39FF14]' : 'text-white hover:text-neutral-200'
                    }`}
                  >
                    {item.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'border-[#39FF14]/40 bg-[#39FF14]/10 text-[#39FF14] rotate-180'
                        : 'border-neutral-700 bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Accordion Content Body */}
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60 animate-fadeIn">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          7. ORDER TRACKER QUICK BANNER
      ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#12151c] to-[#0e1014] border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-700 text-[#39FF14] flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white uppercase tracking-wide">
              Already Placed a Custom Hoodie Order?
            </div>
            <div className="text-xs text-neutral-400">
              Track live Bahrain workshop printing and courier status with your Order ID or phone number.
            </div>
          </div>
        </div>
        <button
          onClick={onOpenTracker}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer"
        >
          Track Order Live
        </button>
      </div>
    </div>
  );
};
