import React, { useState } from 'react';
import { Product } from '../types';
import { COLOR_OPTIONS, SALAPEED_BRAND, getHoodiePhoto } from '../data/mockData';
import { formatBHD } from '../lib/store';
import { ArrowRight, Sparkles, ShieldCheck, Layers, Scissors, Check, Eye, LayoutGrid, MessageCircle, Instagram, Globe } from 'lucide-react';
import { BrochurePedestalCard } from './BrochurePedestalCard';

interface ProductCatalogueProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onCustomizeDirect?: (product: Product, color: string) => void;
}

export const ProductCatalogue: React.FC<ProductCatalogueProps> = ({
  products,
  onSelectProduct,
  onCustomizeDirect,
}) => {
  const [viewMode, setViewMode] = useState<'brochure' | 'blueprint'>('brochure');

  // Store active preview color per product card
  const [activeColors, setActiveColors] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    products.forEach((p) => {
      initial[p.id] = p.colors[0] || 'Black';
    });
    return initial;
  });

  const handleColorChange = (e: React.MouseEvent, productId: string, colorName: string) => {
    e.stopPropagation();
    setActiveColors((prev) => ({ ...prev, [productId]: colorName }));
  };

  return (
    <div className="space-y-6 pb-14">
      {/* Salapeed Official Brand Header */}
      <div className="blueprint-card p-5 sm:p-6 bg-gradient-to-br from-[#151820] via-[#0f1116] to-[#0a0c0f] border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#39FF14] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
            <span>SALAPEED · PRINT . STITCH . DELIVER</span>
          </div>

          {/* Quick Contact Links */}
          <div className="flex items-center gap-3 text-xs font-mono">
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

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-wide uppercase">
              Realistic Garment Catalogue
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl leading-relaxed">
              Official Salapeed fleece hoodies and jackets crafted from 380 GSM ring-spun cotton-poly fleece. Features double-lined hoods, heavy metallic zippers, and multi-zone custom printing.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-black/60 rounded-xl border border-neutral-800 shrink-0">
            <button
              onClick={() => setViewMode('brochure')}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'brochure'
                  ? 'bg-neutral-200 text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-black" />
              <span>Studio Photo View</span>
            </button>
            <button
              onClick={() => setViewMode('blueprint')}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'blueprint'
                  ? 'bg-[#39FF14] text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Interactive Blueprint</span>
            </button>
          </div>
        </div>

        {/* Quality Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-neutral-800/80">
          <div className="flex items-center gap-2 text-[11px] text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-[#39FF14] shrink-0" />
            <span>380 GSM Heavyweight</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-300">
            <Layers className="w-4 h-4 text-[#39FF14] shrink-0" />
            <span>Multi-Zone Placement</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-300">
            <Scissors className="w-4 h-4 text-[#39FF14] shrink-0" />
            <span>Bar-Tack Reinforced</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-300">
            <Sparkles className="w-4 h-4 text-[#39FF14] shrink-0" />
            <span>BenefitPay / COD</span>
          </div>
        </div>
      </div>

      {/* MODE 1: BROCHURE 3D PEDESTAL GALLERY (Matching exact brochure pages) */}
      {viewMode === 'brochure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => {
            const currentColor = activeColors[product.id] || product.colors[0] || 'Navy';
            return (
              <BrochurePedestalCard
                key={product.id}
                product={product}
                selectedColor={currentColor}
                onSelectColor={(col) =>
                  setActiveColors((prev) => ({ ...prev, [product.id]: col }))
                }
                onCustomize={(prod, col) => {
                  if (onCustomizeDirect) {
                    onCustomizeDirect(prod, col);
                  } else {
                    onSelectProduct(prod);
                  }
                }}
              />
            );
          })}
        </div>
      )}

      {/* MODE 2: INTERACTIVE BLUEPRINT CARDS GRID */}
      {viewMode === 'blueprint' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {products.map((product) => {
            const currentColor = activeColors[product.id] || product.colors[0] || 'Black';
            const swatch = COLOR_OPTIONS[currentColor] || COLOR_OPTIONS.Black;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="blueprint-card p-4 sm:p-5 flex flex-col justify-between hover:border-[#39FF14]/80 transition-all duration-200 cursor-pointer group bg-[#111317] hover:shadow-[0_10px_35px_rgba(0,0,0,0.6)]"
              >
                <div className="space-y-4">
                  {/* Header Info & Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/60 text-neutral-300 border border-neutral-800 uppercase tracking-wider font-semibold">
                        {product.kind === 'kids' ? 'Kids (Ages 2–12)' : 'Adult (XS–XXL)'}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">
                        {product.imageType}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-bold text-[#39FF14]">
                      from {formatBHD(product.basePrice)}
                    </span>
                  </div>

                  {/* REALISTIC HOODIE 3D MOCKUP STAGE */}
                  <div className="w-full aspect-[4/3] rounded-xl relative overflow-hidden bg-gradient-to-b from-[#181b22] to-[#0e1014] border border-neutral-800 p-2 flex items-center justify-center group-hover:border-neutral-700 transition">
                    <div className="absolute inset-0 sp-stripes-subtle opacity-30 pointer-events-none" />

                    {/* Render the authentic real hoodie photography */}
                    <div className="w-full h-full max-h-[95%] flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 ease-out">
                      <img
                        src={getHoodiePhoto(product.imageType, currentColor, 'front', product)}
                        alt={`${product.name} in ${currentColor}`}
                        className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
                      />
                    </div>

                    {/* Floating Color Badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-neutral-700/80 text-[10px] font-mono text-neutral-300 flex items-center gap-1.5 shadow">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-neutral-500"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <span>{currentColor}</span>
                    </div>

                    {/* View Angle Pill */}
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-mono text-neutral-400">
                      Front & Back Ready
                    </div>
                  </div>

                  {/* Product Title & Authentic Description */}
                  <div>
                    <h3 className="text-lg font-heading font-black text-white group-hover:text-[#39FF14] transition tracking-wide uppercase">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {product.desc}
                    </p>
                  </div>

                  {/* Interactive Color Switcher Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500 font-medium">Select Fabric Color:</span>
                      <span className="font-mono text-neutral-300 text-[10px]">{currentColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.colors.map((cName) => {
                        const c = COLOR_OPTIONS[cName];
                        const isSelected = cName === currentColor;

                        return (
                          <button
                            key={cName}
                            onClick={(e) => handleColorChange(e, product.id, cName)}
                            className={`relative w-6 h-6 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                              isSelected
                                ? 'border-[#39FF14] scale-115 shadow-[0_0_8px_rgba(57,255,20,0.6)]'
                                : 'border-neutral-700 hover:border-neutral-500 hover:scale-105'
                            }`}
                            style={{ backgroundColor: c?.hex || '#222' }}
                            title={`Switch preview to ${cName}`}
                          >
                            {isSelected && (
                              <Check
                                className={`w-3 h-3 ${
                                  cName === 'White' || cName === 'Heather Grey'
                                    ? 'text-black'
                                    : 'text-[#39FF14]'
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-neutral-400">
                    {product.sizes.length} Sizes ({product.sizes[0]}–{product.sizes[product.sizes.length - 1]})
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCustomizeDirect) {
                        onCustomizeDirect(product, currentColor);
                      } else {
                        onSelectProduct(product);
                      }
                    }}
                    className="px-3.5 py-1.5 bg-[#39FF14] hover:bg-[#32e012] text-black font-heading font-black text-xs uppercase tracking-wider rounded-lg shadow flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Customize Live</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
