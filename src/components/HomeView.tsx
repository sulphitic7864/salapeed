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
  Sparkles,
  Zap,
  CheckCircle2,
  Scissors,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { formatBHD, FaqItem, INITIAL_FAQS } from '../lib/store';
import { getHoodiePhoto, SALAPEED_BRAND, COLOR_OPTIONS } from '../data/mockData';

interface HomeViewProps {
  products: Product[];
  graphics: GraphicItem[];
  onStartCustomizing: (product?: Product, color?: string) => void;
  onBrowseCatalogue: () => void;
  onOpenTracker: () => void;
  onSelectProduct?: (product: Product) => void;
  faqs?: FaqItem[];
  deliveryFee?: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  graphics,
  onStartCustomizing,
  onBrowseCatalogue,
  onOpenTracker,
  onSelectProduct,
  faqs,
  deliveryFee = 1.5,
}) => {
  // Sort hoodies site-wide so Kids Hoodies are strictly positioned #1 first!
  const validHoodies = [...products]
    .filter((p) => p.id !== 'fleece-jacket' && p.imageType !== 'jacket')
    .sort((a, b) => {
      const orderMap: Record<string, number> = {
        'kids-hoodie': 1,
        'fleece-hoodie': 2,
        'zipper-hoodie': 3,
      };
      return (orderMap[a.id] || 99) - (orderMap[b.id] || 99);
    });

  // Featured hoodie: Kids hoodie first as requested site-wide
  const heroHoodie = validHoodies[0] || products[0];

  // Interactive Hero Color State
  const [heroColor, setHeroColor] = useState<string>('Black');

  // Stacked FAQ Accordion State - by default, 1st item (index 0) is OPEN
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  // Dynamic FAQs from store (DTF question removed, fully admin-editable)
  const faqList: FaqItem[] = faqs && faqs.length > 0 ? faqs : INITIAL_FAQS;

  return (
    <div className="space-y-10 sm:space-y-14 pb-16 text-left">
      {/* Official Salapeed Brand Ribbon */}
      <div className="p-3 bg-gradient-to-r from-[#14171f] via-[#0f1116] to-[#14171f] rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-black border border-[#39FF14]/40 p-0.5 flex items-center justify-center overflow-hidden">
            <img src="/salapeed-logo.jpeg" alt="Salapeed" className="w-full h-full object-contain" />
          </div>
          <span className="font-heading font-black text-white text-sm tracking-wide">
            Salapeed
          </span>
          <span className="text-neutral-600 hidden sm:inline">|</span>
          <span className="text-neutral-400 text-[11px] hidden sm:inline">
            Print . Stitch . Deliver &bull; Bahrain Workshop
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
          No delivery over BD 25, flat delivery wording, BenefitPay only!
      ========================================================================= */}
      <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-[#12151c] via-[#0d0f14] to-[#0a0c0f] p-6 sm:p-10 shadow-2xl">
        <div className="absolute inset-0 sp-stripes opacity-15 pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Bold Copy & CTAs */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-xs font-mono text-[#39FF14] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
              <span>LIVE CUSTOM HOODIE STUDIO &bull; BAHRAIN</span>
            </div>

            <div className="space-y-2.5">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase text-white leading-[1.05]">
                CUSTOM <span className="text-[#39FF14]">HOODIES</span> & APPAREL.
              </h1>
              <p className="text-xs sm:text-base text-neutral-300 max-w-xl leading-relaxed">
                Design custom heavyweight 380 GSM hoodies, fleece, and streetwear in our live online studio. No minimums. High-density screen printing, vibrant DTF, and premium 3D embroidery crafted right here in Bahrain.
              </p>
            </div>

            {/* CTA Button & BenefitPay / Flat Delivery Value Checklist */}
            <div className="space-y-3.5 pt-1">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => onStartCustomizing(heroHoodie, heroColor)}
                  className="py-4 px-8 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-base uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(57,255,20,0.35)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>Start Designing Hoodies</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={onBrowseCatalogue}
                  className="py-3.5 px-6 bg-neutral-900/90 hover:bg-neutral-800 text-white font-heading font-bold text-sm uppercase tracking-wider rounded-xl border border-neutral-700 hover:border-neutral-500 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-neutral-400" />
                  <span>Browse Hoodies ({validHoodies.length})</span>
                </button>
              </div>

              {/* Consistent Flat Delivery & BenefitPay Points */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-neutral-800/80 text-xs text-neutral-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <span>Flat Delivery (BD {deliveryFee.toFixed(3)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <span>BenefitPay Accepted Exclusively</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <span>No Minimums &bull; Order 1+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Hoodie Visual with Live Color Swatches */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full relative rounded-2xl bg-gradient-to-b from-[#161a22] to-[#0d0f14] border border-neutral-800/90 p-5 shadow-inner group">
              {/* Badge */}
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pb-3 border-b border-neutral-800/60">
                <span className="text-white font-bold uppercase tracking-wider truncate max-w-[200px]">
                  #1 {heroHoodie?.brochureTitle || heroHoodie?.name}
                </span>
                <span className="text-[#39FF14] font-bold">
                  from {formatBHD(heroHoodie?.basePrice || 9.5)}
                </span>
              </div>

              {/* Center Hoodie Visual */}
              <div
                onClick={() => onStartCustomizing(heroHoodie, heroColor)}
                className="w-full h-60 sm:h-64 relative flex items-center justify-center cursor-pointer my-2 transition-transform duration-300 group-hover:scale-105"
              >
                <img
                  src={getHoodiePhoto(heroHoodie?.imageType || 'pullover', heroColor, 'front', heroHoodie)}
                  alt={`${heroColor} Hoodie`}
                  className="w-full h-full max-h-60 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
                />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border border-dashed border-[#39FF14]/50 bg-[#39FF14]/5 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-mono text-[#39FF14] shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>Click to Design This Hoodie</span>
                  </div>
                </div>
              </div>

              {/* Live Color Swatch Selector for Hero Hoodie */}
              <div className="pt-2.5 border-t border-neutral-800/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-neutral-400">
                  Color: <strong className="text-white">{heroColor}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  {['Black', 'Navy', 'Heather Grey', 'Red', 'Charcoal'].map((cName) => {
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
                        className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${
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
          <span className="text-neutral-500">&bull;</span>
          <span className="text-neutral-300 font-bold">ESPORTS LEAGUES</span>
          <span className="text-neutral-500">&bull;</span>
          <span className="text-neutral-300 font-bold">UOB SOCIETIES</span>
          <span className="text-neutral-500">&bull;</span>
          <span className="text-neutral-300 font-bold">STREETWEAR BRANDS</span>
        </div>
      </div>

      {/* =========================================================================
          2. BEST-SELLING HOODIES (KIDS HOODIE LISTED #1 FIRST)
      ========================================================================= */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-neutral-800 pb-3">
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
            className="text-xs font-bold text-neutral-400 hover:text-[#39FF14] transition flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
          >
            <span>View All Garments</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Hoodie Cards Grid: Kids first, then Adult Pullover, then Adult Zip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {validHoodies.map((hoodie, idx) => {
            const isKids = hoodie.kind === 'kids';

            return (
              <div
                key={hoodie.id}
                className="group relative rounded-xl bg-[#11141a] border border-neutral-800 hover:border-[#39FF14]/70 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.7)]"
              >
                {/* Garment Image Showcase */}
                <div
                  onClick={() => onStartCustomizing(hoodie)}
                  className="relative w-full h-52 bg-gradient-to-b from-[#151922] to-[#0e1015] p-3 flex items-center justify-center cursor-pointer overflow-hidden"
                >
                  {/* Position Tag */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 border border-neutral-700/80 text-[10px] font-mono text-neutral-300">
                    {isKids ? '★ #1 KIDS FAVORITE' : `${idx + 1}. 380 GSM FLEECE`}
                  </div>

                  <img
                    src={hoodie.photoUrl || getHoodiePhoto(hoodie.imageType, hoodie.colors[0] || 'Navy', 'front', hoodie)}
                    alt={hoodie.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Hoodie Content Details (Nudged up for zero cutoff) */}
                <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-heading font-black text-sm uppercase text-white group-hover:text-[#39FF14] transition truncate">
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
                    <span className="text-neutral-400 font-semibold">{hoodie.sizes.length} Sizes</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-1.5 flex items-center gap-2">
                    <button
                      onClick={() => onStartCustomizing(hoodie)}
                      className="flex-1 py-2 px-3 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Customize</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {onSelectProduct && (
                      <button
                        onClick={() => onSelectProduct(hoodie)}
                        className="py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs uppercase rounded-lg border border-neutral-800 hover:border-neutral-700 transition cursor-pointer"
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          3. DIRECT ACCESS TO DESIGN STUDIO
          Replaces the preview image section with a direct, fast CTA to studio!
      ========================================================================= */}
      <section className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-[#12151d] via-[#0d0f14] to-[#0a0c0f] p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 sp-stripes-subtle opacity-20 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/40 text-xs font-mono text-[#39FF14] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DIRECT ACCESS STUDIO &bull; NO DELAYS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black uppercase text-white tracking-tight leading-tight">
              DESIGN YOUR HOODIE IN MINUTES. GO STRAIGHT TO STUDIO.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Skip the wait. Select your silhouette (Kids, Adults Pullover, or Full-Zip), choose your size and fabric color, and drop your artwork onto the safe print zone canvas immediately.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-1.5 text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
                Flat Delivery BD {deliveryFee.toFixed(3)}
              </span>
              <span className="flex items-center gap-1.5 text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
                BenefitPay Accepted Exclusively
              </span>
              <span className="flex items-center gap-1.5 text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
                Zero Minimum Order Quantity
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onStartCustomizing()}
              className="py-4 px-8 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(57,255,20,0.4)] flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Enter Design Studio Now</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
            <button
              type="button"
              onClick={onBrowseCatalogue}
              className="py-3 px-6 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-neutral-400" />
              <span>Browse All Models</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. HOW IT WORKS
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
                1. Select Silhouette & Sizing
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Choose between Kids Fleece, Adults Pullover, or Full-Zip Metallic hoodies. Select your exact age group or size and fabric colorway with deliberate input.
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
                2. Position Artwork
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Drag and drop your logos, custom arched streetwear typography, or curated vector graphics. Rotate and resize with direct handles inside the safe print zone.
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
                3. BenefitPay & Doorstep Delivery
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Checkout with instant zero-fee BenefitPay QR scan. We print in our Bahrain workshop and deliver directly to your doorstep with flat delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. WHAT WE DO (PRINT METHODS)
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
            Learn about our print and decoration methods from digital printing to screen printing and embroidery.
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
                  Volume Discounts &bull; 20+ Pieces
                </span>
                <h3 className="text-lg font-heading font-black uppercase text-white">
                  Screen Printing
                </h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Traditional multi-color press pushing premium plastisol and discharge inks through custom fine-mesh screens. Unrivaled wash durability and best pricing on bulk drops.
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
                  No Minimums &bull; 1 to 500+ Pieces
                </span>
                <h3 className="text-lg font-heading font-black uppercase text-white">
                  Digital DTF Printing
                </h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Direct-To-Film technology spraying micro-pigment inks with specialized adhesive backings. Produces full-spectrum photographic detail with smooth gradients and soft feel.
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
                High-density industrial stitching directly into heavyweight 380 GSM fleece fibers. Provides a raised, textured 3D finish that elevates your hoodie into retail-grade luxury.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>3D Puff embroidery available</span>
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
          6. FREQUENTLY ASKED QUESTIONS (DYNAMIC & ADMIN-EDITABLE)
          The 1st DTF question was removed as requested.
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
          {faqList.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={item.id || index}
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
