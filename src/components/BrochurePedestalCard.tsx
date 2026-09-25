import React, { useState } from 'react';
import { Product } from '../types';
import { COLOR_OPTIONS, SALAPEED_BRAND, getHoodiePhoto } from '../data/mockData';
import { Phone, Globe, Instagram, Check, ArrowRight } from 'lucide-react';

interface BrochurePedestalCardProps {
  product: Product;
  selectedColor?: string;
  onSelectColor?: (color: string) => void;
  onCustomize?: (product: Product, color: string) => void;
  className?: string;
  compact?: boolean;
}

export const BrochurePedestalCard: React.FC<BrochurePedestalCardProps> = ({
  product,
  selectedColor,
  onSelectColor,
  onCustomize,
  className = '',
  compact = false,
}) => {
  const [internalColor, setInternalColor] = useState<string>(
    selectedColor || product.colors[0] || 'Navy'
  );

  const activeColor = selectedColor || internalColor;
  const handleColorClick = (colorName: string) => {
    setInternalColor(colorName);
    if (onSelectColor) onSelectColor(colorName);
  };

  // Determine realistic photo URL for this product and color
  const photo =
    product.colorPhotos?.[activeColor] ||
    product.photoUrl ||
    getHoodiePhoto(product.imageType, activeColor, 'front', product);

  const title = product.brochureTitle || product.name.toUpperCase();

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#e9e6df] text-[#1c1c1c] shadow-[0_12px_40px_rgba(0,0,0,0.45)] border border-[#d6d0c4] flex flex-col justify-between font-sans ${className}`}
      style={{
        boxShadow:
          '0 20px 40px -15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.8)',
      }}
    >
      {/* 3D Stepped Architectural Pedestal Backdrop Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Outer Layer shadow */}
        <div className="absolute top-[8%] left-[6%] right-[6%] bottom-[12%] bg-[#ded9ce] rounded-xl shadow-inner border border-[#d1cbc0]/60" />
        {/* Mid Pedestal Layer */}
        <div
          className="absolute top-[12%] left-[10%] right-[10%] bottom-[15%] bg-[#ede9e1] rounded-lg border border-[#ffffff]/70"
          style={{
            boxShadow:
              '0 15px 35px rgba(0,0,0,0.07), inset 0 2px 4px rgba(255,255,255,0.9)',
          }}
        />
        {/* Soft Ambient Light Gradient */}
        <div className="absolute inset-0 bg-radial from-white/30 via-transparent to-black/10 pointer-events-none" />
      </div>

      {/* TOP HEADER: Salapeed Brand & Slogan */}
      <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between gap-2 border-b border-black/5">
        {/* Left: Salapeed Stylized Logo */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-lg sm:text-xl tracking-tighter text-[#141416]">
                Salapeed
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#cc1c24]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
              Workshop Edition
            </span>
          </div>
        </div>

        {/* Right: Tagline */}
        <div className="px-3 py-1 rounded-md bg-white/70 backdrop-blur-sm border border-black/5 text-[10px] sm:text-[11px] font-semibold text-neutral-700 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
          <span>Print . Stitch . Deliver</span>
        </div>
      </div>

      {/* CENTER: Photorealistic Hoodie Floating Display */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-6 min-h-[260px] sm:min-h-[320px]">
        {/* Floating Hoodie Container */}
        <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center group">
          {/* Subtle Grounding Cast Shadow */}
          <div className="absolute -bottom-2 w-[75%] h-5 bg-black/25 rounded-full blur-md" />

          {/* Real Photo Image from Salapeed Catalogue */}
          <img
            src={photo}
            alt={`${product.name} in ${activeColor}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain filter drop-shadow-[0_18px_25px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      </div>

      {/* LOWER FLOATING CARD: Product Title & Interactive Color Swatches */}
      <div className="relative z-10 px-4 sm:px-6 pb-2 -mt-1">
        <div
          className="bg-[#f7f5f0] border border-[#e3dfd5] rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3"
          style={{
            boxShadow:
              '0 8px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
          }}
        >
          {/* Product Title */}
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base tracking-wider text-[#15171a] uppercase leading-tight">
              {title}
            </h3>
          </div>

          {/* Color Swatch Dots */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
              Colors:
            </span>
            <div className="flex items-center gap-1.5">
              {product.colors.map((cName) => {
                const swatch = COLOR_OPTIONS[cName];
                const isSelected = cName === activeColor;
                return (
                  <button
                    key={cName}
                    onClick={() => handleColorClick(cName)}
                    className={`relative w-6 h-6 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center shadow-sm ${
                      isSelected
                        ? 'border-[#15171a] scale-110 shadow-md ring-2 ring-black/20'
                        : 'border-[#cfc9bd] hover:border-black hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatch?.hex || '#1a1a1a' }}
                    title={cName}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3 h-3 ${
                          cName === 'White' || cName === 'Heather Grey'
                            ? 'text-black'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SIZES AVAILABLE ROW */}
      <div className="relative z-10 px-4 sm:px-6 py-2.5 text-center">
        <div className="text-[11px] sm:text-xs font-mono font-bold text-neutral-800 tracking-wider">
          {product.kind === 'kids'
            ? 'Sizes Available: 2 Years to 12 years'
            : `Sizes Available: ${product.sizes.join(', ')}`}
        </div>
      </div>

      {/* ACTION / CUSTOMIZE BUTTON IF APPLICABLE */}
      {onCustomize && (
        <div className="relative z-10 px-4 sm:px-6 pb-3 pt-0.5">
          <button
            onClick={() => onCustomize(product, activeColor)}
            className="w-full py-3 px-4 bg-[#14161a] hover:bg-black text-white font-heading font-black text-xs uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer group"
          >
            <span>Customize this {product.name} ({activeColor})</span>
            <ArrowRight className="w-4 h-4 text-[#39FF14] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* FOOTER BAR: Official Salapeed Contact Details */}
      <div className="relative z-10 bg-[#dfdad0]/95 backdrop-blur-sm border-t border-[#d3cdc0] px-4 py-3 flex items-center justify-between text-[11px] font-mono text-neutral-800">
        {/* Phone / Call */}
        <a
          href={`tel:${SALAPEED_BRAND.phone.replace(/[^0-9+]/g, '')}`}
          className="flex items-center gap-1.5 hover:text-black font-bold transition"
        >
          <Phone className="w-3.5 h-3.5 text-neutral-800" />
          <span>{SALAPEED_BRAND.phone}</span>
        </a>

        {/* Website */}
        <a
          href={SALAPEED_BRAND.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1 hover:text-black transition"
        >
          <Globe className="w-3.5 h-3.5 text-neutral-600" />
          <span>{SALAPEED_BRAND.website}</span>
        </a>

        {/* Instagram */}
        <a
          href={SALAPEED_BRAND.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-pink-700 font-bold transition"
        >
          <Instagram className="w-3.5 h-3.5 text-pink-700" />
          <span>{SALAPEED_BRAND.instagram}</span>
        </a>
      </div>
    </div>
  );
};
