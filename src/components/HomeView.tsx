import React from 'react';
import { Product, GraphicItem } from '../types';
import { Sparkles, ArrowRight, ShieldCheck, Layers, Printer, Search, Compass, MessageCircle, Instagram, Globe } from 'lucide-react';
import { formatBHD } from '../lib/store';
import { RealisticHoodieGraphic } from './RealisticHoodieGraphic';
import { SALAPEED_BRAND } from '../data/mockData';

interface HomeViewProps {
  products: Product[];
  graphics: GraphicItem[];
  onStartCustomizing: (product?: Product) => void;
  onBrowseCatalogue: () => void;
  onOpenTracker: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  graphics,
  onStartCustomizing,
  onBrowseCatalogue,
  onOpenTracker,
}) => {
  const featuredProduct = products[0] || products[1];

  return (
    <div className="space-y-6 pb-12">
      {/* Official Salapeed Brand Ribbon */}
      <div className="p-3 bg-gradient-to-r from-[#181a20] via-[#121418] to-[#181a20] rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-heading font-black text-white text-sm tracking-wide">
            Salapeed
          </span>
          <span className="text-neutral-500 hidden sm:inline">|</span>
          <span className="text-neutral-400 text-[11px] hidden sm:inline">
            Print . Stitch . Deliver
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={SALAPEED_BRAND.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-green-400 hover:text-green-300 font-bold transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{SALAPEED_BRAND.phone}</span>
          </a>
          <a
            href={SALAPEED_BRAND.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-pink-400 hover:text-pink-300 font-bold transition"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>{SALAPEED_BRAND.instagram}</span>
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <div className="blueprint-card relative overflow-hidden p-5 sm:p-7 bg-gradient-to-b from-[#13161d] to-[#0e1014] border-neutral-800">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 sp-stripes opacity-20 pointer-events-none" />

        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/30 text-[11px] font-mono text-[#39FF14] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
            <span>CUSTOM HOODIE STUDIO · BAHRAIN</span>
          </div>

          <div className="space-y-1.5 max-w-lg">
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-wide uppercase text-white leading-none">
              DESIGN YOUR <span className="text-[#39FF14]">CUSTOM HOODIE</span> LIVE.
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Place multiple graphics, uploaded photos, and curved text directly on front, back, and sleeves. Printed locally in Bahrain on premium heavyweight 380 GSM blanks.
            </p>
          </div>

          {/* Quick Hero Garment Visual with Realistic Photo */}
          <div className="py-2">
            <div
              onClick={() => onStartCustomizing(featuredProduct)}
              className="p-3 bg-black/60 border border-neutral-800 hover:border-[#39FF14]/60 rounded-xl flex items-center justify-between gap-3 cursor-pointer group transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-neutral-900/90 border border-neutral-700/80 p-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition overflow-hidden shadow-inner">
                  {featuredProduct?.photoUrl ? (
                    <img
                      src={featuredProduct.photoUrl}
                      alt={featuredProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                    />
                  ) : (
                    <RealisticHoodieGraphic
                      imageType={featuredProduct?.imageType || 'zipper'}
                      colorName="Navy"
                      side="front"
                      className="w-full h-full"
                      highlightTexture={false}
                    />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#39FF14] transition flex items-center gap-1.5">
                    <span>Featured: {featuredProduct?.brochureTitle || featuredProduct?.name}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Front, Back, and Sleeve print zones with magnetic drag & drop
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#39FF14] whitespace-nowrap">
                from {formatBHD(featuredProduct?.basePrice || 11.5)}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            <button
              onClick={() => onStartCustomizing(featuredProduct)}
              className="py-3.5 px-6 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-sm uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Start Designing Live</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onBrowseCatalogue}
              className="py-3 px-5 bg-neutral-900 hover:bg-neutral-800 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl border border-neutral-700 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-neutral-400" />
              <span>Browse Garments ({products.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Hoodie Silhouettes Quick Preview Row with Real Brochure Photos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Available Hoodie Silhouettes
          </h2>
          <span className="text-[10px] font-mono text-[#39FF14]">380 GSM FLEECE</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => onStartCustomizing(p)}
              className="blueprint-card p-3 flex flex-col items-center justify-between text-center hover:border-[#39FF14]/80 transition cursor-pointer group bg-[#111317]"
            >
              <div className="w-24 h-24 relative flex items-center justify-center my-1 group-hover:scale-105 transition">
                {p.photoUrl ? (
                  <img
                    src={p.photoUrl}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.7)]"
                  />
                ) : (
                  <RealisticHoodieGraphic
                    imageType={p.imageType}
                    colorName={p.colors[0] || 'Black'}
                    side="front"
                    className="w-full h-full"
                    highlightTexture={false}
                  />
                )}
              </div>
              <div className="w-full mt-2">
                <span className="text-xs font-heading font-black text-white group-hover:text-[#39FF14] transition uppercase block truncate">
                  {p.brochureTitle || p.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#39FF14] mt-1">
                from {formatBHD(p.basePrice)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Step Process */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            How Salapeed Works
          </h2>
          <span className="text-[10px] font-mono text-[#39FF14]">3 SIMPLE STEPS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="blueprint-card p-3.5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#39FF14]/10 text-[#39FF14] flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <h3 className="text-xs font-bold text-white uppercase">Choose Silhouette & Color</h3>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Pick from Zipper Hoodies, Classic Pullovers, Fleece Jackets, and Kids sizes in 5 authentic colors.
            </p>
          </div>

          <div className="blueprint-card p-3.5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#39FF14]/10 text-[#39FF14] flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <h3 className="text-xs font-bold text-white uppercase">Interactive Drag & Drop</h3>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Drag graphics, upload your own images, scale corners, rotate, and curve custom typography with live 3D preview.
            </p>
          </div>

          <div className="blueprint-card p-3.5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#39FF14]/10 text-[#39FF14] flex items-center justify-center font-mono font-bold text-xs">
              03
            </div>
            <h3 className="text-xs font-bold text-white uppercase">Printed in Bahrain</h3>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Workshop printing with BenefitPay or Cash on Delivery. Fast courier delivery across all Bahrain blocks.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Graphics Shelf */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Curated Graphics Library
            </h2>
            <p className="text-[10px] text-neutral-500">Bahrain F1, Street Racing, Anime, & Modern Calligraphy</p>
          </div>
          <button
            onClick={() => onStartCustomizing()}
            className="text-xs text-[#39FF14] hover:underline"
          >
            Explore all →
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {graphics.slice(0, 6).map((g) => (
            <div
              key={g.id}
              onClick={() => onStartCustomizing()}
              className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-[#39FF14]/60 transition cursor-pointer group flex flex-col items-center justify-between text-center"
            >
              <div className="w-full aspect-square bg-[#0b0c0f] rounded-lg p-1.5 flex items-center justify-center group-hover:scale-105 transition">
                {g.svgContent ? (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: g.svgContent }}
                  />
                ) : (
                  <img src={g.previewUrl} alt={g.name} className="w-full h-full object-contain" />
                )}
              </div>
              <span className="text-[11px] font-bold text-neutral-300 truncate w-full mt-1.5">
                {g.name}
              </span>
              <span className="text-[9px] font-mono text-neutral-500">{g.category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Order Tracking Banner */}
      <div className="p-4 rounded-xl bg-[#121419] border border-neutral-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-800 text-[#39FF14] flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase">Already Placed an Order?</div>
            <div className="text-[11px] text-neutral-400">
              Track live workshop printing status with your Order ID or phone number.
            </div>
          </div>
        </div>
        <button
          onClick={onOpenTracker}
          className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold whitespace-nowrap transition cursor-pointer"
        >
          Track Order
        </button>
      </div>
    </div>
  );
};
